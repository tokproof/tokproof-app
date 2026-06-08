import { Sk, SkPmTable } from '@/components/shared/Skeleton'

export default function EcommerceLoading() {
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
              <Sk w={180} h={20} r={7} />
              <Sk w={260} h={13} r={5} style={{ opacity: .6 }} />
            </div>
          </div>
          <Sk w={110} h={36} r={10} style={{ opacity: .8, flexShrink: 0 }} />
        </div>

        {/* Filter row */}
        <div className="pm-filters">
          <div style={{ display: 'flex', gap: 4, padding: 4, background: 'rgba(124,58,237,.07)', borderRadius: 8 }}>
            {[60, 80, 80].map((w, i) => (
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

        {/* Table */}
        <SkPmTable rows={4} />

      </div>
    </div>
  )
}
