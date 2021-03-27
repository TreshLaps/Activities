using System;
using System.Collections.Concurrent;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Newtonsoft.Json;

namespace Activities.Core.Caching
{
    public class FileStorageService : IPermanentStorageService
    {
        private readonly string _storagePath;
        private static readonly ConcurrentDictionary<string, SemaphoreSlim> AsyncLocks = new();

        public FileStorageService(IWebHostEnvironment webHostEnvironment)
        {
            _storagePath = Path.Combine(webHostEnvironment.ContentRootPath, "storage");
        }
        
        public async Task<T> GetOrAdd<T>(string key, Func<Task<T>> action) where T : class
        {
            var result = await Get<T>(key);

            if (result != null)
            {
                return result;
            }
            
            var semaphoreSlim = AsyncLocks.GetOrAdd(key, new SemaphoreSlim(1, 1));
            await semaphoreSlim.WaitAsync();

            try
            {
                result = await Get<T>(key);

                if (result != null)
                {
                    return result;
                }
                
                result = await action();
                await Add(key, result);
            }
            finally
            {
                semaphoreSlim.Release();
            }

            return result;
        }
        
        public async Task Add<T>(string key, T value) where T : class
        {
            if (key == null)
            {
                return;
            }
            
            EnsureDirectoryExists();
            var filePath = GetFilePath(key);
            var json = JsonConvert.SerializeObject(value);
            await File.WriteAllTextAsync(filePath, json);
        }

        public async Task<T> Get<T>(string key)
        {
            if (key == null)
            {
                return default;
            }

            EnsureDirectoryExists();
            var filePath = GetFilePath(key);

            if (!File.Exists(filePath))
            {
                return default;
            }

            var json = await File.ReadAllTextAsync(GetFilePath(key));
            return JsonConvert.DeserializeObject<T>(json);
        }

        private void EnsureDirectoryExists()
        {
            if (!Directory.Exists(_storagePath))
            {
                Directory.CreateDirectory(_storagePath);
            }
        }

        private string GetFilePath(string key)
        {
            return Path.Combine(_storagePath, $"{key.Replace(":", ".")}.json");
        }
    }
}
