package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"strconv"

	_ "github.com/lib/pq"
)

type Surah struct {
	Index     string    `json:"index"`
	Title     string    `json:"title"`
	TitleAr   string    `json:"titleAr"`
	Place     string    `json:"place"`
	Type      string    `json:"type"`
	Count     int       `json:"count"`
	Pages     string    `json:"pages"`
	Juz       []JuzRef  `json:"juz"`
}

type JuzRef struct {
	Index string       `json:"index"`
	Verse VerseRange   `json:"verse"`
}

type VerseRange struct {
	Start string `json:"index"`
	End   string `json:"name"`
}

type Juz struct {
	Index string     `json:"index"`
	Start SurahRef   `json:"start"`
	End   SurahRef   `json:"end"`
}

type SurahRef struct {
	Index string `json:"index"`
	Verse string `json:"verse"`
	Name  string `json:"name"`
}

func main() {
	// Read database URL from environment
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://hafalan_user:hafalan_pass@localhost:5432/hafalan_tracker?sslmode=disable"
	}

	// Connect to database
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Read surah JSON - adjust path for running from different directories
	surahDataPath := "shared/data/surah.json"
	if _, err := os.Stat(surahDataPath); os.IsNotExist(err) {
		surahDataPath = "../shared/data/surah.json"
	}

	surahData, err := ioutil.ReadFile(surahDataPath)
	if err != nil {
		log.Fatal(err)
	}

	var surahs []Surah
	if err := json.Unmarshal(surahData, &surahs); err != nil {
		log.Fatal(err)
	}

	// Insert surahs
	for _, surah := range surahs {
		surahNum, _ := strconv.Atoi(surah.Index)
		pageNum, _ := strconv.Atoi(surah.Pages)
		juzNum := 0
		if len(surah.Juz) > 0 {
			juzNum, _ = strconv.Atoi(surah.Juz[0].Index)
		}

		_, err := db.Exec(`
			INSERT INTO surah (surah_number, name_latin, name_arabic, place, type, ayah_count, start_page, juz_number)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			ON CONFLICT (surah_number) DO NOTHING
		`, surahNum, surah.Title, surah.TitleAr, surah.Place, surah.Type, surah.Count, pageNum, juzNum)
		if err != nil {
			log.Printf("Error inserting surah %s: %v", surah.Title, err)
		}
	}

	fmt.Println("Imported", len(surahs), "surahs")

	// Read juz JSON - adjust path for running from different directories
	juzDataPath := "shared/data/juz.json"
	if _, err := os.Stat(juzDataPath); os.IsNotExist(err) {
		juzDataPath = "../shared/data/juz.json"
	}

	juzData, err := ioutil.ReadFile(juzDataPath)
	if err != nil {
		log.Fatal(err)
	}

	var juzs []Juz
	if err := json.Unmarshal(juzData, &juzs); err != nil {
		log.Fatal(err)
	}

	// Insert juzs
	for _, juz := range juzs {
		startSurahID, _ := strconv.Atoi(juz.Start.Index)
		endSurahID, _ := strconv.Atoi(juz.End.Index)

		_, err := db.Exec(`
			INSERT INTO juz (juz_number, start_surah_id, start_ayah, end_surah_id, end_ayah)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (juz_number) DO NOTHING
		`, juz.Index, startSurahID, juz.Start.Verse, endSurahID, juz.End.Verse)
		if err != nil {
			log.Printf("Error inserting juz %s: %v", juz.Index, err)
		}
	}

	fmt.Println("Imported", len(juzs), "juzs")
	fmt.Println("Quran data imported successfully!")
}
