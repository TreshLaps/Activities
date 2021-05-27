using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;

namespace Activities.Strava.Syncing
{
    public class ActivitiesSyncHostedService : IHostedService
    {
        private readonly ActivitiesSyncService _activitiesSyncService;

        public ActivitiesSyncHostedService(ActivitiesSyncService activitiesSyncService)
        {
            _activitiesSyncService = activitiesSyncService;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            return _activitiesSyncService.ProcessJobs(cancellationToken);
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}