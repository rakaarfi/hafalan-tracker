import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  const { t } = useTranslation()

  const handleConfirm = () => {
    onConfirm()
    // Don't close dialog here - let the calling code handle it after async operation
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[90vw] border-2 sm:p-6 p-4">
        <DialogHeader>
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            {variant === 'danger' && (
              <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 sm:h-8 text-red-600" />
              </div>
            )}
            {variant === 'warning' && (
              <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 sm:h-8 text-yellow-600" />
              </div>
            )}
            {variant === 'info' && (
              <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 sm:h-8 text-blue-600" />
              </div>
            )}
            <DialogTitle className="text-base sm:text-lg font-semibold text-center">{title}</DialogTitle>
          </div>
        </DialogHeader>

        <DialogDescription className="text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4 text-center">
          {description}
        </DialogDescription>

        <DialogFooter className="mt-4 sm:mt-6 gap-2 sm:gap-3 justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="min-h-[40px] sm:min-h-[44px] text-sm sm:text-base flex-1 px-2 sm:px-4"
          >
            {cancelLabel || t('common.actions.cancel')}
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
            {isLoading ? t('common.status.processing') : (confirmLabel || t('common.actions.confirm'))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
