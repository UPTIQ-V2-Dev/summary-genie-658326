# Summary Generator Agent - Frontend Implementation Plan

## Project Overview

A React 19 + Vite + Shadcn + Tailwind v4 application for generating summaries from text input using an AI agent.

## Page-by-Page Implementation Plan

### 1. Main Summary Generator Page (`/`)

#### Components Needed:

- `SummaryGenerator` - Main container component
- `TextInputSection` - Left side input area
- `SummaryOutputSection` - Right side output area
- `GenerateButton` - Primary action button

#### Types:

- `SummaryRequest` - API request type
- `SummaryResponse` - API response type
- `SummaryState` - Component state type

#### Utils:

- `summaryApi.ts` - API calls for summary generation
- `textValidation.ts` - Input text validation utilities
- `summaryFormatters.ts` - Output formatting utilities

#### API Endpoints:

- `POST /api/summary/generate` - Generate summary from text
- `GET /api/summary/history` - Get user's summary history

#### Features:

- Text input with placeholder and validation
- Real-time character/word count
- Loading states during generation
- Copy to clipboard functionality
- Clear input/output actions

### 2. Summary History Page (`/history`)

#### Components Needed:

- `HistoryPage` - Main page component
- `HistoryList` - List of previous summaries
- `HistoryItem` - Individual summary card
- `SearchFilter` - Filter and search summaries

#### Types:

- `HistoryItem` - Individual history entry type
- `HistoryFilters` - Filter options type

#### Utils:

- `historyApi.ts` - History-related API calls
- `dateFormatters.ts` - Date formatting utilities

#### API Endpoints:

- `GET /api/summary/history` - Fetch user history
- `DELETE /api/summary/{id}` - Delete specific summary

#### Features:

- Paginated list of summaries
- Search and filter functionality
- Export individual summaries
- Delete summaries

### 3. Settings Page (`/settings`)

#### Components Needed:

- `SettingsPage` - Main settings container
- `SummaryPreferences` - Summary generation preferences
- `ThemeSettings` - Theme customization
- `ExportSettings` - Export format preferences

#### Types:

- `UserSettings` - Settings configuration type
- `ThemePreference` - Theme settings type

#### Utils:

- `settingsApi.ts` - Settings API calls
- `themeUtils.ts` - Theme management utilities

#### API Endpoints:

- `GET /api/user/settings` - Fetch user settings
- `PUT /api/user/settings` - Update user settings

#### Features:

- Summary length preferences
- Theme selection (light/dark/system)
- Export format options
- Auto-save preferences

## Common Components & Layout

### Layout Components:

- `AppLayout` - Main application layout
- `Sidebar` - Navigation sidebar (if needed)
- `Header` - Top navigation bar
- `Footer` - Application footer

### UI Components (using Shadcn):

- `Button` - Primary/secondary actions
- `Card` - Content containers
- `Textarea` - Text input areas
- `Dialog` - Modal dialogs
- `Toast` - Notification system
- `Loading` - Loading states
- `Skeleton` - Loading placeholders

### Common Utils:

- `api.ts` - Base API configuration
- `auth.ts` - Authentication utilities
- `constants.ts` - Application constants
- `storage.ts` - Local storage utilities
- `errorHandling.ts` - Error management

### Common Types:

- `User` - User data type
- `ApiResponse` - Standard API response
- `ErrorState` - Error handling types

### 4. Login Page (`/login`)

#### Components Needed:

- `LoginPage` - Main login page component
- `LoginForm` - Login form with validation
- `AuthCard` - Card container for auth forms

#### Types:

- `LoginRequest` - Login credentials type (already exists)
- `AuthResponse` - Authentication response type (already exists)

#### Utils:

- `authApi.ts` - Authentication API calls (already exists)
- `validation.ts` - Form validation utilities

#### API Endpoints:

- `POST /auth/login` - User authentication
- `POST /auth/refresh-tokens` - Token refresh

#### Features:

- Email/password login form
- Form validation with error handling
- Loading states during authentication
- Redirect to main page after successful login
- Remember me functionality
- Forgot password link placeholder

## Routing Structure

```
/ - Main summary generator
/login - User login
/history - Summary history
/settings - User settings
/auth/register - Registration (if auth required)
```

## State Management

- React Query for server state
- React hooks for local state
- Context for theme/user preferences

## Key Features Per Page:

1. **Main Page**: Core summary generation functionality
2. **History**: Review and manage past summaries
3. **Settings**: Customize user experience and preferences

This plan provides a foundation for implementing a complete summary generator application with modern React patterns and best practices.
