using Azure.Storage.Blobs;
using Newtonsoft.Json;
using System;
using System.Collections.Concurrent;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Azure.Storage.Blobs.Models;

namespace Activities.Core.Caching
{
    public class AzureBlobService : IPermanentStorageService
    {
        private readonly string _connectionString;
        private readonly string _containerName;
        private static readonly ConcurrentDictionary<string, SemaphoreSlim> AsyncLocks = new();

        public AzureBlobService(string connectionString)
        {
            _connectionString = connectionString;
            _containerName = "activities";
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

            var container = new BlobContainerClient(_connectionString, _containerName);
            await container.CreateIfNotExistsAsync();
            
            await using var memoryStream = new MemoryStream();
            memoryStream.Write(Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(value)));
            memoryStream.Seek(0, SeekOrigin.Begin);
            
            var blob = container.GetBlobClient(key);
            await blob.UploadAsync(memoryStream, new BlobHttpHeaders { ContentType = "application/json" });
        }

        public async Task<T> Get<T>(string key)
        {
            if (key == null)
            {
                return default;
            }

            var container = new BlobContainerClient(_connectionString, _containerName);
            await container.CreateIfNotExistsAsync();
            
            var blob = container.GetBlobClient(key);
            var exists = await blob.ExistsAsync();

            if (exists.Value == false)
            {
                return default;
            }

            await using var blobStream = await blob.OpenReadAsync();
            using var streamReader = new StreamReader(blobStream);
            var json = await streamReader.ReadToEndAsync();
            return JsonConvert.DeserializeObject<T>(json);
        }

        public void Remove(string key)
        {
            if (key == null)
            {
                return;
            }

            var container = new BlobContainerClient(_connectionString, _containerName);
            container.CreateIfNotExists();
            
            var blob = container.GetBlobClient(key);
            blob.DeleteIfExists();
        }
    }
}
