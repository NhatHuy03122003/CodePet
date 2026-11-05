# GitHub OAuth Application Setup

This guide explains how to set up a GitHub OAuth application for CodePet authentication.

## Prerequisites

- A GitHub account
- Access to GitHub Developer Settings

## Step-by-Step Setup

### 1. Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on "OAuth Apps" in the left sidebar
3. Click "New OAuth App" button
4. Fill in the application details:

   **Application name**: `CodePet` (or your preferred name)

   **Homepage URL**: `http://localhost:3000` (for development) or your production URL

   **Application description**: `AI-powered coding companion that grows with your GitHub activity`

   **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github` (for development) or `https://yourdomain.com/api/auth/callback/github` (for production)

5. Click "Register application"

### 2. Generate Client Secret

1. After registration, you'll see your **Client ID** (copy this)
2. Scroll down to "Client secrets" section
3. Click "Generate a new client secret"
4. Copy the generated **Client Secret** (you won't be able to see it again)

### 3. Configure Environment Variables

Add the following to your `.env` file:

```bash
# GitHub OAuth
GITHUB_CLIENT_ID="your-client-id-here"
GITHUB_CLIENT_SECRET="your-client-secret-here"
```

### 4. Required OAuth Scopes

CodePet requires the following GitHub OAuth scopes:

- `read:user` - Read user profile data
- `user:email` - Access user email address

These scopes are automatically requested by the application.

### 5. Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/login`
3. Click "Sign in with GitHub"
4. You should be redirected to GitHub's authorization page
5. Authorize the application
6. You should be redirected back to your dashboard

## Production Setup

For production deployment:

1. Update the **Homepage URL** and **Authorization callback URL** in your GitHub OAuth App settings
2. Update `NEXTAUTH_URL` in your environment variables to your production domain
3. Ensure HTTPS is enabled (GitHub requires HTTPS for production OAuth callbacks)
4. Regenerate your client secret if needed

## Security Best Practices

- Never commit `.env` file to version control
- Use environment-specific OAuth apps (separate for dev/staging/production)
- Rotate client secrets periodically
- Monitor OAuth app usage in GitHub settings
- Revoke access if security breach is suspected

## Troubleshooting

### "Application not found" error
- Verify `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are correctly set
- Check that the callback URL matches exactly what's configured in GitHub

### "Redirect URI mismatch" error
- Ensure the callback URL in GitHub matches your environment
- Include the full path: `/api/auth/callback/github`

### "Invalid client" error
- Double-check the client ID is copied correctly
- Ensure you're using the correct OAuth app (not a GitHub App)

## Additional Resources

- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [NextAuth.js GitHub Provider](https://authjs.dev/reference/core/providers/github)
