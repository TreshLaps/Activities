using System;
using System.Collections.Concurrent;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Activities.Core.Caching
{
    public class FileStorageService : IPermanentStorageService
    {
        private readonly string _storagePath;
        private static readonly ConcurrentDictionary<string, SemaphoreSlim> AsyncLocks = new();

        public FileStorageService(string contentRootPath)
        {
            _storagePath = Path.Combine(contentRootPath, "storage");
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
                await AddOrUpdate(key, TimeSpan.MaxValue, result);
            }
            finally
            {
                semaphoreSlim.Release();
            }

            return result;
        }

        public async Task AddOrUpdate(string key, TimeSpan expiration, object value)
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

        public void Remove(string key)
        {
            var filePath = GetFilePath(key);

            if (File.Exists(filePath) && !key.Contains("\\") && !key.Contains("/") && !key.Contains(".."))
            {
                File.Delete(filePath);
            }
        }

        public bool ContainsKey(string key)
        {
            EnsureDirectoryExists();
            var filePath = GetFilePath(key);
            return File.Exists(filePath);
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