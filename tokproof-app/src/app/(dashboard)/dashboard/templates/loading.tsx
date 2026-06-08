import { Sk, SkTemplateCard } from '@/components/shared/Skeleton'

export default function TemplatesLoading() {
  return (
    <div className="db-page">
      <div className="db-main">

        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <Sk w={180} h={26} r={7} mb={8} />
          <Sk w={320} h={14} r={5} />
        </div>

        {/* Category filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28, flexWrap: 'wrap' }}>
          {[80, 100, 90, 110, 76].map((w, i) => (
            <Sk key={i} w={w} h={32} r={99} style={{ opacity: i === 0 ? 1 : 0.55 - i * 0.08 }} />
          ))}
        </div>

        {/* Featured label */}
        <Sk w={120} h={14} r={5} mb={16} style={{ opacity: .6 }} />

        {/* Template grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ opacity: 1 - i * 0.06 }}>
              <SkTemplateCard />
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
