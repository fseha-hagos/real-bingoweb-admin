# Vercel Deployment Guide

## Environment Variables Setup

### Required Environment Variable

You must set the `NEXT_PUBLIC_API_URL` environment variable in Vercel:

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Click on "Settings"
   - Click on "Environment Variables"

2. **Add Environment Variable**
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your production backend API URL
     - Example: `https://your-backend-api.herokuapp.com/api`
     - Example: `https://api.yourdomain.com/api`
     - Example: `https://your-backend.railway.app/api`
   - **Environments**: Select all (Production, Preview, Development)
   - Click "Save"

3. **Redeploy**
   - After adding the variable, go to "Deployments"
   - Click the three dots on the latest deployment
   - Click "Redeploy"

## Backend CORS Configuration

Make sure your backend API allows requests from your Vercel domain. Add your Vercel URL to the CORS allowed origins:

```javascript
// Example Express.js CORS configuration
const cors = require('cors');

app.use(cors({
  origin: [
    'https://your-app.vercel.app',
    'https://your-custom-domain.com',
    'http://localhost:3000' // For local development
  ],
  credentials: true
}));
```

## Common Issues

### 1. Network Error on Login
**Problem**: Getting "Network Error" when trying to login

**Solutions**:
- ✅ Check that `NEXT_PUBLIC_API_URL` is set in Vercel environment variables
- ✅ Verify the API URL is correct and publicly accessible
- ✅ Check browser console for CORS errors
- ✅ Ensure backend API is running and accessible
- ✅ Verify backend allows requests from your Vercel domain

### 2. CORS Error
**Problem**: Browser shows CORS error in console

**Solutions**:
- Add your Vercel domain to backend CORS whitelist
- Ensure backend sends proper CORS headers
- Check that backend accepts requests from `https://your-app.vercel.app`

### 3. Environment Variable Not Working
**Problem**: Still using localhost URL after setting variable

**Solutions**:
- Redeploy the application after adding environment variable
- Clear browser cache
- Check that variable name is exactly `NEXT_PUBLIC_API_URL`
- Verify variable is set for the correct environment (Production/Preview)

### 4. API Timeout
**Problem**: Requests timeout

**Solutions**:
- Check backend API response time
- Verify backend is not rate limiting
- Check network connectivity
- Consider increasing timeout in `lib/api.ts`

## Testing

After deployment:

1. **Check Environment Variable**
   - Open browser DevTools
   - Check Network tab for API requests
   - Verify the request URL is your production API, not localhost

2. **Test Login**
   - Try logging in
   - Check console for errors
   - Verify authentication token is saved

3. **Test API Calls**
   - Navigate through different pages
   - Verify data loads correctly
   - Check for any network errors

## Example Backend CORS Configuration

### Express.js
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'https://your-app.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### NestJS
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://your-app.vercel.app'
    ],
    credentials: true,
  });
  
  await app.listen(3000);
}
```

## Security Notes

- Never commit `.env.local` file to git
- Use environment variables for sensitive configuration
- Ensure backend API has proper authentication
- Use HTTPS for production API URLs
- Regularly update dependencies for security patches

