import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)

  const togglePassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("pr-12", className)}
        ref={ref}
        {...props}
      />
      <button
        type="button"
        onClick={togglePassword}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff size={20} />
        ) : (
          <Eye size={20} />
        )}
      </button>
    </div>
  )
})
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
