// Analytics Service - Advanced Analytics API Integration
// Handles all analytics data fetching and processing

import { 
  AnalyticsResponse, 
  AdminAnalytics, 
  StudentAnalytics, 
  ReportTemplate,
  ExportConfig,
  ExportResult,
  ReportSchedule,
  AnalyticsTimeRange,
  RealTimeMetrics,
  PredictiveModel,
  MetricSelector,
  FilterConfig
} from './types'

class AnalyticsService {
  private baseUrl = '/api/analytics'
  private adminBaseUrl = '/api/admin/analytics'

  // Admin Analytics Endpoints
  async getSchoolAnalytics(timeRange: AnalyticsTimeRange): Promise<AnalyticsResponse<AdminAnalytics>> {
    const params = new URLSearchParams({
      timeRange: timeRange.type,
      start: timeRange.start.toISOString(),
      end: timeRange.end.toISOString()
    })

    const response = await fetch(`${this.adminBaseUrl}/overview?${params}`)
    return response.json()
  }

  async getClassPerformanceAnalytics(
    classId?: string, 
    timeRange?: AnalyticsTimeRange
  ): Promise<AnalyticsResponse<any>> {
    const params = new URLSearchParams()
    
    if (classId) params.append('classId', classId)
    if (timeRange) {
      params.append('timeRange', timeRange.type)
      params.append('start', timeRange.start.toISOString())
      params.append('end', timeRange.end.toISOString())
    }

    const response = await fetch(`${this.adminBaseUrl}/classes?${params}`)
    return response.json()
  }

  async getEngagementAnalytics(timeRange: AnalyticsTimeRange): Promise<AnalyticsResponse<any>> {
    const params = new URLSearchParams({
      timeRange: timeRange.type,
      start: timeRange.start.toISOString(),
      end: timeRange.end.toISOString()
    })

    const response = await fetch(`${this.adminBaseUrl}/engagement?${params}`)
    return response.json()
  }

  async getSubjectPerformanceAnalytics(timeRange: AnalyticsTimeRange): Promise<AnalyticsResponse<any>> {
    const params = new URLSearchParams({
      timeRange: timeRange.type,
      start: timeRange.start.toISOString(),
      end: timeRange.end.toISOString()
    })

    const response = await fetch(`${this.adminBaseUrl}/subtests?${params}`)
    return response.json()
  }

  // Student Analytics Endpoints
  async getStudentAnalytics(studentId: string, timeRange: AnalyticsTimeRange): Promise<AnalyticsResponse<StudentAnalytics>> {
    const params = new URLSearchParams({
      timeRange: timeRange.type,
      start: timeRange.start.toISOString(),
      end: timeRange.end.toISOString()
    })

    const response = await fetch(`${this.baseUrl}/student/${studentId}?${params}`)
    return response.json()
  }

  async getLearningPatterns(studentId?: string, classId?: string): Promise<AnalyticsResponse<any>> {
    const params = new URLSearchParams()
    if (studentId) params.append('studentId', studentId)
    if (classId) params.append('classId', classId)

    const response = await fetch(`${this.baseUrl}/patterns?${params}`)
    return response.json()
  }

  async getProgressTrends(
    studentId?: string,
    classId?: string,
    timeRange?: AnalyticsTimeRange
  ): Promise<AnalyticsResponse<any>> {
    const params = new URLSearchParams()
    if (studentId) params.append('studentId', studentId)
    if (classId) params.append('classId', classId)
    if (timeRange) {
      params.append('timeRange', timeRange.type)
      params.append('start', timeRange.start.toISOString())
      params.append('end', timeRange.end.toISOString())
    }

    const response = await fetch(`${this.baseUrl}/trends?${params}`)
    return response.json()
  }

  // Real-time Analytics
  async getRealTimeMetrics(): Promise<AnalyticsResponse<RealTimeMetrics>> {
    const response = await fetch(`${this.baseUrl}/realtime`)
    return response.json()
  }

  async subscribeToRealTimeUpdates(callback: (metrics: RealTimeMetrics) => void): Promise<void> {
    const eventSource = new EventSource(`${this.baseUrl}/realtime/stream`)
    
    eventSource.onmessage = (event) => {
      try {
        const metrics = JSON.parse(event.data)
        callback(metrics)
      } catch (error) {
        console.error('Error parsing real-time update:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('Real-time stream error:', error)
    }
  }

  // Predictive Analytics
  async getPredictiveModels(): Promise<AnalyticsResponse<PredictiveModel[]>> {
    const response = await fetch(`${this.baseUrl}/predictive/models`)
    return response.json()
  }

  async runPredictiveAnalysis(
    modelId: string,
    targetIds: string[],
    timeHorizon: string
  ): Promise<AnalyticsResponse<any>> {
    const response = await fetch(`${this.baseUrl}/predictive/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelId,
        targetIds,
        timeHorizon
      })
    })
    return response.json()
  }

  // Report Management
  async getReportTemplates(): Promise<AnalyticsResponse<ReportTemplate[]>> {
    const response = await fetch(`${this.baseUrl}/reports/templates`)
    return response.json()
  }

  async createReportTemplate(template: Omit<ReportTemplate, 'id' | 'createdAt'>): Promise<AnalyticsResponse<ReportTemplate>> {
    const response = await fetch(`${this.baseUrl}/reports/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    })
    return response.json()
  }

  async updateReportTemplate(
    id: string, 
    template: Partial<ReportTemplate>
  ): Promise<AnalyticsResponse<ReportTemplate>> {
    const response = await fetch(`${this.baseUrl}/reports/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    })
    return response.json()
  }

  async deleteReportTemplate(id: string): Promise<AnalyticsResponse<void>> {
    const response = await fetch(`${this.baseUrl}/reports/templates/${id}`, {
      method: 'DELETE'
    })
    return response.json()
  }

  // Report Generation & Export
  async generateReport(config: ExportConfig): Promise<AnalyticsResponse<ExportResult>> {
    const response = await fetch(`${this.baseUrl}/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    return response.json()
  }

  async getExportHistory(limit: number = 50): Promise<AnalyticsResponse<ExportResult[]>> {
    const response = await fetch(`${this.baseUrl}/reports/history?limit=${limit}`)
    return response.json()
  }

  async downloadReport(reportId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/reports/download/${reportId}`)
    if (!response.ok) {
      throw new Error(`Failed to download report: ${response.statusText}`)
    }
    return response.blob()
  }

  // Scheduled Reports
  async getScheduledReports(): Promise<AnalyticsResponse<ReportSchedule[]>> {
    const response = await fetch(`${this.baseUrl}/reports/scheduled`)
    return response.json()
  }

  async createScheduledReport(schedule: Omit<ReportSchedule, 'id'>): Promise<AnalyticsResponse<ReportSchedule>> {
    const response = await fetch(`${this.baseUrl}/reports/scheduled`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedule)
    })
    return response.json()
  }

  async updateScheduledReport(
    id: string, 
    schedule: Partial<ReportSchedule>
  ): Promise<AnalyticsResponse<ReportSchedule>> {
    const response = await fetch(`${this.baseUrl}/reports/scheduled/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedule)
    })
    return response.json()
  }

  async deleteScheduledReport(id: string): Promise<AnalyticsResponse<void>> {
    const response = await fetch(`${this.baseUrl}/reports/scheduled/${id}`, {
      method: 'DELETE'
    })
    return response.json()
  }

  // Data Export for Integration
  async exportDataForIntegration(
    format: 'JSON' | 'CSV' | 'Excel',
    filters: FilterConfig[],
    dateRange: AnalyticsTimeRange
  ): Promise<AnalyticsResponse<{ url: string; filename: string }>> {
    const response = await fetch(`${this.baseUrl}/export/integration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format,
        filters,
        dateRange
      })
    })
    return response.json()
  }

  // Analytics Configuration
  async getAvailableMetrics(): Promise<AnalyticsResponse<MetricSelector[]>> {
    const response = await fetch(`${this.baseUrl}/metrics/available`)
    return response.json()
  }

  async getMetricDefinition(metricId: string): Promise<AnalyticsResponse<MetricSelector>> {
    const response = await fetch(`${this.baseUrl}/metrics/${metricId}`)
    return response.json()
  }

  // Utility Methods
  createDefaultTimeRange(type: AnalyticsTimeRange['type']): AnalyticsTimeRange {
    const end = new Date()
    const start = new Date()
    
    switch (type) {
      case '7d':
        start.setDate(end.getDate() - 7)
        break
      case '30d':
        start.setDate(end.getDate() - 30)
        break
      case '90d':
        start.setDate(end.getDate() - 90)
        break
      case '365d':
        start.setFullYear(end.getFullYear() - 1)
        break
      default:
        start.setDate(end.getDate() - 30)
    }
    
    return { start, end, type }
  }

  async validateReportConfig(config: ExportConfig): Promise<AnalyticsResponse<{ valid: boolean; errors: string[] }>> {
    const response = await fetch(`${this.baseUrl}/reports/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    return response.json()
  }

  // Cache Management
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  private async getCachedData<T>(key: string): Promise<T | null> {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }
    return null
  }

  private setCachedData<T>(key: string, data: T, ttl: number = 300000): void { // 5 minutes default TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  // Error Handling
  private async handleApiError(response: Response): Promise<never> {
    const error = await response.json()
    throw new AnalyticsError(error.code || 'UNKNOWN_ERROR', error.message || 'An error occurred')
  }
}

// Custom Error Class
class AnalyticsError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'AnalyticsError'
  }
}

// Singleton Instance
export const analyticsService = new AnalyticsService()
export default analyticsService