import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, FileText, Calendar, Filter, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

interface _MemorizationRecord {  // Prefixed with underscore to indicate intentionally unused for future use
  date: string
  unit: string
  unit_type: string
  status: string
  notes: string
  teacher_name: string
}

export function ReportsPage() {
  const { t } = useTranslation()
  const [reportType, setReportType] = useState<'student' | 'class' | 'period'>('student')
  const [loading, setLoading] = useState(false)

  // Mock data untuk laporan
  const mockStudentReport = {
    student: {
      id: '1',
      name: 'Ahmad Fauzi',
      class_name: 'Kelas 6A',
      birth_date: '2012-05-15',
      parent_1_name: 'Bapak Ahmad',
      parent_2_name: 'Ibu Siti',
    },
    progress: {
      total_units: 114,
      completed: 45,
      percent: 40,
    },
    memorizations: [
      {
        date: '2026-04-01',
        unit: 'Juz 30',
        unit_type: 'juz',
        status: 'fluent',
        notes: 'Sangat lancar, makhraj baik',
        teacher_name: 'Budi Santoso'
      },
      {
        date: '2026-03-28',
        unit: 'An-Naba',
        unit_type: 'surah',
        status: 'good',
        notes: 'Cukup lancar, perlu latihan tajwid',
        teacher_name: 'Budi Santoso'
      },
      {
        date: '2026-03-25',
        unit: 'Al-Baqarah 1-10',
        unit_type: 'page',
        status: 'fluent',
        notes: 'Lancar, hafalan kuat',
        teacher_name: 'Budi Santoso'
      },
      {
        date: '2026-03-20',
        unit: 'Yasin',
        unit_type: 'surah',
        status: 'good',
        notes: 'Cukup baik',
        teacher_name: 'Budi Santoso'
      },
      {
        date: '2026-03-15',
        unit: 'Al-Mulk',
        unit_type: 'surah',
        status: 'needs_improvement',
        notes: 'Perlu banyak latihan',
        teacher_name: 'Siti Rahayu'
      },
      {
        date: '2026-03-10',
        unit: 'Juz 29',
        unit_type: 'juz',
        status: 'good',
        notes: 'Progress baik',
        teacher_name: 'Siti Rahayu'
      },
    ]
  }

  const mockClassReport = {
    class: {
      id: '3',
      name: 'Kelas 6A',
      teacher_name: 'Budi Santoso',
    },
    students: [
      {
        name: 'Ahmad Fauzi',
        parent_1_name: 'Bapak Ahmad',
        completed: 45,
        total: 114,
        percent: 40,
        last_test: '2026-04-01',
        last_status: 'fluent'
      },
      {
        name: 'Siti Aminah',
        parent_1_name: 'Bapak Hasan',
        completed: 28,
        total: 114,
        percent: 25,
        last_test: '2026-04-03',
        last_status: 'good'
      },
    ],
    stats: {
      total_students: 2,
      avg_progress: 32.5,
      total_memorizations: 8
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fluent': return 'text-green-700'
      case 'good': return 'text-yellow-700'
      case 'needs_improvement': return 'text-red-700'
      default: return 'text-gray-700'
    }
  }

  // Export PDF
  const exportPDF = async () => {
    setLoading(true)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20

      // Add school logo (placeholder)
      // doc.addImage(logoUrl, 'PNG', margin, margin, 30, 30)

      // Header
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text(t('pages.admin.reports.pdfTitle'), pageWidth / 2, 20, { align: 'center' })

      // School info (mock data)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(t('app.name'), pageWidth / 2, 30, { align: 'center' })

      const date = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
      doc.text(`${t('pages.admin.reports.date')}: ${date}`, pageWidth / 2, 37, { align: 'center' })

      // Line
      doc.line(margin, 45, pageWidth - margin, 45)

      if (reportType === 'student') {
        // Student Report
        const { student, progress, memorizations } = mockStudentReport

        // Student Info
        let yPosition = 55
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text(`${t('forms.labels.fullName')}: ${student.name}`, margin, yPosition)
        yPosition += 7
        doc.setFont('helvetica', 'normal')
        doc.text(`${t('dataTable.headers.class')}: ${student.class_name}`, margin, yPosition)
        yPosition += 7
        doc.text(`${t('pages.admin.reports.father')}: ${student.parent_1_name}`, margin, yPosition)
        yPosition += 7
        if (student.parent_2_name) {
          doc.text(`${t('pages.admin.reports.mother')}: ${student.parent_2_name}`, margin, yPosition)
          yPosition += 7
        }

        // Progress
        yPosition += 10
        doc.line(margin, yPosition, pageWidth - margin, yPosition)
        yPosition += 7
        doc.setFont('helvetica', 'bold')
        doc.text(`${t('pages.admin.reports.memorizationProgress')}:`, margin, yPosition)
        yPosition += 7
        doc.setFont('helvetica', 'normal')
        doc.text(`Completion: ${progress.percent}% (${progress.completed}/${progress.total_units} unit)`, margin, yPosition)

        // Table
        yPosition += 10
        const tableData = memorizations.map((m, idx) => [
          idx + 1,
          m.date,
          m.unit,
          m.status === 'fluent' ? t('teacher.status.fluent') : m.status === 'good' ? t('teacher.status.good') : t('teacher.status.needs_improvement'),
          m.notes,
          m.teacher_name
        ])

        autoTable(doc, {
          head: [['#', t('dataTable.headers.date'), 'Unit', t('dataTable.headers.status'), t('teacher.notes'), t('roles.teacher')]],
          body: tableData,
          startY: yPosition,
          theme: 'grid',
          styles: {
            fontSize: 9,
            cellPadding: 3,
          },
          headStyles: { fillColor: [240, 240, 240] },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 25 },
            2: { cellWidth: 30 },
            3: { cellWidth: 25 },
            4: { cellWidth: 50 },
            5: { cellWidth: 30 },
          },
        })

      } else if (reportType === 'class') {
        // Class Report
        const { class: classData, students, stats } = mockClassReport

        let yPosition = 55
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text(`${t('dataTable.headers.class')}: ${classData.name}`, margin, yPosition)
        yPosition += 7
        doc.setFont('helvetica', 'normal')
        doc.text(`${t('roles.homeroom')}: ${classData.teacher_name}`, margin, yPosition)
        yPosition += 7

        // Stats
        yPosition += 10
        doc.line(margin, yPosition, pageWidth - margin, yPosition)
        yPosition += 7
        doc.setFont('helvetica', 'bold')
        doc.text(`${t('pages.admin.reports.classStatistics')}:`, margin, yPosition)
        yPosition += 7
        doc.setFont('helvetica', 'normal')
        doc.text(`${t('pages.admin.reports.totalStudents')}: ${stats.total_students}`, margin, yPosition)
        yPosition += 7
        doc.text(`${t('pages.admin.reports.avgProgress')}: ${stats.avg_progress}%`, margin, yPosition)
        yPosition += 7
        doc.text(`${t('pages.admin.reports.totalMemorizations')}: ${stats.total_memorizations}`, margin, yPosition)

        // Students Table
        yPosition += 10
        const tableData = students.map((student, idx) => [
          idx + 1,
          student.name,
          `${student.completed}/${student.total} (${student.percent}%)`,
          student.last_test,
          student.last_status === 'fluent' ? t('teacher.status.fluent') : student.last_status === 'good' ? t('teacher.status.good') : t('teacher.status.needs_improvement'),
          student.parent_1_name
        ])

        autoTable(doc, {
          head: [['#', t('dataTable.headers.name'), t('parent.overallProgress'), t('parent.lastTest'), t('dataTable.headers.status'), t('pages.admin.reports.father')]],
          body: tableData,
          startY: yPosition,
          theme: 'grid',
          styles: {
            fontSize: 9,
            cellPadding: 3,
          },
          headStyles: { fillColor: [240, 240, 240] },
        })
      }

      // Save PDF
      const filename = `laporan-${reportType}-${Date.now()}.pdf`
      doc.save(filename)

      alert(`${t('pages.admin.reports.pdfSuccess')} ${filename}`)
    } catch (error) {
      alert(`${t('pages.admin.reports.pdfError')} ${error}`)
    } finally {
      setLoading(false)
    }
  }

  // Export Excel
  const exportExcel = async () => {
    setLoading(true)
    try {
      let data: any[] = []
      let filename = ''

      if (reportType === 'student') {
        const { student, progress, memorizations } = mockStudentReport
        filename = `laporan-${student.name.replace(/\s+/g, '-')}-${Date.now()}.xlsx`

        data = memorizations.map((m, idx) => ({
          '#': idx + 1,
          [t('dataTable.headers.date')]: m.date,
          'Unit': m.unit,
          [t('pages.admin.reports.type')]: m.unit_type,
          [t('dataTable.headers.status')]: m.status === 'fluent' ? t('teacher.status.fluent') : m.status === 'good' ? t('teacher.status.good') : t('teacher.status.needs_improvement'),
          [t('teacher.notes')]: m.notes,
          [t('roles.teacher')]: m.teacher_name
        }))

        // Add student info row
        data.unshift({
          [t('pages.admin.reports.studentName')]: student.name,
          [t('dataTable.headers.class')]: student.class_name,
          [t('parent.overallProgress')]: `${progress.percent}%`,
          '': '',
          '': '',
          '': '',
          '': '',
          '': ''
        })

      } else if (reportType === 'class') {
        const { class: classData, students } = mockClassReport
        filename = `laporan-${classData.name.replace(/\s+/g, '-')}-${Date.now()}.xlsx`

        data = students.map((student, idx) => ({
          '#': idx + 1,
          [t('pages.admin.reports.studentName')]: student.name,
          [t('parent.overallProgress')]: `${student.completed}/${student.total} (${student.percent}%)`,
          [t('parent.lastTest')]: student.last_test,
          [t('dataTable.headers.status')]: student.last_status === 'fluent' ? t('teacher.status.fluent') : student.last_status === 'good' ? t('teacher.status.good') : t('teacher.status.needs_improvement'),
          [t('pages.admin.reports.father')]: student.parent_1_name
        }))

        // Add class info rows
        data.unshift(
          { [t('dataTable.headers.class')]: classData.name, '': '', '': '', '': '', '': '', '': '' },
          { [t('roles.homeroom')]: classData.teacher_name, '': '', '': '', '': '', '': '', '': '' },
          { '': '', '': '', [t('pages.admin.reports.totalStudents')]: students.length, '': '', '': '', '': '' }
        )
      }

      // Create workbook
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(data)
      XLSX.utils.book_append_sheet(wb, ws, 'Report')

      // Generate file
      XLSX.writeFile(wb, filename)

      alert(`${t('pages.admin.reports.excelSuccess')} ${filename}`)
    } catch (error) {
      alert(`${t('pages.admin.reports.excelError')} ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('pages.admin.reports.title')}</h1>
        <p className="text-gray-600">{t('pages.admin.reports.description')}</p>
      </div>

      {/* Report Type Selector */}
      <div className="mb-6">
        <div className="flex gap-4 border-2 border-border bg-white p-4">
          <button
            onClick={() => setReportType('student')}
            className={`px-6 py-2 border-2 min-h-[44px] ${reportType === 'student' ? 'bg-primary text-white' : 'hover:bg-gray-50'}`}
          >
            <FileText size={20} className="mr-2 inline" />
            {t('pages.admin.reports.studentReport')}
          </button>
          <button
            onClick={() => setReportType('class')}
            className={`px-6 py-2 border-2 min-h-[44px] ${reportType === 'class' ? 'bg-primary text-white' : 'hover:bg-gray-50'}`}
          >
            <Users size={20} className="mr-2 inline" />
            {t('pages.admin.reports.classReport')}
          </button>
          <button
            onClick={() => setReportType('period')}
            className={`px-6 py-2 border-2 min-h-[44px] ${reportType === 'period' ? 'bg-primary text-white' : 'hover:bg-gray-50'}`}
          >
            <Calendar size={20} className="mr-2 inline" />
            {t('pages.admin.reports.periodReport')}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="mb-6">
        {reportType === 'student' && (
          <div className="border-2 border-border bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">{t('pages.admin.reports.preview')}: {t('pages.admin.reports.studentReport')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border-2 border-border p-4">
                <div className="text-sm text-gray-600 mb-1">{t('forms.labels.fullName')}</div>
                <div className="font-semibold">{mockStudentReport.student.name}</div>
              </div>
              <div className="border-2 border-border p-4">
                <div className="text-sm text-gray-600 mb-1">{t('dataTable.headers.class')}</div>
                <div className="font-semibold">{mockStudentReport.student.class_name}</div>
              </div>
              <div className="border-2 border-border p-4">
                <div className="text-sm text-gray-600 mb-1">{t('parent.overallProgress')}</div>
                <div className="font-semibold text-2xl">{mockStudentReport.progress.percent}%</div>
                <div className="text-xs text-gray-500">{mockStudentReport.progress.completed}/{mockStudentReport.progress.total_units} unit</div>
              </div>
            </div>
          </div>
        )}

        {reportType === 'class' && (
          <div className="border-2 border-border bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">{t('pages.admin.reports.preview')}: {t('pages.admin.reports.classReport')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border-2 border-border p-4">
                <div className="text-sm text-gray-600 mb-1">{t('dataTable.headers.class')}</div>
                <div className="font-semibold">{mockClassReport.class.name}</div>
              </div>
              <div className="border-2 border-border p-4">
                <div className="text-sm text-gray-600 mb-1">{t('roles.homeroom')}</div>
                <div className="font-semibold">{mockClassReport.class.teacher_name}</div>
              </div>
              <div className="border-2 border-border p-4">
                <div className="text-sm text-gray-600 mb-1">{t('pages.admin.reports.totalStudents')}</div>
                <div className="font-semibold text-2xl">{mockClassReport.stats.total_students}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={exportPDF}
          disabled={loading}
          className="min-h-[44px] min-w-[44px]"
        >
          <Download size={20} className="mr-2" />
          {loading ? t('common.status.processing') : t('pages.admin.reports.exportPDF')}
        </Button>
        <Button
          onClick={exportExcel}
          disabled={loading}
          variant="outline"
          className="min-h-[44px] min-w-[44px]"
        >
          <Download size={20} className="mr-2" />
          {loading ? t('common.status.processing') : t('pages.admin.reports.exportExcel')}
        </Button>
      </div>

      {/* Notes */}
      <div className="mt-6 border-2 border-blue-100 bg-blue-50 p-4">
        <p className="text-sm text-blue-800 font-medium mb-2">
          ℹ️ {t('pages.admin.reports.exportInfo.title')}:
        </p>
        <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
          <li><strong>PDF:</strong> {t('pages.admin.reports.exportInfo.pdfDesc')}</li>
          <li><strong>Excel:</strong> {t('pages.admin.reports.exportInfo.excelDesc')}</li>
          <li>{t('pages.admin.reports.exportInfo.downloadInfo')}</li>
          <li>{t('pages.admin.reports.exportInfo.logoInfo')}</li>
        </ul>
      </div>
    </div>
  )
}
