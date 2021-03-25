using System;
using System.Threading.Tasks;

namespace Activities.Core.Caching
{
    public interface IPermanentStorageService
    {
        Task<T> GetOrAdd<T>(string key, Func<Task<T>> action) where T : class;
        Task Add<T>(string key, T value) where T : class;
        Task<T> Get<T>(string key);
    }
}