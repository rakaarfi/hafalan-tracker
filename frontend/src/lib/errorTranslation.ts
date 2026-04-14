/**
 * Translate backend error messages to Indonesian
 */
export function translateBackendError(error: string): string {
  const errorMap: Record<string, string> = {
    // Auth errors
    'Invalid email or password': 'Email atau kata sandi salah',
    'Only admin can access user list': 'Hanya admin yang dapat mengakses daftar pengguna',
    'Only teachers can create memorization records': 'Hanya guru yang dapat membuat catatan hafalan',
    'Only teachers can update memorization records': 'Hanya guru yang dapat mengupdate catatan hafalan',
    'You are not authorized to input memorization for this student. You must be either the homeroom teacher or an active Quran teacher for this student\'s class.': 'Anda tidak berwenang menginput hafalan untuk murid ini. Anda harus menjadi wali kelas atau guru Quran aktif untuk kelas murid ini.',
    'You are not authorized to update this memorization record': 'Anda tidak berwenang mengupdate catatan hafalan ini',
    'You don\'t have permission to view this student\'s memorizations': 'Anda tidak memiliki izin untuk melihat hafalan murid ini',
    'You don\'t have permission to view this student\'s progress': 'Anda tidak memiliki izin untuk melihat progress murid ini',

    // Not Found (404)
    'User not found': 'Pengguna tidak ditemukan',
    'Student not found': 'Murid tidak ditemukan',
    'Teacher not found': 'Guru tidak ditemukan',
    'Parent not found': 'Orang tua tidak ditemukan',
    'Class not found': 'Kelas tidak ditemukan',
    'Memorization not found': 'Hafalan tidak ditemukan',
    'Memorization record not found': 'Catatan hafalan tidak ditemukan',

    // Failed to [Action]
    'Failed to fetch users': 'Gagal mengambil data pengguna',
    'Failed to fetch user data': 'Gagal mengambil data pengguna',
    'Failed to retrieve children\'s memorizations': 'Gagal mengambil data hafalan anak',
    'Failed to retrieve children progress': 'Gagal mengambil data progress anak',
    'Failed to retrieve memorization': 'Gagal mengambil data hafalan',
    'Failed to retrieve memorizations': 'Gagal mengambil data hafalan',
    'Failed to retrieve memorization statistics': 'Gagal mengambil statistik hafalan',
    'Failed to retrieve recent test statistics': 'Gagal mengambil statistik tes terbaru',
    'Failed to retrieve student': 'Gagal mengambil data murid',
    'Failed to retrieve student information': 'Gagal mengambil informasi murid',
    'Failed to retrieve student statistics': 'Gagal mengambil statistik murid',
    'Failed to retrieve students': 'Gagal mengambil data murid',
    'Failed to retrieve teacher': 'Gagal mengambil data guru',
    'Failed to retrieve teachers': 'Gagal mengambil data guru',
    'Failed to retrieve teacher assignments': 'Gagal mengambil data penugasan guru',
    'Failed to retrieve teacher statistics': 'Gagal mengambil statistik guru',
    'Failed to retrieve parent': 'Gagal mengambil data orang tua',
    'Failed to retrieve parents': 'Gagal mengambil data orang tua',
    'Failed to retrieve parent statistics': 'Gagal mengambil statistik orang tua',
    'Failed to retrieve class': 'Gagal mengambil data kelas',
    'Failed to retrieve classes': 'Gagal mengambil data kelas',
    'Failed to retrieve Quran teacher assignments': 'Gagal mengambil data penugasan guru Quran',
    'Failed to retrieve settings': 'Gagal mengambil pengaturan',
    'Failed to verify teacher assignment': 'Gagal memverifikasi penugasan guru',
    'Failed to verify teacher permissions': 'Gagal memverifikasi izin guru',
    'Failed to assign child to parent': 'Gagal menautkan anak ke orang tua',
    'Failed to remove parent': 'Gagal menghapus orang tua',
    'Failed to restore parent relationships': 'Gagal memulihkan hubungan orang tua',
    'Failed to assign Quran teacher': 'Gagal menugaskan guru Quran',
    'Failed to end assignment': 'Gagal mengakhiri penugasan',
    'Failed to update assignment': 'Gagal mengupdate penugasan',
    'Failed to read request': 'Gagal membaca permintaan',

    // Invalid Input (400)
    'Invalid request format': 'Format permintaan tidak valid',
    'Invalid user ID': 'ID pengguna tidak valid',
    'Invalid teacher ID': 'ID guru tidak valid',
    'Invalid class ID': 'ID kelas tidak valid',
    'Invalid assignment ID': 'ID penugasan tidak valid',
    'Invalid student class ID': 'ID kelas murid tidak valid',
    'Invalid JSON format': 'Format JSON tidak valid',
    'Invalid role for memorization view': 'Peran tidak valid untuk melihat hafalan',
    'Student ID is required': 'ID murid wajib diisi',

    // Student-Parent relationship errors
    'Student already has a father. Please remove the existing father first.': 'Murid sudah punya ayah. Hapus ayah yang lama terlebih dahulu',
    'Student already has a mother. Please remove the existing mother first.': 'Murid sudah punya ibu. Hapus ibu yang lama terlebih dahulu',
    'This parent is not linked to the student': 'Orang tua ini tidak terhubung dengan murid tersebut',

    // Business Logic Errors
    'This student is no longer in your assigned classes': 'Murid ini tidak lagi di kelas yang ditugaskan kepada Anda',
  }

  return errorMap[error] || error
}
