# Quran Teacher Filtering Implementation

## 🎯 Overview

Implementation of Quran teacher filtering system where teachers can only access and input hafalan for students in their assigned classes.

## ✅ What Was Implemented

### 1. Database Schema

**Table:** `class_quran_teachers`

```sql
CREATE TABLE class_quran_teachers (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    quran_teacher_id INTEGER NOT NULL REFERENCES teachers(user_id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
)
```

**Features:**
- ✅ Supports 1 teacher for multiple classes
- ✅ Full history of teacher assignments
- ✅ Academic year tracking
- ✅ Unique constraint: 1 active teacher per class per year

### 2. Backend Implementation

**Repository:** `backend/internal/repository/class_quran_teacher.go`
- `GetActiveByTeacher(teacherID, academicYear)` - Get active assignments
- `GetAllActiveByTeacher(teacherID)` - Get all active assignments
- `GetHistoryByClass(classID)` - Get assignment history for a class
- `Create()`, `EndAssignment()` - Manage assignments

**Handler Updates:** `backend/internal/server/handlers.go`
- `getTeacherStudents()` - Returns only students from teacher's assigned classes
- `createMemorization()` - Validates student is in teacher's assigned class
- `updateMemorization()` - Validates ownership and class assignment

### 3. Testing Results

**Ibu Siti** (Teacher ID: 4, Assigned: Class 1A & 1B):
```json
[
  {"id": "6", "name": "Aisyah Humaira", "class_name": "Kelas 1A"},
  {"id": "16", "name": "Test Student", "class_name": "Kelas 1A"},
  {"id": "7", "name": "Zainal Abidin", "class_name": "Kelas 1A"},
  {"id": "8", "name": "Khadijah Siti", "class_name": "Kelas 1B"},
  {"id": "9", "name": "Umar Faruq", "class_name": "Kelas 1B"}
]
```
- ✅ **6 students** from Class 1A & 1B only
- ❌ Cannot see Class 6A & 6B students

**Pak Budi** (Teacher ID: 3, Assigned: Class 6A & 6B):
```json
[
  {"id": "1", "name": "Ahmad Fauzi", "class_name": "Kelas 6A"},
  {"id": "10", "name": "Ali bin Abi Thalib", "class_name": "Kelas 6A"},
  {"id": "4", "name": "Fatimah Zahra", "class_name": "Kelas 6A"},
  {"id": "2", "name": "Siti Aminah", "class_name": "Kelas 6A"},
  {"id": "5", "name": "Abdullah Rahman", "class_name": "Kelas 6B"},
  {"id": "3", "name": "Muhammad Rizki", "class_name": "Kelas 6B"}
]
```
- ✅ **6 students** from Class 6A & 6B only
- ❌ Cannot see Class 1A & 1B students

## 🔒 Security Features

1. **Student Filtering**: Teachers only see students from their assigned classes
2. **Input Validation**: Teachers can only create hafalan records for their students
3. **Update Validation**: Teachers can only update hafalan records they created
4. **History Tracking**: Full audit trail of teacher assignments

## 📊 Database State

**Current Assignments (2025/2026):**
| Class | Quran Teacher | Students |
|-------|---------------|----------|
| Kelas 1A | Ibu Siti Rahayu | 4 students |
| Kelas 1B | Ibu Siti Rahayu | 2 students |
| Kelas 6A | Pak Budi Santoso | 4 students |
| Kelas 6B | Pak Budi Santoso | 2 students |

## 🚀 How It Works

### 1. Teacher Logs In
```
POST /api/v1/public/login
→ JWT token contains user_id (string "4" for Ibu Siti)
```

### 2. Teacher Views Students
```
GET /api/v1/teachers/me/students
→ Converts user_id to int
→ Queries class_quran_teachers for active assignments
→ Returns only students from assigned classes
```

### 3. Teacher Inputs Hafalan
```
POST /api/v1/memorizations
→ Validates student is in teacher's assigned class
→ Returns 403 Forbidden if not authorized
→ Creates memorization record if authorized
```

## 📝 Next Steps (Frontend)

To complete the UX:

1. **Add Tabs by Class** - Filter students by class name
2. **Show Class Info** - Display which classes teacher manages
3. **Better Error Messages** - Show why input was rejected

## ⚠️ Known Limitations

1. **Academic Year** - Currently hardcoded to "2025/2026", should be configurable
2. **Admin Override** - Admin users not handled in this implementation
3. **Multiple Teachers** - System assumes 1 teacher per class per academic year

## 🔧 Technical Notes

- Used PostgreSQL's `ANY()` with `pq.Array()` for efficient array queries
- Type conversions: String userID (from JWT) → Int (database operations)
- Added struct tags `db:"field_name"` for proper sqlx mapping
- Partial unique index: `WHERE is_active = true` for constraint
