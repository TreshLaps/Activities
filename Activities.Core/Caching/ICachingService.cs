using System;
using System.Threading.Tasks;

namespace Activities.Core.Caching
{
    public interface ICachingService
    {
        Task<T> GetOrAdd<T>(string key, TimeSpan expiration, Func<Task<T>> action) where T : class;
        Task AddOrUpdate(string key, TimeSpan expiration, object value);
    }
}