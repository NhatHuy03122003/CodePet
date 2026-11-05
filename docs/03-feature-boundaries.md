# CodePet Feature Boundaries

## Overview

This document defines the boundaries, responsibilities, and interactions between CodePet's major features. Clear boundaries prevent feature creep, ensure maintainability, and enable parallel development.

## Core Features

### 1. Authentication Feature

**Responsibilities:**
- User authentication via GitHub OAuth
- Session management with NextAuth
- User profile creation and updates
- Token management (GitHub access token storage)

**Boundaries:**
- **Owns:** User session state, OAuth flow, token encryption/decryption
- **Does NOT own:** GitHub API calls (delegates to GitHub feature), user profile UI (delegates to Dashboard feature)

**Interactions:**
- → GitHub Feature: Provides encrypted GitHub token for API access
- → Dashboard Feature: Provides user session data for display
- → All Features: Provides current user context

**Entry Points:**
- `/api/auth/[...nextauth]` - NextAuth configuration
- `/src/features/auth/` - Auth-specific logic
- `/src/components/auth/` - Auth UI components

**External Dependencies:**
- NextAuth.js
- GitHub OAuth API
- Supabase (for user data)

---

### 2. GitHub Integration Feature

**Responsibilities:**
- GitHub API client wrapper
- Webhook handling (push, pull_request events)
- Repository synchronization
- Activity data fetching (commits, PRs, issues)
- Rate limiting management

**Boundaries:**
- **Owns:** GitHub API client, webhook processing, repository data fetching
- **Does NOT own:** User authentication (receives token from Auth), activity storage (delegates to database), mascot updates (delegates to Mascot feature)

**Interactions:**
- ← Auth Feature: Receives encrypted GitHub token
- → Database: Stores repository and commit data
- → Mascot Feature: Triggers mascot growth on new activity
- → AI Feature: Triggers comment generation on commits

**Entry Points:**
- `/api/github/webhook` - GitHub webhook handler
- `/api/github/sync` - Manual repository sync
- `/src/features/github/` - GitHub-specific logic

**External Dependencies:**
- GitHub REST API
- GitHub Webhooks
- Octokit (GitHub JS SDK)

**Webhook Events Handled:**
- `push` - New commits
- `pull_request` - PR opened, merged, closed
- `pull_request_review` - Code reviews

---

### 3. Mascot Feature

**Responsibilities:**
- Mascot state management (level, stage, experience)
- Growth calculation and progression
- Mascot stage determination based on level
- Mascot comment generation triggers
- Mascot visual display logic

**Boundaries:**
- **Owns:** Mascot state, growth logic, stage progression, comment triggers
- **Does NOT own:** AI comment generation (delegates to AI feature), activity tracking (receives from GitHub feature), UI rendering (delegates to components)

**Interactions:**
- ← GitHub Feature: Receives activity events for growth calculation
- → AI Feature: Requests mascot comments
- → Database: Persists mascot state
- → Components: Provides mascot data for display

**Entry Points:**
- `/api/mascot/growth` - Growth calculation endpoint
- `/api/mascot/comments` - Comment retrieval
- `/src/features/mascot/` - Mascot-specific logic

**Growth Rules:**
- Commit: +10 XP
- PR Opened: +50 XP
- PR Merged: +100 XP
- Code Review: +30 XP
- Issue Opened: +20 XP
- Issue Closed: +40 XP
- Streak Milestone: Bonus XP (streak × 10)

**Stage Progression:**
- Stage 1: Level 1-5
- Stage 2: Level 6-10
- Stage 3: Level 11-20
- Stage 4: Level 21-50
- Stage 5: Level 51-100
- Stage 6: Level 101-200
- Stage 7: Level 201-500
- Stage 8: Level 501-1000
- Stage 9: Level 1001-2000
- Stage 10: Level 2001+

---

### 4. Streaks Feature

**Responsibilities:**
- Streak calculation and tracking
- Daily activity monitoring
- Streak milestone detection
- Streak reset logic
- Streak statistics

**Boundaries:**
- **Owns:** Streak state, streak calculation logic, milestone detection
- **Does NOT own:** Activity data fetching (receives from GitHub feature), streak UI (delegates to Dashboard feature)

**Interactions:**
- ← GitHub Feature: Receives daily activity data
- → Database: Persists streak state
- → Mascot Feature: Notifies of streak milestones for bonuses
- → Dashboard Feature: Provides streak data for display

**Entry Points:**
- `/src/features/streaks/` - Streak-specific logic
- Scheduled job (cron) for daily streak calculation

**Streak Rules:**
- Activity on consecutive days = streak +1
- Gap of 1 day = streak reset to 0
- Streak calculated at midnight UTC
- Milestones: 7, 14, 30, 60, 90, 100, 365 days

---

### 5. AI Feature

**Responsibilities:**
- AI comment generation using OpenAI
- Comment tone/personality management
- Prompt engineering and template management
- Cost tracking and optimization
- AI response caching

**Boundaries:**
- **Owns:** OpenAI API calls, prompt templates, comment generation
- **Does NOT own:** Comment storage (delegates to Database), comment display (delegates to Mascot feature), trigger logic (receives from Mascot feature)

**Interactions:**
- ← Mascot Feature: Receives comment generation requests
- → Database: Stores AI comments and cost data
- → OpenAI API: Generates comments

**Entry Points:**
- `/src/features/ai/` - AI-specific logic
- Internal service called by Mascot feature

**Comment Types:**
- Commit comments: React to code changes
- Streak achievements: Celebrate milestones
- Level-ups: Encourage progression
- Daily greetings: Welcome users back

**Tone Options:**
- Friendly: Encouraging and warm
- Witty: Humorous and playful
- Professional: Polished and respectful
- Motivational: Inspiring and uplifting

**Cost Management:**
- Cache comments for similar contexts
- Use GPT-3.5 for simple comments, GPT-4 for complex ones
- Track token usage and costs
- Implement budget limits per user

---

## Cross-Feature Concerns

### Database Access
- All features access database through Prisma client
- Database schema defined in `/prisma/schema.prisma`
- No direct SQL queries outside of migrations

### Error Handling
- Each feature handles its own errors
- Standardized error response format
- Global error boundary in `/src/app/error.tsx`

### Logging
- Structured logging with context
- Feature-specific log prefixes
- Error tracking integrated (e.g., Sentry)

### Validation
- Input validation via Zod schemas
- Feature-specific schemas in `/src/lib/validations/`
- Validation at API route boundaries

### State Management
- Feature-specific state in `/src/stores/`
- Server state via React Query
- Session state via NextAuth

## Feature Interdependency Graph

```
                    ┌──────────────┐
                    │  Auth        │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────▼─────┐ ┌────▼────┐ ┌────▼────┐
        │  GitHub   │ │ Dashboard│ │  AI     │
        └─────┬─────┘ └─────────┘ └─────────┘
              │
        ┌─────┼─────┐
        │     │     │
  ┌─────▼─┐ ┌▼──────▼──┐
  │Mascot │ │ Streaks  │
  └───────┘ └──────────┘
```

## Feature Ownership Matrix

| Responsibility | Auth | GitHub | Mascot | Streaks | AI |
|----------------|------|--------|--------|---------|----|
| User Session | ✅ | | | | |
| GitHub Token | ✅ | | | | |
| GitHub API Calls | | ✅ | | | |
| Webhook Handling | | ✅ | | | |
| Repository Sync | | ✅ | | | |
| Activity Tracking | | ✅ | | | |
| Mascot State | | | ✅ | | |
| Growth Calculation | | | ✅ | | |
| Stage Progression | | | ✅ | | |
| Streak Calculation | | | | ✅ | |
| Streak Milestones | | | | ✅ | |
| AI Comment Generation | | | | | ✅ |
| Prompt Engineering | | | | | ✅ |
| Cost Tracking | | | | | ✅ |

## Future Feature Expansion

### Phase 2 Features (Post-MVP)
1. **Achievements System**: Unlockable badges and rewards
2. **Leaderboards**: Compare progress with friends
3. **Social Features**: Share mascot on social media
4. **Custom Mascots**: User-customizable mascot appearance
5. **Teams Support**: Team mascots and collective growth

### Integration Points for Future Features
- Achievements: Integrate with Mascot and Streaks features
- Leaderboards: New feature, reads from all user data
- Social: New feature, exports mascot data
- Custom Mascots: Extend Mascot feature with customization
- Teams: New feature, extends GitHub integration

## Anti-Patterns to Avoid

1. **Tight Coupling**: Features should not directly import each other's internal logic
2. **Shared State**: Avoid global state between features; use explicit data flow
3. **Circular Dependencies**: Feature A depends on B, B depends on A
4. **Feature Bloat**: Keep features focused; split when they grow too large
5. **Hidden Dependencies**: All dependencies should be explicit via interfaces/APIs

## Testing Strategy

### Unit Tests
- Test each feature in isolation
- Mock external dependencies (GitHub API, OpenAI API)
- Test business logic (growth calc, streak calc)

### Integration Tests
- Test feature interactions
- Test webhook processing flow
- Test end-to-end user journeys

### E2E Tests
- Test complete user flows
- Test auth → sync → growth → comment pipeline
- Test streak reset logic

## Feature Lifecycle

### Development
- Feature developed in isolation
- API contracts defined first
- Mock implementations for dependencies

### Integration
- Features integrated one by one
- Integration tests run after each integration
- Contract testing between features

### Deployment
- Features can be deployed independently
- Feature flags for gradual rollout
- Monitoring for feature-specific metrics
