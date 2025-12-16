'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  ReportBuilder,
  ReportSection,
  ReportTemplate,
  ReportLayout,
  DragDropItem,
  ReportBuilderState,
  ReportValidation
} from '@/lib/reports/types'
import { reportBuilderService } from '@/lib/reports/service'
import { 
  Plus, 
  Save, 
  Eye, 
  Download, 
  Settings,
  Grid,
  Layout,
  BarChart3,
  Filter,
  Type,
  Image,
  Table,
  Move,
  Trash2,
  Copy,
  Share
} from 'lucide-react'

import { toast } from 'sonner'

interface ReportBuilderComponentProps {
  initialTemplate?: string
  onSave?: (report: ReportBuilder) => void
  onPreview?: (report: ReportBuilder) => void
  readOnly?: boolean
  showTemplates?: boolean
  allowedCategories?: string[]
}

export function ReportBuilderComponent({
  initialTemplate,
  onSave,
  onPreview,
  readOnly = false,
  showTemplates = true,
  allowedCategories
}: ReportBuilderComponentProps) {
  const [state, setState] = useState<ReportBuilderState>({
    currentReport: null,
    availableItems: [],
    sections: [],
    selectedTemplate: null,
    previewMode: false,
    isDirty: false,
    zoom: 1,
    gridSize: 20,
    snapToGrid: true
  })
  
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [validation, setValidation] = useState<ReportValidation | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('builder')
  
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadTemplates()
    loadAvailableItems()
    
    if (initialTemplate) {
      loadTemplate(initialTemplate)
    } else {
      createNewReport()
    }
  }, [initialTemplate])

  const loadTemplates = async () => {
    try {
      const response = await reportBuilderService.getReportTemplates()
      setTemplates(response.templates)
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
  }

  const loadAvailableItems = () => {
    const items: DragDropItem[] = [
      {
        id: 'metric_card',
        type: 'metric',
        name: 'Metric Card',
        icon: '📊',
        category: 'metrics',
        config: { type: 'counter' },
        defaultSize: { width: 200, height: 120 }
      },
      {
        id: 'line_chart',
        type: 'chart',
        name: 'Line Chart',
        icon: '📈',
        category: 'charts',
        config: { type: 'line' },
        defaultSize: { width: 400, height: 300 }
      },
      {
        id: 'bar_chart',
        type: 'chart',
        name: 'Bar Chart',
        icon: '📊',
        category: 'charts',
        config: { type: 'bar' },
        defaultSize: { width: 400, height: 300 }
      },
      {
        id: 'pie_chart',
        type: 'chart',
        name: 'Pie Chart',
        icon: '🥧',
        category: 'charts',
        config: { type: 'pie' },
        defaultSize: { width: 300, height: 300 }
      },
      {
        id: 'data_table',
        type: 'table',
        name: 'Data Table',
        icon: '📋',
        category: 'data',
        config: { type: 'basic' },
        defaultSize: { width: 600, height: 400 }
      },
      {
        id: 'text_block',
        type: 'text',
        name: 'Text Block',
        icon: '📝',
        category: 'content',
        config: { type: 'paragraph' },
        defaultSize: { width: 400, height: 100 }
      },
      {
        id: 'image',
        type: 'image',
        name: 'Image',
        icon: '🖼️',
        category: 'content',
        config: { type: 'static' },
        defaultSize: { width: 300, height: 200 }
      },
      {
        id: 'filter',
        type: 'filter',
        name: 'Date Filter',
        icon: '🗓️',
        category: 'filters',
        config: { type: 'date_range' },
        defaultSize: { width: 250, height: 60 }
      }
    ]
    
    setState(prev => ({ ...prev, availableItems: items }))
  }

  const createNewReport = () => {
    const newReport: ReportBuilder = {
      id: reportBuilderService.generateReportId(),
      name: 'Untitled Report',
      description: '',
      category: 'custom',
      isTemplate: false,
      isPublic: false,
      createdBy: 'current-user', // Would come from auth
      createdAt: new Date(),
      updatedAt: new Date(),
      sections: []
    }
    
    setState(prev => ({ 
      ...prev, 
      currentReport: newReport,
      sections: [],
      isDirty: false 
    }))
  }

  const loadTemplate = async (templateId: string) => {
    try {
      setLoading(true)
      const template = await reportBuilderService.getReportTemplate(templateId)
      
      const report: ReportBuilder = {
        id: reportBuilderService.generateReportId(),
        name: `${template.name} (Copy)`,
        description: template.description,
        category: template.category as any,
        isTemplate: false,
        isPublic: false,
        createdBy: 'current-user',
        createdAt: new Date(),
        updatedAt: new Date(),
        sections: template.sections
      }
      
      setState(prev => ({ 
        ...prev, 
        currentReport: report,
        sections: template.sections,
        selectedTemplate: template,
        isDirty: false 
      }))
    } catch (error) {
      console.error('Failed to load template:', error)
      toast.error('Failed to load template')
    } finally {
      setLoading(false)
    }
  }

  const addSection = useCallback((item: DragDropItem, position: { x: number; y: number }) => {
    if (readOnly) return
    
    const newSection: ReportSection = {
      id: `section_${Date.now()}`,
      type: item.type as any,
      title: item.name,
      content: item.config,
      position: {
        x: state.snapToGrid ? Math.round(position.x / state.gridSize) * state.gridSize : position.x,
        y: state.snapToGrid ? Math.round(position.y / state.gridSize) * state.gridSize : position.y,
        width: item.defaultSize.width,
        height: item.defaultSize.height
      },
      styling: {
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        textColor: '#1a202c',
        fontSize: 'medium'
      }
    }
    
    setState(prev => ({
      ...prev,
      sections: [...prev.sections, newSection],
      isDirty: true
    }))
    
    // Validate after adding
    validateReport()
  }, [readOnly, state.snapToGrid, state.gridSize])

  const moveSection = useCallback((dragIndex: number, hoverIndex: number) => {
    if (readOnly) return
    
    const sections = Array.from(state.sections)
    const [draggedSection] = sections.splice(dragIndex, 1)
    sections.splice(hoverIndex, 0, draggedSection)
    
    setState(prev => ({
      ...prev,
      sections,
      isDirty: true
    }))
  }, [readOnly, state.sections])

  const removeSection = useCallback((sectionId: string) => {
    if (readOnly) return
    
    setState(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId),
      isDirty: true
    }))
    
    validateReport()
  }, [readOnly])

  const updateSection = useCallback((sectionId: string, updates: Partial<ReportSection>) => {
    if (readOnly) return
    
    setState(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      ),
      isDirty: true
    }))
    
    validateReport()
  }, [readOnly])

  const validateReport = async () => {
    if (!state.currentReport) return
    
    try {
      const validation = await reportBuilderService.validateReport({
        ...state.currentReport,
        sections: state.sections
      })
      setValidation(validation)
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const saveReport = async () => {
    if (!state.currentReport || readOnly) return
    
    try {
      setLoading(true)
      
      const reportToSave = {
        ...state.currentReport,
        sections: state.sections,
        updatedAt: new Date()
      }
      
      let savedReport: ReportBuilder
      if (state.currentReport.id.startsWith('report_')) {
        // New report
        savedReport = await reportBuilderService.createReport(reportToSave)
      } else {
        // Existing report
        savedReport = await reportBuilderService.updateReport(state.currentReport.id, reportToSave)
      }
      
      setState(prev => ({
        ...prev,
        currentReport: savedReport,
        isDirty: false
      }))
      
      toast.success('Report saved successfully!')
      onSave?.(savedReport)
    } catch (error) {
      console.error('Failed to save report:', error)
      toast.error('Failed to save report')
    } finally {
      setLoading(false)
    }
  }

  const previewReport = async () => {
    if (!state.currentReport) return
    
    try {
      const preview = await reportBuilderService.previewReport(state.currentReport.id)
      window.open(preview.url, '_blank')
      onPreview?.(state.currentReport)
    } catch (error) {
      console.error('Failed to generate preview:', error)
      toast.error('Failed to generate preview')
    }
  }

  const exportReport = async (format: 'PDF' | 'Excel' | 'CSV') => {
    if (!state.currentReport) return
    
    try {
      const result = await reportBuilderService.generateReport(state.currentReport.id, format)
      if (result.url) {
        window.open(result.url, '_blank')
        toast.success(`Report exported as ${format}`)
      }
    } catch (error) {
      console.error('Failed to export report:', error)
      toast.error('Failed to export report')
    }
  }

  const handleItemClick = (item: DragDropItem) => {
    if (readOnly) return
    
    // Add item to center of canvas
    addSection(item, {
      x: 100,
      y: 100
    })
  }

  const renderSection = (section: ReportSection) => {
    const isSelected = false // Would track selected section
    
    return (
      <div
        key={section.id}
        className={`absolute border-2 rounded-lg p-4 cursor-move transition-all ${
          isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-300'
        }`}
        style={{
          left: `${section.position.x}px`,
          top: `${section.position.y}px`,
          width: `${section.position.width}px`,
          height: `${section.position.height}px`,
          backgroundColor: section.styling?.backgroundColor || '#ffffff',
          borderColor: section.styling?.borderColor || '#e2e8f0'
        }}
        onClick={() => {/* Select section */}}
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-sm">{section.title}</h4>
          {!readOnly && (
            <div className="flex space-x-1">
              <Button size="sm" variant="ghost" onClick={() => {/* Configure */}}>
                <Settings className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => removeSection(section.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Render section content based on type */}
        <div className="text-xs text-muted-foreground">
          {section.type === 'chart' && <BarChart3 className="h-8 w-8" />}
          {section.type === 'table' && <Table className="h-8 w-8" />}
          {section.type === 'text' && <Type className="h-8 w-8" />}
          {section.type === 'image' && <Image className="h-8 w-8" />}
          {section.type === 'metric_cards' && <Grid className="h-8 w-8" />}
        </div>
      </div>
    )
  }

  if (loading && !state.currentReport) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Input
              value={state.currentReport?.name || ''}
              onChange={(e) => setState(prev => ({
                ...prev,
                currentReport: prev.currentReport ? {
                  ...prev.currentReport,
                  name: e.target.value
                } : null,
                isDirty: true
              }))}
              className="text-lg font-semibold"
              placeholder="Report Name"
              disabled={readOnly}
            />
            
            {state.isDirty && (
              <Badge variant="secondary">Unsaved</Badge>
            )}
            
            {validation && !validation.isValid && (
              <Badge variant="destructive">
                {validation.errors.length} errors
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('templates')}
            >
              Templates
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={previewReport}
              disabled={!state.currentReport}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportReport('PDF')}
              disabled={!state.currentReport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button
              onClick={saveReport}
              disabled={!state.currentReport || !state.isDirty || readOnly}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 border-r p-4">
          <h3 className="font-medium mb-4">Components</h3>
          
          <div className="space-y-2">
            {state.availableItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow ${
                  readOnly ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-auto bg-gray-50">
          <div
            ref={reportRef}
            className="relative"
            style={{
              width: '2000px',
              height: '2000px',
              backgroundImage: state.snapToGrid 
                ? `repeating-linear-gradient(0deg, #e5e7eb 0px, transparent 1px, transparent ${state.gridSize - 1}px, #e5e7eb ${state.gridSize}px),
                           repeating-linear-gradient(90deg, #e5e7eb 0px, transparent 1px, transparent ${state.gridSize - 1}px, #e5e7eb ${state.gridSize}px)`
                : 'none',
              backgroundSize: `${state.gridSize}px ${state.gridSize}px`,
              transform: `scale(${state.zoom})`,
              transformOrigin: 'top left'
            }}
          >
            <div className="w-full h-full">
              {state.sections.map((section) => renderSection(section))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}