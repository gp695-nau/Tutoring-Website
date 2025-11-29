# Design Guidelines - Tutoring Platform

## Design Approach
**Reference-Based Approach**: Drawing from Calendly's intuitive scheduling interface and Khan Academy's educational dashboard design patterns.

## Typography
- **Primary Font**: Inter for UI elements, labels, and body text
- **Display Font**: Poppins for headings and section titles
- **Hierarchy**:
  - Page Titles: Poppins Bold, 2xl-3xl
  - Section Headers: Poppins SemiBold, xl-2xl
  - Card Titles: Inter SemiBold, lg
  - Body Text: Inter Regular, base
  - Labels: Inter Medium, sm
  - Captions: Inter Regular, xs

## Layout System
- **Spacing Units**: Use Tailwind spacing of 4, 5, 6, 8, 12, and 20 (as specified: 20px base spacing)
- **Container**: max-w-7xl for main content areas
- **Sidebar**: Fixed width of 64 (256px) on desktop, collapsible on mobile
- **Content Grid**: 12-column grid system for flexible layouts

## Dashboard Structure

### Student Dashboard
- **Hero Section**: Welcome banner with student name, progress summary cards (sessions completed, upcoming sessions, learning hours)
- **Quick Actions**: Prominent "Book a Session" CTA button, "View Schedule" link
- **Main Content Areas**:
  - Calendar widget showing upcoming sessions (Calendly-inspired)
  - Session cards in 2-column grid displaying tutor, subject, time, join button
  - Learning materials library with filterable cards (3-column grid on desktop)
- **Sidebar Navigation**: Dashboard, Book Session, My Schedule, Materials, Profile

### Admin Dashboard
- **Overview Section**: Stats cards in 4-column grid (total students, active tutors, sessions today, revenue)
- **Management Panels**: Tabbed interface for Tutors/Students/Sessions
- **Data Tables**: Clean tables with search, filter, and sort capabilities
- **Action Buttons**: Add/Edit/Delete actions with clear iconography

## Component Library

### Cards
- Background: White with subtle shadow (shadow-sm)
- Border: 1px solid #E5E7EB (gray-200)
- Padding: p-6
- Border radius: rounded-lg
- Hover: shadow-md transition

### Buttons
- **Primary**: bg-indigo-600 (#4F46E5), white text, rounded-lg, px-6 py-3
- **Secondary**: bg-emerald-500 (#10B981), white text, rounded-lg, px-6 py-3
- **Outline**: border-2 border-indigo-600, indigo text, rounded-lg, px-6 py-3
- Blur backgrounds when placed over images

### Forms
- Input fields: border-gray-300, rounded-md, focus:ring-indigo-500
- Labels: Inter Medium, text-gray-700, mb-2
- Error states: border-red-500, text-red-600

### Tables
- Header: bg-gray-50, Inter SemiBold, text-gray-600
- Rows: border-b border-gray-200, hover:bg-gray-50
- Cell padding: px-6 py-4

### Navigation
- Sidebar items: py-3 px-4, rounded-md, hover:bg-indigo-50
- Active state: bg-indigo-100, text-indigo-700, border-l-4 border-indigo-600
- Icons: Heroicons (outline style)

### Modals & Overlays
- Backdrop: bg-black/50
- Content: bg-white, rounded-xl, shadow-2xl, max-w-2xl
- Close button: top-right with hover state

## Scheduling Interface (Calendly-Inspired)
- Calendar view with available time slots in grid format
- Selected slots highlighted in emerald (#10B981)
- Time slots as clickable buttons in 30-minute increments
- Tutor selection with avatar, name, and specialty
- Confirmation step with session summary card

## Visual Hierarchy by Role
- **Student Interface**: Welcoming, learning-focused with emerald accents for positive actions
- **Admin Interface**: Professional, data-dense with indigo dominance, comprehensive controls

## Responsive Breakpoints
- Mobile: < 768px (single column, hamburger menu)
- Tablet: 768px - 1024px (2-column grids)
- Desktop: > 1024px (full sidebar, multi-column layouts)

## Images
- **Student Dashboard Hero**: Friendly illustration of online learning/tutoring (abstract, colorful)
- **Empty States**: Custom illustrations for "No sessions booked yet", "No materials available"
- **Tutor Profiles**: Avatar placeholders (circular, 48px-64px)

## Status Indicators
- Scheduled: bg-blue-100, text-blue-800
- Completed: bg-green-100, text-green-800 (using success color)
- Cancelled: bg-red-100, text-red-800
- In Progress: bg-amber-100, text-amber-800 (using warning color)

## Accessibility
- Focus states with visible ring-2 ring-indigo-500
- Consistent tab navigation order
- ARIA labels for all interactive elements
- Minimum touch target size: 44px × 44px