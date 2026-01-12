# OTT Viewer Implementation Guide

## Overview

The Chai Shorts CMS now includes a **public OTT viewer experience** alongside the protected CMS. This is a single Next.js application with two distinct modes:

1. **Viewer Mode** (Public) - Browse and watch content
2. **CMS Mode** (Protected) - Admin/Editor content management

## Routing Structure

### Public Viewer Routes (No Authentication Required)

- `/` - OTT Home page with series grid
- `/series/[id]` - Series detail page showing episodes
- `/episode/[id]` - Episode player page with video

### Protected CMS Routes (Admin/Editor Only)

- `/login` - Admin/Editor login page
- `/cms` - CMS Dashboard
- `/cms/programs` - Series management
- `/cms/programs/[id]` - Series detail/edit
- `/cms/lessons` - Episodes management
- `/cms/lessons/[id]` - Episode editor
- `/cms/topics` - Topics management
- `/cms/analytics` - Analytics (if implemented)
- `/cms/settings` - Settings (if implemented)

## Key Components

### Viewer Components

1. **`ViewerHeader`** (`app/components/ViewerHeader.tsx`)
   - Public header with Chai Shorts branding
   - Login button for admins/editors
   - CMS link for logged-in admins/editors

2. **OTT Home Page** (`app/page.tsx`)
   - Fetches published series from `/api/catalog/programs`
   - Displays series grid with posters
   - Netflix-style card layout

3. **Series Detail Page** (`app/series/[id]/page.tsx`)
   - Shows series information and published episodes
   - Episode cards with Free/Premium badges
   - Links to episode player

4. **Episode Player Page** (`app/episode/[id]/page.tsx`)
   - HTML5 video player
   - Language selector
   - Subtitle selector
   - Blocks access to unpublished episodes

### CMS Components

1. **`CMSLayout`** (`app/components/CMSLayout.tsx`)
   - Protects CMS routes
   - Checks authentication and role (ADMIN/EDITOR)
   - Redirects unauthorized users to `/login`
   - Wraps CMS pages with existing Layout component

2. **CMS Pages** (`app/cms/*`)
   - All CMS pages use `CMSLayout` wrapper
   - Protected by authentication and role checks

## Authentication Flow

1. **Public Access**: Users can browse `/`, `/series/[id]`, `/episode/[id]` without login
2. **CMS Access**: 
   - Click "Login" button → `/login`
   - Enter admin/editor credentials
   - On success, redirects to `/cms` (dashboard)
   - Viewers (role: VIEWER) cannot access CMS routes

## API Integration

### Viewer Pages Use Public Catalog API

- `GET /api/catalog/programs` - List published series
- `GET /api/catalog/programs/:id` - Get published series detail
- `GET /api/catalog/lessons/:id` - Get published episode detail

### CMS Pages Use Protected API

- `GET /api/programs` - List all series (with auth)
- `GET /api/lessons` - List all episodes (with auth)
- All CMS operations require JWT token

## Implementation Notes

### What Was Changed

1. ✅ Created OTT home page (`/`)
2. ✅ Created series detail page (`/series/[id]`)
3. ✅ Created episode player page (`/episode/[id]`)
4. ✅ Created ViewerHeader component
5. ✅ Created CMSLayout protection wrapper
6. ✅ Created `/login` page with role-based redirect
7. ✅ Created `/cms` dashboard page
8. ✅ Created `/cms/programs` page
9. ✅ Created `/cms/lessons` page
10. ✅ Updated Sidebar to use `/cms/*` routes

### What Remains (Optional)

The following CMS pages can be created following the same pattern:

- `/cms/programs/[id]/page.tsx` - Copy from `app/programs/[id]/page.tsx` and wrap with CMSLayout
- `/cms/lessons/[id]/page.tsx` - Copy from `app/lessons/[id]/page.tsx` and wrap with CMSLayout
- `/cms/topics/page.tsx` - Copy from `app/topics/page.tsx` and wrap with CMSLayout
- `/cms/analytics/page.tsx` - Copy from `app/analytics/page.tsx` and wrap with CMSLayout
- `/cms/settings/page.tsx` - Copy from `app/settings/page.tsx` and wrap with CMSLayout

**Pattern for creating CMS pages:**

```tsx
'use client';

import { CMSLayout } from '../../components/CMSLayout';
// ... other imports

export default function CMSPageName() {
  // ... component logic
  
  return (
    <CMSLayout>
      {/* Page content */}
    </CMSLayout>
  );
}
```

## Testing Checklist

- [ ] Public user can browse series on `/`
- [ ] Public user can view series detail on `/series/[id]`
- [ ] Public user can watch episodes on `/episode/[id]`
- [ ] Unpublished episodes are blocked
- [ ] Login button appears on viewer pages
- [ ] Admin can login and access `/cms`
- [ ] Editor can login and access `/cms`
- [ ] Viewer role cannot access `/cms` routes
- [ ] CMS routes redirect to `/login` when not authenticated
- [ ] All CMS functionality works as before

## Backend Compatibility

✅ **No backend changes required**
- All existing API endpoints work as-is
- Catalog API already exists and returns only published content
- Authentication endpoints unchanged
- Database schema unchanged

## Next Steps

1. Test the viewer experience end-to-end
2. Create remaining CMS detail pages (programs/[id], lessons/[id], etc.)
3. Add error handling for network failures
4. Add loading states for better UX
5. Consider adding search functionality to viewer
6. Consider adding "Continue Watching" feature
