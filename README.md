Dashboard for activities

## Requirements

.NET 6.0 SDK

## Local development

### Configure Strava app secrets in web project.

- Get your strava clientID and secret from https://www.strava.com/settings/api
- Go to `Activities.Web` in your terminal
- Run `dotnet user-secrets set "Strava:ClientId" "<id>"`
- Run `dotnet user-secrets set "Strava:Secret" "<secret>"`

### Run in vscode/etc

- Go to `Activities.Web\ClientApp` in your terminal and run `npm config set legacy-peer-deps true` and then `npm install`
- Go to `Activities.Web` in your terminal and run `dotnet watch`
  - This will start the website

### Run in Visual Studio

- Go to `Activities.Web\ClientApp` in your terminal and run `npm config set legacy-peer-deps true` and then `npm install`
- Run the project as you normally would. Activities.Web should be the startup project.