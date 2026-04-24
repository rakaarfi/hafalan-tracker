-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role permissions junction table
CREATE TABLE role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    is_active BOOLEAN DEFAULT true,
    password_changed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teachers table
CREATE TABLE teachers (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parents table
CREATE TABLE parents (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classes table
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    grade_level VARCHAR(50),
    homeroom_teacher_id INTEGER REFERENCES teachers(user_id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
    enrollment_year INTEGER NOT NULL,
    semester INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student parents junction table
CREATE TABLE student_parents (
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES parents(user_id) ON DELETE CASCADE,
    relationship_type VARCHAR(20) NOT NULL CHECK (relationship_type IN ('father', 'mother', 'guardian')),
    is_primary_contact BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Surah reference table
CREATE TABLE surah (
    id SERIAL PRIMARY KEY,
    surah_number INTEGER UNIQUE NOT NULL,
    name_latin VARCHAR(100) NOT NULL,
    name_arabic VARCHAR(100),
    place VARCHAR(20) CHECK (place IN ('Mecca', 'Medina')),
    type VARCHAR(20) CHECK (type IN ('Makkiyah', 'Madaniyah')),
    ayah_count INTEGER,
    start_page INTEGER,
    juz_number INTEGER
);

-- Juz reference table
CREATE TABLE juz (
    id SERIAL PRIMARY KEY,
    juz_number INTEGER UNIQUE NOT NULL,
    start_surah_id INTEGER REFERENCES surah(id),
    start_ayah VARCHAR(20),
    end_surah_id INTEGER REFERENCES surah(id),
    end_ayah VARCHAR(20)
);

-- Memorization table
CREATE TABLE memorization (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id),
    teacher_id INTEGER NOT NULL REFERENCES teachers(user_id),
    unit_type VARCHAR(10) NOT NULL CHECK (unit_type IN ('surah', 'page', 'juz')),
    surah_id INTEGER REFERENCES surah(id) ON DELETE SET NULL,
    juz_id INTEGER REFERENCES juz(id) ON DELETE SET NULL,
    page_start INTEGER,
    page_end INTEGER,
    status VARCHAR(30) NOT NULL CHECK (status IN ('fluent', 'good', 'needs_improvement')),
    notes TEXT,
    test_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        (unit_type = 'surah' AND surah_id IS NOT NULL AND juz_id IS NULL AND page_start IS NULL AND page_end IS NULL) OR
        (unit_type = 'page' AND juz_id IS NOT NULL AND page_start IS NOT NULL AND page_end IS NOT NULL AND surah_id IS NULL) OR
        (unit_type = 'juz' AND juz_id IS NOT NULL AND surah_id IS NULL AND page_start IS NULL AND page_end IS NULL)
    )
);

-- Memorization history table
CREATE TABLE memorization_history (
    id SERIAL PRIMARY KEY,
    memorization_id INTEGER NOT NULL REFERENCES memorization(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id),
    teacher_id INTEGER NOT NULL REFERENCES teachers(user_id),
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    notes TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_active ON students(is_active);
CREATE INDEX idx_memorization_student ON memorization(student_id);
CREATE INDEX idx_memorization_teacher ON memorization(teacher_id);
CREATE INDEX idx_memorization_date ON memorization(test_date);
CREATE INDEX idx_memorization_active ON memorization(is_active);
CREATE INDEX idx_student_parents_student ON student_parents(student_id);
CREATE INDEX idx_student_parents_parent ON student_parents(parent_id);
CREATE INDEX idx_surah_number ON surah(surah_number);
CREATE INDEX idx_juz_number ON juz(juz_number);
