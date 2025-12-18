'use client'

import { ReactNode } from 'react'
import { useMobileDetection } from '@/hooks/useMobileDetection'
import { cn } from '@/lib/utils'

interface MobileLayoutProps {
  children: ReactNode
  className?: string
  enableSafeArea?: boolean
}

export function MobileLayout({ 
  children, 
  className,
  enableSafeArea = true 
}: MobileLayoutProps) {
  const { isMobile, isTablet, orientation } = useMobileDetection()

  return (
    <div 
      className={cn(
        'min-h-screen bg-background',
        enableSafeArea && 'pt-safe-top pb-safe-bottom',
        isMobile && 'touch-action-manipulation',
        isTablet && 'px-4',
        className
      )}
      style={{
        paddingTop: enableSafeArea ? 'env(safe-area-inset-top)' : undefined,
        paddingBottom: enableSafeArea ? 'env(safe-area-inset-bottom)' : undefined,
      }}
    >
      <div 
        className={cn(
          'max-w-full mx-auto',
          isMobile && 'w-full px-3',
          isTablet && 'max-w-2xl',
          !isMobile && !isTablet && 'max-w-7xl px-6'
        )}
      >
        {children}
      </div>
    </div>
  )
}

interface MobileContainerProps {
  children: ReactNode
  className?: string
  spacing?: 'tight' | 'normal' | 'loose'
}

export function MobileContainer({ 
  children, 
  className,
  spacing = 'normal' 
}: MobileContainerProps) {
  const { isMobile } = useMobileDetection()

  const spacingClasses = {
    tight: isMobile ? 'space-y-2' : 'space-y-4',
    normal: isMobile ? 'space-y-4' : 'space-y-6',
    loose: isMobile ? 'space-y-6' : 'space-y-8'
  }

  return (
    <div className={cn(spacingClasses[spacing], className)}>
      {children}
    </div>
  )
}

interface MobileGridProps {
  children: ReactNode
  className?: string
  cols?: 1 | 2 | 3 | 4
}

export function MobileGrid({ 
  children, 
  className,
  cols = 2 
}: MobileGridProps) {
  const { isMobile, isTablet } = useMobileDetection()

  const gridClasses = {
    1: 'grid-cols-1',
    2: isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-2',
    3: isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3',
    4: isMobile ? 'grid-cols-2' : isTablet ? 'grid-cols-3' : 'grid-cols-4'
  }

  return (
    <div className={cn(
      'grid gap-4',
      gridClasses[cols],
      className
    )}>
      {children}
    </div>
  )
}

export default MobileLayout