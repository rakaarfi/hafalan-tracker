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
      doc.text('Laporan Hafalan Quran', pageWidth / 2, 20, { align: 'center' })

      // School info (mock data)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('Hafalan Tracker School', pageWidth / 2, 30, { align: 'center' })

      const date = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
      doc.text(`Tanggal: ${date}`, pageWidth / 2, 37, { align: 'center' })

      // Line
      doc.line(margin, 45, pageWidth - margin, 45)

      if (reportType === 'student') {
        // Student Report
        const { student, progress, memorizations } = mockStudentReport

        // Student Info
        let yPosition = 55
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text(`Nama: ${student.name}`, margin, yPosition)
        yPosition += 7
        doc.setFont('helvetica', 'normal')
        doc.text(`Kelas: ${student.class_name}`, margin, yPosition)
        yPosition += 7
        doc.text(`Ayah: ${student.parent_1_name}`, margin, yPosition)
        yPosition += 7
        if (student.parent_2_name) {
          doc.text(`Ibu: ${student.parent_2_name}`, margin, yPosition)
          yPosition += 7
        }

        // Progress
        yPosition += 10
        doc.line(margin, yPosition, pageWidth - margin, yPosition)
        yPosition += 7
        doc.setFont('helvetica', 'bold')
        doc.text('Progress Hafalan:', margin, yPosition)
        yPosition += 7
        doc.setFont('helvetica', 'normal')
        doc.text(`Completion: ${progress.percent}% (${progress.completed}/${progress.total_units} unit)`, margin, yPosition)

        // Table
        yPosition += 10
        const tableData = memorizations.map((m, idx) => [
          idx + 1,
          m.date,
          m.unit,
          m.status === 'fluent' ? 'Lancar' : m.status === 'good' ? 'Cukup' : 'Perlu Perbaikan',
          m.notes,
          m.teacher_name
        ])

        autoTable(doc, {
          head: [['#', 'Tanggal', 'Unit', 'Status', 'Catatan', 'Guru']],
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
        doc.text(`Kelas: ${classData.name}`, margin, yPosition)
        yPosition += 7
        doc.setFont('helvetica', 'normal')
        doc.text(`Wali Kelas: ${classData.teacher_name}`, margin, yPosition)
        yPosition += 7

        // Stats
        yPosition += 10
        doc.line(margin, yPosition, pageWidth - margin, yPosition)
        yPosition += 7
        doc.setFont('helvetica', 'bold')
        doc.text('Statistik Kelas:', margin, yPosition)
        yPosition += 7
        doc.setFont('helvetica', 'normal')
        doc.text(`Total Murid: ${stats.total_students}`, margin, yPosition)
        yPosition += 7
        doc.text(`Rata-rata Progress: ${stats.avg_progress}%`, margin, yPosition)
        yPosition += 7
        doc.text(`Total Setoran: ${stats.total_memorizations}`, margin, yPosition)

        // Students Table
        yPosition += 10
        const tableData = students.map((student, idx) => [
          idx + 1,
          student.name,
          `${student.completed}/${student.total} (${student.percent}%)`,
          student.last_test,
          student.last_status === 'fluent' ? 'Lancar' : student.last_status === 'good' ? 'Cukup' : 'Perlu Perbaikan',
          student.parent_1_name
        ])

        autoTable(doc, {
          head: [['#', 'Nama Murid', 'Progress', 'Tes Terakhir', 'Status', 'Ayah']],
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

      alert(`PDF berhasil didownload: ${filename}`)
    } catch (error) {
      alert('Gagal generate PDF: ' + error)
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
          'Tanggal': m.date,
          'Unit': m.unit,
          'Tipe': m.unit_type,
          'Status': m.status === 'fluent' ? 'Lancar' : m.status === 'good' ? 'Cukup' : 'Perlu Perbaikan',
          'Catatan': m.notes,
          'Guru': m.teacher_name
        }))

        // Add student info row
        data.unshift({
          'Nama Murid': student.name,
          'Kelas': student.class_name,
          'Progress': `${progress.percent}%`,
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
          'Nama Murid': student.name,
          'Progress': `${student.completed}/${student.total} (${student.percent}%)`,
          'Tes Terakhir': student.last_test,
          'Status': student.last_status === 'fluent' ? 'Lancar' : student.last_status === 'good' ? 'Cukup' : 'Perlu Perbaikan',
          'Ayah': student.parent_1_name
        }))

        // Add class info rows
        data.unshift(
          { 'Kelas': classData.name, '': '', '': '', '': '', '': '', '': '' },
          { 'Wali Kelas': classData.teacher_name, '': '', '': '', '': '', '': '', '': '' },
          { '': '', '': '', 'Total Murid': students.length, '': '', '': '', '': '' }
        )
      }

      // Create workbook
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(data)
      XLSX.utils.book_append_sheet(wb, ws, 'Report')

      // Generate file
      XLSX.writeFile(wb, filename)

      alert(`Excel berhasil didownload: ${filename}`)
    } catch (error) {
      alert('Gagal generate Excel: ' + error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Laporan & Export</h1>
        <p className="text-gray-600">Generate laporan dalam format PDF dan Excel</p>
      </div>

      {/* Report Type Selector */}
      <div className="mb-6">
        <div className="flex gap-4 border-2 border-border bg-white p-4">
          <button
            onClick={() => setReportType('student')}
            className={`px-6 py-2 border-2 min-h-[44px] ${reportType === 'student' ? 'bg-primary text-white' : 'hover:bg-gray-50'}`}
          >
            <FileText size={20} className="mr-2 inline" />
            Laporan Per Murid
          </button>
          <button
            onClick={() => setReportType('class')}
            className={`px-6 py-2 border-2 min-h-[44px] ${reportType === 'class' ? 'bg-primary text-white' : 'hover:bg-gray-50'}`}
          >
            <Users size={20} className="mr-2 inline" />
            Laporan Per Kelas
          </button>
          <button
            onClick={() => setReportType('period')}
            className={`px-6 py-2 border-2 min-h-[44px] ${reportType === 'period' ? 'bg-primary text-white' : 'hover:bg-gray-50'}`}
          >
            <Calendar size={20} className="mr-2 inline" />
            Laporan Per Periode
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="mb-6">
        {reportType === 'student' && (
          <div className="border-2 border-border bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Preview: Laporan Per Murid</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border-2 border-border p-4">
                <div className="text-sm text-gray-600 mb-1">Nama</div>
                <div className="font-semibold">{mockStudentReport.student.name}</div>
              </div>
              <div className="border-2 border-border p-4">
                <div className="text-sm text-gray-600 mb-1">Kelas</div>
                <div className="font-semibold">{mockStudentReport.student.class_name}</div>
              </div>
              <div className="border-2 border-border p-4">
                <div className="text-sm text-gray-600 mb-1">Progress</div>
                <div className="font-semibold text-2xl">{mockStudentReport.progress.percent}%</div>
                <div className="text-xs text-gray-500">{mockStudentReport.progress.completed}/{mockStudentReport.progress.total_units} unit</div>
              </div>
            </div>
          </div>
        )}

        {reportType === 'class' && (
          <div className="border-2 border-border bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Preview: Laporan Per Kelas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border-2 border-border p-4">
                <div className="text-sm text-gray-600 mb-1">Kelas</div>
                <div className="font-semibold">{mockClassReport.class.name}</div>
              </div>
              <div className="border-2 border-border p-4">
                <div className="text-sm text-gray-600 mb-1">Wali Kelas</div>
                <div className="font-semibold">{mockClassReport.class.teacher_name}</div>
              </div>
              <div className="border-2 border-border p-4">
                <div className="text-sm text-gray-600 mb-1">Total Murid</div>
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
          {loading ? 'Generating...' : 'Export PDF'}
        </Button>
        <Button
          onClick={exportExcel}
          disabled={loading}
          variant="outline"
          className="min-h-[44px] min-w-[44px]"
        >
          <Download size={20} className="mr-2" />
          {loading ? 'Generating...' : 'Export Excel'}
        </Button>
      </div>

      {/* Notes */}
      <div className="mt-6 border-2 border-blue-100 bg-blue-50 p-4">
        <p className="text-sm text-blue-800 font-medium mb-2">
          ℹ️ Informasi Export:
        </p>
        <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
          <li><strong>PDF:</strong> Format resmi untuk presentasi, bisa diprint, include logo sekolah</li>
          <li><strong>Excel:</strong> Untuk data processing, bisa diedit lagi, semua data lengkap</li>
          <li>Laporan akan di-download langsung ke browser</li>
          <li>Logo sekolah akan ditambahkan di halaman settings</li>
        </ul>
      </div>
    </div>
  )
}
