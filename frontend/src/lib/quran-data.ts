export interface SurahOption {
  value: string
  label: string
  number: number
  juz: number
  arabic: string
}

export interface JuzOption {
  value: string
  label: string
  number: number
}

// Sample data - will be replaced with API call
export const juzOptions: JuzOption[] = Array.from({ length: 30 }, (_, i) => ({
  value: String(i + 1),
  label: `Juz ${i + 1}`,
  number: i + 1
}))

// Sample surah data (first 10 surahs for demo)
export const surahOptions: SurahOption[] = [
  { value: "1", label: "Al-Fatihah", number: 1, juz: 1, arabic: "الفاتحة" },
  { value: "2", label: "Al-Baqarah", number: 2, juz: 1, arabic: "البقرة" },
  { value: "3", label: "Ali 'Imran", number: 3, juz: 3, arabic: "آل عمران" },
  { value: "4", label: "An-Nisa'", number: 4, juz: 4, arabic: "النساء" },
  { value: "5", label: "Al-Ma'idah", number: 5, juz: 6, arabic: "المائدة" },
  { value: "6", label: "Al-An'am", number: 6, juz: 7, arabic: "الأنعام" },
  { value: "7", label: "Al-A'raf", number: 7, juz: 8, arabic: "الأعراف" },
  { value: "8", label: "Al-Anfal", number: 8, juz: 9, arabic: "الأنفال" },
  { value: "9", label: "At-Tawbah", number: 9, juz: 10, arabic: "التوبة" },
  { value: "10", label: "Yunus", number: 10, juz: 11, arabic: "يونس" },
]

export async function loadQuranData() {
  // Will fetch from API
  const response = await fetch('/api/v1/surah')
  const data = await response.json()
  return data
}
