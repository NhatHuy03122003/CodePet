# ADR 003: Database Technology Selection

## Status
Accepted

## Context
CodePet requires a database to store:
- User profiles and authentication data
- GitHub repositories and commit history
- Mascot state and progression
- Activity tracking for streaks
- AI-generated comments
- Streak statistics

Requirements:
- Relational data model (users, repositories, commits have relationships)
- Scalable for future growth
- Type-safe database access
- Easy migrations
- Real-time capabilities (optional but desirable)
- Free tier for MVP
- Production-ready with clear upgrade path

## Decision
We selected Supabase (PostgreSQL) with Prisma ORM as the database solution.

### Technology Choices

#### Database: Supabase (PostgreSQL)
**Rationale:**
- **PostgreSQL**: Industry-standard relational database with advanced features
  - Full-text search
  - JSON support
  - Advanced indexing
  - Reliable ACID compliance
- **Supabase Features**:
  - Generous free tier (500MB database, 2GB file storage, 2GB bandwidth)
  - Built-in authentication (though we're using NextAuth)
  - Row-level security (RLS) for multi-tenant isolation
  - Real-time subscriptions (useful for future features)
  - Edge functions (can offload some backend logic)
  - Built-in dashboard for monitoring
  - Easy to scale to paid tiers
- **Hosting**: Managed PostgreSQL, no infrastructure management
- **Backup**: Automatic daily backups with point-in-time recovery
- **API**: Auto-generated REST API (though we'll use Prisma)

#### ORM: Prisma
**Rationale:**
- **Type Safety**: Full TypeScript support with generated types
- **Developer Experience**: Excellent IDE support with autocomplete
- **Migrations**: Built-in migration system with version control
- **Query Builder**: Intuitive API for complex queries
- **Performance**: Efficient query generation
- **Ecosystem**: Large community and good documentation
- **Integration**: Works seamlessly with Next.js and Supabase

### Database Schema Overview

See [Database Schema Document](../02-database-schema.md) for complete schema details.

Key tables:
- `User`: User profiles and authentication
- `Mascot`: Mascot state and progression
- `Repository`: GitHub repositories
- `Commit`: Individual commits
- `Activity`: Daily activity tracking
- `Comment`: Mascot comments
- `Streak`: Streak tracking

### Implementation Details

#### Prisma Configuration
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### Database Client
```typescript
// src/lib/db/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

#### Migration Strategy
- Prisma Migrate for schema changes
- Version-controlled migration files
- Automatic migration on deployment
- Seed script for initial data (mascot stages)

#### Row-Level Security (RLS)
- Supabase RLS policies for data isolation
- Users can only access their own data
- Additional application-level checks for critical operations
- RLS as defense-in-depth, not sole security mechanism

### Alternatives Considered

#### MongoDB + Mongoose
**Pros:**
- Flexible schema (document-based)
- Good for unstructured data
- Free tier available (MongoDB Atlas)

**Cons:**
- Less relational fit for our data model
- Weaker type safety
- No built-in RLS equivalent
- Complex relationships harder to model
- Query performance can suffer with complex joins

**Decision:** PostgreSQL better fits our relational data model with clear relationships between users, repositories, commits, etc.

#### PlanetScale (MySQL)
**Pros:**
- Serverless MySQL
- Good free tier
- Excellent scaling
- Branching for development

**Cons:**
- MySQL less feature-rich than PostgreSQL
- No built-in RLS
- Limited JSON support compared to PostgreSQL
- Less mature ecosystem with Prisma

**Decision:** PostgreSQL's advanced features and Supabase's additional features make it the better choice.

#### Neon (PostgreSQL)
**Pros:**
- Serverless PostgreSQL
- Good free tier
- Fast cold starts
- Branching support

**Cons:**
- Fewer additional features than Supabase
- No built-in RLS
- No built-in authentication
- Less mature dashboard

**Decision:** Supabase provides more features out of the box (RLS, real-time, edge functions) which may be useful later.

#### Direct SQL without ORM
**Pros:**
- No ORM overhead
- Full control over queries
- Fewer dependencies

**Cons:**
- No type safety
- More boilerplate code
- Manual migration management
- SQL injection risk if not careful
- Slower development

**Decision:** Prisma's type safety and developer experience outweigh the minor performance overhead.

## Consequences

### Positive
- Type-safe database access with Prisma
- Excellent developer experience
- Scalable PostgreSQL database
- Free tier sufficient for MVP
- Row-level security for data isolation
- Easy migration management
- Future-proof with advanced PostgreSQL features
- Real-time capabilities available when needed

### Negative
- Additional dependency (Prisma)
- Supabase vendor lock-in (though PostgreSQL is portable)
- Free tier limitations (500MB database)
- Need to manage environment variables
- Learning curve for team unfamiliar with Prisma

### Risks
- Supabase downtime or service issues
- Free tier limits may be reached
- Prisma schema changes can be tricky with existing data
- Database connection limits on free tier

### Mitigations
- Monitor database usage and upgrade to paid tier before limits
- Implement database connection pooling
- Use Prisma's migration system carefully with data preservation
- Have backup plan for database export/import
- Regular database backups (automatic with Supabase)
- Consider database read replicas for scaling

## Scaling Strategy

### Phase 1: MVP (Free Tier)
- Supabase free tier (500MB database)
- Single database instance
- Connection pooling via Prisma
- Application-level caching

### Phase 2: Growth (Pro Tier)
- Upgrade to Supabase Pro ($25/month)
- 8GB database
- 50GB file storage
- 50GB bandwidth
- Point-in-time recovery

### Phase 3: Scale (Enterprise)
- Database read replicas
- Connection pooling (PgBouncer)
- Query optimization
- Consider database sharding if needed
- Archive old data to cold storage

## Performance Considerations

### Indexing Strategy
- Indexes on foreign keys
- Indexes on frequently queried fields (userId, date, type)
- Composite indexes for common query patterns
- Regular index analysis and optimization

### Query Optimization
- Use Prisma's `select` to fetch only needed fields
- Implement pagination for large datasets
- Use `include` vs `select` appropriately
- Monitor slow queries with Supabase dashboard

### Caching Strategy
- Application-level caching for frequently accessed data
- Redis for distributed caching (future)
- Database query result caching
- Mascot state cached in memory

## Backup and Recovery

### Backup Strategy
- Supabase automatic daily backups
- Point-in-time recovery (up to 7 days on free tier, 30 days on Pro)
- Regular database exports to local storage
- Migration files as schema backup

### Recovery Plan
- Restore from Supabase backup if needed
- Point-in-time recovery for data corruption
- Migration rollback for schema issues
- Disaster recovery plan documented

## Security Considerations

1. **Row-Level Security**
   - Supabase RLS policies for data isolation
   - Users can only access their own data
   - Additional application-level checks

2. **Encryption**
   - GitHub tokens encrypted at rest
   - Supabase uses TLS for all connections
   - Environment variables for sensitive config

3. **Input Validation**
   - All inputs validated via Zod schemas
   - Prisma provides SQL injection protection
   - Parameterized queries by default

4. **Access Control**
   - Database access via environment variables
   - No direct database access from client
   - API routes mediate all database access

## Future Enhancements

1. **Real-time Features**
   - Real-time mascot updates via Supabase subscriptions
   - Live activity feed
   - Real-time streak updates

2. **Full-Text Search**
   - PostgreSQL full-text search for commits
   - Search by commit message
   - Search by code changes

3. **Data Analytics**
   - Analytics queries on activity data
   - Materialized views for complex aggregations
   - Time-series data analysis

4. **Edge Functions**
   - Offload webhook processing to Supabase Edge Functions
   - Reduce Next.js API route load
   - Better performance for high-volume events

## References
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Database Schema Document](../02-database-schema.md)
