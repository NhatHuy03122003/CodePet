# CodePet API Contracts

## Overview

This document defines all API contracts for CodePet, including routes, methods, request/response schemas, authentication requirements, and error handling. All APIs follow RESTful conventions and use OpenAPI 3.0 specification style.

## Base URL

```
Development: http://localhost:3000/api
Production: https://codepet.app/api
```

## Authentication

Most API endpoints require authentication via NextAuth session cookie. Public endpoints are marked as such.

**Authentication Methods:**
- Session cookie (NextAuth)
- GitHub OAuth token (for GitHub-specific endpoints)

**Headers:**
```
Cookie: next-auth.session-token=<session_token>
```

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-11-04T20:00:00Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2026-11-04T20:00:00Z"
  }
}
```

### Error Codes
- `UNAUTHORIZED`: Authentication required or invalid
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error
- `GITHUB_API_ERROR`: GitHub API call failed
- `AI_SERVICE_ERROR`: AI service error
- `DATABASE_ERROR`: Database operation failed

## API Endpoints

### Authentication API

#### GitHub OAuth Callback
**Endpoint:** `GET /api/auth/callback/github`

**Description:** Handle GitHub OAuth callback (managed by NextAuth)

**Authentication:** None (public)

**Query Parameters:**
- `code` (string, required): Authorization code from GitHub
- `state` (string, required): CSRF protection token

**Response:** Redirects to dashboard or error page

---

#### Sign Out
**Endpoint:** `POST /api/auth/signout`

**Description:** Sign out user and clear session

**Authentication:** Required

**Request Body:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Signed out successfully"
  }
}
```

---

#### Get Current Session
**Endpoint:** `GET /api/auth/session`

**Description:** Get current user session

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clxxx",
      "name": "John Doe",
      "email": "john@example.com",
      "image": "https://github.com/johndoe.png",
      "githubUsername": "johndoe"
    },
    "expires": "2026-11-05T20:00:00Z"
  }
}
```

---

### GitHub Integration API

#### Webhook Handler
**Endpoint:** `POST /api/github/webhook`

**Description:** Handle GitHub webhook events (push, pull_request, etc.)

**Authentication:** None (public, signature verified)

**Headers:**
- `X-Hub-Signature-256` (string, required): Webhook signature
- `X-GitHub-Event` (string, required): Event type
- `X-GitHub-Delivery` (string, required): Delivery ID

**Request Body:** GitHub webhook payload (varies by event type)

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Webhook processed successfully",
    "eventId": "12345-67890"
  }
}
```

**Event Types Handled:**
- `push`: New commits pushed
- `pull_request`: PR opened, closed, merged
- `pull_request_review`: Code review submitted

---

#### Sync Repositories
**Endpoint:** `POST /api/github/sync`

**Description:** Manually trigger repository synchronization

**Authentication:** Required

**Request Body:**
```json
{
  "force": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "synced": 5,
    "failed": 0,
    "repositories": [
      {
        "id": "clxxx",
        "name": "owner/repo",
        "lastSyncedAt": "2026-11-04T20:00:00Z"
      }
    ]
  }
}
```

---

#### Get User Repositories
**Endpoint:** `GET /api/github/repositories`

**Description:** Get list of user's synced repositories

**Authentication:** Required

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "repositories": [
      {
        "id": "clxxx",
        "name": "owner/repo",
        "fullName": "owner/repository",
        "description": "A cool project",
        "language": "TypeScript",
        "stars": 42,
        "forks": 10,
        "isPrivate": false,
        "lastSyncedAt": "2026-11-04T20:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

---

#### Get Activity Summary
**Endpoint:** `GET /api/github/activity`

**Description:** Get user's coding activity summary

**Authentication:** Required

**Query Parameters:**
- `period` (string, optional, default: "7d"): "7d", "30d", "90d", "1y", "all"
- `startDate` (string, optional, format: YYYY-MM-DD)
- `endDate` (string, optional, format: YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "7d",
    "summary": {
      "commits": 25,
      "pullRequestsOpened": 3,
      "pullRequestsMerged": 2,
      "reviews": 5,
      "issuesOpened": 1,
      "issuesClosed": 2
    },
    "dailyActivity": [
      {
        "date": "2026-11-04",
        "commits": 5,
        "pullRequests": 1
      }
    ]
  }
}
```

---

### Mascot API

#### Get Mascot
**Endpoint:** `GET /api/mascot`

**Description:** Get user's mascot information

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxxx",
    "name": "Byte",
    "stage": 3,
    "experience": 1500,
    "level": 15,
    "stageInfo": {
      "name": "Dev Byte",
      "description": "Contributing to open source",
      "minLevel": 11,
      "imageUrl": "/images/mascot/stage-3.png"
    },
    "nextLevel": {
      "currentLevel": 15,
      "nextLevel": 16,
      "xpToNext": 200,
      "xpProgress": 80
    }
  }
}
```

---

#### Get Mascot Comments
**Endpoint:** `GET /api/mascot/comments`

**Description:** Get mascot comments for commits and events

**Authentication:** Required

**Query Parameters:**
- `limit` (number, optional, default: 10)
- `offset` (number, optional, default: 0)
- `type` (string, optional): Filter by comment type

**Response:**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "clxxx",
        "type": "COMMIT_COMMENT",
        "content": "Great work on that commit! 🎉",
        "tone": "friendly",
        "createdAt": "2026-11-04T20:00:00Z",
        "commit": {
          "id": "clxxx",
          "message": "Fix authentication bug",
          "repository": "owner/repo"
        }
      }
    ],
    "pagination": {
      "limit": 10,
      "offset": 0,
      "total": 25
    }
  }
}
```

---

#### Generate Mascot Comment
**Endpoint:** `POST /api/mascot/comments/generate`

**Description:** Generate a new mascot comment (manual trigger)

**Authentication:** Required

**Request Body:**
```json
{
  "context": {
    "type": "COMMIT_COMMENT",
    "commitId": "clxxx",
    "repository": "owner/repo",
    "message": "Add new feature"
  },
  "tone": "friendly"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxxx",
    "content": "Nice feature addition! Keep it up! 💪",
    "tone": "friendly",
    "type": "COMMIT_COMMENT",
    "createdAt": "2026-11-04T20:00:00Z"
  }
}
```

---

#### Update Mascot Settings
**Endpoint:** `PATCH /api/mascot/settings`

**Description:** Update mascot preferences

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Byte",
  "tone": "witty",
  "autoComment": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Byte",
    "tone": "witty",
    "autoComment": true
  }
}
```

---

### Streaks API

#### Get Current Streak
**Endpoint:** `GET /api/streaks/current`

**Description:** Get user's current streak information

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "current": 14,
    "longest": 30,
    "lastActive": "2026-11-04",
    "startDate": "2026-10-21",
    "daysUntilMilestone": 16,
    "nextMilestone": 30
  }
}
```

---

#### Get Streak History
**Endpoint:** `GET /api/streaks/history`

**Description:** Get user's streak history

**Authentication:** Required

**Query Parameters:**
- `limit` (number, optional, default: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "date": "2026-11-04",
        "active": true,
        "streak": 14
      },
      {
        "date": "2026-11-03",
        "active": true,
        "streak": 13
      }
    ]
  }
}
```

---

### Users API

#### Get User Profile
**Endpoint:** `GET /api/users/me`

**Description:** Get current user's profile

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxxx",
    "name": "John Doe",
    "email": "john@example.com",
    "image": "https://github.com/johndoe.png",
    "githubUsername": "johndoe",
    "createdAt": "2026-10-01T00:00:00Z",
    "mascot": {
      "name": "Byte",
      "level": 15,
      "stage": 3
    },
    "stats": {
      "totalCommits": 250,
      "totalPRs": 15,
      "currentStreak": 14,
      "longestStreak": 30
    }
  }
}
```

---

#### Update User Profile
**Endpoint:** `PATCH /api/users/me`

**Description:** Update user profile

**Authentication:** Required

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxxx",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "image": "https://github.com/johndoe.png",
    "githubUsername": "johndoe"
  }
}
```

---

#### Delete User Account
**Endpoint:** `DELETE /api/users/me`

**Description:** Delete user account and all associated data

**Authentication:** Required

**Request Body:**
```json
{
  "confirmation": "DELETE_MY_ACCOUNT"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Account deleted successfully"
  }
}
```

---

## Rate Limiting

### Rate Limits by Endpoint

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /api/github/sync` | 5/hour | 1 hour |
| `POST /api/mascot/comments/generate` | 10/hour | 1 hour |
| `GET /api/github/activity` | 100/hour | 1 hour |
| All other endpoints | 1000/hour | 1 hour |

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1699123456
```

### Rate Limit Error Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "details": {
      "limit": 1000,
      "remaining": 0,
      "resetAt": "2026-11-04T21:00:00Z"
    }
  }
}
```

## Validation Schemas

### Request Validation Examples

#### Sync Repositories Request
```typescript
const syncReposSchema = z.object({
  force: z.boolean().optional().default(false)
})
```

#### Generate Comment Request
```typescript
const generateCommentSchema = z.object({
  context: z.object({
    type: z.enum(['COMMIT_COMMENT', 'STREAK_ACHIEVEMENT', 'LEVEL_UP']),
    commitId: z.string().optional(),
    repository: z.string().optional(),
    message: z.string().optional()
  }),
  tone: z.enum(['friendly', 'witty', 'professional', 'motivational'])
})
```

#### Update User Profile Request
```typescript
const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional()
})
```

## Webhook Contracts

### Push Event Payload
```json
{
  "ref": "refs/heads/main",
  "repository": {
    "id": 123456789,
    "name": "repo",
    "full_name": "owner/repo",
    "private": false
  },
  "pusher": {
    "name": "username"
  },
  "commits": [
    {
      "id": "abc123",
      "message": "Commit message",
      "author": {
        "name": "Author Name",
        "email": "author@example.com"
      },
      "added": ["file1.ts"],
      "removed": [],
      "modified": ["file2.ts"]
    }
  ]
}
```

### Pull Request Event Payload
```json
{
  "action": "opened",
  "repository": {
    "id": 123456789,
    "name": "repo",
    "full_name": "owner/repo"
  },
  "pull_request": {
    "id": 1,
    "number": 1,
    "title": "PR title",
    "user": {
      "login": "username"
    },
    "merged": false,
    "merged_at": null
  }
}
```

## Error Handling

### Error Response Format
All errors follow the standard format defined above.

### Common Error Scenarios

#### Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

#### Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found",
    "details": {
      "resource": "mascot",
      "id": "clxxx"
    }
  }
}
```

#### Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "fields": {
        "email": ["Invalid email format"]
      }
    }
  }
}
```

## API Versioning

Current version: `v1`

Version included in URL for breaking changes:
```
/api/v1/mascot
```

Backward-compatible changes don't require version bump.

## Security Considerations

1. **CSRF Protection**: All POST/PUT/DELETE endpoints require CSRF token
2. **Webhook Signature**: GitHub webhooks verified with HMAC signature
3. **Token Encryption**: GitHub tokens encrypted at rest
4. **Rate Limiting**: Prevents abuse and DoS attacks
5. **Input Validation**: All inputs validated via Zod schemas
6. **SQL Injection Prevention**: Prisma ORM prevents SQL injection
7. **XSS Prevention**: Output sanitization in responses

## Testing the API

### Example cURL Commands

#### Get Mascot
```bash
curl -X GET https://codepet.app/api/mascot \
  -H "Cookie: next-auth.session-token=<token>"
```

#### Sync Repositories
```bash
curl -X POST https://codepet.app/api/github/sync \
  -H "Cookie: next-auth.session-token=<token>" \
  -H "Content-Type: application/json" \
  -d '{"force": false}'
```

#### Generate Comment
```bash
curl -X POST https://codepet.app/api/mascot/comments/generate \
  -H "Cookie: next-auth.session-token=<token>" \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "type": "COMMIT_COMMENT",
      "commitId": "clxxx",
      "repository": "owner/repo",
      "message": "Add new feature"
    },
    "tone": "friendly"
  }'
```

## API Documentation Generation

The API contracts can be used to generate:
- OpenAPI/Swagger documentation
- TypeScript client SDK
- Postman collection
- API mock server

Recommended tool: `openapi-typescript` for TypeScript types from OpenAPI spec.
