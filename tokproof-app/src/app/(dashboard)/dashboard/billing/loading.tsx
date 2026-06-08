import { Sk, SkBillingCard } from '@/components/shared/Skeleton'

export default function BillingLoading() {
  return (
    <div className="db-page">
      <div className="db-main">

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Sk w={160} h={26} r={7} mb={8} />
          <Sk w={300} h={14} r={5} />
        </div>

        {/* Plan cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 20,
          maxWidth: 760,
          marginBottom: 32,
        }}>
          <SkBillingCard />
          <SkBillingCard />
        </div>

        {/* Current plan panel */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-xl)',
          padding: '24px 28px',
          marginBottom: 24,
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Sk w={40} h={40} r={11} style={{ flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Sk w={120} h={16} r={6} />
              <Sk w={200} h={12} r={5} style={{ opacity: .6 }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Sk w={120} h={36} r={9} />
            <Sk w={100} h={36} r={9} style={{ opacity: .5 }} />
          </div>
        </div>

        {/* Invoice table */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
            <Sk w={100} h={13} r={5} style={{ opacity: .5 }} />
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '14px 20px',
              borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
            }}>
              <Sk w={80} h={12} r={5} style={{ opacity: .65 }} />
              <Sk w={120} h={12} r={5} />
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
                <Sk w={60} h={22} r={99} />
                <Sk w={56} h={22} r={7} style={{ opacity: .5 }} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
