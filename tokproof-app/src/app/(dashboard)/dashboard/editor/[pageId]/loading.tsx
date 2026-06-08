import { Sk, SkPhonePreview } from '@/components/shared/Skeleton'

export default function EditorLoading() {
  return (
    <div className="ed-page">

      {/* Topbar */}
      <div className="ed-topbar">
        <Sk w={28} h={28} r={7} style={{ opacity: .5 }} />
        <Sk w={1} h={20} r={0} style={{ background: 'var(--border)', opacity: 1, margin: '0 4px' }} />
        <Sk w={160} h={28} r={7} style={{ opacity: .55 }} />
        <div className="ed-tb-r">
          <Sk w={80} h={30} r={9} style={{ opacity: .5 }} />
          <Sk w={100} h={30} r={9} />
        </div>
      </div>

      {/* Body */}
      <div className="ed-body">

        {/* Left sidebar */}
        <div className="ed-sb" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Tool tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
            <Sk w="33%" h={32} r={8} />
            <Sk w="33%" h={32} r={8} style={{ opacity: .6 }} />
            <Sk w="33%" h={32} r={8} style={{ opacity: .45 }} />
          </div>
          {/* Block items */}
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              opacity: 1 - (i * 0.08),
            }}>
              <Sk w={16} h={16} r={4} style={{ opacity: .4, flexShrink: 0 }} />
              <Sk w={16} h={16} r={4} style={{ flexShrink: 0 }} />
              <Sk w="55%" h={12} r={5} />
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                <Sk w={20} h={20} r={5} style={{ opacity: .4 }} />
                <Sk w={20} h={20} r={5} style={{ opacity: .3 }} />
              </div>
            </div>
          ))}
          {/* Add block button */}
          <Sk h={36} r={9} mt={4} style={{ opacity: .45 }} />
        </div>

        {/* Preview area */}
        <div className="ed-main">
          <div className="ed-preview-col">
            {/* Device toggle */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Sk w={88} h={28} r={7} style={{ opacity: .55 }} />
              <Sk w={220} h={28} r={7} style={{ opacity: .4 }} />
            </div>
            {/* Phone frame */}
            <SkPhonePreview />
          </div>
        </div>

      </div>
    </div>
  )
}
