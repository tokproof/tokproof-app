import { Sk, SkPageHeader, SkKpiGrid, SkChart } from '@/components/shared/Skeleton'

export default function AnalyticsLoading() {
  return (
    <div className="db-page">
      <div className="db-main">

        {/* Page header + filter row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
          <SkPageHeader mb={0} />
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginTop: 4 }}>
            <Sk w={130} h={34} r={9} style={{ opacity: .6 }} />
            <Sk w={130} h={34} r={9} style={{ opacity: .5 }} />
          </div>
        </div>

        {/* KPI cards */}
        <SkKpiGrid cols={4} />

        {/* Main chart */}
        <SkChart h={260} />

        {/* Secondary row — funnel + mini chart */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)', padding: 20, boxShadow: 'var(--shadow-sm)',
          }}>
            <Sk w={120} h={14} r={5} mb={16} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[100, 72, 54, 38].map((pct, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Sk w={80} h={11} r={4} style={{ opacity: .6 }} />
                    <Sk w={36} h={11} r={4} style={{ opacity: .5 }} />
                  </div>
                  <Sk w={`${pct}%`} h={8} r={99} />
                </div>
              ))}
            </div>
          </div>
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)', padding: 20, boxShadow: 'var(--shadow-sm)',
          }}>
            <Sk w={120} h={14} r={5} mb={16} />
            <Sk h={160} r={10} style={{ opacity: .65 }} />
          </div>
        </div>

        {/* Pages table */}
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Sk w={140} h={15} r={5} />
          </div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '14px 20px',
              borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
            }}>
              <Sk w={28} h={28} r={7} style={{ flexShrink: 0, opacity: .5 }} />
              <Sk w="30%" h={13} r={5} />
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 20 }}>
                <Sk w={40} h={13} r={5} />
                <Sk w={40} h={13} r={5} />
                <Sk w={40} h={13} r={5} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
