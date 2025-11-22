# Docker Deployment Guide

This guide explains how to deploy the CRM Backend application using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

### Using Docker Compose (Recommended)

1. **Navigate to the docker directory:**
   ```bash
   cd docker
   ```

2. **Start all services:**
   ```bash
   docker compose up -d
   ```

3. **View logs:**
   ```bash
   docker compose logs -f
   ```

4. **Stop services:**
   ```bash
   docker compose down
   ```

### Using Docker Only

1. **Build the image:**
   ```bash
   docker build -t crm-backend -f docker/Dockerfile .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 crm-backend
   ```

## Services

The `compose.yaml` file defines the following services:

- **app**: The main Express.js application
- **db**: PostgreSQL database
- **redis**: Redis cache server

## Environment Variables

Make sure to set the following environment variables in your deployment:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:password@db:5432/crm_db
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key
```

## Production Deployment

### Building for Production

```bash
# Build multi-platform image (if needed)
docker build --platform=linux/amd64 -t crm-backend -f docker/Dockerfile .

# Push to registry
docker tag crm-backend your-registry.com/crm-backend
docker push your-registry.com/crm-backend
```

### Health Checks

The application includes health check endpoints:
- `GET /health` - Application health status

### Monitoring

- Application logs: `docker compose logs -f app`
- Database logs: `docker compose logs -f db`
- Redis logs: `docker compose logs -f redis`

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3000, 5432, and 6379 are available
2. **Database connection**: Ensure DATABASE_URL is correctly set
3. **Redis connection**: Ensure Redis service is running

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
```

### Rebuilding

```bash
# Rebuild and restart
docker compose up --build -d

# Rebuild specific service
docker compose up --build -d app
```

## References

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)