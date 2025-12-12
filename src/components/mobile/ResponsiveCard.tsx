'use client'

import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ResponsiveCardProps {
  title: string
  icon?: ReactNode
  children: ReactNode
  className?: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
}

export function ResponsiveCard({
  title,
  icon,
  children,
  className = '',
  variant = 'default'
}: ResponsiveCardProps) {
  const variantClasses = {
    default: 'bg-white border-gray-200',
    primary: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    danger: 'bg-red-50 border-red-200'
  }

  return (
    <Card className={`${variantClasses[variant]} ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          {icon}
          <span className="truncate">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  )
}

