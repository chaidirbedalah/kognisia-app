'use client'

import { ReactNode, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { useMobileDetection } from '@/hooks/useMobileDetection'

interface MobileCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  touchRipple?: boolean
  onPress?: () => void
}

const MobileCard = forwardRef<HTMLDivElement, MobileCardProps>(
  ({ 
    children, 
    className,
    variant = 'default',
    padding = 'md',
    touchRipple = false,
    onPress
  }, ref) => {
    const { isMobile, touchSupported } = useMobileDetection()

    const variants = {
      default: 'bg-card text-card-foreground border border-border',
      outlined: 'bg-background border-2 border-border',
      elevated: 'bg-card text-card-foreground shadow-lg border-0'
    }

    const paddings = {
      none: '',
      sm: isMobile ? 'p-3' : 'p-4',
      md: isMobile ? 'p-4' : 'p-6',
      lg: isMobile ? 'p-5' : 'p-8'
    }

    const handleClick = () => {
      if (onPress && isMobile && 'vibrate' in navigator) {
        navigator.vibrate(5) // Light haptic feedback
      }
      onPress?.()
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl transition-all duration-200',
          variants[variant],
          paddings[padding],
          
          // Mobile optimizations
          isMobile && [
            'active:scale-98', // Subtle press feedback
            'touch-action-manipulation', // Optimize for touch
          ],
          
          // Interactive styles
          onPress && [
            'cursor-pointer hover:shadow-md',
            isMobile && 'active:shadow-sm'
          ],
          
          className
        )}
        onClick={handleClick}
      >
        {children}
      </div>
    )
  }
)

MobileCard.displayName = 'MobileCard'

interface MobileCardHeaderProps {
  title?: string
  subtitle?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function MobileCardHeader({ 
  title, 
  subtitle, 
  icon, 
  action,
  className 
}: MobileCardHeaderProps) {
  const { isMobile } = useMobileDetection()

  return (
    <div className={cn(
      'flex items-start justify-between gap-3',
      isMobile ? 'mb-3' : 'mb-4',
      className
    )}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {icon && (
          <div className={cn(
            'flex-shrink-0',
            isMobile ? 'w-8 h-8' : 'w-10 h-10'
          )}>
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          {title && (
            <h3 className={cn(
              'font-semibold leading-tight truncate',
              isMobile ? 'text-base' : 'text-lg'
            )}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={cn(
              'text-muted-foreground mt-1 line-clamp-2',
              isMobile ? 'text-sm' : 'text-base'
            )}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  )
}

interface MobileCardContentProps {
  children: ReactNode
  className?: string
}

export function MobileCardContent({ children, className }: MobileCardContentProps) {
  const { isMobile } = useMobileDetection()

  return (
    <div className={cn(
      isMobile ? 'space-y-3' : 'space-y-4',
      className
    )}>
      {children}
    </div>
  )
}

interface MobileCardFooterProps {
  children: ReactNode
  className?: string
}

export function MobileCardFooter({ children, className }: MobileCardFooterProps) {
  const { isMobile } = useMobileDetection()

  return (
    <div className={cn(
      'flex items-center gap-2 mt-4 pt-4 border-t border-border',
      isMobile ? 'flex-col' : 'flex-row',
      className
    )}>
      {children}
    </div>
  )
}

export default MobileCard