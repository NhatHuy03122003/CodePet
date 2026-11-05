# CodePet Database Schema

## Overview

CodePet uses Supabase (PostgreSQL) as the database, managed through Prisma ORM. The schema supports user authentication, GitHub integration, mascot growth tracking, and AI-generated comments.

## ER Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │───1:N─│  Activity   │───N:1─│  Repository │
└─────────────┘       └─────────────┘       └─────────────┘
       │                                           │
       │ 1:1                                       │ 1:N
       ▼                                           ▼
┌─────────────┐                           ┌─────────────┐
│   Mascot     │                           │   Commit    │
└─────────────┘                           └─────────────┘
       │                                           │
       │ 1:N                                       │ 1:N
       ▼                                           ▼
┌─────────────┐                           ┌─────────────┐
│  MascotStage│                           │  Comment    │
└─────────────┘                           └─────────────┘
                                                │
                                                │ N:1
                                                ▼
                                         ┌─────────────┐
                                         │  AIComment  │
                                         └─────────────┘
```

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// User & Authentication
// ============================================================================

model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  name          String?
  image         String?
  githubId      String?   @unique
  githubUsername String?
  githubToken   String?   // Encrypted access token
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  mascot        Mascot?
  activities    Activity[]
  repositories  Repository[]

  @@index([githubId])
  @@index([email])
}

// ============================================================================
// Mascot & Growth
// ============================================================================

model Mascot {
  id          String       @id @default(cuid())
  userId      String       @unique
  name        String       @default("Byte")
  stage       Int          @default(1) // Current growth stage (1-10)
  experience  Int          @default(0) // Total XP
  level       Int          @default(1) // Level based on XP
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  // Relations
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  comments    Comment[]

  @@index([userId])
}

model MascotStage {
  id          Int          @id
  name        String       // e.g., "Baby Byte", "Coder Byte", "Master Byte"
  description String
  minLevel    Int          // Minimum level to reach this stage
  imageUrl    String       // Path to mascot image
  unlocked    Boolean      @default(false) // Whether this stage is unlockable

  @@map("mascot_stages")
}

// ============================================================================
// GitHub Integration
// ============================================================================

model Repository {
  id              String    @id @default(cuid())
  userId          String
  githubId        Int       // GitHub repository ID
  name            String    // e.g., "owner/repo"
  fullName        String
  description     String?
  language        String?
  stars           Int       @default(0)
  forks           Int       @default(0)
  isPrivate       Boolean   @default(false)
  lastSyncedAt    DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  commits         Commit[]

  @@unique([userId, githubId])
  @@index([userId])
  @@index([githubId])
}

model Activity {
  id          String    @id @default(cuid())
  userId      String
  type        ActivityType
  date        DateTime  @db.Date
  count       Int       @default(0) // Number of commits, PRs, etc.
  metadata    Json?     // Additional context

  // Relations
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, type, date])
  @@index([userId])
  @@index([date])
}

enum ActivityType {
  COMMIT
  PR_OPENED
  PR_MERGED
  PR_REVIEWED
  ISSUE_OPENED
  ISSUE_CLOSED
  CODE_REVIEW
}

model Commit {
  id              String    @id @default(cuid())
  repositoryId    String
  githubSha       String    @unique
  message         String
  authorName      String
  authorEmail     String
  committedAt     DateTime
  addedLines      Int       @default(0)
  deletedLines    Int       @default(0)
  createdAt       DateTime  @default(now())

  // Relations
  repository      Repository @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  comments        Comment[]

  @@index([repositoryId])
  @@index([committedAt])
  @@index([githubSha])
}

// ============================================================================
// Comments & AI
// ============================================================================

model Comment {
  id          String    @id @default(cuid())
  mascotId    String
  commitId    String?
  aiCommentId String?   @unique
  type        CommentType
  content     String    @db.Text
  tone        String    @default("friendly") // e.g., "friendly", "encouraging", "witty"
  createdAt   DateTime  @default(now())

  // Relations
  mascot      Mascot    @relation(fields: [mascotId], references: [id], onDelete: Cascade)
  commit      Commit?   @relation(fields: [commitId], references: [id], onDelete: Cascade)
  aiComment   AIComment? @relation(fields: [aiCommentId], references: [id], onDelete: SetNull)

  @@index([mascotId])
  @@index([commitId])
  @@index([createdAt])
}

enum CommentType {
  COMMIT_COMMENT
  STREAK_ACHIEVEMENT
  LEVEL_UP
  MILESTONE
  DAILY_GREETING
}

model AIComment {
  id          String    @id @default(cuid())
  prompt      String    @db.Text
  response    String    @db.Text
  model       String    @default("gpt-4")
  tokensUsed  Int       @default(0)
  cost        Float     @default(0)
  createdAt   DateTime  @default(now())

  // Relations
  comments    Comment[]

  @@index([createdAt])
}

// ============================================================================
// Streaks & Achievements
// ============================================================================

model Streak {
  id          String    @id @default(cuid())
  userId      String    @unique
  current     Int       @default(0) // Current streak length
  longest     Int       @default(0) // Longest streak achieved
  lastActive  DateTime? // Last date with activity
  startDate   DateTime? // When current streak started
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([userId])
}
```

## Schema Details

### User Table
Stores user information from GitHub OAuth. The `githubToken` is encrypted using Supabase's vault or application-level encryption.

**Key Fields:**
- `githubId`: Unique GitHub user ID
- `githubToken`: Encrypted OAuth token for API access
- `githubUsername`: GitHub handle for display

### Mascot Table
Tracks the user's mascot (Byte) growth and progression.

**Key Fields:**
- `stage`: Current visual stage (1-10)
- `experience`: Total XP accumulated
- `level`: Calculated level based on XP thresholds

**Growth Logic:**
- 1 commit = 10 XP
- 1 PR opened = 50 XP
- 1 PR merged = 100 XP
- 1 code review = 30 XP
- Streak milestone bonuses

### MascotStage Table
Defines the 10 growth stages with their requirements and visuals.

**Example Stages:**
1. Level 1-5: Baby Byte (just born)
2. Level 6-10: Coder Byte (learning to code)
3. Level 11-20: Dev Byte (contributing)
4. Level 21-50: Senior Byte (experienced)
5. Level 51-100: Lead Byte (team lead)
6. Level 101-200: Architect Byte (system design)
7. Level 201-500: Master Byte (expert)
8. Level 501-1000: Legend Byte (legendary)
9. Level 1001-2000: Mythic Byte (mythical)
10. Level 2001+: Cosmic Byte (transcendent)

### Repository Table
Synced GitHub repositories for the user.

**Key Fields:**
- `githubId`: GitHub's repository ID
- `lastSyncedAt`: Timestamp of last webhook sync
- Indexed by both `userId` and `githubId` for fast lookups

### Activity Table
Daily activity tracking for streak calculation and statistics.

**Key Fields:**
- `type`: Activity type (commit, PR, review, etc.)
- `date`: Date of activity (UTC)
- `count`: Number of activities of that type on that date
- `metadata`: JSON for additional context

**Unique Constraint:** `[userId, type, date]` ensures one record per activity type per day.

### Commit Table
Stores individual commits from synced repositories.

**Key Fields:**
- `githubSha`: Unique commit SHA from GitHub
- `addedLines`/`deletedLines`: Code change metrics
- `committedAt`: Timestamp from GitHub

### Comment Table
Stores mascot comments on commits and events.

**Key Fields:**
- `type`: Comment context (commit, streak, level-up, etc.)
- `tone`: Personality tone for AI generation
- Links to both `Mascot` and optional `Commit`

### AIComment Table
Tracks AI-generated comments for cost monitoring and debugging.

**Key Fields:**
- `prompt`: The input sent to OpenAI
- `response`: The AI's response
- `tokensUsed`/`cost`: For cost tracking
- One-to-many with `Comment` (same AI response can be reused)

### Streak Table
Tracks coding streaks for motivation.

**Key Fields:**
- `current`: Current consecutive days of activity
- `longest`: Best streak achieved
- `lastActive`: Last date with any activity
- `startDate`: When current streak began

**Streak Logic:**
- Activity on consecutive days increments streak
- Gap of 1 day resets streak to 0
- Streaks calculated at midnight UTC

## Indexes

All tables have appropriate indexes for:
- Foreign key relationships
- Common query patterns (by date, by user, by type)
- Unique constraints for data integrity

## Security Considerations

1. **Encrypted Tokens**: GitHub OAuth tokens stored encrypted
2. **Row-Level Security**: Supabase RLS policies for multi-tenant isolation
3. **Input Validation**: All inputs validated via Zod schemas
4. **SQL Injection Prevention**: Prisma ORM provides parameterized queries
5. **PII Protection**: Email and name optional, not required

## Migration Strategy

Initial migration will:
1. Create all tables
2. Seed `MascotStage` with 10 predefined stages
3. Set up RLS policies in Supabase
4. Create database functions for streak calculation

Future migrations will be managed via Prisma Migrate.

## Scaling Considerations

1. **Partitioning**: `Activity` and `Commit` tables can be partitioned by date if needed
2. **Read Replicas**: Statistics queries can use read replicas
3. **Caching**: Frequently accessed mascot data cached in Redis
4. **Archiving**: Old commits can be archived to cold storage after 1 year
5. **Connection Pooling**: Supabase connection pooling for high concurrency
