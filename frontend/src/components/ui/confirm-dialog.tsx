import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  isLoading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Ya',
  cancelLabel = 'Batal',
  variant = 'danger',
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    // Don't close dialog here - let the calling code handle it after async operation
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[90vw] mx-4 border-2 sm:p-6 p-4">
        <DialogHeader>
          <div className="flex items-center gap-2 sm:gap-3">
            {variant === 'danger' && (
              <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 sm:h-6 text-red-600" />
              </div>
            )}
            {variant === 'warning' && (
              <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 sm:h-6 text-yellow-600" />
              </div>
            )}
            {variant === 'info' && (
              <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 sm:h-6 text-blue-600" />
              </div>
            )}
            <div className="flex-1">
              <DialogTitle className="text-base sm:text-lg font-semibold">{title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <DialogDescription className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-4 pl-10 sm:pl-15">
          {description}
        </DialogDescription>

        <DialogFooter className="mt-4 sm:mt-6 gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="min-h-[40px] sm:min-h-[44px] text-sm sm:text-base flex-1 px-2 sm:px-4"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`min-h-[40px] sm:min-h-[44px] text-sm sm:text-base flex-1 px-2 sm:px-4 ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : variant === 'warning'
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isLoading ? 'Memproses...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
