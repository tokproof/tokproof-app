import { Sk, SkSettingsPanel } from '@/components/shared/Skeleton'

export default function SettingsLoading() {
  return (
    <div className="db-page">
      <div className="db-main">

        {/* Page header */}
        <div className="db-hero">
          <Sk w={120} h={26} r={7} mb={8} />
          <Sk w={280} h={14} r={5} mb={32} />
        </div>

        {/* Profile card */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-xl)',
          padding: '30px 34px',
          display: 'flex',
          gap: 0,
          marginBottom: 24,
          boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Avatar col */}
          <div style={{
            width: 200, flexShrink: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            paddingRight: 30,
            borderRight: '1px solid var(--border)',
          }}>
            <Sk w={118} h={118} r="50%" mb={16} />
            <Sk w={120} h={32} r={10} mb={10} style={{ opacity: .7 }} />
            <Sk w={80} h={11} r={5} style={{ opacity: .5 }} />
          </div>
          {/* Fields grid */}
          <div style={{
            flex: 1, display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '22px 40px',
            paddingLeft: 34,
          }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i}>
                <Sk w={80} h={10} r={4} mb={6} style={{ opacity: .5 }} />
                <Sk h={38} r={10} />
              </div>
            ))}
            <div style={{ gridColumn: '1' }}>
              <Sk w={120} h={38} r={10} style={{ opacity: .8 }} />
            </div>
          </div>
        </div>

        {/* 3-column panels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginBottom: 24 }}>
          <SkSettingsPanel rows={4} />
          <SkSettingsPanel rows={2} />
          <SkSettingsPanel rows={3} />
        </div>

        {/* 2-column bottom row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 24, marginBottom: 52 }}>
          <SkSettingsPanel rows={1} />
          <SkSettingsPanel rows={1} />
        </div>

      </div>
    </div>
  )
}
