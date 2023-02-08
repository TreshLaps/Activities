FROM docker.io/alpine:latest AS build-env
WORKDIR /app

# Copy files into image
COPY . ./
# Install dependencies, dotnet sdk 7 and dotnet runtime 6
RUN apk add bash icu-libs krb5-libs libgcc libintl libssl1.1 libstdc++ zlib dotnet7-sdk aspnetcore6-runtime nodejs npm curl
# Setting legacy provider for SSL to work as expected
ENV NODE_OPTIONS="--openssl-legacy-provider"
RUN npm config set legacy-peer-deps true
# Restore as distinct layers
RUN dotnet restore
# Build and publish a release
RUN dotnet publish -c Release -o out

# Build runtime image
FROM docker.io/alpine:latest
# Install dependencies and dotnet runtime 6
RUN apk add aspnetcore6-runtime bash icu-libs krb5-libs libgcc libintl libssl1.1 libstdc++ zlib nodejs npm curl
# Setting legacy provider for SSL to work as expected
ENV NODE_OPTIONS="--openssl-legacy-provider"
RUN npm config set legacy-peer-deps true
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