using System;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Activities.Core.Caching;
using Activities.Strava.Authentication;
using Activities.Strava.Endpoints;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Scrutor;

namespace Activities.Web;

public class Startup
{
    private readonly IWebHostEnvironment _env;

    public Startup(IConfiguration configuration, IWebHostEnvironment env)
    {
        _env = env;
        Configuration = configuration;
    }

    public IConfiguration Configuration { get; }

    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddApplicationInsightsTelemetry();

        if (!_env.IsDevelopment())
        {
            services.AddResponseCompression(
                options =>
                {
                    options.Providers.Add<GzipCompressionProvider>();
                    options.Providers.Add<BrotliCompressionProvider>();
                    options.EnableForHttps = true;
                });
        }

        services
            .AddAuthentication(options =>
            {
                options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
            })
            .AddCookie(options =>
            {
                options.ExpireTimeSpan = TimeSpan.FromDays(180);
                options.Cookie.HttpOnly = true;
                options.Cookie.MaxAge = options.ExpireTimeSpan;
                options.SlidingExpiration = true;
                options.LoginPath = "/signin";
                options.LogoutPath = "/signout";
                options.Events = new CookieAuthenticationEvents
                {
                    OnValidatePrincipal = OauthUtils.OnValidatePrincipal
                };
            })
            .AddStrava(options =>
            {
                options.ClientId = Configuration["Strava:ClientId"];
                options.ClientSecret = Configuration["Strava:Secret"];
                options.SaveTokens = true;
                options.Scope.Add("read_all");
                options.Scope.Add("activity:read_all");
                options.Events.OnCreatingTicket = OnCreatingTicket;
            });

        services.AddDataProtection().PersistKeysToFileSystem(new DirectoryInfo("storage/DataProtectionKeys"));

        services.AddControllersWithViews();
        services.AddHttpClient();
        services.AddMemoryCache();

        // In production, the React files will be served from this directory
        services.AddSpaStaticFiles(configuration => { configuration.RootPath = "ClientApp/build"; });

        services.AddTransient<FileStorageService, FileStorageService>(_ =>
            new FileStorageService(_env.ContentRootPath));

        services.AddTransient<IPermanentStorageService, FileStorageService>(_ =>
            new FileStorageService(_env.ContentRootPath));

        services.AddTransient<ICachingService, CachingService>();
        services.AddTransient<AzureBlobService, AzureBlobService>(_ =>
            new AzureBlobService(Configuration.GetConnectionString("AzureBlob")));

        ScanAssembly<Startup>(services);
        ScanAssembly<ActivitiesClient>(services);
        ScanAssembly<ICachingService>(services);
    }

    private static void ScanAssembly<T>(IServiceCollection services)
    {
        services.Scan(scan => scan
            .FromAssemblyOf<T>()
            .AddClasses(x => x.Where(type => type.Name.EndsWith("Service") || type.Name.EndsWith("Client")))
            .UsingRegistrationStrategy(RegistrationStrategy.Skip)
            .AsSelf()
            .WithTransientLifetime()
        );
    }

    private async Task OnCreatingTicket(OAuthCreatingTicketContext context)
    {
        var athleteClient = context.HttpContext.RequestServices.GetService<AthleteClient>();
        var clubs = await athleteClient.GetAthleteClubs(context.AccessToken);
        context.Identity.AddClaim(new Claim("urn:strava:clubs",
            clubs != null ? string.Join(",", clubs.Select(club => club.Id)) : ""));
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        var cultureInfo = new CultureInfo("en-US");
        CultureInfo.DefaultThreadCurrentCulture = cultureInfo;
        CultureInfo.DefaultThreadCurrentUICulture = cultureInfo;

        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }
        else
        {
            app.UseExceptionHandler("/Error");
            // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
            app.UseHsts();
        }

        app.UseHttpsRedirection();
        app.UseStaticFiles();
        app.UseSpaStaticFiles();

        app.UseRouting();

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseForwardedHeaders(new ForwardedHeadersOptions
        {
            ForwardedHeaders = ForwardedHeaders.XForwardedProto
        });

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllerRoute(
                "default",
                "{controller}/{action=Index}/{id?}");
        });

        app.UseSpa(spa =>
        {
            spa.Options.SourcePath = "ClientApp";

            if (env.IsDevelopment())
            {
                spa.UseReactDevelopmentServer("start");
            }
        });
    }
}