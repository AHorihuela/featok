# Featok - Product Idea Voting Platform

## Project Overview
A modern, user-friendly platform for submitting and voting on product ideas without requiring user accounts. The platform emphasizes simplicity, efficiency, and engaging interaction through swipe gestures.

## Core Features

### 1. Idea Submission
- **Bulk Input Interface**
  - Single textarea for multiple ideas
  - Format: Title on first line, description on following lines
  - Ideas separated by blank lines
  - Real-time preview of parsed ideas
  - Auto-resizing textarea

### 2. Voting Interface
- **Swipe Gestures**
  - Swipe right: "Love" (❤️) - Strong interest
  - Swipe up: "Neat" (👍) - Moderate interest
  - Swipe left: "Meh" (🤷) - Not interested
- **Visual Feedback**
  - Color transitions during swipes
  - Direction indicators
  - Progress tracking (X of Y ideas)
  - Current vote counts display

### 3. Creator Features
- **Anonymous Creator Identification**
  - Unique creator ID stored in localStorage
  - No account required
  - Ability to track created idea groups
- **Group Management**
  - Ideas submitted together share a groupId
  - Order preservation within groups
  - Shareable links for idea groups

### 4. Results Display
- **Final Results Screen**
  - Shows after voting on all ideas in a group
  - Displays vote counts for each reaction type
  - Clean, visual presentation of results
  - CSV export functionality
  - Share link functionality

## Technical Implementation

### Data Model
- **ProductIdea Schema**
  ```typescript
  {
    title: string;
    description: string;
    votes: {
      superLike: number;  // "Love" votes
      up: number;         // "Neat" votes
      neutral: number;    // "Meh" votes
    };
    views: number;        // View tracking
    shareableId: string;  // Unique, shareable identifier
    groupId: string;      // Groups related ideas
    creatorId: string;    // Anonymous creator identifier
    order: number;        // Position in group
    createdAt: Date;
  }
  ```

### API Endpoints
- `/api/ideas` (POST) - Submit multiple ideas
- `/api/ideas/group/[id]` (GET) - Fetch ideas in a group
- `/api/ideas/[id]/vote` (POST) - Cast vote on an idea
- `/api/ideas/[id]/view` (POST) - Track idea views
- `/api/ideas/creator/[id]` (GET) - Fetch creator's ideas

### UI/UX Principles
- Dark/Light theme support with system preference detection
- Responsive design with mobile-first approach
- Smooth animations using Framer Motion
- Clear visual feedback for all interactions
- Intuitive swipe and click interactions
- Toast notifications for user feedback
- Proper meta tags and SEO optimization

### Assets & Branding
- **Favicon & Icons**
  - SVG-based scalable favicon
  - Multiple sizes for different platforms (16x16 to 512x512)
  - PWA-ready icons
  - Maskable icons for Android
  - Safari pinned tab icon
  - Apple touch icon
- **Meta Tags & SEO**
  - OpenGraph images for social sharing (1200x630)
  - Twitter card support
  - PWA manifest
  - Comprehensive meta descriptions
  - Proper favicon implementation
  - Automated image generation pipeline

### Code Quality Standards
- TypeScript for type safety
- ESLint with strict rules
- Prettier for consistent formatting
- React best practices
- Next.js 14 app router conventions

## Development Guidelines

### Styling
- Tailwind CSS with custom design tokens
- CSS variables for theming
- Mobile-first responsive design
- Consistent component patterns
- Geist font for modern typography

### Error Handling
- Graceful error states
- User-friendly error messages
- Proper error logging
- Loading states for async operations

### Performance
- Optimized animations
- Efficient state management
- Minimal re-renders
- Proper data caching
- Image optimization with Sharp
- SVG optimization with SVGO

### Accessibility
- Keyboard navigation support
- Screen reader friendly
- ARIA attributes where needed
- Color contrast compliance
- Proper heading hierarchy

## Development Environment
- Node.js
- MongoDB
- Next.js 14
- React 19
- TypeScript 5
- Tailwind CSS
- Framer Motion
- Geist Font
- Sharp for image processing
- SVGO for SVG optimization

## Deployment
- Vercel for hosting (recommended)
  - Zero-config deployment
  - Automatic HTTPS
  - Edge functions
  - Preview deployments
  - Analytics
- MongoDB Atlas for database
  - Free tier with 512MB storage
  - Automated backups
  - Monitoring tools
- Environment Variables
  - MONGODB_URI
  - Other configuration

## Future Considerations
1. Edit functionality for creators
2. List view of created groups
3. Analytics for idea performance
4. Share functionality improvements
5. Optional user accounts
6. Enhanced voting analytics

## Development Environment
- Node.js
- MongoDB
- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Framer Motion 