# Joanna's Portfolio Website - Project Overview

## Project Structure
This is a React + TypeScript + Vite project for a portfolio website with vertical full-screen sections, each containing horizontal image carousels.

## Key Components

### SwipeCarousel Component (`src/components/SwipeCarousel.tsx`)
- **Purpose**: Reusable horizontal image carousel using native CSS scroll-snap
- **Architecture**: Store-based approach with React Context for state management
- **Features**:
  - **Native CSS scroll-snap**: `scroll-snap-type: x mandatory` with real browser scrolling
  - **Real scroll events**: Native scroll listeners instead of complex gesture detection
  - **Touch/drag optimization**: Browser-native scrolling behavior
  - **Progress bar**: Shows current position (0% to 100%)
  - **Navigation hints**: Chevron indicators with Framer Motion animations
  - **Store integration**: Uses CarouselContext for centralized state

### CarouselContext (`src/contexts/CarouselContext.tsx`)
- **Purpose**: Centralized state management for carousel components
- **Features**:
  - Current slide tracking across components
  - Total slides management
  - Component communication without prop drilling

### Main App Structure (`src/App.tsx`)
- **Layout**: Vertical scroll sections with native CSS scroll snap
- **Sections**: Full-screen sections each containing a SwipeCarousel wrapped in CarouselProvider
- **Logo positioning**: Fixed logos at 100px from top/bottom edges
- **Navigation**: Anchor links for smooth section navigation

### ProjectIndex Component (`src/components/ProjectIndex.tsx`)
- **Navigation**: Uses anchor links (`href="#project-0"`) for section navigation
- **Styling**: Clean typography with hover effects
- **Architecture**: Zero JavaScript navigation - pure web standards

### ProjectPopup Component (`src/components/ProjectPopup.tsx`)
- **Content Structure**: 
  - Project title (uppercase, 12px)
  - Agency responsibilities (uppercase, 12px): ARTIST HANDLING, CREATIVE PRODUCTION, CONCEPT MANAGEMENT
  - Project description (normal case, 12px)
- **Spacing**: 18px margins between content sections
- **Typography**: EnduroWeb font family with 0.03em letter-spacing, no font-bold
- **Layout**: Fixed positioning with centered content and 16px horizontal padding

## Key Features Implemented

### Scroll Behavior
1. **Vertical Scroll Snap**: Native CSS scroll snap with anchor link navigation
   - Uses CSS `scroll-snap-type: y mandatory`
   - Anchor links (`#project-0`, `#project-1`, etc.) for direct navigation
   - Native `scrollBy()` method for programmatic scrolling
   - No custom JavaScript animations - browser handles smooth scrolling

2. **Horizontal Scroll Snap**: Native CSS scroll snap within carousels
   - Uses CSS `scroll-snap-type: x mandatory` with real scrolling
   - `overflow-x: auto` enables horizontal scrolling
   - `snap-center` on each slide for perfect centering
   - Eliminates image skipping through browser-native behavior

### Store-Based Architecture
- **CarouselContext**: React Context provides centralized state management
- **Component Communication**: Components read from store instead of prop drilling
- **Real Scroll Events**: Native scroll listeners update store state
- **Simplified Logic**: Removed complex gesture detection and protection layers

### Typography & Design
- **Font**: EnduroWeb font family across all components
- **Weight**: Removed font-bold to prevent stretched appearance
- **Spacing**: 0.03em letter-spacing for improved readability
- **Logo Positioning**: 100px from screen edges for better visual balance
- **Text Hierarchy**: Uppercase for titles/roles, normal case for descriptions

## Technical Decisions

### Native CSS Scroll-Snap Implementation
- **Previous**: Complex JavaScript gesture handling with Framer Motion transforms
- **Current**: Native browser scrolling with CSS scroll-snap-type: mandatory
- **Benefits**: 
  - Eliminates image skipping
  - Better performance
  - Consistent cross-browser behavior
  - Simplified codebase

### Anchor Link Navigation
- **Previous**: Custom JavaScript scroll animations with potential conflicts
- **Current**: Standard anchor links with CSS scroll-behavior: smooth
- **Benefits**:
  - Zero JavaScript for navigation
  - SEO-friendly link structure
  - Browser back/forward support
  - Accessibility compliance

### Typography Optimization
- **Issue**: Font-bold caused stretched text appearance
- **Solution**: Removed font-bold while maintaining letter-spacing
- **Result**: Sharp, readable text across all components

### Centralized State Management
- **Architecture**: React Context instead of prop drilling
- **Benefits**: 
  - Component isolation
  - Easier maintenance
  - Clear data flow
  - Better scalability

## CSS Architecture
- **Tailwind CSS**: Primary styling framework
- **Native CSS Properties**: scroll-snap-type, scroll-behavior, overflow behaviors
- **Inline Styles**: Component-specific scroll properties and typography
- **Minimal Custom CSS**: Leverages browser-native features

## Positioning & Animation Best Practices

### Framer Motion Compatibility
- **Issue**: Framer Motion animations can override CSS transform properties, breaking centering
- **Solution**: Use CSS custom properties for animations while preserving positioning transforms
- **Pattern**: `transform: 'translate(-50%, -50%) scale(var(--scale, 1))'`
- **Implementation**: Animate custom properties instead of direct transform values

### Viewport-Relative Positioning
- **Fixed Positioning**: Elements that need to stay centered relative to viewport must use `position: fixed`
- **DOM Structure**: Position elements outside scrolling containers to ensure true viewport centering
- **Centering Pattern**: Use `top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2` for perfect centering

### Component Architecture for Popups
- **State Management**: Keep popup state at App level, not within individual sections
- **Positioning Context**: Render popups outside main container to avoid CSS containment issues
- **Event Handling**: Use callback props to communicate between title components and popup state

## Development Commands
```bash
npm run dev  # Start development server (typically runs on http://localhost:5174/)
```

## Project Data Structure
```typescript
const projectsData = [
  { 
    title: "Project Title", 
    description: "Lorem ipsum...", 
    images: [{ src: "image-url" }] 
  }
];
```

## Browser Compatibility
- **Modern Browsers**: Optimized for CSS scroll-snap support
- **Touch Devices**: Native touch scrolling behavior
- **Desktop**: Mouse wheel and trackpad gesture support

## Major Improvements Implemented
1. **Eliminated Image Skipping**: Native CSS scroll-snap prevents users from skipping images
2. **Smooth Navigation**: Anchor links provide instant, smooth section navigation
3. **Reduced JavaScript**: Minimal custom code, maximum browser-native features
4. **Better Performance**: Browser-optimized scrolling and rendering
5. **Improved Typography**: Sharp, readable text without font-weight issues
6. **Enhanced UX**: Consistent, predictable scrolling behavior across all interactions

## Architecture Philosophy
- **Web Standards First**: Leverage native browser capabilities over custom JavaScript
- **Performance Focused**: Minimize custom animations in favor of browser-optimized solutions
- **Accessibility**: Standard HTML elements and navigation patterns
- **Maintainability**: Simple, readable code with centralized state management

## Future Considerations
- Consider adding keyboard navigation (arrow keys)
- Potential lazy loading for images
- Accessibility improvements (ARIA labels already implemented)
- Animation performance optimization for larger image sets