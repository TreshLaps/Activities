using Microsoft.Extensions.Caching.Memory;
using System;
using System.Threading.Tasks;

namespace Activities.Core.Caching
{
    public class MemoryCacheService : ICachingService
    {
        private readonly IMemoryCache _memoryCache;

        public MemoryCacheService(IMemoryCache memoryCache)
        {
            _memoryCache = memoryCache;
        }

        public async Task<T> GetOrAdd<T>(string key, TimeSpan expiration, Func<Task<T>> action) where T : class
        {
            var result = _memoryCache.Get<T>(key);

            if (result == null)
            {
                result = await action();
                var cacheEntryOptions = new MemoryCacheEntryOptions()
                    .SetSlidingExpiration(expiration);
            
                _memoryCache.Set(key, result, cacheEntryOptions);
            }

            return result;
        }
    }
}
