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

// All 30 Juz
export const juzOptions: JuzOption[] = Array.from({ length: 30 }, (_, i) => ({
  value: String(i + 1),
  label: `Juz ${i + 1}`,
  number: i + 1
}))

// All 114 Surahs with Arabic names
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
  { value: "11", label: "Hud", number: 11, juz: 11, arabic: "هود" },
  { value: "12", label: "Yusuf", number: 12, juz: 12, arabic: "يوسف" },
  { value: "13", label: "Ar-Ra'd", number: 13, juz: 13, arabic: "الرعد" },
  { value: "14", label: "Ibrahim", number: 14, juz: 13, arabic: "إبراهيم" },
  { value: "15", label: "Al-Hijr", number: 15, juz: 14, arabic: "الحجر" },
  { value: "16", label: "An-Nahl", number: 16, juz: 14, arabic: "النحل" },
  { value: "17", label: "Al-Isra'", number: 17, juz: 15, arabic: "الإسراء" },
  { value: "18", label: "Al-Kahf", number: 18, juz: 15, arabic: "الكهف" },
  { value: "19", label: "Maryam", number: 19, juz: 16, arabic: "مريم" },
  { value: "20", label: "Ta-Ha", number: 20, juz: 16, arabic: "طه" },
  { value: "21", label: "Al-Anbiya'", number: 21, juz: 17, arabic: "الأنبياء" },
  { value: "22", label: "Al-Hajj", number: 22, juz: 17, arabic: "الحج" },
  { value: "23", label: "Al-Mu'minun", number: 23, juz: 18, arabic: "المؤمنون" },
  { value: "24", label: "An-Nur", number: 24, juz: 18, arabic: "النور" },
  { value: "25", label: "Al-Furqan", number: 25, juz: 19, arabic: "الفرقان" },
  { value: "26", label: "Ash-Shu'ara'", number: 26, juz: 19, arabic: "الشعراء" },
  { value: "27", label: "An-Naml", number: 27, juz: 19, arabic: "النمل" },
  { value: "28", label: "Al-Qasas", number: 28, juz: 20, arabic: "القصص" },
  { value: "29", label: "Al-Ankabut", number: 29, juz: 20, arabic: "العنكبوت" },
  { value: "30", label: "Ar-Rum", number: 30, juz: 21, arabic: "الروم" },
  { value: "31", label: "Luqman", number: 31, juz: 21, arabic: "لقمان" },
  { value: "32", label: "As-Sajdah", number: 32, juz: 21, arabic: "السجدة" },
  { value: "33", label: "Al-Ahzab", number: 33, juz: 22, arabic: "الأحزاب" },
  { value: "34", label: "Saba'", number: 34, juz: 22, arabic: "سبأ" },
  { value: "35", label: "Fatir", number: 35, juz: 22, arabic: "فاطر" },
  { value: "36", label: "Ya-Sin", number: 36, juz: 22, arabic: "يس" },
  { value: "37", label: "As-Saffat", number: 37, juz: 23, arabic: "الصافات" },
  { value: "38", label: "Sad", number: 38, juz: 23, arabic: "ص" },
  { value: "39", label: "Az-Zumar", number: 39, juz: 23, arabic: "الزمر" },
  { value: "40", label: "Ghafir", number: 40, juz: 24, arabic: "غافر" },
  { value: "41", label: "Fussilat", number: 41, juz: 24, arabic: "فصلت" },
  { value: "42", label: "Ash-Shuraa", number: 42, juz: 25, arabic: "الشورى" },
  { value: "43", label: "Az-Zukhruf", number: 43, juz: 25, arabic: "الزخرف" },
  { value: "44", label: "Ad-Dukhan", number: 44, juz: 25, arabic: "الدخان" },
  { value: "45", label: "Al-Jathiyah", number: 45, juz: 25, arabic: "الجاثية" },
  { value: "46", label: "Al-Ahqaf", number: 46, juz: 26, arabic: "الأحقاف" },
  { value: "47", label: "Muhammad", number: 47, juz: 26, arabic: "محمد" },
  { value: "48", label: "Al-Fath", number: 48, juz: 26, arabic: "الفتح" },
  { value: "49", label: "Al-Hujurat", number: 49, juz: 26, arabic: "الحجرات" },
  { value: "50", label: "Qaf", number: 50, juz: 26, arabic: "ق" },
  { value: "51", label: "Adh-Dhariyat", number: 51, juz: 26, arabic: "الذاريات" },
  { value: "52", label: "At-Tur", number: 52, juz: 27, arabic: "الطور" },
  { value: "53", label: "An-Najm", number: 53, juz: 27, arabic: "النجم" },
  { value: "54", label: "Al-Qamar", number: 54, juz: 27, arabic: "القمر" },
  { value: "55", label: "Ar-Rahman", number: 55, juz: 27, arabic: "الرحمن" },
  { value: "56", label: "Al-Waqi'ah", number: 56, juz: 27, arabic: "الواقعة" },
  { value: "57", label: "Al-Hadid", number: 57, juz: 27, arabic: "الحديد" },
  { value: "58", label: "Al-Mujadila", number: 58, juz: 28, arabic: "المجادلة" },
  { value: "59", label: "Al-Hashr", number: 59, juz: 28, arabic: "الحشر" },
  { value: "60", label: "Al-Mumtahanah", number: 60, juz: 28, arabic: "الممتحنة" },
  { value: "61", label: "As-Saff", number: 61, juz: 28, arabic: "الصف" },
  { value: "62", label: "Al-Jumu'ah", number: 62, juz: 28, arabic: "الجمعة" },
  { value: "63", label: "Al-Munafiqun", number: 63, juz: 28, arabic: "المنافقون" },
  { value: "64", label: "At-Taghabun", number: 64, juz: 28, arabic: "التغابن" },
  { value: "65", label: "At-Talaq", number: 65, juz: 28, arabic: "الطلاق" },
  { value: "66", label: "At-Tahrim", number: 66, juz: 28, arabic: "التحريم" },
  { value: "67", label: "Al-Mulk", number: 67, juz: 29, arabic: "الملك" },
  { value: "68", label: "Al-Qalam", number: 68, juz: 29, arabic: "القلم" },
  { value: "69", label: "Al-Haqqah", number: 69, juz: 29, arabic: "الحاقة" },
  { value: "70", label: "Al-Ma'arij", number: 70, juz: 29, arabic: "المعارج" },
  { value: "71", label: "Nuh", number: 71, juz: 29, arabic: "نوح" },
  { value: "72", label: "Al-Jinn", number: 72, juz: 29, arabic: "الجن" },
  { value: "73", label: "Al-Muzzammil", number: 73, juz: 29, arabic: "المزمل" },
  { value: "74", label: "Al-Muddaththir", number: 74, juz: 29, arabic: "المدثر" },
  { value: "75", label: "Al-Qiyamah", number: 75, juz: 29, arabic: "القيامة" },
  { value: "76", label: "Al-Insan", number: 76, juz: 29, arabic: "الإنسان" },
  { value: "77", label: "Al-Mursalat", number: 77, juz: 30, arabic: "المرسلات" },
  { value: "78", label: "An-Naba'", number: 78, juz: 30, arabic: "النبأ" },
  { value: "79", label: "An-Nazi'at", number: 79, juz: 30, arabic: "النازعات" },
  { value: "80", label: "Abasa", number: 80, juz: 30, arabic: "عبس" },
  { value: "81", label: "At-Takwir", number: 81, juz: 30, arabic: "التكوير" },
  { value: "82", label: "Al-Infitar", number: 82, juz: 30, arabic: "الانفطار" },
  { value: "83", label: "Al-Mutaffifin", number: 83, juz: 30, arabic: "المطففين" },
  { value: "84", label: "Al-Inshiqaq", number: 84, juz: 30, arabic: "الانشقاق" },
  { value: "85", label: "Al-Buruj", number: 85, juz: 30, arabic: "البروج" },
  { value: "86", label: "At-Tariq", number: 86, juz: 30, arabic: "الطارق" },
  { value: "87", label: "Al-A'la", number: 87, juz: 30, arabic: "الأعلى" },
  { value: "88", label: "Al-Ghashiyah", number: 88, juz: 30, arabic: "الغاشية" },
  { value: "89", label: "Al-Fajr", number: 89, juz: 30, arabic: "الفجر" },
  { value: "90", label: "Al-Balad", number: 90, juz: 30, arabic: "البلد" },
  { value: "91", label: "Ash-Shams", number: 91, juz: 30, arabic: "الشمس" },
  { value: "92", label: "Al-Layl", number: 92, juz: 30, arabic: "الليل" },
  { value: "93", label: "Ad-Duha", number: 93, juz: 30, arabic: "الضحى" },
  { value: "94", label: "Ash-Sharh", number: 94, juz: 30, arabic: "الشرح" },
  { value: "95", label: "At-Tin", number: 95, juz: 30, arabic: "التين" },
  { value: "96", label: "Al-'Alaq", number: 96, juz: 30, arabic: "العلق" },
  { value: "97", label: "Al-Qadr", number: 97, juz: 30, arabic: "القدر" },
  { value: "98", label: "Al-Bayyinah", number: 98, juz: 30, arabic: "البينة" },
  { value: "99", label: "Az-Zalzalah", number: 99, juz: 30, arabic: "الزلزلة" },
  { value: "100", label: "Al-'Adiyat", number: 100, juz: 30, arabic: "العاديات" },
  { value: "101", label: "Al-Qari'ah", number: 101, juz: 30, arabic: "القارعة" },
  { value: "102", label: "At-Takathur", number: 102, juz: 30, arabic: "التكاثر" },
  { value: "103", label: "Al-'Asr", number: 103, juz: 30, arabic: "العصر" },
  { value: "104", label: "Al-Humazah", number: 104, juz: 30, arabic: "الهمزة" },
  { value: "105", label: "Al-Fil", number: 105, juz: 30, arabic: "الفيل" },
  { value: "106", label: "Quraysh", number: 106, juz: 30, arabic: "قريش" },
  { value: "107", label: "Al-Ma'un", number: 107, juz: 30, arabic: "الماعون" },
  { value: "108", label: "Al-Kawthar", number: 108, juz: 30, arabic: "الكوثر" },
  { value: "109", label: "Al-Kafirun", number: 109, juz: 30, arabic: "الكافرون" },
  { value: "110", label: "An-Nasr", number: 110, juz: 30, arabic: "النصر" },
  { value: "111", label: "Al-Masad", number: 111, juz: 30, arabic: "المسد" },
  { value: "112", label: "Al-Ikhlas", number: 112, juz: 30, arabic: "الإخلاص" },
  { value: "113", label: "Al-Falaq", number: 113, juz: 30, arabic: "الفلق" },
  { value: "114", label: "An-Nas", number: 114, juz: 30, arabic: "الناس" },
]

export async function loadQuranData() {
  // Will fetch from API
  const response = await fetch('/api/v1/surah')
  const data = await response.json()
  return data
}
