# Restructure Spiritual Pages and Sidebar

## Goal
Combine the "Bible" and "Prayer" pages into a single section called "Spiritual" (or Faith) which will include 3 sub-pages: Bible, Prayer, and Devotion. 
Replace the old "Prayer" link in the sidebar with a new "Camp" page using a camp icon.

## Proposed Changes

### 1. New Routing Structure (`/faith`)
- **`src/app/(public)/faith/layout.tsx`**: A new layout component that displays the page title ("Spiritual Growth") and 3 toggle tabs (Bible, Prayer, Devotion) to navigate between the sub-pages.
- **`src/app/(public)/faith/page.tsx`**: A redirect to `/faith/bible` so clicking the main sidebar link goes to the first tab.
- **Move existing pages**:
  - `src/app/(public)/bible` -> `src/app/(public)/faith/bible`
  - `src/app/(public)/prayers` -> `src/app/(public)/faith/prayers`
- **Create new Devotion page**:
  - `src/app/(public)/faith/devotions/page.tsx`: A new public page that fetches and displays `daily_devotions`.

### 2. Sidebar Updates (`src/components/layout/Navbar.tsx`)
- **Remove** the standalone "Bible" and "Prayer" links.
- **Add** a new "Spiritual" link pointing to `/faith` with a Bible (`Book`) icon.
- **Add** a new "Camp" link pointing to `/camp` using a Camp (`Tent`) icon.

### 3. Create Camp Placeholder
- **`src/app/(public)/camp/page.tsx`**: Create a basic placeholder page for "Camp".

## Verification Plan
1. Check that the sidebar contains "Spiritual" and "Camp".
2. Click "Spiritual" and ensure it redirects to `/faith/bible`.
3. Verify the tabs (Bible, Prayer, Devotion) successfully toggle between the three views.
4. Verify the Camp page loads correctly.
