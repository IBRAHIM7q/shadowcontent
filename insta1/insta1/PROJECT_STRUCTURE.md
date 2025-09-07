# Project Structure Documentation

## Overview
This document provides a comprehensive overview of the project structure for the Shadow social media platform.

## Root Directory
```
shadow/
├── .env.local
├── .gitignore
├── .nvmrc
├── README.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── public/
└── src/
```

## Source Directory Structure
```
src/
├── app/
├── components/
└── lib/
```

## App Directory Structure
```
app/
├── actions/
│   └── userActions.ts
├── api/
│   ├── confirm-user/
│   │   └── route.ts
│   └── test-supabase/
│       └── route.ts
├── auth/
│   ├── callback/
│   │   └── route.tsx
│   ├── forgot/
│   │   └── page.tsx
│   ├── forgot-password/
│   │   └── page.tsx
│   ├── reset-password/
│   │   └── page.tsx
│   ├── signin/
│   │   └── page.tsx
│   └── signup/
│       └── page.tsx
├── profile/
│   ├── [id]/
│   │   ├── page.tsx
│   │   └── posts/
│   │       └── page.tsx
│   ├── edit/
│   │   └── page.tsx
│   └── page.tsx
├── test-supabase/
│   └── page.tsx
├── globals.css
├── layout.tsx
└── page.tsx
```

## Components Directory Structure
```
components/
├── Feed.tsx
├── Header.tsx
├── Post.tsx
├── Providers.tsx
├── Stories.tsx
├── StoryViewer.tsx
├── ThemeProvider.tsx
└── UploadModal.tsx
```

## Lib Directory Structure
```
lib/
├── store.ts
├── supabase.ts
└── supabase/
    └── server.ts
```

## Key Directories and Files

### 1. Authentication System (`src/app/auth/`)
Handles all authentication flows:
- Sign in (`signin/`)
- Sign up (`signup/`)
- Password reset (`reset-password/`, `forgot-password/`, `forgot/`)
- Authentication callback (`callback/`)

### 2. API Routes (`src/app/api/`)
Backend API endpoints:
- User confirmation (`confirm-user/`)
- Supabase testing (`test-supabase/`)

### 3. Profile System (`src/app/profile/`)
User profile management:
- Main profile page (`page.tsx`)
- Profile editing (`edit/`)
- User-specific profiles (`[id]/`)

### 4. Core Components (`src/components/`)
Reusable UI components:
- Feed: Main content feed
- Header: Navigation header
- Post: Individual post component
- Stories: Stories carousel
- StoryViewer: Story viewing component
- UploadModal: Media upload functionality

### 5. State Management and Utilities (`src/lib/`)
Application utilities and state management:
- Store: Application state management
- Supabase: Client-side Supabase integration
- Supabase Server: Server-side Supabase integration

## Technology Stack
- **Frontend Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Lucide React
- **Backend**: Supabase (Authentication, Database, Storage)
- **State Management**: Custom store implementation
- **Build Tools**: Webpack, PostCSS

## Development Standards
- TypeScript for type safety
- ESLint for code quality
- Component-based architecture
- Server-side rendering with Next.js
- Responsive design with Tailwind CSS