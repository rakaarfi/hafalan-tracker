# Testing Checklist - Hafalan Tracker Frontend

## Test User Accounts

### Admin
- **Email:** admin@test.com
- **Password:** admin123
- **Access:** Full admin dashboard, all CRUD operations, reports, settings

### Teacher
- **Email:** teacher@test.com
- **Password:** password123
- **Access:** Teacher dashboard, input hafalan, view student progress

### Parent
- **Email:** parent@test.com
- **Password:** password123
- **Access:** Parent dashboard, view child progress

## Test Scenarios

### 1. Authentication Tests

#### Login Page (`/login`)
- [ ] Login with valid admin credentials
- [ ] Login with valid teacher credentials
- [ ] Login with valid parent credentials
- [ ] Login with invalid credentials (should show error)
- [ ] Check responsive design on mobile

#### Logout
- [ ] Logout button works from all dashboards
- [ ] After logout, redirect to login page
- [ ] Cannot access protected routes after logout

### 2. Admin Dashboard Tests (`/admin`)

#### Dashboard Overview (`/admin/dashboard`)
- [ ] Stats cards display correctly (Total Murid, Total Guru, Total Orang Tua, Total Hafalan)
- [ ] Quick action buttons work
- [ ] Recent activities list displays
- [ ] Mobile responsive

#### Student Management (`/admin/students`)
- [ ] Student list page loads with table view
- [ ] Search functionality works
- [ ] "Tambah Murid" button navigates to form
- [ ] Edit button on student row works
- [ ] Delete button shows confirmation dialog
- [ ] Delete removes student from list

#### Student Form (`/admin/students/new` and `/admin/students/:id/edit`)
- [ ] Form loads with proper fields (Nama, Kelas, Parent 1, Parent 2, Tanggal Lahir, No HP)
- [ ] Class dropdown shows available classes
- [ ] Parent dropdowns work (can select 2 parents)
- [ ] Form validation works (required fields)
- [ ] Save button creates/updates student
- [ ] Cancel button returns to list
- [ ] Success toast appears after save

#### Parent Management (`/admin/parents`)
- [ ] Parent list page loads with card view
- [ ] Search functionality works
- [ ] Cards show parent info (Name, Email, Phone, Children count)
- [ ] "Tambah Orang Tua" button works
- [ ] Edit button on parent card works
- [ ] Delete button shows confirmation

#### Parent Form (`/admin/parents/new` and `/admin/parents/:id/edit`)
- [ ] Form loads with proper fields (Nama, Email, No HP, Password)
- [ ] Email validation works
- [ ] Password field shows on create only (not edit)
- [ ] Info box explains parent can be assigned to multiple children
- [ ] Save creates/updates parent

#### Teacher Management (`/admin/teachers`)
- [ ] Teacher list page loads with table view
- [ ] Table shows (Nama, Email, No HP, Kelas)
- [ ] Class badges display correctly
- [ ] "Tambah Guru" button works
- [ ] Edit/Delete buttons work

#### Teacher Form (`/admin/teachers/new` and `/admin/teachers/:id/edit`)
- [ ] Form loads with proper fields (Nama, Email, No HP, Password)
- [ ] Email validation works
- [ ] Password field shows on create only
- [ ] Info box explains teacher role assignment
- [ ] Save creates/updates teacher

#### Class Management (`/admin/classes`)
- [ ] Class list page loads with grid view
- [ ] Cards show class info (Nama, Wali Kelas, Jumlah Murid)
- [ ] GraduationCap icon displays
- [ ] "Tambah Kelas" button works
- [ ] Edit/Delete buttons work

#### Class Form (`/admin/classes/new` and `/admin/classes/:classId/edit`)
- [ ] Form loads with proper fields (Nama Kelas, Wali Kelas)
- [ ] Teacher dropdown shows available teachers
- [ ] Info box explains format naming conventions
- [ ] Save creates/updates class

#### Reports Page (`/admin/reports`)
- [ ] Report type selector works (Student, Class, Period)
- [ ] Preview section updates based on selection
- [ ] Student report preview shows correct info (Nama, Kelas, Progress)
- [ ] Class report preview shows correct info (Kelas, Wali Kelas, Total Murid)
- [ ] PDF Export button works and downloads file
- [ ] Excel Export button works and downloads file
- [ ] Export buttons show loading state
- [ ] Success alert appears after export
- [ ] Info box explains export formats

#### Settings Page (`/admin/settings`)
- [ ] School information section loads
- [ ] Logo upload works and shows preview
- [ ] All school fields work (Nama, Email, Phone, Address, Academic Year)
- [ ] Academic year dropdown shows correct options
- [ ] Save button saves settings
- [ ] Password reset section loads
- [ ] User dropdown shows all users
- [ ] Reset password button works
- [ ] Info box explains password reset process
- [ ] System info section displays correctly

#### Sidebar Navigation
- [ ] All menu items work and navigate to correct pages
- [ ] Active menu item is highlighted
- [ ] Collapse/expand button works
- [ ] Logout button works
- [ ] User info displays correctly

### 3. Teacher Dashboard Tests (`/teacher`)

#### Dashboard Overview (`/teacher/dashboard`)
- [ ] Dashboard loads with teacher-specific view
- [ ] Class list displays
- [ ] Student statistics show
- [ ] Quick actions work

#### Student Detail Page (`/teacher/students/:studentId`)
- [ ] Student info displays correctly
- [ ] Progress visualization works
- [ ] Hafalan history table shows
- [ ] Input hafalan button works
- [ ] Back button returns to dashboard

#### Hafalan Input Form
- [ ] Form loads with Quran combobox
- [ ] Surah search works (including Al-Falaq and An-Nas)
- [ ] Unit type selector works (Juz, Surah, Halaman)
- [ ] Status selector works (Lancar, Cukup, Perlu Perbaikan)
- [ ] Notes field works
- [ ] Form validation works
- [ ] Save button submits data
- [ ] Success toast appears

### 4. Parent Dashboard Tests (`/parent`)

#### Dashboard Overview (`/parent/dashboard`)
- [ ] Dashboard loads with parent-specific view
- [ ] Children list displays
- [ ] Each child shows progress overview
- [ ] Click on child navigates to detail page

#### Child Detail Page (`/parent/children/:childId`)
- [ ] Child info displays correctly
- [ ] Progress visualization works (percentage, progress bar)
- [ ] Memorization history shows complete data
- [ ] Last test information displays
- [ ] Filter functionality works
- [ ] Responsive design works on mobile

### 5. Profile Page Tests (`/profile`)

#### Profile Tab
- [ ] Profile tab loads by default
- [ ] Form shows current user info
- [ ] Edit fields work (Nama, Email, No HP)
- [ ] Save button updates profile
- [ ] Success toast appears

#### Password Tab
- [ ] Password tab loads when clicked
- [ ] All password fields work (Current, New, Confirm)
- [ ] Validation works (matching passwords, current password required)
- [ ] Update button changes password
- [ ] Success/error toasts appear
- [ ] Security tips display

### 6. General UI/UX Tests

#### Design Consistency
- [ ] NO rounded corners anywhere (all sharp edges)
- [ ] All borders are border-2 (solid 2px)
- [ ] NO shadows anywhere
- [ ] Clean, simple design throughout
- [ ] Consistent color scheme

#### Accessibility
- [ ] All buttons have minimum 44x44px size
- [ ] All inputs have minimum 44px height
- [ ] Keyboard navigation works
- [ ] Form labels are clear
- [ ] Error messages are clear
- [ ] Color contrast is sufficient

#### Responsive Design
- [ ] Mobile view works (320px+)
- [ ] Tablet view works (768px+)
- [ ] Desktop view works (1024px+)
- [ ] Tables scroll horizontally on mobile
- [ ] Grid layouts stack on mobile
- [ ] Navigation collapses on mobile

#### Performance
- [ ] Pages load quickly
- [ ] No console errors
- [ ] No memory leaks
- [ ] Smooth transitions
- [ ] Optimized images

### 7. Browser Compatibility

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers

## Known Issues

### Resolved
- ✅ Al-Falaq and An-Nas not found in Quran search - Fixed by expanding quran-data.ts to 114 surahs
- ✅ Parent detail page blank - Fixed by creating ChildDetailPage.tsx
- ✅ TypeScript errors with unused variables - Fixed by removing unused imports
- ✅ Missing Users import in ReportsPage - Fixed by adding to lucide-react imports
- ✅ Missing PDF/Excel libraries - Fixed by installing jspdf, jspdf-autotable, xlsx

### Current
- 🚧 Settings page uses mock data - TODO: Connect to backend API
- 🚧 Password reset uses mock data - TODO: Connect to backend API
- 🚧 PDF/Excel export uses mock data - TODO: Connect to backend API

## Demo Preparation Checklist

### Before Demo
- [ ] Start PostgreSQL database: `docker-compose up -d`
- [ ] Start backend server: `cd backend && go run main.go`
- [ ] Start frontend dev server: `cd frontend && bun run dev`
- [ ] Clear browser cache and cookies
- [ ] Open browser to `http://localhost:5173`
- [ ] Test all three user roles

### Demo Script
1. **Admin Demo** (5 minutes)
   - Login as admin@test.com / admin123
   - Show admin dashboard with statistics
   - Navigate to Data Master (Murid, Guru, Kelas, Orang Tua)
   - Add a new student
   - View reports and show PDF export
   - Show settings page

2. **Teacher Demo** (3 minutes)
   - Login as teacher@test.com / password123
   - Show teacher dashboard
   - Click on a student and view progress
   - Input hafalan for a student
   - Show Quran search (demonstrate Al-Falaq and An-Nas)

3. **Parent Demo** (2 minutes)
   - Login as parent@test.com / password123
   - Show parent dashboard with children
   - Click on child and view detailed progress
   - Show memorization history

4. **Profile Demo** (1 minute)
   - Navigate to profile page
   - Show edit profile functionality
   - Show change password functionality

### Backup Plan
- [ ] Screenshots prepared if live demo fails
- [ ] Test data backup available
- [ ] Backend API documentation ready
- [ ] Contact info for support

## Success Criteria

✅ **Must Have**
- All three user roles can login and access their dashboards
- Admin can perform all CRUD operations
- Teacher can input hafalan
- Parent can view child progress
- PDF/Excel export works
- Profile management works
- No console errors
- Mobile responsive

✅ **Nice to Have**
- Fast page loads
- Smooth animations
- Professional UI design
- Comprehensive error handling
- Detailed user feedback

## Timeline

- **Estimated testing time:** 2-3 hours
- **Bug fix time:** 1-2 hours
- **Demo preparation:** 30 minutes
- **Total time:** 4-6 hours

---

**Last updated:** 2026-04-05
**Status:** Ready for testing
**Next steps:** Complete final testing and demo preparation