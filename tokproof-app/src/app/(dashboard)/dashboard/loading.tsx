import { Sk, SkPageHeader, SkStatGrid, SkPageCard } from '@/components/shared/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="db-page">
      <div className="db-main">

        {/* Hero header */}
        <div className="db-hero">
          <div className="db-hero-top">
            <SkPageHeader mb={0} />
            {/* action buttons */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <Sk w={120} h={36} r={10} />
              <Sk w={100} h={36} r={10} style={{ opacity: .6 }} />
            </div>
          </div>
        </div>

        {/* Stats row */}
        <SkStatGrid cols={5} />

        {/* Banner / TikTok Rescue card */}
        <Sk h={88} r={16} mb={32} style={{ opacity: .7 }} />

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Sk w={150} h={17} r={6} />
          <Sk w={30} h={18} r={99} style={{ opacity: .55 }} />
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <Sk w={80} h={28} r={8} style={{ opacity: .5 }} />
            <Sk w={80} h={28} r={8} style={{ opacity: .4 }} />
          </div>
        </div>

        {/* Page cards grid */}
        <div className="db-grid">
          <SkPageCard />
          <SkPageCard />
          <SkPageCard />
        </div>

      </div>
    </div>
  )
}
