package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq" // PostgreSQL driver
	"golang.org/x/crypto/bcrypt"
)

const (
	dbHost   = "localhost"
	dbPort   = 5432
	dbUser   = "postgres"
	dbPass   = "qwertyuiop"
	dbName   = "hafalan_tracker"
	sslMode  = "disable"
)

func main() {
	// Connect to database
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		dbHost, dbPort, dbUser, dbPass, dbName, sslMode)

	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatal("Error opening database:", err)
	}
	defer db.Close()

	// Test connection
	err = db.Ping()
	if err != nil {
		log.Fatal("Error connecting to database:", err)
	}

	log.Println("Connected to database!")

	// Start seeding data
	log.Println("Seeding data...")

	// Hash passwords
	adminPassword := hashPassword("admin123")
	userPassword := hashPassword("password123")

	// Begin transaction
	tx, err := db.Begin()
	if err != nil {
		log.Fatal("Error beginning transaction:", err)
	}

	// Rollback on error
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// Insert Roles
	log.Println("Inserting roles...")
	_, err = tx.Exec(`
		INSERT INTO roles (id, name, description) VALUES
		(1, 'admin', 'Full system access'),
		(2, 'teacher', 'Can input and view student memorization'),
		(3, 'parent', 'Can view their children''s progress')
		ON CONFLICT (id) DO NOTHING
	`)
	if err != nil {
		log.Fatal("Error inserting roles:", err)
	}

	// Insert Users
	log.Println("Inserting users...")
	_, err = tx.Exec(`
		INSERT INTO users (id, email, password_hash, role_id) VALUES
		(1, 'admin@test.com', $1, 1),
		(2, 'teacher@test.com', $2, 2),
		(3, 'budi.santoso@sekolah.sch.id', $2, 2),
		(4, 'siti.rahayu@sekolah.sch.id', $2, 2),
		(5, 'parent@test.com', $2, 3),
		(6, 'bapak.ahmad@test.com', $2, 3),
		(7, 'ibu.siti@test.com', $2, 3),
		(8, 'bapak.hasan@test.com', $2, 3),
		(9, 'ibu.fatimah@test.com', $2, 3)
		ON CONFLICT (id) DO NOTHING
	`, adminPassword, userPassword)
	if err != nil {
		log.Fatal("Error inserting users:", err)
	}

	// Insert Teachers
	log.Println("Inserting teachers...")
	_, err = tx.Exec(`
		INSERT INTO teachers (user_id, full_name, phone) VALUES
		(2, 'Guru Tester', '081234567890'),
		(3, 'Budi Santoso, S.Pd.I', '081234567891'),
		(4, 'Siti Rahayu, S.Pd', '081234567892')
		ON CONFLICT (user_id) DO NOTHING
	`)
	if err != nil {
		log.Fatal("Error inserting teachers:", err)
	}

	// Insert Parents
	log.Println("Inserting parents...")
	_, err = tx.Exec(`
		INSERT INTO parents (user_id, full_name, phone) VALUES
		(5, 'Orang Tua Tester', '081234567893'),
		(6, 'Bapak Ahmad', '081234567894'),
		(7, 'Ibu Siti', '081234567895'),
		(8, 'Bapak Hasan Basri', '081234567896'),
		(9, 'Ibu Fatimah Az-Zahra', '081234567897')
		ON CONFLICT (user_id) DO NOTHING
	`)
	if err != nil {
		log.Fatal("Error inserting parents:", err)
	}

	// Insert Classes
	log.Println("Inserting classes...")
	_, err = tx.Exec(`
		INSERT INTO classes (id, name, grade_level, homeroom_teacher_id) VALUES
		(1, 'Kelas 1A', 'Grade 1', 4),
		(2, 'Kelas 1B', 'Grade 1', 4),
		(3, 'Kelas 6A', 'Grade 6', 3),
		(4, 'Kelas 6B', 'Grade 6', 3)
		ON CONFLICT (id) DO NOTHING
	`)
	if err != nil {
		log.Fatal("Error inserting classes:", err)
	}

	// Insert Students
	log.Println("Inserting students...")
	_, err = tx.Exec(`
		INSERT INTO students (id, name, class_id, enrollment_year, semester) VALUES
		(1, 'Ahmad Fauzi', 3, 2025, 1),
		(2, 'Siti Aminah', 3, 2025, 1),
		(3, 'Muhammad Rizki', 4, 2025, 1),
		(4, 'Fatimah Zahra', 3, 2025, 1),
		(5, 'Abdullah Rahman', 4, 2025, 1),
		(6, 'Aisyah Humaira', 1, 2025, 1),
		(7, 'Zainal Abidin', 1, 2025, 1),
		(8, 'Khadijah Siti', 2, 2025, 1),
		(9, 'Umar Faruq', 2, 2025, 1),
		(10, 'Ali bin Abi Thalib', 3, 2025, 1)
		ON CONFLICT (id) DO NOTHING
	`)
	if err != nil {
		log.Fatal("Error inserting students:", err)
	}

	// Insert Student-Parent Relationships
	log.Println("Inserting student-parent relationships...")
	_, err = tx.Exec(`
		INSERT INTO student_parents (student_id, parent_id, relationship_type, is_primary_contact) VALUES
		(1, 6, 'father', true),
		(1, 7, 'mother', false),
		(2, 8, 'father', true),
		(2, 9, 'mother', false),
		(3, 6, 'father', true),
		(3, 7, 'mother', false),
		(4, 5, 'father', true),
		(5, 8, 'father', true),
		(5, 9, 'mother', false),
		(6, 6, 'father', true),
		(6, 7, 'mother', false),
		(7, 5, 'father', true),
		(8, 5, 'mother', true),
		(9, 8, 'father', true),
		(9, 9, 'mother', false),
		(10, 6, 'father', true),
		(10, 7, 'mother', false)
		ON CONFLICT (student_id, parent_id) DO NOTHING
	`)
	if err != nil {
		log.Fatal("Error inserting student-parent relationships:", err)
	}

	// Insert Quran Surahs and Juz for hafalan tracking
	log.Println("Inserting Quran data...")
	_, err = tx.Exec(`
		INSERT INTO quran_surahs (id, number, name, name_indonesian, number_of_ayahs) VALUES
		(1, 1, 'Al-Fatihah', 'Al-Fatihah', 7),
		(2, 2, 'Al-Baqarah', 'Al-Baqarah', 286),
		(3, 3, 'Ali Imran', 'Ali Imran', 200),
		(4, 36, 'Ya-Sin', 'Ya-Sin', 83),
		(5, 67, 'Al-Mulk', 'Al-Mulk', 30),
		(6, 78, 'An-Naba', 'An-Naba', 40),
		(7, 114, 'An-Nas', 'An-Nas', 6)
		ON CONFLICT (id) DO NOTHING
	`)
	if err != nil {
		log.Fatal("Error inserting Quran surahs:", err)
	}

	_, err = tx.Exec(`
		INSERT INTO quran_juz (id, number, description) VALUES
		(1, 1, 'Juz 1 - Al-Fatihah to Al-Baqarah:141'),
		(2, 30, 'Juz 30 - An-Naba to An-Nas')
		ON CONFLICT (id) DO NOTHING
	`)
	if err != nil {
		log.Fatal("Error inserting Quran juz:", err)
	}

	// Insert Hafalan Memorization Records
	log.Println("Inserting hafalan memorization records...")
	_, err = tx.Exec(`
		INSERT INTO memorization (student_id, teacher_id, surah_id, juz_id, unit_type,
			page_start, page_end, status, notes, test_date)
		VALUES
		-- Student 1 (Ahmad Fauzi) - Hafalan Juz 30
		(1, 3, 6, 2, 'juz', NULL, NULL, 'completed', 'Lancar dan mutqin', '2025-01-15'),
		(1, 3, 7, NULL, 'surah', NULL, NULL, 'in_progress', 'Sedang menghafal', '2025-02-10'),

		-- Student 2 (Siti Aminah) - Hafalan Surah Pendek
		(2, 3, 1, NULL, 'surah', NULL, NULL, 'completed', 'Sangat lancar', '2025-02-01'),
		(2, 3, 4, NULL, 'surah', NULL, NULL, 'in_progress', 'Sedang tahap murajaah', '2025-02-15'),

		-- Student 3 (Muhammad Rizki) - Hafalan Juz 1
		(3, 4, NULL, 1, 'juz', NULL, NULL, 'in_progress', 'Sudah sampai Al-Baqarah:100', '2025-02-20'),

		-- Student 4 (Fatimah Zahra) - Hafalan Surah Al-Mulk
		(4, 3, 5, NULL, 'surah', NULL, NULL, 'completed', 'Hafal dengan baik', '2025-01-20'),

		-- Student 5 (Abdullah Rahman) - Hafalan Juz 30
		(5, 4, 6, 2, 'juz', NULL, NULL, 'in_progress', 'Sedang menghafal An-Naba', '2025-02-05'),
		(5, 4, 7, NULL, 'surah', NULL, NULL, 'completed', 'Sudah lancar', '2025-01-25'),

		-- Student 6 (Aisyah Humaira) - Hafalan Al-Fatihah
		(6, 4, 1, NULL, 'surah', NULL, NULL, 'in_progress', 'Sedang menghafal', '2025-02-25'),

		-- Student 7 (Zainal Abidin) - Hafalan Al-Fatihah
		(7, 3, 1, NULL, 'surah', NULL, NULL, 'completed', 'Lancar sekali', '2025-02-01'),

		-- Student 8 (Khadijah Siti) - Hafalan Ya-Sin
		(8, 4, 4, NULL, 'surah', NULL, NULL, 'in_progress', 'Sedang murajaah', '2025-02-18'),

		-- Student 9 (Umar Faruq) - Hafalan Al-Mulk
		(9, 3, 5, NULL, 'surah', NULL, NULL, 'completed', 'Hafal dengan fasih', '2025-01-30'),

		-- Student 10 (Ali bin Abi Thalib) - Hafalan Juz 30
		(10, 4, 6, 2, 'juz', NULL, NULL, 'in_progress', 'Sudah 50%', '2025-02-12')
		ON CONFLICT DO NOTHING
	`)
	if err != nil {
		log.Fatal("Error inserting memorization records:", err)
	}

	// Commit transaction
	err = tx.Commit()
	if err != nil {
		log.Fatal("Error committing transaction:", err)
	}

	log.Println("✅ Data seeded successfully!")
	fmt.Println("\n📊 Summary of data created:")
	fmt.Println("  - Roles: 3 (admin, teacher, parent)")
	fmt.Println("  - Users: 9 (1 admin, 3 teachers, 5 parents)")
	fmt.Println("  - Classes: 4 (Kelas 1A, 1B, 6A, 6B)")
	fmt.Println("  - Students: 10")
	fmt.Println("  - Student-Parent Relationships: 16")
	fmt.Println("  - Quran Surahs: 7")
	fmt.Println("  - Quran Juz: 2")
	fmt.Println("  - Hafalan Records: 12")
	fmt.Println("\n🔐 Test Accounts:")
	fmt.Println("  Admin:   admin@test.com / admin123")
	fmt.Println("  Teacher: teacher@test.com / password123")
	fmt.Println("  Parent:  parent@test.com / password123")
	fmt.Println("\n👨‍👩‍👧‍👦 Parent-Student Mapping:")
	fmt.Println("  Bapak Ahmad & Ibu Siti → Ahmad Fauzi, Muhammad Rizki")
	fmt.Println("  Bapak Hasan Basri → Siti Aminah")
	fmt.Println("  Ibu Fatimah → Abdullah Rahman")
	fmt.Println("  Orang Tua Tester → Fatimah Zahra, Khadijah Siti")
}

func hashPassword(password string) string {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal("Error hashing password:", err)
	}
	return string(hash)
}
