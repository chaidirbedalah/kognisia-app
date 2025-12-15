import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: string
  trend?: 'up' | 'down' | 'neutral'
  loading?: boolean
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  onClick?: () => void
  dataTestId?: string
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  loading,
  variant = 'default',
  onClick,
  dataTestId
}: StatsCardProps) {
  if (loading) {
    return (
      <Card data-testid={dataTestId} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-10 bg-gray-200 animate-pulse rounded mb-2"></div>
          {description && <div className="h-4 bg-gray-100 animate-pulse rounded"></div>}
        </CardContent>
      </Card>
    )
  }

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-gray-600'
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'border-blue-200 bg-blue-50/50'
      case 'success':
        return 'border-green-200 bg-green-50/50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50/50'
      case 'danger':
        return 'border-red-200 bg-red-50/50'
      default:
        return ''
    }
  }

  const getValueColor = () => {
    if (trend) return getTrendColor()
    
    switch (variant) {
      case 'primary':
        return 'text-blue-600'
      case 'success':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'danger':
        return 'text-red-600'
      default:
        return 'text-gray-900'
    }
  }

  return (
    <Card 
      data-testid={dataTestId}
      className={`hover:shadow-md transition-all duration-200 ${getVariantStyles()} ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          {icon && <span className="text-2xl">{icon}</span>}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${getValueColor()} mb-1`}>
          {value}
        </div>
        {description && (
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
