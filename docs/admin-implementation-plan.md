# Admin Features Implementation Plan

## 🎯 Overview

**Goal**: Mengimplementasikan semua fitur admin yang belum fungsional (70% → 100%)
**Current Status**: 30% Complete (12/40 fitur fungsional)
**Target**: 100% Complete (40/40 fitur fungsional)

## 📋 Implementation Phases

### **Phase 1: CRUD Operations - Students (Priority 1)**
**Estimation**: 2-3 hours  
**Dependencies**: Database schema ready

#### Backend Tasks:
- [ ] **1.1** Create student repository methods
  - [ ] Add `Create()` method to `studentRepository`
  - [ ] Add `Update()` method to `studentRepository`
  - [ ] Add `Delete()` method to `studentRepository`
  - [ ] Add input validation
  - [ ] Add error handling

- [ ] **1.2** Create student service layer
  - [ ] Add `CreateStudent()` with validation
  - [ ] Add `UpdateStudent()` with validation
  - [ ] Add `DeleteStudent()` with cascade checks
  - [ ] Handle parent-child relationships
  - [ ] Handle class assignments

- [ ] **1.3** Add student CRUD handlers
  - [ ] `createStudent()` handler - POST `/admin/students`
  - [ ] `updateStudent()` handler - PUT `/admin/students/:id`
  - [ ] `deleteStudent()` handler - DELETE `/admin/students/:id`
  - [ ] Add admin role middleware
  - [ ] Add request validation

- [ ] **1.4** Update routing
  - [ ] Add POST route for students
  - [ ] Add PUT route for students
  - [ ] Add DELETE route for students
  - [ ] Test all routes with Postman/curl

#### Frontend Tasks:
- [ ] **1.5** Update Student API client
  - [ ] Add `create()` function to `studentsApi`
  - [ ] Add `update()` function to `studentsApi`
  - [ ] Add `delete()` function to `studentsApi`
  - [ ] Add proper error handling

- [ ] **1.6** Update StudentFormPage
  - [ ] Replace mock data with real API calls
  - [ ] Fetch classes from API
  - [ ] Fetch parents from API
  - [ ] Handle create vs edit mode
  - [ ] Add loading states
  - [ ] Add success/error messages

- [ ] **1.7** Update StudentListPage
  - [ ] Connect delete button to real API
  - [ ] Add confirmation dialog
  - [ ] Refresh list after delete
  - [ ] Handle delete errors

#### Testing:
- [ ] **1.8** Test student CRUD
  - [ ] Create new student → verify in database
  - [ ] Update existing student → verify changes
  - [ ] Delete student → verify deletion
  - [ ] Test validation (empty name, invalid email, etc.)
  - [ ] Test error handling (duplicate, not found, etc.)

---

### **Phase 2: CRUD Operations - Teachers (Priority 1)**
**Estimation**: 2-3 hours  
**Dependencies**: None (can run parallel with Phase 1)

#### Backend Tasks:
- [ ] **2.1** Create teacher repository methods
  - [ ] Add `Create()` method to `teacherRepository`
  - [ ] Add `Update()` method to `teacherRepository`
  - [ ] Add `Delete()` method to `teacherRepository`
  - [ ] Handle user account creation/linking

- [ ] **2.2** Create teacher service layer
  - [ ] Add `CreateTeacher()` with user creation
  - [ ] Add `UpdateTeacher()` 
  - [ ] Add `DeleteTeacher()` with user deletion
  - [ ] Password generation for new teachers

- [ ] **2.3** Add teacher CRUD handlers
  - [ ] `createTeacher()` handler
  - [ ] `updateTeacher()` handler
  - [ ] `deleteTeacher()` handler

- [ ] **2.4** Update routing for teachers

#### Frontend Tasks:
- [ ] **2.5** Update Teacher API client
  - [ ] Add CRUD functions

- [ ] **2.6** Update TeacherFormPage
  - [ ] Replace mock data with real API
  - [ ] Add password field for create mode
  - [ ] Handle user creation

- [ ] **2.7** Update TeacherListPage
  - [ ] Connect delete to real API

#### Testing:
- [ ] **2.8** Test teacher CRUD
  - [ ] Create teacher with user account
  - [ ] Login as new teacher
  - [ ] Update teacher info
  - [ ] Delete teacher (cascade to user)

---

### **Phase 3: CRUD Operations - Parents (Priority 1)**
**Estimation**: 2-3 hours  
**Dependencies**: None (can run parallel with Phase 1 & 2)

#### Backend Tasks:
- [ ] **3.1** Create parent repository methods
  - [ ] Add `Create()`, `Update()`, `Delete()` methods
  - [ ] Handle user account creation

- [ ] **3.2** Create parent service layer
  - [ ] Add CRUD with user management
  - [ ] Handle student relationships

- [ ] **3.3** Add parent CRUD handlers

- [ ] **3.4** Update routing for parents

#### Frontend Tasks:
- [ ] **3.5** Update Parent API client

- [ ] **3.6** Update ParentFormPage
  - [ ] Replace mock data
  - [ ] Add password field

- [ ] **3.7** Update ParentListPage
  - [ ] Connect delete to real API

#### Testing:
- [ ] **3.8** Test parent CRUD
  - [ ] Create parent with user account
  - [ ] Login as new parent
  - [ ] Link/unlink students
  - [ ] Delete parent

---

### **Phase 4: CRUD Operations - Classes (Priority 1)**
**Estimation**: 1-2 hours  
**Dependencies**: Teachers must exist

#### Backend Tasks:
- [ ] **4.1** Create class repository methods
  - [ ] Add `Create()`, `Update()`, `Delete()` methods
  - [ ] Handle teacher assignments

- [ ] **4.2** Create class service layer
  - [ ] Add CRUD with validation
  - [ ] Validate teacher existence

- [ ] **4.3** Add class CRUD handlers

- [ ] **4.4** Update routing for classes

#### Frontend Tasks:
- [ ] **4.5** Update Class API client

- [ ] **4.6** Update ClassFormPage
  - [ ] Replace mock data
  - [ ] Fetch teachers for dropdown

- [ ] **4.7** Update ClassListPage
  - [ ] Connect delete to real API

#### Testing:
- [ ] **4.8** Test class CRUD
  - [ ] Create class with teacher
  - [ ] Update class details
  - [ ] Delete class
  - [ ] Assign students to class

---

### **Phase 5: Profile Management (Priority 2)**
**Estimation**: 2 hours  
**Dependencies**: User service

#### Backend Tasks:
- [ ] **5.1** Add profile handlers
  - [ ] `updateProfile()` handler - PUT `/profile`
  - [ ] `changePassword()` handler - POST `/profile/change-password`
  - [ ] Validate current password
  - [ ] Hash new passwords

- [ ] **5.2** Add user service methods
  - [ ] `UpdateProfile()` method
  - [ ] `ChangePassword()` method
  - [ ] Add validation

- [ ] **5.3** Update routing
  - [ ] Add profile routes
  - [ ] Add authentication middleware

#### Frontend Tasks:
- [ ] **5.4** Update ProfilePage
  - [ ] Connect to real API
  - [ ] Add loading states
  - [ ] Handle profile updates
  - [ ] Handle password changes

#### Testing:
- [ ] **5.5** Test profile management
  - [ ] Update name/email
  - [ ] Change password
  - [ ] Login with new password
  - [ ] Test validation (wrong current password)

---

### **Phase 6: Settings Management (Priority 2)**
**Estimation**: 3-4 hours  
**Dependencies**: File upload handling

#### Backend Tasks:
- [ ] **6.1** Create settings storage
  - [ ] Add settings table to database
  - [ ] Add default settings
  - [ ] Create settings repository

- [ ] **6.2** Add settings handlers
  - [ ] `getSettings()` handler
  - [ ] `updateSettings()` handler
  - [ ] `uploadLogo()` handler
  - [ ] File upload handling
  - [ ] Image processing/validation

- [ ] **6.3** Add reset password handler
  - [ ] `resetUserPassword()` handler
  - [ ] Admin-only access
  - [ ] Password generation

- [ ] **6.4** Update routing
  - [ ] Add settings routes
  - [ ] Add admin middleware

#### Frontend Tasks:
- [ ] **6.5** Create settings API client
  - [ ] Add settings functions
  - [ ] Add logo upload function

- [ ] **6.6** Update SettingsPage
  - [ ] Connect to real API
  - [ ] Handle logo upload
  - [ ] Fetch real users list
  - [ ] Implement password reset

#### Testing:
- [ ] **6.7** Test settings management
  - [ ] Update school info
  - [ ] Upload logo
  - [ ] Reset user password
  - [ ] Verify settings persist

---

### **Phase 7: Reports & Export (Priority 3)**
**Estimation**: 4-5 hours  
**Dependencies**: All data must be ready

#### Backend Tasks:
- [ ] **7.1** Create report service
  - [ ] `GenerateStudentReport()` method
  - [ ] `GenerateClassReport()` method
  - [ ] `GeneratePeriodReport()` method
  - [ ] Data aggregation logic
  - [ ] Progress calculations

- [ ] **7.2** Add report handlers
  - [ ] `getStudentReport()` handler
  - [ ] `getClassReport()` handler
  - [ ] `getPeriodReport()` handler
  - [ ] Date range filtering

- [ ] **7.3** Update routing
  - [ ] Add report routes
  - [ ] Add authentication

#### Frontend Tasks:
- [ ] **7.4** Create reports API client
  - [ ] Add report fetching functions

- [ ] **7.5** Update ReportsPage
  - [ ] Connect to real API
  - [ ] Implement PDF generation with real data
  - [ ] Implement Excel export with real data
  - [ ] Add date range picker
  - [ ] Add student/class selectors

#### Testing:
- [ ] **7.6** Test reports
  - [ ] Generate student report
  - [ ] Generate class report
  - [ ] Generate period report
  - [ ] Verify PDF export
  - [ ] Verify Excel export
  - [ ] Test data accuracy

---

### **Phase 8: Dashboard Enhancements (Priority 3)**
**Estimation**: 2 hours  
**Dependencies**: All data ready

#### Backend Tasks:
- [ ] **8.1** Create activity tracking
  - [ ] Add activities table
  - [ ] Log CRUD operations
  - [ ] Add activity repository

- [ ] **8.2** Add activity handlers
  - [ ] `getRecentActivities()` handler
  - [ ] Pagination support

- [ ] **8.3** Update dashboard stats
  - [ ] Add more detailed stats
  - [ ] Add trends/calculations

#### Frontend Tasks:
- [ ] **8.4** Update AdminOverviewPage
  - [ ] Connect activities to real API
  - [ ] Add activity feed
  - [ ] Enhance stats cards

#### Testing:
- [ ] **8.5** Test dashboard
  - [ ] View recent activities
  - [ ] Verify stats accuracy
  - [ ] Test activity logging

---

## 🎯 Success Criteria

Setiap phase harus memenuhi criteria:

1. ✅ **Backend**: All endpoints working, tested with Postman/curl
2. ✅ **Frontend**: All forms connected to real API, no mock data
3. ✅ **Error Handling**: Proper error messages for all failure cases
4. ✅ **Validation**: Input validation on both frontend and backend
5. ✅ **Testing**: Manual testing completed for all features
6. ✅ **Documentation**: Code commented and documented

## 📊 Progress Tracking

**Overall Progress**: 12/40 features (30%)

- [ ] Phase 1: Student CRUD (0/8 tasks)
- [ ] Phase 2: Teacher CRUD (0/8 tasks)  
- [ ] Phase 3: Parent CRUD (0/8 tasks)
- [ ] Phase 4: Class CRUD (0/8 tasks)
- [ ] Phase 5: Profile (0/5 tasks)
- [ ] Phase 6: Settings (0/7 tasks)
- [ ] Phase 7: Reports (0/6 tasks)
- [ ] Phase 8: Dashboard (0/5 tasks)

## 🔧 Development Guidelines

### Backend Development:
1. Follow existing code structure
2. Use repository pattern for data access
3. Use service layer for business logic
4. Add proper error handling
5. Add input validation
6. Add SQL injection protection
7. Test each endpoint individually

### Frontend Development:
1. Remove all mock data
2. Add proper loading states
3. Handle errors gracefully
4. Show success messages
5. Maintain mobile responsiveness
6. Test on multiple screen sizes

### Testing:
1. Test happy path
2. Test error cases
3. Test validation
4. Test with real data
5. Test edge cases
6. Document any issues

## 📝 Notes

- Setiap phase sebaiknya dikerjakan secara terpisah dan di-test sebelum lanjut
- Phases 1-4 bisa dikerjakan paralel oleh developer berbeda
- Phases 5-8 bergantung pada completion phases 1-4
- Documentation harus di-update setelah completion setiap phase
- Final testing harus dilakukan setelah semua phases complete
