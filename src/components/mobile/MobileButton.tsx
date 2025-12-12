'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface MobileButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  icon?: ReactNode
  className?: string
}

export function MobileButton({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  icon,
  className = ''
}: MobileButtonProps) {
  const sizeClasses = {
    sm: 'h-10 px-3 text-sm',
    md: 'h-12 px-4 text-base',
    lg: 'h-14 px-6 text-lg'
  }

  return (
    <Button
      onClick={onClick}
      variant={variant}
      className={`
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        flex items-center justify-center gap-2
        rounded-lg
        font-semibold
        transition-all
        active:scale-95
        ${className}
      `}
    >
      {icon}
      <span>{children}</span>
    </Button>
  )
}

