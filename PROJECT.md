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
  - Swipe right: "Sick!" (🔥) - Strong interest
  - Swipe up: "Neat" (✨) - Moderate interest
  - Swipe left: "Meh" (😐) - Not interested
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

## Technical Implementation

### Data Model
- **ProductIdea Schema**
  ```typescript
  {
    title: string;
    description: string;
    votes: {
      superLike: number;  // "Sick!" votes
      up: number;         // "Neat" votes
      neutral: number;    // "Meh" votes
    };
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

### UI/UX Principles
- Dark/Light theme support
- Responsive design
- Smooth animations
- Clear visual feedback
- Intuitive swipe interactions
- Toast notifications for user feedback

### Code Quality Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for consistent formatting
- React best practices
- Next.js 14 app router conventions

## Development Guidelines

### Styling
- Tailwind CSS for styling
- CSS variables for theming
- Mobile-first responsive design
- Consistent component patterns

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

### Accessibility
- Keyboard navigation support
- Screen reader friendly
- ARIA attributes where needed
- Color contrast compliance

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