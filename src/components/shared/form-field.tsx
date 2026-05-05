'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'url' | 'date' | 'number' | 'textarea'
  value?: string | number
  defaultValue?: string | number
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  className?: string
  onChange?: (value: string) => void
}

/**
 * Reusable form field component with label, input, and error message.
 * Supports text, email, url, date, number, and textarea types.
 */
export function FormField({
  label,
  name,
  type = 'text',
  value,
  defaultValue,
  placeholder,
  required = false,
  disabled = false,
  error,
  className,
  onChange,
}: FormFieldProps) {
  const inputProps = {
    id: name,
    name,
    placeholder,
    required,
    disabled,
    className: cn('w-full', error && 'border-destructive'),
    ...(value !== undefined ? { value: String(value) } : {}),
    ...(defaultValue !== undefined ? { defaultValue: String(defaultValue) } : {}),
    ...(onChange ? { onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value) } : {}),
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {type === 'textarea' ? (
        <Textarea {...inputProps} rows={4} />
      ) : (
        <Input {...inputProps} type={type} />
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
