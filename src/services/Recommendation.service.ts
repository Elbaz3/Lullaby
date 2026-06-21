import { apiRequest, ServerResponse } from './api'

// ── Types ─────────────────────────────────────

export interface CryAnalysis {
  type: string // e.g. 'hungry', 'pain', 'tired'
  intensity: number // 0–1
  confidence: number
}

export interface HistoryAnalysis {
  patternDetected: boolean
  repeatedIssue: string | null
  timeSinceLastSimilar: string | null
  frequencyLast24h: number
}

export interface Priority {
  level: number // 0 = routine, 1 = moderate, 2 = urgent
  name: string // e.g. 'روتيني'
}

export interface Recommendation {
  infantId: string
  infantName: string
  recommendation: string
  priority: Priority
  action: string
  reason: string
  confidence: number
  vitalsSummary: string
  cryAnalysis: CryAnalysis
  historyAnalysis: HistoryAnalysis
  timestamp: string
}

// ── Service ───────────────────────────────────

export const recommendationService = {
  /**
   * GET /api/recommendation
   * Auth: Bearer token (handled by apiRequest automatically)
   */
  getRecommendation: (): Promise<ServerResponse<Recommendation>> =>
    apiRequest<Recommendation>('/recommendation')
}
