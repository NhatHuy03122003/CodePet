# CodePet Folder Architecture

## Project Structure

```
codepet/
├── .devin/                      # Devin configuration
│   └── skills/                  # Custom skills
├── .github/                     # GitHub workflows
│   └── workflows/
├── docs/                        # Project documentation
│   ├── 01-folder-architecture.md
│   ├── 02-database-schema.md
│   ├── 03-feature-boundaries.md
│   ├── 04-service-layers.md
│   ├── 05-api-contracts.md
│   └── adr/                     # Architecture Decision Records
│       ├── 001-tech-stack.md
│       ├── 002-auth-strategy.md
│       ├── 003-database-choice.md
│       └── 004-ai-integration.md
├── prisma/                      # Database schema and migrations
│   ├── schema.prisma
│   └── migrations/
├── public/                      # Static assets
│   ├── images/
│   │   └── mascot/              # Byte mascot assets
│   └── fonts/
├── src/
│   ├── app/                     # Next.js 15 App Router
│   │   ├── (auth)/              # Auth route group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/         # Dashboard route group
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   └── loading.tsx
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (marketing)/         # Marketing route group
│   │   │   ├── page.tsx
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/                 # API routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── github/
│   │   │   │   ├── webhook/
│   │   │   │   │   └── route.ts
│   │   │   │   └── sync/
│   │   │   │       └── route.ts
│   │   │   ├── mascot/
│   │   │   │   ├── comments/
│   │   │   │   │   └── route.ts
│   │   │   │   └── growth/
│   │   │   │       └── route.ts
│   │   │   └── users/
│   │   │       └── [id]/
│   │   │           └── route.ts
│   │   ├── layout.tsx           # Root layout
│   │   ├── loading.tsx          # Root loading state
│   │   ├── error.tsx            # Root error boundary
│   │   └── globals.css          # Global styles
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── auth/                # Auth-specific components
│   │   │   ├── login-form.tsx
│   │   │   └── auth-provider.tsx
│   │   ├── dashboard/           # Dashboard components
│   │   │   ├── stats-card.tsx
│   │   │   ├── activity-feed.tsx
│   │   │   └── streak-display.tsx
│   │   ├── mascot/              # Mascot components
│   │   │   ├── byte-display.tsx
│   │   │   ├── mascot-stage.tsx
│   │   │   └── comment-bubble.tsx
│   │   ├── layout/              # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── footer.tsx
│   │   └── shared/              # Shared components
│   │       ├── loading-spinner.tsx
│   │       └── error-boundary.tsx
│   ├── features/               # Feature modules
│   │   ├── auth/                # Authentication feature
│   │   │   ├── hooks/
│   │   │   │   └── use-auth.ts
│   │   │   ├── services/
│   │   │   │   └── auth.service.ts
│   │   │   └── types/
│   │   │       └── auth.types.ts
│   │   ├── github/              # GitHub integration
│   │   │   ├── hooks/
│   │   │   │   ├── use-github-sync.ts
│   │   │   │   └── use-github-activity.ts
│   │   │   ├── services/
│   │   │   │   ├── github.service.ts
│   │   │   │   └── webhook.handler.ts
│   │   │   └── types/
│   │   │       └── github.types.ts
│   │   ├── mascot/              # Mascot feature
│   │   │   ├── hooks/
│   │   │   │   ├── use-mascot.ts
│   │   │   │   └── use-mascot-comments.ts
│   │   │   ├── services/
│   │   │   │   ├── mascot.service.ts
│   │   │   │   └── growth-calculator.ts
│   │   │   └── types/
│   │   │       └── mascot.types.ts
│   │   ├── streaks/             # Streak tracking
│   │   │   ├── hooks/
│   │   │   │   └── use-streaks.ts
│   │   │   ├── services/
│   │   │   │   └── streak.service.ts
│   │   │   └── types/
│   │   │       └── streak.types.ts
│   │   └── ai/                  # AI features
│   │       ├── hooks/
│   │       │   └── use-ai-comment.ts
│   │       ├── services/
│   │       │   ├── openai.service.ts
│   │       │   └── comment-generator.ts
│   │       └── types/
│   │           └── ai.types.ts
│   ├── lib/                    # Core utilities
│   │   ├── db/                  # Database utilities
│   │   │   ├── prisma.ts
│   │   │   └── seed.ts
│   │   ├── auth/                # Auth utilities
│   │   │   └── config.ts
│   │   ├── validations/         # Zod schemas
│   │   │   ├── auth.schema.ts
│   │   │   ├── github.schema.ts
│   │   │   └── mascot.schema.ts
│   │   ├── utils/               # General utilities
│   │   │   ├── cn.ts            # className utility
│   │   │   ├── date.ts
│   │   │   └── format.ts
│   │   └── constants/           # App constants
│   │       ├── mascot.ts
│   │       └── growth.ts
│   ├── hooks/                  # Global custom hooks
│   │   ├── use-session.ts
│   │   └── use-toast.ts
│   ├── stores/                 # State management
│   │   ├── auth.store.ts
│   │   ├── mascot.store.ts
│   │   └── github.store.ts
│   ├── styles/                 # Additional styles
│   │   └── animations.css
│   └── types/                  # Global types
│       └── index.ts
├── .env.example                # Environment variables template
├── .eslintrc.json              # ESLint configuration
├── .gitignore                  # Git ignore rules
├── next.config.js              # Next.js configuration
├── package.json                # Dependencies and scripts
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.js          # TailwindCSS configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project README
```

## Architecture Principles

### 1. **Feature-Based Organization**
- Each major feature (auth, github, mascot, streaks, ai) has its own directory
- Features contain their own hooks, services, and types
- Promotes modularity and easy feature extraction

### 2. **Clear Separation of Concerns**
- `components/`: UI elements only
- `features/`: Business logic and feature-specific code
- `lib/`: Shared utilities and core infrastructure
- `app/`: Next.js routing and pages

### 3. **Route Groups for Organization**
- `(auth)`: Authentication-related pages
- `(dashboard)`: Protected dashboard pages
- `(marketing)`: Public marketing pages
- Groups don't affect URL structure but organize code

### 4. **Service Layer Pattern**
- Each feature has a `services/` directory
- Services encapsulate business logic
- Can be reused across components and API routes

### 5. **Type Safety**
- Types defined at feature level in `types/` directories
- Global types in `src/types/`
- Zod schemas in `lib/validations/`

### 6. **Component Hierarchy**
- `ui/`: Reusable shadcn/ui components (no business logic)
- Feature components: Domain-specific UI
- Layout components: Page structure
- Shared components: Cross-cutting UI elements

## Key Directories Explained

### `/src/app`
Next.js 15 App Router directory. Contains all pages and API routes using the app directory structure.

### `/src/components`
React components organized by domain. `ui/` contains shadcn/ui components which are pure UI components without business logic.

### `/src/features`
Feature modules that encapsulate all logic for a specific domain. Each feature is self-contained with its own hooks, services, and types.

### `/src/lib`
Shared utilities and infrastructure code:
- Database client and seeders
- Auth configuration
- Validation schemas
- General utility functions
- Application constants

### `/src/hooks`
Global custom hooks that don't belong to a specific feature.

### `/src/stores`
State management stores (can use Zustand, Jotai, or React Context depending on complexity).

### `/prisma`
Database schema and migrations using Prisma ORM.

### `/docs`
All project documentation including architecture decisions and technical specifications.

## Scalability Considerations

This architecture supports future growth by:

1. **Monorepo-Ready**: Features can be extracted to separate packages if needed
2. **Microservices-Ready**: Service layers can be moved to separate backends
3. **Team Scaling**: Feature directories allow parallel development
4. **Testing**: Clear boundaries make unit and integration testing easier
5. **Code Reuse**: Shared libraries and utilities reduce duplication
