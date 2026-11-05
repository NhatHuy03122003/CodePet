# ADR 001: Technology Stack Selection

## Status
Accepted

## Context
CodePet is an AI-powered coding companion targeting solo developers with a 30-day MVP timeline. The application requires:
- Modern web interface with smooth animations
- Real-time GitHub integration via webhooks
- AI-powered comment generation
- User authentication via GitHub OAuth
- Database for user data and activity tracking
- Production-ready architecture that can scale

## Decision
We selected the following technology stack:

### Frontend Framework
**Choice:** Next.js 15 with App Router

**Rationale:**
- Latest React framework with built-in optimizations
- App Router provides improved routing and data fetching
- Server components for better performance
- Built-in API routes for backend functionality
- Excellent TypeScript support
- Strong community and long-term viability
- Easy deployment to Vercel

**Alternatives Considered:**
- **Remix**: Great framework but steeper learning curve, smaller ecosystem
- **Nuxt.js**: Vue-based, not aligned with React expertise
- **SvelteKit**: Promising but smaller ecosystem, less mature

### UI Library
**Choice:** shadcn/ui + TailwindCSS + Framer Motion

**Rationale:**
- **shadcn/ui**: Component library built on Radix UI, highly customizable, no bundle bloat
- **TailwindCSS**: Utility-first CSS, rapid development, consistent design system
- **Framer Motion**: Smooth animations for mascot and UI interactions
- All three work seamlessly together
- shadcn/ui components are copied into the project, giving full control

**Alternatives Considered:**
- **Material-UI**: Heavy bundle size, less customizable
- **Chakra UI**: Good but less popular than shadcn/ui
- **Mantine**: Excellent but larger learning curve

### Authentication
**Choice:** NextAuth.js (Auth.js)

**Rationale:**
- Official authentication solution for Next.js
- Built-in GitHub OAuth provider
- Session management handled automatically
- TypeScript support
- Easy to configure and extend
- Supports multiple auth providers for future expansion

**Alternatives Considered:**
- **Supabase Auth**: Good but would require additional setup with Next.js
- **Clerk**: Excellent but paid tier required for production
- **Custom OAuth**: Too much complexity for MVP

### Database
**Choice:** Supabase (PostgreSQL) with Prisma ORM

**Rationale:**
- **Supabase**: PostgreSQL with built-in auth, real-time, and edge functions
- Free tier generous for MVP
- Easy to scale later
- **Prisma ORM**: Type-safe database access, excellent migrations, great DX
- PostgreSQL reliability and feature set
- Row-level security for multi-tenant isolation

**Alternatives Considered:**
- **MongoDB + Mongoose**: Less relational data, less type safety
- **PlanetScale (MySQL)**: Good but PostgreSQL preferred for complex queries
- **Neon (PostgreSQL)**: Good alternative but Supabase has more features

### AI Integration
**Choice:** OpenAI SDK

**Rationale:**
- Industry standard for AI text generation
- Reliable API with good documentation
- Multiple model options (GPT-3.5, GPT-4) for cost optimization
- TypeScript SDK available
- Can switch to other providers later if needed

**Alternatives Considered:**
- **Anthropic Claude**: Good but less mature ecosystem
- **Cohere**: Smaller market share
- **Local LLMs**: Too complex for MVP, requires GPU resources

### State Management
**Choice:** React Query (TanStack Query)

**Rationale:**
- Excellent for server state management
- Automatic caching and refetching
- Great TypeScript support
- Works seamlessly with Next.js
- Reduces boilerplate for data fetching

**Alternatives Considered:**
- **SWR**: Good but React Query has more features
- **Redux**: Overkill for this use case
- **Zustand**: Good for client state but React Query better for server state

### Validation
**Choice:** Zod

**Rationale:**
- TypeScript-first validation library
- Schema-first approach
- Integrates well with React Hook Form
- Can generate TypeScript types from schemas
- Excellent error messages

**Alternatives Considered:**
- **Yup**: Older, less TypeScript-friendly
- **Joi**: More popular in Node.js but less TypeScript integration
- **io-ts**: Too complex for simple validation needs

## Consequences

### Positive
- Modern, future-proof stack with strong community support
- Excellent developer experience with TypeScript throughout
- Fast development with shadcn/ui and TailwindCSS
- Scalable architecture that can grow with the product
- Free/low-cost hosting options (Vercel + Supabase)
- Type safety across the entire stack

### Negative
- Learning curve if team not familiar with Next.js 15 App Router
- OpenAI API costs need monitoring
- Supabase free tier has limitations (500MB database, 2GB file storage)
- Shadcn/ui requires manual component installation

### Risks
- Next.js 15 is relatively new, potential breaking changes
- OpenAI API rate limits could affect user experience
- Supabase free tier may not suffice for high-traffic scenarios

### Mitigations
- Follow Next.js best practices and stay updated on changes
- Implement caching for AI responses to reduce API calls
- Monitor costs and implement rate limiting
- Easy migration path to paid tiers when needed
- Consider alternative AI providers for backup

## Timeline
- **Week 1**: Set up Next.js project with all dependencies
- **Week 2**: Implement authentication with NextAuth
- **Week 3**: Set up database with Prisma and Supabase
- **Week 4**: Build core features with shadcn/ui components

## References
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
