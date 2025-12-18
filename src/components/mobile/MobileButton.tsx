'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { useMobileDetection } from '@/hooks/useMobileDetection'
import { Loader2 } from 'lucide-react'

interface MobileButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  touchOptimized?: boolean
  hapticFeedback?: boolean
}

const MobileButton = forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md',
    loading = false,
    touchOptimized = true,
    hapticFeedback = false,
    children, 
    disabled,
    onClick,
    ...props 
  }, ref) => {
    const { isMobile, touchSupported } = useMobileDetection()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Haptic feedback for mobile devices
      if (hapticFeedback && isMobile && 'vibrate' in navigator) {
        navigator.vibrate(10)
      }
      
      onClick?.(e)
    }

    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground active:scale-95',
      ghost: 'hover:bg-accent hover:text-accent-foreground active:scale-95',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-95'
    }

    const sizes = {
      sm: isMobile ? 'h-10 px-4 text-sm' : 'h-8 px-3 text-xs',
      md: isMobile ? 'h-12 px-6 text-base' : 'h-10 px-4 text-sm',
      lg: isMobile ? 'h-14 px-8 text-lg' : 'h-12 px-6 text-base',
      xl: isMobile ? 'h-16 px-10 text-xl' : 'h-14 px-8 text-lg'
    }

    return (
      <button
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          
          // Mobile optimizations
          touchOptimized && isMobile && [
            'min-h-[44px]', // iOS touch target minimum
            'select-none', // Prevent text selection on touch
            'touch-action-manipulation', // Optimize for touch
            'active:scale-95', // Touch feedback
          ],
          
          // Variant and size
          variants[variant],
          sizes[size],
          
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {loading && (
          <Loader2 className={cn(
            'animate-spin',
            isMobile ? 'mr-2 h-5 w-5' : 'mr-2 h-4 w-4'
          )} />
        )}
        {children}
      </button>
    )
  }
)

MobileButton.displayName = 'MobileButton'

export default MobileButton