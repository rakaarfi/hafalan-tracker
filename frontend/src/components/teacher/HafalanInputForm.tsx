import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { QuranCombobox } from '@/components/quran/QuranCombobox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'

const hafalanSchema = z.object({
  unit_type: z.enum(['surah', 'page', 'juz']),
  surah_id: z.string().optional(),
  juz_id: z.string().optional(),
  page_start: z.number({
    required_error: "validation.pageStart",
    invalid_type_error: "validation.pageStart"
  }).min(1, "validation.pageMin").max(604, "validation.pageMax").optional(),
  page_end: z.number({
    required_error: "validation.pageEnd",
    invalid_type_error: "validation.pageEnd"
  }).min(1, "validation.pageMin").max(604, "validation.pageMax").optional(),
  status: z.enum(['fluent', 'good', 'needs_improvement']),
  notes: z.string().max(500).optional(),
  test_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "validation.invalidDate")
})

type HafalanFormData = z.infer<typeof hafalanSchema>

interface HafalanInputFormProps {
  studentId: string
  onSuccess?: () => void
}

export function HafalanInputForm({ studentId, onSuccess }: HafalanInputFormProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { user } = useAuthStore()

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue, reset, trigger } = useForm<HafalanFormData>({
    resolver: zodResolver(hafalanSchema),
    mode: "onTouched", // Validate on blur (when user leaves the field)
    defaultValues: {
      unit_type: 'surah',
      status: 'fluent',
      test_date: new Date().toISOString().split('T')[0]
    }
  })

  const watchedUnitType = watch('unit_type')
  const watchedStatus = watch('status', 'fluent')

  const onSubmit = async (data: HafalanFormData) => {
    try {
      // Build payload according to backend requirements
      const payload: any = {
        student_id: studentId, // Send as string, backend expects string
        teacher_id: user?.id, // Add teacher_id from authStore
        unit_type: data.unit_type,
        status: data.status,
        notes: data.notes || '',
        test_date: data.test_date
      }

      // Add unit-specific fields
      if (data.unit_type === 'surah' && data.surah_id) {
        payload.surah_id = data.surah_id
      } else if (data.unit_type === 'juz' && data.juz_id) {
        payload.juz_id = data.juz_id
      } else if (data.unit_type === 'page') {
        if (data.page_start) payload.page_start = data.page_start
        if (data.page_end) payload.page_end = data.page_end
      }

      await api.post('/memorizations', payload)

      toast({
        title: "Berhasil",
        description: "Data hafalan berhasil disimpan",
      })

      // Reset form
      reset()

      // Call onSuccess callback to refresh data
      if (onSuccess) {
        onSuccess()
      }

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.response?.data?.error || "Gagal menyimpan data",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Validation errors */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 border-2 border-red-200 bg-red-50 text-red-800">
          <p className="font-semibold mb-2">Mohon perbaiki kesalahan berikut:</p>
          <ul className="list-disc list-inside text-sm">
            {Object.entries(errors).map(([field, error]) => {
              // Map field names to user-friendly labels
              const fieldLabels: Record<string, string> = {
                page_start: 'Halaman awal',
                page_end: 'Halaman akhir',
                unit_type: 'Tipe unit',
                surah_id: 'Surah',
                juz_id: 'Juz',
                status: 'Status',
                test_date: 'Tanggal tes',
                notes: 'Catatan'
              }
              const fieldName = fieldLabels[field] || field
              const errorMessage = error.message && error.message.startsWith('validation.')
                ? t(error.message)
                : error.message || 'Unknown error'

              return (
                <li key={field}>
                  <span className="font-medium">{fieldName}:</span> {errorMessage}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Unit Type Selector */}
      <div>
        <Label>{t('teacher.unitType')}</Label>
        <div className="flex gap-4 mt-2">
          {(['surah', 'page', 'juz'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setValue('unit_type', type)
              }}
              className={`px-4 py-2 border-2 min-h-[44px] min-w-[44px] ${
                watchedUnitType === type
                  ? 'border-primary bg-primary text-white'
                  : 'border-border hover:bg-gray-50'
              }`}
            >
              {t(`teacher.${type}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic combobox based on unit type */}
      {watchedUnitType === 'surah' && (
        <div>
          <Label>{t('teacher.surah')}</Label>
          <div className="mt-2">
            <QuranCombobox
              mode="surah"
              value={watch('surah_id') || ''}
              onChange={(value) => setValue('surah_id', value)}
            />
          </div>
        </div>
      )}

      {watchedUnitType === 'juz' && (
        <div>
          <Label>{t('teacher.juz')}</Label>
          <div className="mt-2">
            <QuranCombobox
              mode="juz"
              value={watch('juz_id') || ''}
              onChange={(value) => setValue('juz_id', value)}
            />
          </div>
        </div>
      )}

      {watchedUnitType === 'page' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="page_start">Halaman Awal</Label>
            <input
              id="page_start"
              type="number"
              min={1}
              max={604}
              {...register('page_start', {
                valueAsNumber: true,
                onBlur: () => trigger('page_start')
              })}
              className="flex h-9 w-full rounded-none border-2 border-input bg-transparent px-3 py-1 text-base transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[44px]"
            />
            {errors.page_start && (
              <p className="text-sm text-red-600">
                {errors.page_start.message?.startsWith('validation.')
                  ? t(errors.page_start.message)
                  : errors.page_start.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="page_end">Halaman Akhir</Label>
            <input
              id="page_end"
              type="number"
              min={1}
              max={604}
              {...register('page_end', {
                valueAsNumber: true,
                onBlur: () => trigger('page_end')
              })}
              className="flex h-9 w-full rounded-none border-2 border-input bg-transparent px-3 py-1 text-base transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[44px]"
            />
            {errors.page_end && (
              <p className="text-sm text-red-600">
                {errors.page_end.message?.startsWith('validation.')
                  ? t(errors.page_end.message)
                  : errors.page_end.message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Status Selector */}
      <div>
        <Label>{t('teacher.statusLabel')}</Label>
        <div className="flex gap-4 mt-2">
          {(['fluent', 'good', 'needs_improvement'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setValue('status', status)}
              className={`px-4 py-2 border-2 min-h-[44px] min-w-[44px] ${
                watchedStatus === status
                  ? status === 'fluent'
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : status === 'good'
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      : 'bg-red-100 text-red-800 border-red-200'
                  : 'border-border hover:bg-gray-50'
              }`}
            >
              {status === 'fluent' && '✅ '}
              {status === 'good' && '👍 '}
              {status === 'needs_improvement' && '⚠️ '}
              {t(`teacher.status.${status}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">{t('teacher.notes')} (Opsional)</Label>
        <Textarea
          id="notes"
          placeholder="Catatan tambahan..."
          rows={3}
          maxLength={500}
          {...register('notes')}
          className="border-2 mt-2"
        />
        <p className="text-xs text-gray-500 mt-1">
          {watch('notes')?.length || 0} / 500 karakter
        </p>
      </div>

      {/* Test Date */}
      <div>
        <Label htmlFor="test_date">{t('teacher.testDate')}</Label>
        <input
          id="test_date"
          type="date"
          {...register('test_date')}
          className="flex h-9 w-full rounded-none border-2 border-input bg-transparent px-3 py-1 text-base transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[44px] mt-2"
        />
        {errors.test_date && (
          <p className="text-sm text-red-600">
            {errors.test_date.message?.startsWith('validation.')
              ? t(errors.test_date.message)
              : errors.test_date.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full min-h-[44px]"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Menyimpan...' : t('teacher.submit')}
      </Button>
    </form>
  )
}
