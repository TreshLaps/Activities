using System;
using System.Threading.Tasks;

namespace Activities.Core.Caching
{
    public class CachingService : ICachingService
    {
        private readonly MemoryCacheService _memoryCacheService;
        private readonly IPermanentStorageService _permanentStorageService;

        public CachingService(MemoryCacheService memoryCacheService, IPermanentStorageService permanentStorageService)
        {
            _memoryCacheService = memoryCacheService;
            _permanentStorageService = permanentStorageService;
        }

        public Task<T> GetOrAdd<T>(string key, TimeSpan expiration, Func<Task<T>> action) where T : class
        {
            return _memoryCacheService.GetOrAdd(
                key,
                expiration == TimeSpan.MaxValue ? TimeSpan.FromDays(2) : expiration,
                () =>
                {
                    if (expiration == TimeSpan.MaxValue)
                    {
                        return _permanentStorageService.GetOrAdd(
                            key,
                            action);
                    }
                    
                    return action();
                });
        }
    }
}
