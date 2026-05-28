export * from './database'

export interface SafeScoreResult {
  score: number
  label: 'Excellent' | 'Medium' | 'Risky'
  checks: SafeScoreCheck[]
}

export interface SafeScoreCheck {
  id: string
  label: string
  passed: boolean
  warning?: string
}

export interface OnboardingState {
  username: string
  displayName: string
  pageType: 'trust' | 'simple'
  templateId: string | null
}
