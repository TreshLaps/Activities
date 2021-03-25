using Azure.Storage.Blobs;
using Newtonsoft.Json;
using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Azure.Storage.Blobs.Models;

namespace Activities.Core.Caching
{
    public class AzureBlobService : IPermanentStorageService
    {
        private readonly string _connectionString;
        private readonly string _containerName;

        public AzureBlobService(string connectionString)
        {
            _connectionString = connectionString;
            _containerName = "activities";
        }
        
        public async Task<T> GetOrAdd<T>(string key, Func<Task<T>> action) where T : class
        {
            var result = await Get<T>(key);

            if (result == null)
            {
                result = await action();
                await Add(key, result);
            }

            return result;
        }
        
        public async Task Add<T>(string key, T value) where T : class
        {
            if (key == null)
            {
                return;
            }

            var container = new BlobContainerClient(_connectionString, _containerName);
            await container.CreateIfNotExistsAsync();
            
            await using var memoryStream = new MemoryStream();
            memoryStream.Write(Encoding.UTF8.GetBytes((string) JsonConvert.SerializeObject(value)));
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
    }
}
