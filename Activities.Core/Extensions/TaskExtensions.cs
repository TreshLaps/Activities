using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Activities.Core.Extensions
{
    public static class TaskExtensions
    {
        public static async Task<List<T2>> ForEachAsync<T, T2>(this IEnumerable<T> source, int degreeOfParallelism, Func<T, Task<T2>> body)
        {
            var sourceList = source.ToList();
            var result = new T2[sourceList.Count];
            var tasks = new List<Task>();
            using var throttler = new SemaphoreSlim(degreeOfParallelism);

            for (var i = 0; i < sourceList.Count; i++)
            {
                var index = i;
                var localThrottler = throttler;
                var element = sourceList[index];
                await localThrottler.WaitAsync().ConfigureAwait(false);
                tasks.Add(Task.Factory.StartNew(async () =>
                {
                    try
                    {
                        result[index] = await body(element).ConfigureAwait(false);
                    }
                    finally
                    {
                        localThrottler.Release();
                    }
                }, TaskCreationOptions.LongRunning).Result);
            }

            await Task.WhenAll(tasks);
            return result.ToList();
        }
        
        public static async Task DoAsync<T>(this IEnumerable<T> source, int degreeOfParallelism, Func<T, Task> body)
        {
            var sourceList = source.ToList();
            var tasks = new List<Task>(sourceList.Count);
            using var throttler = new SemaphoreSlim(degreeOfParallelism);

            for (var i = 0; i < sourceList.Count; i++)
            {
                var index = i;
                var localThrottler = throttler;
                var element = sourceList[index];
                await localThrottler.WaitAsync().ConfigureAwait(false);

                tasks.Add(Task.Factory.StartNew(async () =>
                {
                    try
                    {
                        await body(element).ConfigureAwait(false);
                    }
                    finally
                    {
                        localThrottler.Release();
                    }
                }, TaskCreationOptions.LongRunning).Result);
            }

            await Task.WhenAll(tasks).ConfigureAwait(false);
        }
    }
}
