# Deployment Instructions - Dokploy

## Prerequisites
- Docker & Docker Compose installed
- PostgreSQL database (either in docker-compose or external)
- Git repository with this code

## Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env file with your values:**
   - Change `DB_PASSWORD` to secure password
   - Change `JWT_SECRET` to secure random string
   - Update `CORS_ORIGINS` with your domain
   - Update `VITE_API_BASE_URL` with your backend URL

## Deployment via Dokploy UI

### Step 1: Connect Repository
1. Login to Dokploy UI
2. Add new project → Connect Git repository
3. Select branch: `safe-checkpoint`

### Step 2: Configure Application
1. **Application Type:** Docker Compose
2. **Docker Compose Path:** `/docker-compose.yml`
3. **Environment Variables:** Copy from `.env` file

### Step 3: Configure Ports
- Frontend: 80 (HTTP)
- Backend: 8080 (API)
- PostgreSQL: 5432 (internal only)

### Step 4: Deploy
1. Click "Deploy" button
2. Wait for all services to be healthy
3. Check logs for any errors

## Post-Deployment Verification

1. **Check health status:**
   ```bash
   curl http://your-domain/health
   curl http://your-backend:8080/health
   ```

2. **Test frontend:**
   - Open browser: `http://your-domain`
   - Try login functionality

3. **Test backend:**
   ```bash
   curl http://your-backend:8080/api/v1/public/login
   ```

## Troubleshooting

### Frontend Build Fails
- Check logs: `docker logs hafalan-frontend`
- Ensure Bun builds correctly
- Check Vite API URL configuration

### Backend Cannot Connect to Database
- Ensure PostgreSQL is healthy: `docker ps`
- Check database connection string
- Verify database credentials in .env

### Authentication Loop
- Check CORS_ORIGINS includes your domain
- Verify JWT_SECRET is set
- Check browser console for errors

## Local Development

For local development with all services:
```bash
docker-compose up -d
```

To stop:
```bash
docker-compose down
```

To view logs:
```bash
docker-compose logs -f
```
