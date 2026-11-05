# CodePet Service Layers

## Overview

CodePet uses a service layer pattern to encapsulate business logic and provide a clean separation between presentation (components/pages) and data access (database/APIs). Services are the single source of truth for business operations.

## Service Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  (Components, Pages, API Routes)                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                     Service Layer                         │
│  (Business Logic, Orchestration, Validation)             │
├─────────────────────────────────────────────────────────┤
│  AuthService │ GitHubService │ MascotService │ AIService │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Access Layer                      │
│  (Prisma ORM, External APIs, Supabase)                  │
└─────────────────────────────────────────────────────────┘
```

## Service Principles

1. **Single Responsibility**: Each service handles one domain
2. **Stateless**: Services don't maintain internal state
3. **Testable**: Easy to unit test with mocked dependencies
4. **Reusable**: Can be called from components, API routes, or other services
5. **Validated**: All inputs validated before processing
6. **Error Handling**: Consistent error responses
7. **Type Safety**: Full TypeScript types for inputs/outputs

## Core Services

### 1. AuthService

**Location:** `/src/features/auth/services/auth.service.ts`

**Responsibilities:**
- User authentication and session management
- GitHub OAuth token encryption/decryption
- User profile creation and updates
- Token refresh and validation

**Methods:**

```typescript
class AuthService {
  // Create or update user from GitHub profile
  async upsertUser(githubProfile: GitHubProfile): Promise<User>

  // Encrypt and store GitHub token
  async storeGitHubToken(userId: string, token: string): Promise<void>

  // Decrypt and retrieve GitHub token
  async getGitHubToken(userId: string): Promise<string | null>

  // Validate current session
  async validateSession(session: Session): Promise<boolean>

  // Update user profile
  async updateUser(userId: string, data: Partial<User>): Promise<User>

  // Delete user account
  async deleteUser(userId: string): Promise<void>
}
```

**Dependencies:**
- Prisma Client (database)
- Crypto utility (token encryption)
- NextAuth (session management)

**Error Handling:**
- `AuthError`: User not found, invalid token
- `ValidationError`: Invalid input data
- `DatabaseError`: Database operation failed

---

### 2. GitHubService

**Location:** `/src/features/github/services/github.service.ts`

**Responsibilities:**
- GitHub API client wrapper
- Repository synchronization
- Activity data fetching
- Rate limiting management
- Webhook signature verification

**Methods:**

```typescript
class GitHubService {
  // Sync user repositories
  async syncRepositories(userId: string): Promise<Repository[]>

  // Fetch commits for a repository
  async fetchCommits(repoId: string, since?: Date): Promise<Commit[]>

  // Fetch pull requests for a repository
  async fetchPullRequests(repoId: string, since?: Date): Promise<PullRequest[]>

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string): boolean

  // Process webhook event
  async processWebhook(event: WebhookEvent): Promise<void>

  // Get user activity summary
  async getActivitySummary(userId: string, period: DateRange): Promise<ActivitySummary>

  // Refresh repository data
  async refreshRepository(repoId: string): Promise<Repository>
}
```

**Dependencies:**
- Octokit (GitHub SDK)
- Prisma Client (database)
- AuthService (for GitHub token)
- RateLimiter (for API rate limits)

**Error Handling:**
- `GitHubError`: API call failed, rate limit exceeded
- `WebhookError`: Invalid webhook signature
- `SyncError`: Repository sync failed

---

### 3. MascotService

**Location:** `/src/features/mascot/services/mascot.service.ts`

**Responsibilities:**
- Mascot state management
- Growth calculation
- Stage progression
- Experience point management
- Comment trigger logic

**Methods:**

```typescript
class MascotService {
  // Get or create mascot for user
  async getOrCreateMascot(userId: string): Promise<Mascot>

  // Add experience points
  async addExperience(userId: string, xp: number, source: XPSource): Promise<Mascot>

  // Calculate level from experience
  calculateLevel(experience: number): number

  // Determine stage from level
  determineStage(level: number): MascotStage

  // Check for level up
  async checkLevelUp(userId: string): Promise<{ levelUp: boolean, newLevel: number }>

  // Trigger comment generation
  async triggerComment(userId: string, context: CommentContext): Promise<Comment>

  // Get mascot growth history
  async getGrowthHistory(userId: string): Promise<GrowthHistory[]>
}
```

**Dependencies:**
- Prisma Client (database)
- AIService (comment generation)
- GrowthCalculator (XP calculation logic)

**Error Handling:**
- `MascotError`: Mascot not found, invalid XP value
- `GrowthError`: Level calculation failed

---

### 4. GrowthCalculator

**Location:** `/src/features/mascot/services/growth-calculator.ts`

**Responsibilities:**
- XP calculation rules
- Level thresholds
- Stage requirements
- Bonus calculations

**Methods:**

```typescript
class GrowthCalculator {
  // Calculate XP for activity type
  calculateXP(activityType: ActivityType, metadata?: Record<string, any>): number

  // Get XP needed for next level
  getXPForLevel(level: number): number

  // Calculate bonus for streak milestone
  calculateStreakBonus(streak: number): number

  // Get total XP required for stage
  getXPForStage(stage: number): number
}
```

**Dependencies:**
- None (pure functions)

**Error Handling:**
- No errors (pure calculation functions)

---

### 5. StreakService

**Location:** `/src/features/streaks/services/streak.service.ts`

**Responsibilities:**
- Streak calculation
- Daily activity monitoring
- Streak milestone detection
- Streak reset logic

**Methods:**

```typescript
class StreakService {
  // Get current streak for user
  async getStreak(userId: string): Promise<Streak>

  // Update streak based on daily activity
  async updateStreak(userId: string, activityDate: Date): Promise<Streak>

  // Check for streak milestone
  async checkMilestone(userId: string): Promise<{ milestone: number | null }>

  // Reset streak (gap in activity)
  async resetStreak(userId: string): Promise<Streak>

  // Get streak history
  async getStreakHistory(userId: string): Promise<StreakHistory[]>

  // Calculate consecutive active days
  calculateConsecutiveDays(activities: Activity[]): number
}
```

**Dependencies:**
- Prisma Client (database)
- Date utility (date calculations)

**Error Handling:**
- `StreakError`: Invalid date, calculation failed

---

### 6. AIService

**Location:** `/src/features/ai/services/openai.service.ts`

**Responsibilities:**
- OpenAI API calls
- Comment generation
- Prompt template management
- Cost tracking
- Response caching

**Methods:**

```typescript
class AIService {
  // Generate mascot comment
  async generateComment(context: CommentContext, tone: string): Promise<string>

  // Generate comment with specific prompt
  async generateWithPrompt(prompt: string, options: GenerationOptions): Promise<string>

  // Get cached comment if available
  async getCachedComment(context: CommentContext): Promise<string | null>

  // Cache generated comment
  async cacheComment(context: CommentContext, response: string): Promise<void>

  // Track API usage and cost
  async trackUsage(tokens: number, cost: number): Promise<void>

  // Get cost summary for user
  async getCostSummary(userId: string, period: DateRange): Promise<CostSummary>
}
```

**Dependencies:**
- OpenAI SDK
- Prisma Client (database)
- Cache (Redis or in-memory)

**Error Handling:**
- `AIError`: API call failed, rate limit exceeded
- `CostError`: Budget exceeded

---

### 7. CommentGenerator

**Location:** `/src/features/ai/services/comment-generator.ts`

**Responsibilities:**
- Prompt template selection
- Context building for AI
- Comment type handling
- Tone application

**Methods:**

```typescript
class CommentGenerator {
  // Build prompt for commit comment
  buildCommitPrompt(commit: Commit, mascot: Mascot): string

  // Build prompt for streak achievement
  buildStreakPrompt(streak: number, mascot: Mascot): string

  // Build prompt for level up
  buildLevelUpPrompt(level: number, mascot: Mascot): string

  // Apply tone to comment
  applyTone(comment: string, tone: string): string

  // Select appropriate template
  selectTemplate(commentType: CommentType): PromptTemplate
}
```

**Dependencies:**
- None (pure functions + templates)

**Error Handling:**
- No errors (pure functions)

---

### 8. WebhookHandler

**Location:** `/src/features/github/services/webhook.handler.ts`

**Responsibilities:**
- Webhook event parsing
- Event routing to appropriate handlers
- Event validation
- Idempotency handling

**Methods:**

```typescript
class WebhookHandler {
  // Handle push event (commits)
  async handlePushEvent(event: PushEvent): Promise<void>

  // Handle pull request event
  async handlePullRequestEvent(event: PullRequestEvent): Promise<void>

  // Handle pull request review event
  async handleReviewEvent(event: ReviewEvent): Promise<void>

  // Check if event already processed (idempotency)
  async isProcessed(eventId: string): Promise<boolean>

  // Mark event as processed
  async markProcessed(eventId: string): Promise<void>
}
```

**Dependencies:**
- GitHubService (API calls)
- MascotService (growth updates)
- StreakService (streak updates)
- Prisma Client (idempotency tracking)

**Error Handling:**
- `WebhookError`: Invalid event, processing failed

---

## Service Orchestration

### Example: Commit Processing Flow

```typescript
// Webhook receives push event
WebhookHandler.handlePushEvent(event)
  ↓
// GitHubService fetches commit details
GitHubService.fetchCommits(repoId)
  ↓
// Activity recorded to database
GitHubService.recordActivity(activity)
  ↓
// MascotService calculates growth
MascotService.addExperience(userId, xp, 'commit')
  ↓
// Check for level up
MascotService.checkLevelUp(userId)
  ↓
// StreakService updates streak
StreakService.updateStreak(userId, activityDate)
  ↓
// Check for streak milestone
StreakService.checkMilestone(userId)
  ↓
// AIService generates comment
AIService.generateComment(context, tone)
  ↓
// Comment saved to database
MascotService.saveComment(comment)
```

### Example: User Dashboard Load Flow

```typescript
// Dashboard page loads
Dashboard component
  ↓
// Fetch user mascot
MascotService.getOrCreateMascot(userId)
  ↓
// Fetch current streak
StreakService.getStreak(userId)
  ↓
// Fetch recent activity
GitHubService.getActivitySummary(userId, period)
  ↓
// Fetch recent comments
MascotService.getRecentComments(userId)
  ↓
// Display to user
Dashboard component renders
```

## Service Testing Strategy

### Unit Tests
- Test each service in isolation
- Mock all external dependencies (APIs, database)
- Test business logic thoroughly
- Edge cases and error conditions

### Integration Tests
- Test service interactions
- Use test database
- Test end-to-end flows
- Verify side effects

### Test Examples

```typescript
// AuthService unit test
describe('AuthService', () => {
  it('should create user from GitHub profile', async () => {
    const mockProfile = { id: '123', login: 'testuser', ... }
    const result = await authService.upsertUser(mockProfile)
    expect(result.githubUsername).toBe('testuser')
  })
})

// MascotService integration test
describe('MascotService Integration', () => {
  it('should add XP and trigger level up', async () => {
    await mascotService.addExperience(userId, 100, 'commit')
    const mascot = await mascotService.getOrCreateMascot(userId)
    expect(mascot.level).toBeGreaterThan(1)
  })
})
```

## Service Error Handling Pattern

All services follow a consistent error handling pattern:

```typescript
try {
  // Business logic
  const result = await performOperation()
  return result
} catch (error) {
  // Log error with context
  logger.error('Operation failed', { userId, error })

  // Transform to service-specific error
  if (error instanceof PrismaError) {
    throw new DatabaseError('Database operation failed', error)
  }

  // Re-throw
  throw error
}
```

## Service Caching Strategy

### Cache Layers
1. **In-Memory Cache**: Short-lived (5 minutes) for frequently accessed data
2. **Redis Cache**: Medium-lived (1 hour) for shared data
3. **Database Cache**: Long-lived (1 day) for computed results

### Cache Keys
- `mascot:{userId}` - Mascot state
- `streak:{userId}` - Current streak
- `activity:{userId}:{date}` - Daily activity
- `comment:{contextHash}` - Generated comments

### Cache Invalidation
- Time-based expiration
- Event-based invalidation (on new activity)
- Manual invalidation (on user action)

## Service Monitoring

### Metrics to Track
- Service execution time
- Error rates per service
- API call counts
- Cache hit/miss ratios
- Database query performance

### Logging
- Structured logs with context
- Log levels: error, warn, info, debug
- Include userId, requestId, timestamp

### Alerts
- High error rate
- Slow service execution
- API rate limit exceeded
- Database connection issues

## Service Versioning

For future API changes:

1. **Semantic Versioning**: Major.Minor.Patch
2. **Backward Compatibility**: Maintain old versions
3. **Deprecation Warnings**: Notify consumers
4. **Migration Path**: Guide to new version

## Service Documentation

Each service should include:

1. **JSDoc Comments**: Method descriptions
2. **Type Definitions**: Input/output types
3. **Usage Examples**: How to use the service
4. **Error Scenarios**: What errors can occur
5. **Dependencies**: What the service needs

## Service Layer Benefits

1. **Separation of Concerns**: Business logic isolated from UI
2. **Reusability**: Services used by multiple consumers
3. **Testability**: Easy to unit test
4. **Maintainability**: Changes isolated to service
5. **Scalability**: Services can be extracted to microservices
6. **Type Safety**: Full TypeScript support
