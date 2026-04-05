import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { surahOptions, juzOptions, type SurahOption, type JuzOption } from '@/lib/quran-data'

interface QuranComboboxProps {
  mode: 'surah' | 'juz' | 'page'
  value: string
  onChange: (value: string) => void
}

export function QuranCombobox({ mode, value, onChange }: QuranComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  // Get options based on mode
  const options = mode === 'surah' ? surahOptions : juzOptions

  // Filter options based on search
  const filteredOptions = options.filter((option) => {
    const searchLower = search.toLowerCase()
    return (
      option.label.toLowerCase().includes(searchLower) ||
      (mode === 'surah' && (option as SurahOption).arabic.includes(search))
    )
  })

  // Get selected option label
  const selectedOption = options.find((opt) => opt.value === value)
  const displayValue = selectedOption?.label || ''

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(!open)}
        className="w-full justify-between border-2 min-h-[44px]"
      >
        <span className="truncate">{displayValue || `Select ${mode}...`}</span>
        <span className="ml-2 text-xs">▼</span>
      </Button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-border">
          {/* Search input */}
          <div className="p-3 border-b-2 border-border">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${mode}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 border-2 focus-visible:ring-0 min-h-[44px]"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No {mode} found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                    setSearch('')
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-border last:border-b-0 transition-colors min-h-[44px] flex items-center justify-between",
                    value === option.value && "bg-accent"
                  )}
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{option.label}</div>
                    {mode === 'surah' && (
                      <div className="text-xs text-muted-foreground">
                        {(option as SurahOption).arabic}
                      </div>
                    )}
                  </div>
                  {value === option.value && (
                    <span className="text-xs text-primary">✓</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
