# Auth0 JWT Token Validation Setup

This guide explains how to configure Spring Boot to validate Auth0 JWT tokens.

## Step 1: Get Your Auth0 Domain

1. Go to [Auth0 Dashboard](https://manage.auth0.com)
2. Check your **Domain** (e.g., `dev-abc123.us.auth0.com`)
3. Copy this value

## Step 2: Create an API in Auth0 (Optional but Recommended)

1. In Auth0 Dashboard, go to **Applications** → **APIs**
2. Click **Create API**
3. Set:
   - **Name**: TruSwap API
   - **Identifier**: `https://truSwap-api` (or your preferred identifier)
   - **Signing Algorithm**: RS256
4. Click **Create**
5. Copy the **Identifier** - this is your audience

## Step 3: Configure Frontend to Request API Access

In your frontend `.env` file, add:
```env
VITE_AUTH0_AUDIENCE=https://truSwap-api
```

This tells Auth0 to include the API audience in the token.

## Step 4: Configure Backend application.properties

Update `/backend/src/main/resources/application.properties`:

```properties
# Replace YOUR_AUTH0_DOMAIN with your actual Auth0 domain
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://YOUR_AUTH0_DOMAIN/
spring.security.oauth2.resourceserver.jwt.audiences=https://truSwap-api
```

**Example:**
```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://dev-abc123.us.auth0.com/
spring.security.oauth2.resourceserver.jwt.audiences=https://truSwap-api
```

## Step 5: Restart Backend

Restart your Spring Boot application for changes to take effect.

## How It Works

1. **Frontend**: User logs in via Auth0 and receives a JWT token
2. **Frontend**: Sends token in `Authorization: Bearer <token>` header
3. **Backend**: Spring Security validates the token signature and issuer
4. **Backend**: Extracts user ID from token's `sub` claim
5. **Backend**: Associates the listing with the authenticated user

## Token Claims

The JWT token contains:
- `sub`: User ID (used as `userId` in the database)
- `email`: User's email address
- `name`: User's name
- `aud`: Audience (your API identifier)
- `iss`: Issuer (your Auth0 domain)

## Testing

1. Log in to your frontend
2. Try creating a listing
3. The backend should:
   - Validate the token
   - Extract the user ID from `sub` claim
   - Create the listing with that user ID

## Troubleshooting

### Error: "Invalid token"
- Check that `issuer-uri` matches your Auth0 domain exactly
- Ensure the token includes the correct audience

### Error: "401 Unauthorized"
- Make sure the token is being sent in the Authorization header
- Verify the user is logged in on the frontend
- Check that the API audience matches in both frontend and backend

### Error: "Could not resolve Signing Key"
- Verify your Auth0 domain is correct
- Check that the issuer URI ends with `/` (slash)
- Ensure internet connection for key resolution

## Security Notes

- The JWT token is validated on every request to protected endpoints
- Token signature is verified using Auth0's public keys
- Token expiration is automatically checked
- User ID is extracted from the token, not from request body (more secure)

