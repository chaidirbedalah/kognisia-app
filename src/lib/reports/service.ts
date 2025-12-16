// Report Builder Service - Custom Report Generation & Management
// Handles drag-and-drop report building and template management

import {
  ReportBuilder,
  ReportSection,
  ReportTemplate,
  ReportLayout,
  MetricConfig,
  ChartConfig,
  FilterConfig,
  ReportExport,
  ScheduledReport,
  ReportBuilderState,
  BuilderAction,
  ReportValidation,
  TemplateGalleryResponse,
  ReportCollaboration,
  Comment,
  ReportVersion
} from './types'

class ReportBuilderService {
  private baseUrl = '/api/reports'
  private templatesCache = new Map<string, TemplateGalleryResponse>()
  private collaborationCache = new Map<string, ReportCollaboration>()

  // Template Management
  async getReportTemplates(
    category?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<TemplateGalleryResponse> {
    const cacheKey = `templates_${category}_${page}_${limit}`
    
    if (this.templatesCache.has(cacheKey)) {
      const cached = this.templatesCache.get(cacheKey)
      return cached || { templates: [], categories: [], totalCount: 0, page: 1, totalPages: 1 }
    }

    const params = new URLSearchParams()
    if (category) params.append('category', category)
    params.append('page', page.toString())
    params.append('limit', limit.toString())

    const response = await fetch(`${this.baseUrl}/templates?${params}`)
    const data = await response.json()
    
    this.templatesCache.set(cacheKey, data.data)
    return data.data
  }

  async getReportTemplate(id: string): Promise<ReportTemplate> {
    const response = await fetch(`${this.baseUrl}/templates/${id}`)
    const data = await response.json()
    return data.data
  }

  async createReportTemplate(template: Omit<ReportTemplate, 'id' | 'createdAt' | 'usageCount' | 'rating'>): Promise<ReportTemplate> {
    const response = await fetch(`${this.baseUrl}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    })
    
    const data = await response.json()
    
    // Clear cache
    this.templatesCache.clear()
    
    return data.data
  }

  async updateReportTemplate(
    id: string, 
    template: Partial<ReportTemplate>
  ): Promise<ReportTemplate> {
    const response = await fetch(`${this.baseUrl}/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    })
    
    const data = await response.json()
    
    // Clear cache
    this.templatesCache.clear()
    
    return data.data
  }

  async deleteReportTemplate(id: string): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${this.baseUrl}/templates/${id}`, {
      method: 'DELETE'
    })
    
    const data = await response.json()
    
    // Clear cache
    this.templatesCache.clear()
    
    return data
  }

  async duplicateReportTemplate(id: string, name: string): Promise<ReportTemplate> {
    const original = await this.getReportTemplate(id)
    const duplicated = {
      ...original,
      name,
      isDefault: false
    }
    
    delete (duplicated as any).id
    delete (duplicated as any).createdAt
    delete (duplicated as any).usageCount
    delete (duplicated as any).rating
    
    return this.createReportTemplate(duplicated)
  }

  // Report Building
  async createReport(report: Omit<ReportBuilder, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReportBuilder> {
    const response = await fetch(`${this.baseUrl}/builder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    })
    
    const data = await response.json()
    return data.data
  }

  async updateReport(
    id: string,
    updates: Partial<ReportBuilder>
  ): Promise<ReportBuilder> {
    const response = await fetch(`${this.baseUrl}/builder/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    
    const data = await response.json()
    return data.data
  }

  async saveReport(id: string): Promise<{ success: boolean; reportId?: string }> {
    const response = await fetch(`${this.baseUrl}/builder/${id}/save`, {
      method: 'POST'
    })
    
    const data = await response.json()
    return data.data
  }

  async getReport(id: string): Promise<ReportBuilder> {
    const response = await fetch(`${this.baseUrl}/builder/${id}`)
    const data = await response.json()
    return data.data
  }

  async getUserReports(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ reports: ReportBuilder[]; total: number }> {
    const params = new URLSearchParams()
    params.append('userId', userId)
    params.append('page', page.toString())
    params.append('limit', limit.toString())

    const response = await fetch(`${this.baseUrl}/user?${params}`)
    const data = await response.json()
    return data.data
  }

  // Report Generation & Export
  async generateReport(
    reportId: string,
    format: ReportExport['format'],
    options?: ReportExport['options']
  ): Promise<{ success: boolean; url?: string; filename?: string }> {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportId,
        format,
        options
      })
    })
    
    const data = await response.json()
    return data.data
  }

  async previewReport(
    reportId: string,
    format: 'html' | 'pdf' = 'html'
  ): Promise<{ url: string; expiresAt: Date }> {
    const response = await fetch(`${this.baseUrl}/preview/${reportId}?format=${format}`, {
      method: 'POST'
    })
    
    const data = await response.json()
    return data.data
  }

  async getExportHistory(
    userId: string,
    limit: number = 50
  ): Promise<Array<{
    id: string
    reportName: string
    format: string
    generatedAt: Date
    size: number
    downloadCount: number
  }>> {
    const response = await fetch(`${this.baseUrl}/exports/${userId}?limit=${limit}`)
    const data = await response.json()
    return data.data
  }

  // Scheduled Reports
  async createScheduledReport(schedule: Omit<ScheduledReport, 'id'>): Promise<ScheduledReport> {
    const response = await fetch(`${this.baseUrl}/scheduled`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedule)
    })
    
    const data = await response.json()
    return data.data
  }

  async getScheduledReports(userId: string): Promise<ScheduledReport[]> {
    const response = await fetch(`${this.baseUrl}/scheduled/${userId}`)
    const data = await response.json()
    return data.data
  }

  async updateScheduledReport(
    id: string,
    updates: Partial<ScheduledReport>
  ): Promise<ScheduledReport> {
    const response = await fetch(`${this.baseUrl}/scheduled/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    
    const data = await response.json()
    return data.data
  }

  async deleteScheduledReport(id: string): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${this.baseUrl}/scheduled/${id}`, {
      method: 'DELETE'
    })
    
    const data = await response.json()
    return data
  }

  // Collaboration
  async shareReport(
    reportId: string,
    collaborators: string[],
    permissions: 'view' | 'edit' | 'comment' = 'view'
  ): Promise<ReportCollaboration> {
    const response = await fetch(`${this.baseUrl}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportId,
        collaborators,
        permissions
      })
    })
    
    const data = await response.json()
    
    // Update cache
    this.collaborationCache.set(reportId, data.data)
    
    return data.data
  }

  async getReportCollaboration(reportId: string): Promise<ReportCollaboration> {
    if (this.collaborationCache.has(reportId)) {
      return this.collaborationCache.get(reportId)!
    }

    const response = await fetch(`${this.baseUrl}/collaboration/${reportId}`)
    const data = await response.json()
    
    this.collaborationCache.set(reportId, data.data)
    return data.data
  }

  async addComment(
    reportId: string,
    sectionId: string,
    content: string,
    userId: string
  ): Promise<Comment> {
    const response = await fetch(`${this.baseUrl}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportId,
        sectionId,
        content,
        userId
      })
    })
    
    const data = await response.json()
    return data.data
  }

  async getComments(reportId: string, sectionId?: string): Promise<Comment[]> {
    const params = new URLSearchParams()
    params.append('reportId', reportId)
    if (sectionId) params.append('sectionId', sectionId)

    const response = await fetch(`${this.baseUrl}/comments?${params}`)
    const data = await response.json()
    return data.data
  }

  // Version Control
  async createVersion(reportId: string, description: string): Promise<ReportVersion> {
    const response = await fetch(`${this.baseUrl}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportId,
        description
      })
    })
    
    const data = await response.json()
    return data.data
  }

  async getVersions(reportId: string): Promise<ReportVersion[]> {
    const response = await fetch(`${this.baseUrl}/versions/${reportId}`)
    const data = await response.json()
    return data.data
  }

  async restoreVersion(reportId: string, versionId: string): Promise<ReportBuilder> {
    const response = await fetch(`${this.baseUrl}/versions/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportId,
        versionId
      })
    })
    
    const data = await response.json()
    return data.data
  }

  // Validation
  async validateReport(report: ReportBuilder): Promise<ReportValidation> {
    const response = await fetch(`${this.baseUrl}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    })
    
    const data = await response.json()
    return data.data
  }

  // Utility Methods
  generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  calculateReportComplexity(sections: ReportSection[]): {
    score: number
    level: 'simple' | 'medium' | 'complex'
    factors: {
      dataSources: number
      charts: number
      filters: number
      computations: number
    }
  } {
    let dataSources = 0
    let charts = 0
    let filters = 0
    let computations = 0

    sections.forEach(section => {
      switch (section.type) {
        case 'chart':
          charts++
          if (section.dataSource?.type === 'api') dataSources++
          break
        case 'table':
          if (section.dataSource?.type === 'api') dataSources++
          if (section.dataSource?.filters) filters += section.dataSource.filters.length
          break
        case 'metric_cards':
          if (section.dataSource?.type === 'computed') computations++
          break
        default:
          if (section.dataSource?.type === 'api') dataSources++
      }
    })

    const score = (dataSources * 2) + (charts * 3) + (filters * 1) + (computations * 2)
    
    let level: 'simple' | 'medium' | 'complex'
    if (score <= 10) level = 'simple'
    else if (score <= 25) level = 'medium'
    else level = 'complex'

    return {
      score,
      level,
      factors: {
        dataSources,
        charts,
        filters,
        computations
      }
    }
  }

  estimateGenerationTime(report: ReportBuilder): {
    seconds: number
    complexity: 'fast' | 'medium' | 'slow'
  } {
    const complexity = this.calculateReportComplexity(report.sections || [])
    
    let baseTime = 5 // Base time in seconds
    let multiplier = 1
    
    switch (complexity.level) {
      case 'simple':
        multiplier = 1
        break
      case 'medium':
        multiplier = 2
        baseTime = 8
        break
      case 'complex':
        multiplier = 4
        baseTime = 15
        break
    }

    const seconds = baseTime * multiplier
    
    let complexityLevel: 'fast' | 'medium' | 'slow'
    if (seconds <= 10) complexityLevel = 'fast'
    else if (seconds <= 30) complexityLevel = 'medium'
    else complexityLevel = 'slow'

    return {
      seconds,
      complexity: complexityLevel
    }
  }

  // Cache Management
  clearCache(): void {
    this.templatesCache.clear()
    this.collaborationCache.clear()
  }

  // Error Handling
  private async handleApiError(response: Response): Promise<never> {
    const error = await response.json()
    throw new ReportBuilderError(error.code || 'BUILDER_ERROR', error.message || 'A report builder error occurred')
  }
}

// Custom Error Class
class ReportBuilderError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ReportBuilderError'
  }
}

// Singleton Instance
export const reportBuilderService = new ReportBuilderService()
export default reportBuilderService