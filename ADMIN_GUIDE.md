# Admin Panel Guide

## Accessing the Admin Panel

Navigate to `/admin` in your browser to access the admin login page.

**URL**: `http://localhost:5173/admin` (development) or `https://yourdomain.com/admin` (production)

## Login

Use your PocketBase account credentials to log in:
- Email: Your PocketBase user email
- Password: Your PocketBase user password

## Features

### Dashboard Overview

After logging in, you'll see the main dashboard with:
- A grid of all your portfolio projects
- Project preview images
- Quick access to edit and delete functions
- "New Project" button to create projects

### Creating a New Project

1. Click the **"+ New Project"** button
2. Fill in the required fields:
   - **Project Title**: Name of the project (e.g., "Maria Bodil for Nike")
   - **Description**: Detailed description of the project
   - **Order**: Position in the portfolio (0 = first, 1 = second, etc.)
   - **Responsibilities**: Add tags like "CREATIVE PRODUCTION", "ARTIST HANDLING"
3. Upload images:
   - Click **"Upload Images"** to select multiple images
   - You can select multiple files at once
4. Click **"Create Project"** to save

### Editing an Existing Project

1. Click **"Edit"** on any project card
2. Modify any field as needed
3. Upload new images or delete existing ones
4. Click **"Update Project"** to save changes

### Managing Images

#### Uploading Images
- Click the "Upload Images" button
- Select one or multiple image files
- Supported formats: JPG, PNG, WEBP, GIF

#### Reordering Images
- **Drag and drop** images to reorder them
- The numbers on each image show the current order
- Images are displayed on the portfolio in this exact order

#### Deleting Images
- Hover over an image thumbnail
- Click the **"Delete"** button that appears
- The image will be removed when you save the project

### Important Notes

#### Image Order
- **The order of images in the admin panel matches the order on the portfolio**
- Use drag-and-drop to arrange images in your preferred sequence
- The first image is used as the preview thumbnail

#### Responsibilities Tags
- Enter each responsibility and click "Add" or press Enter
- Use UPPERCASE for consistency (e.g., "CREATIVE PRODUCTION")
- Click the "×" on any tag to remove it

#### Project Order
- The "Order" field determines the project's position in the portfolio
- Lower numbers appear first (0, 1, 2, etc.)
- Make sure each project has a unique order number

### Deleting a Project

1. Click **"Delete"** on the project card
2. Confirm the deletion in the popup dialog
3. **Warning**: This action cannot be undone and will delete:
   - The project record
   - All associated images
   - All project metadata

### Security

- Sessions are managed by PocketBase
- You'll remain logged in until you click "Logout"
- If your session expires, you'll be redirected to the login page

### Logout

Click the **"Logout"** button in the top-right corner of the dashboard.

---

## Technical Notes

### Direct PocketBase Access

You can still use the PocketBase admin panel at `https://admin.kontext.site/_/` for:
- Advanced database operations
- User management
- Backup and restore
- System settings

The custom admin panel provides a simplified, portfolio-focused interface but doesn't replace PocketBase's full functionality.

### Image Storage

- All images are stored in PocketBase
- Images are automatically optimized when displayed on the portfolio
- Original files are preserved in PocketBase storage

### Caching

- The portfolio uses a 6-hour cache for better performance
- Changes made in the admin panel may take a few minutes to appear on the live portfolio
- Clear your browser cache or wait for the cache to expire to see updates immediately
