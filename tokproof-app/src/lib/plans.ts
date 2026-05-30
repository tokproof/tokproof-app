export type Plan = 'free' | 'pro'

export interface PlanLimits {
  maxQuickExits: number
  maxPublishedPages: number
  canRemoveBranding: boolean
  canUsePremiumBlocks: boolean
  canUsePremiumTemplates: boolean
  canUseAdvancedAnalytics: boolean
}

const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    maxQuickExits:            1,
    maxPublishedPages:        1,
    canRemoveBranding:        false,
    canUsePremiumBlocks:      false,
    canUsePremiumTemplates:   false,
    canUseAdvancedAnalytics:  false,
  },
  pro: {
    maxQuickExits:            Infinity,
    maxPublishedPages:        Infinity,
    canRemoveBranding:        true,
    canUsePremiumBlocks:      true,
    canUsePremiumTemplates:   true,
    canUseAdvancedAnalytics:  true,
  },
}

export function getUserPlan(profile: { plan?: string | null } | null | undefined): Plan {
  return profile?.plan === 'pro' ? 'pro' : 'free'
}

export function isProUser(profile: { plan?: string | null } | null | undefined): boolean {
  return getUserPlan(profile) === 'pro'
}

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan]
}
