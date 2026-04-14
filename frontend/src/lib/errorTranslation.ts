/**
 * Translate backend error messages to Indonesian
 */
export function translateBackendError(error: string): string {
  const errorMap: Record<string, string> = {
    // Auth errors
    'Invalid email or password': 'Email atau kata sandi salah',

    // Student-Parent relationship errors
    'Student already has a father. Please remove the existing father first.': 'Murid sudah punya ayah. Hapus ayah yang lama terlebih dahulu',
    'Student already has a mother. Please remove the existing mother first.': 'Murid sudah punya ibu. Hapus ibu yang lama terlebih dahulu',
    'This parent is not linked to the student': 'Orang tua ini tidak terhubung dengan murid tersebut',
  }

  return errorMap[error] || error
}
