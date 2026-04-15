import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'
import { teachersApi, classesApi } from '@/lib/api'
import { translateBackendError } from '@/lib/errorTranslation'
import { useAuthStore } from '@/stores/authStore'

interface Teacher {
  UserID: string
  FullName: string
  Phone: string
  Email: string
  CreatedAt: string
  HomeroomClasses?: string[]
  QuranTeacherClasses?: string[]
}

interface Class {
  id: string
  name: string
}

export function TeacherListPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteTeacher, setPendingDeleteTeacher] = useState<Teacher | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [classes, setClasses] = useState<Class[]>([])
  const [teacherType, setTeacherType] = useState('')
  const [selectedClassId, setSelectedClassId] = useState('')
  const [loadingClasses, setLoadingClasses] = useState(true)

  const { toast } = useToast()
  const { t } = useTranslation()
  const { isAuthenticated } = useAuthStore()
  const hasFetchedInitially = useRef(false)

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true)
      const data = await classesApi.getAll()
      setClasses(data || [])
    } catch (err: any) {
      setClasses([])
    } finally {
      setLoadingClasses(false)
    }
  }

  const fetchTeachers = async (searchQuery?: string, type?: string, classId?: string, pageNumber = 1) => {
    try {
      setLoading(true)
      setError(null)
      const response = await teachersApi.getAll(searchQuery, type, classId, pageNumber, 10)
      setTeachers(response.data || [])
      setTotalPages(response.total_pages || 1)
      setTotal(response.total || 0)
      setPage(response.page || 1)
    } catch (err: any) {
      setError('Gagal memuat data guru')
      setTeachers([])
    } finally {
      setLoading(false)
    }
  }

  // Single useEffect for both initial fetch and debounced search
  useEffect(() => {
    if (!isAuthenticated) return

    // Initial fetch when auth completes
    if (!hasFetchedInitially.current) {
      fetchTeachers()
      fetchClasses()
      hasFetchedInitially.current = true
      return
    }

    // Debounced search for subsequent changes
    const timeoutId = setTimeout(() => {
      if (search.length >= 0) {
        fetchTeachers(search || undefined, teacherType || undefined, selectedClassId || undefined, 1)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [search, teacherType, selectedClassId, isAuthenticated])

  const handleDelete = (teacher: Teacher) => {
    setPendingDeleteTeacher(teacher)
    setDeleteDialogOpen(true)
  }

  const executeDelete = async () => {
    if (!pendingDeleteTeacher) return

    try {
      setDeleting(pendingDeleteTeacher.UserID)
      await teachersApi.delete(pendingDeleteTeacher.UserID)
      setTeachers(teachers.filter(t => t.UserID !== pendingDeleteTeacher.UserID))
      toast({
        title: t('common.status.success'),
        description: t('messages.success.deleted'),
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t('common.status.failed'),
        description: error.response?.data?.error || error.message || t('errors.failedToDelete'),
      })
    } finally {
      setDeleting(null)
      setDeleteDialogOpen(false)
      setPendingDeleteTeacher(null)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary"></div>
        <p className="mt-4 text-gray-600">Memuat data...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">{t('pages.admin.teachers.title')}</h1>
          <p className="text-gray-600">{t('pages.admin.teachers.description')}</p>
        </div>
        <Link to="/admin/teachers/new">
          <Button
            className="min-h-[44px] min-w-[44px] w-full sm:w-auto"
          >
            <Plus size={20} className="mr-2 inline" />
            {t('pages.admin.teachers.add')}
          </Button>
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="border-2 border-red-200 bg-red-50 p-4 mb-6">
          <p className="text-red-800 font-medium">{error}</p>
          <button
            onClick={() => fetchTeachers(search || undefined, teacherType || undefined, selectedClassId || undefined)}
            className="mt-2 px-4 py-2 border-2 border-red-300 text-red-700 hover:bg-red-100 min-h-[44px] min-w-[44px]"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Cari nama atau email guru..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-2 min-h-[44px]"
          />
        </div>
        <div className="relative sm:w-48">
          <select
            value={teacherType}
            onChange={(e) => setTeacherType(e.target.value)}
            className="w-full h-9 px-3 border-2 border-input bg-transparent rounded-none text-sm min-h-[44px] flex items-center"
          >
            <option value="">Semua Guru</option>
            <option value="homeroom">Wali Kelas</option>
            <option value="quran">Guru Quran</option>
          </select>
        </div>
        <div className="relative sm:w-48">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            disabled={loadingClasses}
            className="w-full h-9 px-3 border-2 border-input bg-transparent rounded-none text-sm min-h-[44px] flex items-center"
          >
            <option value="">Semua Kelas</option>
            {classes?.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="border-2 border-border bg-white overflow-x-auto rounded-lg">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50 border-b-2 border-border">
            <tr>
              <th className="text-left p-2 md:p-4 border-r-2 border-border text-sm md:text-base">
                <div className="flex items-center gap-2">
                  <GraduationCap size={16} className="md:size-[18px]" />
                  {t('dataTable.headers.name')}
                </div>
              </th>
              <th className="text-left p-2 md:p-4 border-r-2 border-border text-sm md:text-base">{t('dataTable.headers.email')}</th>
              <th className="text-left p-2 md:p-4 border-r-2 border-border text-sm md:text-base">{t('dataTable.headers.phone')}</th>
              <th className="text-left p-2 md:p-4 border-r-2 border-border text-sm md:text-base">{t('dataTable.headers.class')}</th>
              <th className="text-center p-2 md:p-4 text-sm md:text-base">{t('dataTable.headers.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-border">
            {!teachers || teachers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  {search ? t('dataTable.noResults') : t('pages.admin.teachers.empty')}
                </td>
              </tr>
            ) : (
              teachers.map((teacher) => (
                <tr key={teacher.UserID} className="hover:bg-gray-50">
                  <td className="p-2 md:p-4 border-r-2 border-border">
                    <div className="font-medium text-sm md:text-base">{teacher.FullName}</div>
                  </td>
                  <td className="p-2 md:p-4 border-r-2 border-border text-sm md:text-sm">
                    {teacher.Email}
                  </td>
                  <td className="p-2 md:p-4 border-r-2 border-border text-sm md:text-sm">
                    {teacher.Phone || '-'}
                  </td>
                  <td className="p-2 md:p-4 border-r-2 border-border text-sm md:text-sm">
                    <div className="flex flex-col gap-1">
                      {(() => {
                        const homeroomSet = new Set(teacher.HomeroomClasses || []);
                        const quranSet = new Set(teacher.QuranTeacherClasses || []);
                        const allClasses = new Set([...homeroomSet, ...quranSet]);

                        if (allClasses.size === 0) return '-';

                        return Array.from(allClasses).map((className) => {
                          const isHomeroom = homeroomSet.has(className);
                          const isQuran = quranSet.has(className);

                          let badgeClass = '';
                          let title = '';

                          if (isHomeroom && isQuran) {
                            badgeClass = 'px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs';
                            title = 'Homeroom & Quran Teacher';
                          } else if (isHomeroom) {
                            badgeClass = 'px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs';
                            title = 'Homeroom Teacher';
                          } else {
                            badgeClass = 'px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs';
                            title = 'Quran Teacher';
                          }

                          return (
                            <span
                              key={className}
                              className={badgeClass}
                              title={title}
                            >
                              {className}
                            </span>
                          );
                        });
                      })()}
                    </div>
                  </td>
                  <td className="p-2 md:p-4">
                    <div className="flex justify-center gap-1 md:gap-2">
                      <Link
                        to={`/admin/teachers/${teacher.UserID}/edit`}
                        className="p-1.5 md:p-2 border-2 border-yellow-200 hover:bg-yellow-50 min-h-[36px] min-w-[36px] inline-block"
                        title="Edit"
                      >
                        <Edit size={14} className="md:size-[16px]" />
                      </Link>
                      <button
                        onClick={() => handleDelete(teacher)}
                        disabled={deleting === teacher.UserID}
                        className="p-1.5 md:p-2 border-2 border-red-200 hover:bg-red-50 min-h-[36px] min-w-[36px] disabled:opacity-50"
                        title="Hapus"
                      >
                        <Trash2 size={14} className="md:size-[16px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            {t('pagination.showing', {
              start: (page - 1) * 10 + 1,
              end: Math.min(page * 10, total)
            })} {t('pagination.of', { total })} {t('pagination.results')}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => fetchTeachers(search || undefined, teacherType || undefined, selectedClassId || undefined, page - 1)}
              disabled={page <= 1 || loading}
              className="min-h-[36px] min-w-[36px]"
            >
              {t('pagination.previous')}
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? "default" : "outline"}
                    onClick={() => fetchTeachers(search || undefined, teacherType || undefined, selectedClassId || undefined, pageNum)}
                    disabled={loading}
                    className="min-h-[36px] min-w-[36px]"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              onClick={() => fetchTeachers(search || undefined, teacherType || undefined, selectedClassId || undefined, page + 1)}
              disabled={page >= totalPages || loading}
              className="min-h-[36px] min-w-[36px]"
            >
              {t('pagination.next')}
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4">
        <div className="border-2 border-border bg-white p-4 text-center">
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-sm text-gray-600">Total Guru</div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={`${t('pages.admin.teachers.delete')}?`}
        description={
          pendingDeleteTeacher
            ? `${t('messages.confirm.delete')} ${pendingDeleteTeacher.FullName}?`
            : t('messages.confirm.delete')
        }
        confirmLabel={`${t('common.actions.confirm')}, ${t('common.actions.delete')}`}
        cancelLabel={t('common.actions.cancel')}
        variant="danger"
        onConfirm={executeDelete}
        isLoading={deleting !== null}
      />
    </div>
  )
}
