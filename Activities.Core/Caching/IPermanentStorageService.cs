using System;
using System.Threading.Tasks;

namespace Activities.Core.Caching
{
    public interface IPermanentStorageService
    {
        Task<T> GetOrAdd<T>(string key, Func<Task<T>> action) where T : class;
        Task AddOrUpdate(string key, TimeSpan expiration, object value);
        Task<T> Get<T>(string key);
        void Remove(string key);
    }
}