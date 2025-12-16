// Report Builder Types & Interfaces
// For custom report generation and management

export interface ReportBuilder {
  id: string
  name: string
  description: string
  category: 'academic' | 'engagement' | 'administrative' | 'custom'
  isTemplate: boolean
  isPublic: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
  sections?: ReportSection[]
}

export interface ReportSection {
  id: string
  type: 'header' | 'metric_cards' | 'chart' | 'table' | 'text' | 'image' | 'divider'
  title: string
  description?: string
  content: any
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  styling: {
    backgroundColor?: string
    borderColor?: string
    textColor?: string
    fontSize?: 'small' | 'medium' | 'large'
    fontWeight?: 'normal' | 'bold' | 'light'
  }
  dataSource?: {
    type: 'api' | 'static' | 'computed'
    endpoint?: string
    query?: any
    refreshInterval?: number
    filters?: any[]
  }
}

export interface DragDropItem {
  id: string
  type: 'metric' | 'chart' | 'filter' | 'text' | 'table' | 'image'
  name: string
  icon: string
  category: string
  config: any
  defaultSize: {
    width: number
    height: number
  }
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  category: string
  layout: ReportLayout
  sections: ReportSection[]
  isDefault: boolean
  usageCount: number
  rating: number
  createdBy: string
  createdAt: Date
}

export interface ReportLayout {
  type: 'freeform' | 'grid' | 'sections'
  dimensions: {
    width: number
    height: number
    unit: 'px' | 'percent'
  }
  grid?: {
    columns: number
    gap: number
  }
  backgroundColor?: string
  backgroundImage?: string
}

export interface MetricConfig {
  id: string
  name: string
  type: 'counter' | 'percentage' | 'trend' | 'gauge' | 'progress'
  dataSource: {
    endpoint: string
    field: string
    aggregation: 'sum' | 'average' | 'count' | 'min' | 'max'
    filters?: any[]
  }
  styling: {
    primaryColor: string
    secondaryColor?: string
    showIcon: boolean
    iconPosition: 'left' | 'right' | 'top'
    format?: 'number' | 'percentage' | 'currency'
    decimals?: number
  }
  thresholds?: {
    good?: number
    warning?: number
    danger?: number
  }
}

export interface ChartConfig {
  id: string
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap' | 'gauge' | 'radar'
  title: string
  dataSource: {
    endpoint: string
    xField: string
    yField: string
    seriesField?: string
    filters?: any[]
    refreshInterval?: number
  }
  styling: {
    colors: string[]
    showLegend: boolean
    showGrid: boolean
    showTooltip: boolean
    animation: boolean
    curve?: 'linear' | 'monotone' | 'step'
    areaOpacity?: number
  }
  axes: {
    x?: {
      label: string
      format?: string
      type?: 'category' | 'time' | 'linear' | 'log'
    }
    y?: {
      label: string
      format?: string
      type?: 'linear' | 'log'
      min?: number
      max?: number
    }
  }
}

export interface FilterConfig {
  id: string
  type: 'date_range' | 'select' | 'multiselect' | 'text' | 'number'
  label: string
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in' | 'between'
  value?: any
  options?: Array<{ label: string; value: any }>
  defaultValue?: any
  required: boolean
  styling: {
    width?: number
    position?: 'left' | 'right'
  }
}

export interface ReportExport {
  format: 'PDF' | 'Excel' | 'CSV' | 'PNG' | 'PowerPoint'
  options: {
    includeRawData: boolean
    includeCharts: boolean
    pageSize?: 'A4' | 'A3' | 'Letter'
    orientation?: 'portrait' | 'landscape'
    quality?: 'high' | 'medium' | 'low'
    password?: string
    watermark?: boolean
  }
}

export interface ScheduledReport {
  id: string
  name: string
  templateId: string
  recipients: string[]
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  nextRun: Date
  lastRun?: Date
  isActive: boolean
  format: 'PDF' | 'Excel'
  deliveryMethod: 'email' | 'download' | 'webhook'
}

export interface ReportBuilderState {
  currentReport: ReportBuilder | null
  availableItems: DragDropItem[]
  sections: ReportSection[]
  selectedTemplate: ReportTemplate | null
  previewMode: boolean
  isDirty: boolean
  zoom: number
  gridSize: number
  snapToGrid: boolean
}

export interface BuilderAction {
  type: 'add_section' | 'remove_section' | 'move_section' | 'resize_section' | 'configure_section' | 'add_filter' | 'remove_filter'
  payload: any
  timestamp: Date
}

export interface ReportValidation {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
  section?: string
}

export interface ValidationWarning {
  field: string
  message: string
  suggestion?: string
}

// API Response Types
export interface ReportBuilderResponse<T = any> {
  success: boolean
  data: T
  message?: string
  validation?: ReportValidation
}

export interface TemplateGalleryResponse {
  templates: ReportTemplate[]
  categories: string[]
  totalCount: number
  page: number
  totalPages: number
}

// Builder Component Props
export interface ReportBuilderComponentProps {
  initialTemplate?: string
  onSave?: (report: ReportBuilder) => void
  onPreview?: (report: ReportBuilder) => void
  readOnly?: boolean
  showTemplates?: boolean
  allowedCategories?: string[]
}

// Real-time Collaboration
export interface ReportCollaboration {
  reportId: string
  collaborators: Array<{
    userId: string
    name: string
    avatar: string
    role: 'owner' | 'editor' | 'viewer'
    joinedAt: Date
    isActive: boolean
  }>
  changes: BuilderAction[]
  conflicts: Array<{
    section: string
    user1: string
    user2: string
    change1: any
    change2: any
    timestamp: Date
  }>
}

export interface Comment {
  id: string
  sectionId: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  timestamp: Date
  replies: Comment[]
  resolved: boolean
}

export interface ReportVersion {
  id: string
  version: number
  name: string
  description: string
  createdBy: string
  createdAt: Date
  changes: BuilderAction[]
  isCurrent: boolean
}