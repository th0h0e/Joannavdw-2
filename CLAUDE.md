# Joanna's Portfolio Website - Project Overview

## Project Structure
This is a React + TypeScript + Vite project for a portfolio website with vertical full-screen sections, each containing horizontal image carousels.

## Key Components

### Hero Component (`src/components/Hero.tsx`)
- **Purpose**: Animated full-screen hero section with headline text
- **Features**:
  - **Scale animation**: Image scales from 30% to 100% in 1.2 seconds
  - **White background**: Clean background visible during animation
  - **Headline text**: "Creative Strategy and Communication" centered on hero
  - **Scroll hint**: Down chevron at bottom of section
  - **Scroll snap integration**: Full-screen section with mandatory scroll snap

### SwipeCarousel Component (`src/components/SwipeCarousel.tsx`)
- **Purpose**: Reusable horizontal image carousel using native CSS scroll-snap
- **Architecture**: Store-based approach with React Context for state management
- **Features**:
  - **Native CSS scroll-snap**: `scroll-snap-type: x mandatory` with real browser scrolling
  - **Real scroll events**: Native scroll listeners instead of complex gesture detection
  - **Touch/drag optimization**: Browser-native scrolling behavior
  - **Progress bar**: Shows current position (0% to 100%)
  - **Navigation hints**: Right chevron on first slide (only shown on first carousel)
  - **Blur slide**: Last slide shows blurred background for transition effect

### CarouselContext (`src/contexts/CarouselContext.tsx`)
- **Purpose**: Centralized state management for carousel components
- **Features**:
  - Current slide tracking across components
  - Total slides management
  - Component communication without prop drilling

### Main App Structure (`src/App.tsx`)
- **Layout**: Vertical scroll sections with native CSS scroll snap
- **Section Order**: Hero section, followed by project sections, ending with project index
- **Sections**: Full-screen sections each containing a SwipeCarousel wrapped in CarouselProvider
- **Logo positioning**: Fixed logos (LogoTop & LogoBottom) with mix-blend-mode exclusion
- **Navigation**: Anchor links for smooth section navigation
- **Section tracking**: IntersectionObserver tracks current visible section
- **Popup management**: Global state for ProjectPopup and AboutPopup components
- **Hamburger menu**: Fixed position menu for project navigation

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
- **Typography**: EnduroWeb font family with 0.03em letter-spacing
- **Layout**: Fixed positioning with centered content, 280px width
- **Visual**: Uses SVG background image with drop shadow

### AboutPopup Component (`src/components/AboutPopup.tsx`)
- **Content Structure**:
  - Logo assets at top and bottom
  - Story Driven Strategy section
  - Expertise section
  - Selected Clients section
  - Get in touch button (mailto link)
- **Typography**: Same as ProjectPopup (12px, EnduroWeb, 0.03em spacing)
- **Layout**: Fixed positioning, 280px width, same SVG background as ProjectPopup

### HamburgerMenu Component (`src/components/HamburgerMenu.tsx`)
- **Purpose**: Full-screen navigation overlay
- **Features**:
  - Fixed position hamburger icon (18x18px square)
  - Mix-blend-mode exclusion when closed
  - Full project list navigation
  - Smooth close animation before navigation
  - Resets carousel positions after navigation

## Key Features Implemented

### Scroll Behavior
1. **Vertical Scroll Snap**: Native CSS scroll snap with anchor link navigation
   - Uses CSS `scroll-snap-type: y mandatory`
   - Anchor links (`#project-0`, `#project-1`, etc.) for direct navigation
   - IntersectionObserver tracks current section with 50% threshold
   - No custom JavaScript animations - browser handles smooth scrolling

2. **Horizontal Scroll Snap**: Native CSS scroll snap within carousels
   - Uses CSS `scroll-snap-type: x mandatory` with real scrolling
   - `overflow-x: auto` enables horizontal scrolling
   - `snap-center` on each slide for perfect centering
   - Last slide is transparent, showing blurred background
   - 5ms debounced scroll state management

### Store-Based Architecture
- **CarouselContext**: React Context provides centralized state management
- **Component Communication**: Components read from store instead of prop drilling
- **Real Scroll Events**: Native scroll listeners update store state
- **Simplified Logic**: Removed complex gesture detection and protection layers

### Typography & Design
- **Font**: EnduroWeb font family across all components (loaded via WOFF)
- **Spacing**: 0.03em letter-spacing for improved readability
- **Logo Positioning**: 
  - Desktop: 80px from edges (60px top, calc(100vh - 60px - 80px) bottom)
  - Mobile: Responsive sizing with smaller containers
  - Mix-blend-mode: exclusion for visibility on all backgrounds
- **Text Hierarchy**: Uppercase for titles/roles, normal case for descriptions
- **Responsive sizing**: Text scales from text-xl on mobile to text-5xl on desktop

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

### Typography Implementation
- **Font Loading**: EnduroWeb-Medium.woff loaded with font-display: swap
- **Consistent Spacing**: 0.03em letter-spacing across all components
- **Result**: Sharp, readable text with consistent appearance

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

### Responsive Design Issues
- **Undefined Tailwind Classes**: Custom width classes like `w-45`, `w-30`, `w-54`, `w-60` are not standard Tailwind classes and cause parent containers to collapse to 0px x 0px at responsive breakpoints
- **Issue**: When undefined responsive classes are used, the parent container dimensions become 0px, making child elements invisible
- **Solution**: Use inline styles with `rem` units for consistent responsive scaling: `style={{ width: '6rem' }}`
- **Debugging**: Check computed styles in DevTools - if parent container shows 0px x 0px dimensions, look for undefined CSS classes

### Component Architecture for Popups
- **State Management**: Keep popup state at App level, not within individual sections
- **Positioning Context**: Render popups outside main container to avoid CSS containment issues
- **Event Handling**: Use callback props to communicate between title components and popup state

### Logo Animation Implementation
- **Hero State Animation**: Logos animate when entering/leaving hero section
- **Logo Animation Pattern**: 
  - LogoTop: Animates from `calc(50% - 18vh)` to `60px`
  - LogoBottom: Animates from `68vh` to `calc(100vh - 60px - 80px)`
  - Duration: 1.2s with easeOut timing
  - Both logos centered horizontally with translateX(-50%)
- **Visibility**: Hidden when AboutPopup is open or ProjectPopup on mobile
- **Responsive Containers**: 
  - Desktop: 200px × 80px containers
  - Mobile: 160px × 60px containers
  - Logos scale proportionally within containers

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
