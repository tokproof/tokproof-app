import { Sk, SkPmTable } from '@/components/shared/Skeleton'

export default function PersonalBrandLoading() {
  return (
    <div className="pm-page">
      <div className="pm-main">

        {/* Header */}
        <div className="pm-header">
          <div className="pm-header-left">
            <div className="pm-header-icon">
              <Sk w={52} h={52} r={14} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Sk w={200} h={20} r={7} />
              <Sk w={280} h={13} r={5} style={{ opacity: .6 }} />
            </div>
          </div>
          <Sk w={130} h={36} r={10} style={{ opacity: .8, flexShrink: 0 }} />
        </div>

        {/* Filter row */}
        <div className="pm-filters">
          <div style={{ display: 'flex', gap: 4, padding: 4, background: 'rgba(124,58,237,.07)', borderRadius: 8 }}>
            {[60, 90, 80].map((w, i) => (
              <Sk key={i} w={w} h={26} r={6} style={{ opacity: i === 0 ? .9 : .55 }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4, padding: 4, background: 'rgba(124,58,237,.07)', borderRadius: 8 }}>
            {[60, 80, 70].map((w, i) => (
              <Sk key={i} w={w} h={26} r={6} style={{ opacity: i === 0 ? .9 : .55 }} />
            ))}
          </div>
          <Sk w={180} h={34} r={9} style={{ marginLeft: 'auto', opacity: .6 }} />
        </div>

        {/* Table — personal brand has no score column */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {/* header */}
          <div style={{
            display: 'flex', padding: '0 20px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg)',
          }}>
            {[220, 100, 90, 0, 150, 36].map((w, i) => (
              i === 3 ? null :
              <div key={i} style={{ flex: i === 0 ? '2.2 0 0' : `0 0 ${w}px`, padding: '12px 12px 12px 0' }}>
                <Sk w={i === 0 ? 50 : 34} h={10} r={4} style={{ opacity: .45 }} />
              </div>
            ))}
          </div>
          {[1, 2, 3, 4].map((_, r) => (
            <div key={r} style={{
              display: 'flex', alignItems: 'center',
              padding: '0 20px',
              borderBottom: r < 3 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ flex: '2.2 0 0', padding: '14px 12px 14px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                <Sk w={60} h={76} r={10} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Sk w="80%" h={13} r={5} />
                  <Sk w="55%" h={10} r={4} />
                  <Sk w="40%" h={9} r={4} style={{ opacity: .55 }} />
                </div>
              </div>
              <div style={{ flex: '0 0 100px', padding: '14px 12px 14px 0' }}><Sk w={72} h={22} r={6} /></div>
              <div style={{ flex: '0 0 90px', padding: '14px 12px 14px 0' }}><Sk w={64} h={22} r={99} /></div>
              <div style={{ flex: '0 0 150px', padding: '14px 12px 14px 0', display: 'flex', flexDirection: 'column', gap: 5 }}>
                <Sk w="70%" h={12} r={5} />
                <Sk w="50%" h={10} r={4} style={{ opacity: .55 }} />
              </div>
              <div style={{ flex: '0 0 36px' }}><Sk w={28} h={28} r={7} style={{ opacity: .4 }} /></div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
