# Environment Variables Setup

This project uses environment variables to store sensitive configuration like API keys, database credentials, and authentication settings.

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your actual values** in the `.env` file

3. **Run the application** - the `.env` file will be automatically loaded

## Required Environment Variables

### MongoDB Configuration
- `MONGODB_URI` - Your MongoDB connection string
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0`
- `MONGODB_DATABASE` - Database name (default: `truSwap`)

### Auth0 Configuration
- `AUTH0_ISSUER_URI` - Your Auth0 domain
  - Format: `https://your-domain.us.auth0.com/`
  - Get from: https://manage.auth0.com/
- `AUTH0_AUDIENCE` - Your Auth0 API identifier
  - Example: `https://api.truSwap.com`

### PayPal Configuration
- `PAYPAL_CLIENT_ID` - PayPal client ID
- `PAYPAL_CLIENT_SECRET` - PayPal client secret
- `PAYPAL_MODE` - `sandbox` or `live` (default: `sandbox`)
- `PAYPAL_BASE_URL` - Base URL for PayPal callbacks (default: `http://localhost:8080`)
- Get credentials from: https://developer.paypal.com/dashboard/applications/sandbox

## How It Works

The application automatically loads variables from the `.env` file in the `backend/` directory when you run it locally. The `.env` file is **NOT** committed to git (it's in `.gitignore`).

For production deployments, set these as actual environment variables in your hosting platform (Heroku, AWS, etc.).

## Frontend Environment Variables

The frontend also uses environment variables. See `frontend/.env.example` for details.

Required frontend variables:
- `VITE_AUTH0_DOMAIN`
- `VITE_AUTH0_CLIENT_ID`
- `VITE_AUTH0_AUDIENCE` (optional)

## Troubleshooting

- **Application won't start:** Make sure all required environment variables are set
- **Database connection fails:** Check your `MONGODB_URI` is correct
- **Auth0 errors:** Verify your `AUTH0_ISSUER_URI` and `AUTH0_AUDIENCE` match your Auth0 dashboard
- **PayPal errors:** Ensure your PayPal credentials are correct and the mode matches (sandbox vs live)

