using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;

namespace Activities.Core.Caching
{
    public class MemoryCacheService : ICachingService
    {
        private readonly IMemoryCache _memoryCache;
        private static readonly ConcurrentDictionary<string, SemaphoreSlim> AsyncLocks = new();

        public MemoryCacheService(IMemoryCache memoryCache)
        {
            _memoryCache = memoryCache;
        }

        public async Task<T> GetOrAdd<T>(string key, TimeSpan expiration, Func<Task<T>> action) where T : class
        {
            var result = _memoryCache.Get<T>(key);

            if (result != null)
            {
                return result;
            }
            
            var semaphoreSlim = AsyncLocks.GetOrAdd(key, new SemaphoreSlim(1, 1));
            await semaphoreSlim.WaitAsync();

            try
            {
                result = _memoryCache.Get<T>(key);

                if (result != null)
                {
                    return result;
                }
                
                result = await action();
                await AddOrUpdate(key, expiration, result);
            }
            finally
            {
                semaphoreSlim.Release();
            }

            return result;
        }

        public Task AddOrUpdate(string key, TimeSpan expiration, object value)
        {
            var cacheEntryOptions = new MemoryCacheEntryOptions()
                .SetSlidingExpiration(expiration);
            
            _memoryCache.Set(key, value, cacheEntryOptions);
            return Task.CompletedTask;
        }

        public void Remove(string key)
        {
            _memoryCache.Remove(key);
        }
    }
}
