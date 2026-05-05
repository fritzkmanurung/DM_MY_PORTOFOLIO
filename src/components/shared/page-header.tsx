import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title?: string
  description?: string
  children?: React.ReactNode
  className?: string
}

/**
 * Reusable page header for admin pages.
 * Renders a title, optional description, and optional action slot (e.g. "Add New" button).
 */
export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children && <div className="mt-3 sm:mt-0">{children}</div>}
    </div>
  )
}
