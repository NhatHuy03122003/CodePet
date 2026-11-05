# ADR 002: Authentication Strategy

## Status
Accepted

## Context
CodePet requires user authentication to:
- Associate GitHub activity with specific users
- Provide personalized mascot experiences
- Secure access to user data
- Enable GitHub API access on behalf of users

Requirements:
- GitHub OAuth integration (primary auth method)
- Secure session management
- Token storage for GitHub API access
- Simple onboarding flow
- Support for future auth providers (Google, email/password)

## Decision
We selected NextAuth.js (Auth.js) as the authentication solution with GitHub OAuth as the primary provider.

### Authentication Flow

1. **Initial Sign-Up/Sign-In**
   - User clicks "Sign in with GitHub"
   - Redirected to GitHub OAuth consent screen
   - User authorizes CodePet to access their account
   - GitHub redirects back with authorization code
   - NextAuth exchanges code for access token
   - User profile fetched from GitHub
   - User record created in database
   - Access token encrypted and stored
   - Session established via HTTP-only cookie

2. **Session Management**
   - NextAuth manages session via JWT token in HTTP-only cookie
   - Session contains user ID and basic profile info
   - Token refreshed automatically
   - Session expires after configurable duration (default: 30 days)

3. **GitHub API Access**
   - Encrypted GitHub access token stored in database
   - Token decrypted when needed for API calls
   - Token refreshed if expired
   - Token can be revoked by user

### Implementation Details

#### NextAuth Configuration
```typescript
// src/lib/auth/config.ts
export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'read:user user:email repo'
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Create or update user in database
      // Store encrypted access token
      return true
    },
    async session({ session, token }) {
      // Add user ID to session
      session.user.id = token.sub
      return session
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  pages: {
    signIn: '/login'
  }
}
```

#### Token Encryption
- GitHub access tokens encrypted using AES-256-GCM
- Encryption key stored in environment variables
- Tokens decrypted only when needed for API calls
- Never logged or exposed in error messages

#### Database Schema
```prisma
model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  name          String?
  image         String?
  githubId      String?   @unique
  githubUsername String?
  githubToken   String?   // Encrypted
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### Security Considerations

1. **HTTP-Only Cookies**
   - Session cookies marked as HTTP-only
   - Prevents XSS attacks from stealing tokens
   - Secure flag enabled in production (HTTPS only)

2. **CSRF Protection**
   - NextAuth includes built-in CSRF protection
   - Double-submit cookie pattern
   - Required for all state-changing operations

3. **Token Encryption**
   - GitHub tokens encrypted at rest
   - Never exposed in logs or error messages
   - Key rotation strategy for production

4. **OAuth Scope Minimization**
   - Request only necessary permissions
   - Current scope: `read:user user:email repo`
   - Can be expanded later if needed

5. **Session Expiration**
   - Sessions expire after 30 days of inactivity
   - Users must re-authenticate after expiration
   - Configurable based on security requirements

### Alternatives Considered

#### Supabase Auth
**Pros:**
- Built-in authentication with Supabase
- Row-level security integration
- Good documentation

**Cons:**
- Less familiar with Next.js integration
- More complex setup for GitHub OAuth
- Would require additional session management with Next.js

**Decision:** NextAuth provides better Next.js integration and simpler GitHub OAuth flow.

#### Clerk
**Pros:**
- Excellent UX
- Built-in user management
- Good documentation

**Cons:**
- Paid tier required for production
- Less control over authentication flow
- Vendor lock-in

**Decision:** Too expensive for MVP, prefer open-source solution.

#### Custom OAuth Implementation
**Pros:**
- Full control over flow
- No dependencies

**Cons:**
- Reinventing the wheel
- Security risks if not implemented correctly
- More development time
- Need to handle edge cases (token refresh, error handling)

**Decision:** NextAuth handles edge cases and security best practices out of the box.

## Consequences

### Positive
- Industry-standard authentication solution
- Secure by default with best practices
- Easy to add additional providers (Google, email/password)
- Excellent TypeScript support
- Seamless Next.js integration
- Session management handled automatically

### Negative
- Additional dependency to maintain
- Requires environment variables configuration
- Custom callbacks needed for database integration
- Token encryption adds complexity

### Risks
- NextAuth updates may introduce breaking changes
- GitHub OAuth token limits and rate limits
- Token encryption key management in production

### Mitigations
- Pin NextAuth version in package.json
- Monitor GitHub API usage and implement rate limiting
- Use environment-specific encryption keys
- Implement key rotation strategy for production
- Regular security audits

## Future Enhancements

1. **Additional Providers**
   - Google OAuth for non-GitHub users
   - Email/password authentication
   - Magic link authentication

2. **Multi-Factor Authentication**
   - TOTP support
   - SMS verification
   - WebAuthn (hardware keys)

3. **Session Management**
   - Active sessions dashboard
   - Revoke specific sessions
   - Device management

4. **Security Enhancements**
   - IP-based restrictions
   - Suspicious activity detection
   - Account lockout after failed attempts

## References
- [NextAuth.js Documentation](https://next-auth.js.org)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
