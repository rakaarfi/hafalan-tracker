# Hafalan Tracker - System Design

**Date:** 2026-04-05
**Version:** 1.0
**Status:** Draft

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Database Schema Design](#2-database-schema-design)
3. [API Design](#3-api-design)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Authentication Flow](#5-authentication-flow)
6. [Key User Workflows](#6-key-user-workflows)
7. [Error Handling Strategy](#7-error-handling-strategy)
8. [Testing Approach](#8-testing-approach)

---

## 1. System Architecture Overview

### Monorepo Architecture

The system uses a clean separation between frontend and backend with REST API as the boundary. Frontend (React + Bun) consumes JSON APIs served by backend (Golang + Gin), which stores data in PostgreSQL.

### Frontend Structure

```
frontend/
├── pages/              # Route components
│   ├── auth/
│   ├── teacher/
│   ├── parent/
│   └── admin/
├── features/           # Business logic modules
│   ├── auth/
│   ├── memorization/
│   └── students/
└── shared/             # Reusable components
    ├── api/            # API client wrapper
    ├── components/     # shadcn/ui
    ├── i18n/           # Internationalization
    └── stores/         # Zustand stores
```

### Backend Structure

```
backend/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── handler/        # HTTP handlers
│   ├── service/        # Business logic
│   ├── repository/     # Data access
│   ├── model/          # Domain entities
│   ├── middleware/     # HTTP middleware
│   └── config/         # Configuration
└── pkg/
    ├── validator/      # blend/go-zod wrappers
    ├── logger/
    └── database/
```

### Data Flow

```
Frontend Zod validation
  → API call
  → Backend blend/go-zod validation
  → Service logic
  → Repository SQL
  → PostgreSQL
  → Response
  → Service
  → Handler
  → JSON response
  → Frontend Zustand store
  → UI update
```

### Key Design Decisions

- **Stateless REST API** with JWT tokens
- **Quran reference data** loaded at backend startup, served via API
- **Dual validation**: Frontend (UX) + Backend (security)
- **Soft deletes** everywhere (is_active flags) for full audit trail
- **English codebase** with i18n support for UI (EN/ID)

---

## 2. Database Schema Design

### Core Tables

#### users
Central authentication table

```
- id (PK)
- email (unique)
- password_hash
- role (admin/teacher/parent)
- is_active (boolean)
- created_at
- updated_at
```

#### roles
Available system roles

```
- id (PK)
- name (admin/teacher/parent)
- description
```

#### permissions
Granular permissions

```
- id (PK)
- name (create_memorization, view_children_progress, manage_users)
- resource
- action
```

#### role_permissions
RBAC mapping

```
- role_id (FK)
- permission_id (FK)
```

Example mappings:
- teacher → can create_memorization
- parent → can view_children_progress
- admin → full access

#### teachers
Role-specific profile for teachers

```
- user_id (FK, unique)
- full_name
- phone
- created_at
- updated_at
```

#### parents
Role-specific profile for parents

```
- user_id (FK, unique)
- full_name
- phone
- created_at
- updated_at
```

#### students
Students with class assignment

```
- id (PK)
- name
- class_id (FK)
- enrollment_year
- semester
- is_active (boolean)
- created_at
- updated_at
```

#### classes
Class/group definitions

```
- id (PK)
- name
- grade_level
- homeroom_teacher_id (FK)
- is_active (boolean)
- created_at
- updated_at
```

#### student_parents
Many-to-many junction (students ↔ parents)

```
- student_id (FK)
- parent_id (FK)
- relationship_type (father/mother/guardian)
- is_primary_contact (boolean)
- is_active (boolean)
- created_at
- UNIQUE(student_id, parent_id)
```

#### memorization
Main tracking table

```
- id (PK)
- student_id (FK)
- teacher_id (FK)
- unit_type (surah/page/juz)
- surah_id (FK, nullable)
- juz_id (FK, nullable)
- page_start (integer, nullable)
- page_end (integer, nullable)
- status (fluent/good/needs_improvement)
- notes (text)
- test_date (date)
- is_active (boolean)
- created_at
- updated_at
```

#### memorization_history
Audit trail for status changes

```
- id (PK)
- memorization_id (FK)
- student_id (FK)
- teacher_id (FK)
- old_status (varchar)
- new_status (varchar)
- notes (text)
- changed_at (timestamp)
```

#### surah
Quran surah reference (loaded from JSON)

```
- id (PK)
- surah_number (integer, 1-114)
- name_latin (varchar)
- name_arabic (varchar)
- place (Mecca/Medina)
- type (Makkiyah/Madaniyah)
- ayah_count (integer)
- start_page (integer)
- juz_number (integer)
```

#### juz
Quran juz reference (loaded from JSON)

```
- id (PK)
- juz_number (integer, 1-30)
- start_surah_id (FK)
- start_ayah (varchar)
- end_surah_id (FK)
- end_ayah (varchar)
```

### Design Principles

- **Soft deletes**: All tables use `is_active` for audit trail
- **Timestamps**: `created_at`, `updated_at` on all tables
- **Referential integrity**: Foreign keys with CASCADE
- **Indexes**: On frequently queried fields (student_id, teacher_id, test_date)
- **RBAC**: Role-based access control enforced at database level

### RBAC Implementation

- Middleware checks user role against required permission
- Endpoint-level permission requirements
- Parent access filtered by `student_parents` table
- Teacher access filtered by class assignments

---

## 3. API Design

### REST API Conventions

**Base URL:** `/api/v1`

**Content-Type:** `application/json`

**Authentication:** Bearer token (JWT)

### Authentication Endpoints

```
POST /auth/register
  - Admin only (create teacher/parent accounts)
  - Body: { email, password, role, full_name }

POST /auth/login
  - Email/password → JWT token
  - Body: { email, password }
  - Response: { token, user: { id, role, ... } }

POST /auth/refresh
  - Refresh JWT token
  - Headers: Authorization: Bearer <token>

POST /auth/logout
  - Invalidate token
  - Headers: Authorization: Bearer <token>
```

### Teacher Endpoints

```
GET /teachers/classes
  - Get assigned classes
  - Response: [{ id, name, grade_level, student_count }]

GET /teachers/classes/:id/students
  - Get students in class
  - Query: ?page=1&limit=20&search=
  - Response: { data: [], meta: { page, limit, total } }

POST /memorization
  - Create memorization record
  - Body: {
      student_id,
      unit_type,
      surah_id?, juz_id?,
      page_start?, page_end?,
      status, notes, test_date
    }
  - Response: { data: { id, ... } }

PUT /memorization/:id
  - Update (soft delete old, create new)
  - Body: (same as POST)
  - Response: { data: { id, ... } }

GET /students/:id/memorization
  - Student's history
  - Query: ?page=1&limit=20&unit_type=
  - Response: { data: [], meta: {} }

GET /surah
  - Quran surah reference
  - Query: ?juz=30
  - Response: [{ id, name_latin, name_arabic, ... }]

GET /juz
  - Quran juz reference
  - Response: [{ id, juz_number, ... }]
```

### Parent Endpoints

```
GET /parents/children
  - Get linked students
  - Response: [{ id, name, class, photo, ... }]

GET /parents/children/:id/progress
  - Current status snapshot
  - Response: {
      student: { ... },
      overall_progress: { percent, total_units, completed },
      recent_status: [{ date, unit, status }],
      last_test: { date, teacher }
    }

GET /parents/children/:id/memorization
  - Full history
  - Query: ?page=1&limit=20&unit_type=&date_from=&date_to=
  - Response: { data: [], meta: {} }
```

### Admin Endpoints

```
POST /admin/users
  - Create users (RBAC required)
  - Body: { email, password, role, full_name, phone }

PUT /admin/users/:id
  - Update users
  - Body: { full_name, phone, is_active }

GET /admin/users
  - List all users
  - Query: ?role=&page=1&limit=20
  - Response: { data: [], meta: {} }
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "page_start",
        "message": "Must be a positive integer"
      }
    ]
  }
}
```

### RBAC Enforcement

- Middleware checks permissions before handlers
- Parents automatically filtered to own children
- Teachers filtered to assigned classes
- Admin bypasses filters

---

## 4. Frontend Architecture

### Project Structure

```
frontend/
├── src/
│   ├── pages/              # Route components
│   │   ├── auth/
│   │   │   ├── login.tsx
│   │   │   └── not-found.tsx
│   │   ├── teacher/
│   │   │   ├── dashboard.tsx
│   │   │   └── student-detail.tsx
│   │   ├── parent/
│   │   │   ├── dashboard.tsx
│   │   │   └── child-detail.tsx
│   │   └── admin/
│   │       └── user-management.tsx
│   │
│   ├── features/           # Business logic modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   └── login-form.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-auth.ts
│   │   │   ├── stores/
│   │   │   │   └── auth-store.ts
│   │   │   ├── schemas/
│   │   │   │   └── auth.schema.ts
│   │   │   └── api/
│   │   │       └── auth-api.ts
│   │   │
│   │   ├── memorization/
│   │   │   ├── components/
│   │   │   │   ├── memorization-form.tsx
│   │   │   │   ├── unit-selector.tsx
│   │   │   │   └── status-badge.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-memorization.ts
│   │   │   ├── stores/
│   │   │   │   └── memorization-store.ts
│   │   │   ├── schemas/
│   │   │   │   └── memorization.schema.ts
│   │   │   └── api/
│   │   │       └── memorization-api.ts
│   │   │
│   │   └── students/
│   │       ├── components/
│   │       │   ├── student-list.tsx
│   │       │   ├── student-card.tsx
│   │       │   └── student-row.tsx
│   │       ├── hooks/
│   │       │   └── use-students.ts
│   │       └── api/
│   │           └── students-api.ts
│   │
│   ├── shared/             # Cross-cutting concerns
│   │   ├── api/
│   │   │   ├── client.ts   # Axios wrapper
│   │   │   └── endpoints.ts
│   │   ├── components/
│   │   │   ├── ui/         # shadcn/ui components
│   │   │   └── layout/
│   │   │       ├── header.tsx
│   │   │       └── footer.tsx
│   │   ├── i18n/
│   │   │   ├── en.json
│   │   │   ├── id.json
│   │   │   └── config.ts
│   │   ├── hooks/
│   │   │   └── use-i18n.ts
│   │   ├── stores/
│   │   │   └── ui-store.ts
│   │   └── utils/
│   │       ├── date.ts
│   │       └── validation.ts
│   │
│   └── main.tsx
```

### State Management Strategy

**Zustand** for feature-specific state:
- `auth-store.ts` - User auth state
- `memorization-store.ts` - Form state, list data
- `students-store.ts` - Student list state
- `ui-store.ts` - Global UI state (sidebar, modals)

**Server State** (optional React Query):
- Cache API responses
- Automatic refetching
- Optimistic updates

**Local State** (useState):
- Simple component-specific state
- Form UI state (open/close modals)

### Routing

**React Router v6** with protected routes:

```typescript
// Public routes
/login

// Teacher routes
/teacher/dashboard
/teacher/students/:id

// Parent routes
/parent/dashboard
/parent/children/:id

// Admin routes
/admin/users
```

**Route Guards:**
- Check authentication status
- Check role permissions
- Redirect unauthorized users

### UI Components

**shadcn/ui** with custom styling:
- Solid colors, no gradients
- Sharp corners (no rounded corners)
- Simple, clean design
- Mobile-first responsive

**Component Examples:**
- `Button` - Primary, secondary, ghost variants
- `Input` - Text, email, password with validation
- `Combobox` - Searchable dropdown for Quran selection
- `Badge` - Status indicators
- `Card` - Solid borders, no shadows

### Internationalization

**i18n Setup:**
```typescript
// en.json
{
  "auth": {
    "login": "Login",
    "email": "Email",
    "password": "Password"
  },
  "memorization": {
    "status": {
      "fluent": "Fluent",
      "good": "Good",
      "needs_improvement": "Needs Improvement"
    }
  }
}

// id.json
{
  "auth": {
    "login": "Masuk",
    "email": "Email",
    "password": "Kata sandi"
  },
  "memorization": {
    "status": {
      "fluent": "Lancar",
      "good": "Cukup",
      "needs_improvement": "Kurang"
    }
  }
}
```

**Language Switcher:**
- Dropdown in header
- Persists preference to localStorage
- Defaults to browser language

---

## 5. Authentication Flow

### Login Flow

1. **User enters credentials**
   - Form validation with Zod schema
   - Inline error messages
   - Disable submit until valid

2. **API call**
   ```
   POST /auth/login
   Body: { email, password }
   ```

3. **Backend validation**
   - blend/go-zod validates input
   - Check credentials against database
   - Generate JWT token

4. **Response**
   ```json
   {
     "success": true,
     "data": {
       "token": "eyJhbGc...",
       "user": {
         "id": 1,
         "email": "teacher@example.com",
         "role": "teacher",
         "full_name": "John Doe"
       }
     }
   }
   ```

5. **Frontend stores data**
   - Zustand auth store: `setToken(token), setUser(user)`
   - localStorage: Token persistence
   - Axios default header: `Authorization: Bearer {token}`

6. **Redirect based on role**
   - teacher → `/teacher/dashboard`
   - parent → `/parent/dashboard`
   - admin → `/admin/users`

### Protected Routes

**Route wrapper component:**
```typescript
<ProtectedRoute allowedRoles={['teacher']}>
  <TeacherDashboard />
</ProtectedRoute>
```

**Checks:**
- Has valid token in Zustand store?
- Token expired? (JWT expiry check)
- Has required role? (RBAC)

**Redirect:**
- No token → `/login`
- Invalid role → `/unauthorized`
- Expired token → Refresh or logout

### Token Refresh

**Axios interceptor:**
```typescript
// Request interceptor
axios.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try refresh
      const newToken = await refreshToken();
      if (newToken) {
        // Retry original request
        return axios.request(error.config);
      } else {
        // Logout
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### Authorization Checks

**For Teachers:**
- Can only access students in assigned classes
- Backend filters by `class_id`
- Frontend: API returns pre-filtered data

**For Parents:**
- Can only access their linked children
- Backend filters by `student_parents` table
- Frontend: `/api/v1/parents/children` (pre-filtered)

**For Admin:**
- Full access to all endpoints
- Can create/manage users
- Bypasses all filters

### Logout Flow

1. **User clicks logout**
2. **API call:** `POST /auth/logout`
   - Invalidates token server-side
3. **Clear client state:**
   - Zustand store: `clearAuth()`
   - localStorage: `removeItem('token')`
4. **Redirect:** `/login`

### Session Persistence

- **Token storage:** localStorage
- **Zustand hydration:** Load from localStorage on app start
- **Auto-logout:** If token missing/expired on load

---

## 6. Key User Workflows

### Teacher Workflow - Input Memorization

#### Step 1: List View (Default)

**Mobile:**
- Single column list of students
- Each row: Name (large), status badge, last test date
- Thumb-friendly tap targets (min 44px height)
- Pull-to-refresh for new data

**Desktop:**
- Table or multi-column list
- Additional columns: Class, progress bar, quick actions
- Hover effects on rows
- Pagination controls

**Actions:**
- Tap student → Navigate to detail view
- Search bar → Filter by name
- Sort options → Name, last test date, status

#### Step 2: Detail View (Drill-down)

**Header:**
- Student name, photo placeholder
- Class name, enrollment info
- Back button

**Recent History:**
- Last 3 tests summary
- Date, unit, status badge
- Quick glance at progress

**Input Form:**
1. **Unit Type Selector**
   - Radio buttons: [Surah | Page | Juz]
   - Changes form fields below

2. **Dynamic Combobox** (based on unit type)
   - **Surah mode:**
     - Searchable dropdown with all surahs
     - Shows: Name (Latin + Arabic), juz number
     - Example: "Al-Baqarah (البقرة) - Juz 1-3"

   - **Page mode:**
     - Juz dropdown (1-30)
     - Page range inputs: start and end
     - Validation: start ≤ end

   - **Juz mode:**
     - Simple Juz dropdown (1-30)
     - Tracks entire juz completion

3. **Status Selector**
   - Radio buttons with icons:
     - ✅ Fluent (Green)
     - 👍 Good (Yellow)
     - ⚠️ Needs Improvement (Red)

4. **Notes Textarea**
   - Optional feedback
   - Max 500 characters
   - Character counter

5. **Test Date Picker**
   - Defaults to today
   - Calendar dropdown
   - Cannot be in future

6. **Submit Button**
   - Disabled until form valid
   - Loading state during API call
   - Success/error feedback

#### Step 3: Success Flow

- **Show success toast:** "Memorization saved!"
- **Navigate back:** Return to list view
- **Update list:** New status reflected immediately
- **Parent notified:** Can see updated status in their app

### Parent Workflow - View Progress

#### Step 1: Dashboard (Status Snapshot)

**Layout:**
- One card per child
- Mobile: Vertical stack
- Desktop: Grid (2-3 columns)

**Per Child Card:**
- **Header:** Photo placeholder, name
- **Progress:**
  - Overall progress bar (X% complete)
  - Quick stat: "12 of 30 surahs completed"
- **Recent Status:**
  - Last 3 tests as badges
  - Date, unit, status
- **Footer:**
  - "Last tested: 2 days ago by Teacher Name"
  - Tap for details →

**Actions:**
- Tap card → Navigate to child detail view
- Pull-to-refresh → Update data
- Filter children → If multiple

#### Step 2: Detail View

**Header:**
- Child name, photo
- Class, enrollment info
- Overall progress (percentage)
- Back button

**Status Timeline:**
- Vertical list, newest first
- Mobile: Simple cards
- Desktop: Can show side panel with charts

**Each Timeline Entry:**
- Date (large, prominent)
- Unit tested (e.g., "Al-Baqarah pages 1-10")
- Status badge (color-coded)
- Teacher name
- Notes (if any, expandable)
- Tap to expand → Full details

**Filters:**
- Unit type: [All | Surah | Page | Juz]
- Date range: From - To
- Status: [All | Fluent | Good | Needs Improvement]

**Mobile UX:**
- Infinite scroll for history
- Pull-to-refresh
- Swipe to reveal actions (if any)

**Desktop UX:**
- Sidebar with filters
- Main content with timeline
- Optional charts: Progress over time

### Mobile-First Design Principles

**Common Patterns:**
- **Thumb zones:** Important controls in bottom half
- **Touch targets:** Min 44×44px
- **Input:** Select over type when possible (dropdowns vs text)
- **Navigation:** Hamburger menu, bottom tabs
- **Feedback:** Loading spinners, success toasts, error banners

**Responsive Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## 7. Error Handling Strategy

### Frontend Error Handling

#### Form Validation Errors

**Zod Schema Validation:**
- Inline error messages below fields
- Visual feedback: Red border, shake animation
- Disable submit button until valid
- Validate on blur (not on every keystroke)

**Example:**
```typescript
const memorizationSchema = z.object({
  unit_type: z.enum(['surah', 'page', 'juz']),
  surah_id: z.number().optional(),
  page_start: z.number().min(1).optional(),
  page_end: z.number().min(1).optional(),
  status: z.enum(['fluent', 'good', 'needs_improvement']),
  notes: z.string().max(500).optional(),
  test_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});
```

#### API Errors

**Axios Interceptor:**
```typescript
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, data } = error.response || {};

    switch (status) {
      case 400:
        // Validation error - show field-specific messages
        showFieldErrors(data.error.details);
        break;
      case 401:
        // Unauthorized - auto-logout
        logout();
        break;
      case 403:
        // Forbidden - show permission error
        toast.error("You don't have permission");
        break;
      case 404:
        // Not found - show resource error
        toast.error("Resource not found");
        break;
      case 500:
        // Server error - show generic message
        toast.error("Something went wrong");
        break;
      default:
        // Network error
        toast.error("Connection lost");
    }

    return Promise.reject(error);
  }
);
```

#### Network Errors

**Detection:**
- `navigator.onLine` for online/offline status
- Axios error code `ERR_NETWORK`

**Handling:**
- Show "Connection lost" toast
- Disable forms when offline
- Queue requests for retry (when back online)
- Retry mechanism: Exponential backoff (1s, 2s, 4s, 8s)

**Example:**
```typescript
const retryRequest = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(Math.pow(2, i) * 1000);
    }
  }
};
```

### Backend Error Handling

#### Validation Layer

**blend/go-zod Validation:**
```go
func ValidateMemorization(m *Memorization) error {
    return zod.Object{
        "unit_type": zod.String().OneOf("surah", "page", "juz"),
        "surah_id": zod.Number().Optional(),
        "page_start": zod.Number().Min(1).Optional(),
        "page_end": zod.Number().Min(1).Optional(),
        "status": zod.String().OneOf("fluent", "good", "needs_improvement"),
        "notes": zod.String().Max(500).Optional(),
        "test_date": zod.String().Regex(`^\d{4}-\d{2}-\d{2}$`),
    }.Validate(m)
}
```

**Response Format:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "page_start",
        "message": "Must be a positive integer"
      },
      {
        "field": "page_end",
        "message": "Must be greater than page_start"
      }
    ]
  }
}
```

#### Business Logic Errors

**Service Layer Checks:**
```go
// Teacher can only access assigned classes
if !teacher.IsAssignedToClass(classID) {
    return ErrForbidden("You can only access your assigned classes")
}

// Parent can only access own children
if !parent.HasChild(studentID) {
    return ErrForbidden("You can only access your own children")
}

// Invalid surah/juz combination
if !IsValidSurahJuzCombo(surahID, juzID) {
    return ErrBadRequest("Invalid surah for this juz")
}
```

**Response Codes:**
- `403 Forbidden` - Authorization failures
- `400 Bad Request` - Business rule violations

#### Database Errors

**Repository Layer Handling:**
```go
// Foreign key violation
if err.(*pq.Error).Code == "23503" {
    return ErrBadRequest("Referenced resource does not exist")
}

// Unique constraint violation
if err.(*pq.Error).Code == "23505" {
    return ErrConflict("Resource already exists")
}

// Connection error
if err == sql.ErrConnDone {
    return ErrInternal("Database connection failed")
}
```

### Logging

**Structured Logging (JSON):**
```go
logger.Error("memorization_creation_failed",
    "user_id", userID,
    "student_id", studentID,
    "error", err.Error(),
    "timestamp", time.Now(),
)
```

**Log Levels:**
- **ERROR:** Failed operations, exceptions
- **WARN:** Deprecated usage, performance issues
- **INFO:** User actions, state changes
- **DEBUG:** Detailed flow (dev only)

**Log Destinations:**
- Development: Console (pretty-printed)
- Production: File + external service (e.g., Sentry)

### Error Recovery

**Automatic Retry:**
- Transient failures (network, DB connection)
- Exponential backoff
- Max 3 retries

**Manual Recovery:**
- User-triggered retry button
- "Try again" action on error toasts

**Graceful Degradation:**
- If Quran data fails to load, show simplified form
- If charts fail, show text summary instead

---

## 8. Testing Approach

### Frontend Testing

#### Unit Tests (Vitest + React Testing Library)

**What to Test:**
- Component rendering
- Form validation (Zod schemas)
- Custom hooks (use-auth, use-memorization)
- Utility functions (date formatting, validation)

**Example:**
```typescript
describe('MemorizationForm', () => {
  it('validates required fields', () => {
    const { getByLabelText, getByText } = render(<MemorizationForm />);
    const submitBtn = getByText('Submit');

    expect(submitBtn).toBeDisabled();

    // Fill form
    fireEvent.change(getByLabelText('Unit Type'), { target: { value: 'surah' } });
    // ... fill other fields

    expect(submitBtn).toBeEnabled();
  });
});
```

**Target Coverage:** 70%+

#### Integration Tests

**What to Test:**
- API client with mocked responses
- Auth flows (login, logout, token refresh)
- Protected route navigation
- Form submission with real API (mocked)

**Example:**
```typescript
describe('Auth Flow', () => {
  it('logs in successfully and redirects', async () => {
    const { getByLabelText, getByText } = render(<LoginPage />);

    fireEvent.change(getByLabelText('Email'), {
      target: { value: 'teacher@example.com' }
    });
    fireEvent.change(getByLabelText('Password'), {
      target: { value: 'password123' }
    });

    fireEvent.click(getByText('Login'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/teacher/dashboard');
    });
  });
});
```

#### E2E Tests (Playwright - Optional for Demo)

**Critical User Journeys:**
1. **Teacher:**
   - Login → Navigate to dashboard → Select student → Input memorization → Verify

2. **Parent:**
   - Login → View children → Select child → Check history → Verify

**Example:**
```typescript
test('teacher inputs memorization', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'teacher@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Navigate to student
  await page.click('text=John Doe');

  // Fill form
  await page.selectOption('[name="unit_type"]', 'surah');
  await page.fill('[name="notes"]', 'Great progress!');

  // Submit
  await page.click('button[type="submit"]');

  // Verify
  await expect(page.locator('text=Memorization saved')).toBeVisible();
});
```

### Backend Testing

#### Unit Tests

**What to Test:**
- Repository layer (with test DB)
- Service layer business logic
- Handler request/response
- Validation functions

**Example:**
```go
func TestMemorizationService_Create(t *testing.T) {
    // Setup
    mockRepo := &MockMemorizationRepository{}
    service := NewMemorizationService(mockRepo)

    // Test
    input := &CreateMemorizationInput{
        StudentID: 1,
        TeacherID: 2,
        UnitType: "surah",
        SurahID: 1,
        Status: "fluent",
    }

    result, err := service.Create(input)

    // Assert
    assert.NoError(t, err)
    assert.Equal(t, input.StudentID, result.StudentID)
    assert.Equal(t, 1, mockRepo.CreateCallCount)
}
```

#### Integration Tests

**What to Test:**
- Full HTTP stack (endpoint → handler → service → repo)
- Database migrations
- Authentication flows
- RBAC permission checks

**Example:**
```go
func TestAPI_CreateMemorization(t *testing.T) {
    // Setup test server
    app := setupTestApp()
    token := generateTestToken("teacher")

    // Test request
    body := `{
      "student_id": 1,
      "unit_type": "surah",
      "surah_id": 1,
      "status": "fluent"
    }`

    req := httptest.NewRequest("POST", "/api/v1/memorization", strings.NewReader(body))
    req.Header.Set("Authorization", "Bearer "+token)
    req.Header.Set("Content-Type", "application/json")

    // Execute
    w := httptest.NewRecorder()
    app.ServeHTTP(w, req)

    // Assert
    assert.Equal(t, 201, w.Code)
}
```

### Test Database

**Setup:**
- Separate PostgreSQL instance for testing
- Environment variable: `TEST_DATABASE_URL`
- Migrations run before test suite
- Clean slate between tests (transactions rolled back)

**Example:**
```go
func setupTestDB(t *testing.T) *sql.DB {
    db, err := sql.Open("postgres", os.Getenv("TEST_DATABASE_URL"))
    require.NoError(t, err)

    // Run migrations
    migrations.Up(db, "file://database/migrations")

    // Use transaction for each test
    tx, _ := db.Begin()
    t.Cleanup(func() { tx.Rollback() })

    return tx
}
```

### Testing Strategy for Demo

**Priority Order:**

1. **Happy Path Tests First** (Core functionality)
   - Login/logout
   - Create memorization
   - View children progress

2. **Edge Cases** (Critical flows)
   - Auth errors (wrong password, expired token)
   - RBAC (parent accessing other children)
   - Validation errors (invalid inputs)

3. **Manual Testing** (Mobile responsiveness)
   - Test on real devices
   - Check touch targets
   - Verify responsive layouts

**What to Skip for Demo:**
- Load testing (not needed for demo)
- Performance testing (can add later)
- Extensive E2E tests (manual testing sufficient)

### Continuous Integration

**GitHub Actions Workflow:**

```yaml
name: Test

on: [push, pull_request]

jobs:
  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - checkout
      - setup-bun
      - bun install
      - bun test

  backend-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
    steps:
      - checkout
      - setup-go
      - go test ./...
```

---

## Next Steps

This design document provides a comprehensive blueprint for building the Hafalan Tracker system. The next phase is to create a detailed implementation plan that breaks down the work into specific, actionable tasks.

**Key principles to remember during implementation:**

1. **Mobile-first** - Design for small screens, scale up
2. **English codebase** - All variables, schemas, API in English
3. **i18n ready** - UI supports EN/ID from day one
4. **RBAC enforced** - Every endpoint checks permissions
5. **Soft deletes** - Never lose data, always audit trail
6. **Dual validation** - Frontend UX + Backend security
7. **Shadcn/ui** - Solid colors, sharp edges, simple design

---

**Document Status:** Draft - Ready for implementation planning phase
