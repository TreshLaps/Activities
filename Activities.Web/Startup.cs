using System.Globalization;
using Activities.Core.Authentication;
using Activities.Core.Caching;
using Activities.Web.Controllers;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Scrutor;

namespace Activities.Web
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddApplicationInsightsTelemetry();
            
            services.AddResponseCompression(
                options =>
                {
                    options.Providers.Add<GzipCompressionProvider>();
                    options.Providers.Add<BrotliCompressionProvider>();
                    options.EnableForHttps = true;
                });
            
            services
                .AddAuthentication(options =>
                    {
                        options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                    })
                .AddCookie(options =>
                    {
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
                    });
                
            services.AddControllersWithViews();
            services.AddHttpClient();
            services.AddMemoryCache();

            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            });
            
            services.AddTransient<ICachingService, CachingService>();
            services.AddTransient<IPermanentStorageService, FileStorageService>();
            services.AddTransient<AzureBlobService, AzureBlobService>(_ => new AzureBlobService(Configuration.GetConnectionString("AzureBlob")));
            
            services.Scan(scan => scan
                .FromAssemblyOf<Strava.Endpoints.ActivitiesClient>()
                .FromAssemblyOf<Core.Caching.ICachingService>()
                .AddClasses()
                .UsingRegistrationStrategy(RegistrationStrategy.Skip)
                .AsSelf()
                .WithTransientLifetime());
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

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    spa.UseReactDevelopmentServer(npmScript: "start");
                }
            });
        }
    }
}
