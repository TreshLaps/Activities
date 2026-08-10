FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build-env
WORKDIR /app

# Install Node.js 22 for frontend build (Debian repo ships v12, too old for Vite 8+)
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Copy files into image
COPY . ./
# Restore as distinct layers
RUN dotnet restore
# Build and publish a release
RUN dotnet publish -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:6.0
# Install curl for health check
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
# Setting workdir
WORKDIR /app
# Exposing ports for container
EXPOSE 5000
# Copying build env to app/out
COPY --from=build-env /app/out .
# Creating health check environment variable
ENV HEALTHCHECK_URL=http://localhost:5000
# Entrypoint to run app.
ENTRYPOINT ["dotnet", "Activities.Web.dll", "--urls", "http://0.0.0.0:5000"]
# Health check interval and implementation
HEALTHCHECK --interval=30s --timeout=30s --start-period=10s --retries=3 \
     CMD curl -Lk -fsS "${HEALTHCHECK_URL}" || exit 1
