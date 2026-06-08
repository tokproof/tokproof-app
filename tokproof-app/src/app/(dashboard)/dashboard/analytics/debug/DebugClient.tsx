'use client'

import { useState, useCallback } from 'react'
import type { DebugPage } from './page'

const TARGET_EVENTS = [
  'page_view',
  'cta_click',
  'link_click',
  'direct_exit_view',
  'direct_exit_redirected',
] as const

type TargetEvent = typeof TARGET_EVENTS[number]

interface SendResult {
  eventType: TargetEvent
  status:    number
  ok:        boolean
  body:      unknown
  ts:        string
}

interface DBEvent {
  id:         string
  event_type: string
  page_id:    string
  session_id: string | null
  created_at: string
}

interface DBResult {
  events: DBEvent[]
  counts: Record<string, number>
  error?: string
  code?:  string
}

// Matrix entry per event type
type MatrixRow = {
  sent:     boolean
  status:   number | null
  inserted: boolean | null  // null = not checked yet
}

function getSessionId() {
  if (typeof window === 'undefined') return 'server'
  const KEY = 'tp_sid'
  let sid = localStorage.getItem(KEY)
  if (!sid) { sid = crypto.randomUUID(); localStorage.setItem(KEY, sid) }
  return sid
}

const C = {
  bg:    '#F7F5FD',
  card:  '#FFFFFF',
  ink:   '#171717',
  ink2:  '#6B7280',
  muted: '#9CA3AF',
  line:  'rgba(0,0,0,.08)',
  green: '#10B981',
  red:   '#EF4444',
  purple:'#7B61FF',
  pink:  '#F647A9',
}

export default function DebugClient({ pages, userId }: { pages: DebugPage[]; userId: string }) {
  const [selectedId, setSelectedId] = useState<string>(pages[0]?.id ?? '')
  const [loading, setLoading]       = useState<TargetEvent | null>(null)
  const [results, setResults]       = useState<SendResult[]>([])
  const [dbResult, setDbResult]     = useState<DBResult | null>(null)
  const [dbLoading, setDbLoading]   = useState(false)
  const [matrix, setMatrix]         = useState<Record<TargetEvent, MatrixRow>>(() =>
    Object.fromEntries(TARGET_EVENTS.map(e => [e, { sent: false, status: null, inserted: null }])) as Record<TargetEvent, MatrixRow>
  )

  const selectedPage = pages.find(p => p.id === selectedId)

  const sendEvent = useCallback(async (eventType: TargetEvent) => {
    if (!selectedId) return
    setLoading(eventType)
    const sessionId = getSessionId()
    const ts = new Date().toISOString()

    let status = 0
    let body: unknown = null
    let ok = false
    try {
      const res = await fetch('/api/track', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          pageId:    selectedId,
          eventType,
          sessionId,
          slug:      selectedPage?.username ?? null,
          metadata:  { source: 'debug_panel', referer: '' },
        }),
      })
      status = res.status
      ok     = res.ok
      body   = await res.json()
    } catch (err) {
      body = { fetchError: String(err) }
    }

    const result: SendResult = { eventType, status, ok, body, ts }
    setResults(prev => [result, ...prev.slice(0, 19)])

    // Check if inserted (body.inserted or body.skipped)
    const b = body as Record<string, unknown>
    const inserted = ok && (!!b?.inserted || b?.skipped === 'duplicate')

    setMatrix(prev => ({
      ...prev,
      [eventType]: { sent: true, status, inserted },
    }))

    setLoading(null)
  }, [selectedId, selectedPage])

  const checkDB = useCallback(async () => {
    if (!selectedId) return
    setDbLoading(true)
    try {
      const res = await fetch(`/api/debug/events?pageId=${selectedId}`)
      const json = await res.json()
      setDbResult(json)

      // Update matrix inserted status from DB
      if (json.counts) {
        setMatrix(prev => {
          const next = { ...prev }
          for (const ev of TARGET_EVENTS) {
            if (prev[ev].sent) {
              next[ev] = { ...prev[ev], inserted: (json.counts[ev] ?? 0) > 0 }
            }
          }
          return next
        })
      }
    } catch (err) {
      setDbResult({ events: [], counts: {}, error: String(err) })
    }
    setDbLoading(false)
  }, [selectedId])

  if (!pages.length) {
    return (
      <div style={{ padding: 32, fontFamily: 'Inter, sans-serif', color: C.ink }}>
        <h2>No pages found for this account.</h2>
        <p style={{ color: C.ink2 }}>Create and publish at least one page before testing analytics.</p>
      </div>
    )
  }

  const lastResult = results[0]

  return (
    <div style={{ padding: '24px 28px', fontFamily: 'Inter, sans-serif', color: C.ink, maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>Analytics Debug Panel</h1>
        <p style={{ fontSize: 13, color: C.ink2, margin: 0 }}>
          userId: <code style={{ background: '#F3F4F6', padding: '1px 6px', borderRadius: 4 }}>{userId}</code>
        </p>
      </div>

      {/* Page selector */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: C.ink2 }}>Página:</label>
        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.line}`,
            fontSize: 13, fontFamily: 'inherit', color: C.ink, background: C.card }}
        >
          {pages.map(p => (
            <option key={p.id} value={p.id}>
              {p.title ?? p.username ?? p.id.slice(0, 8)} — {p.id}
            </option>
          ))}
        </select>
      </div>

      {selectedPage && (
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 20, fontFamily: 'monospace',
          background: '#F3F4F6', borderRadius: 8, padding: '8px 12px' }}>
          pageId: {selectedId} | slug: {selectedPage.username ?? 'n/a'}
        </div>
      )}

      {/* Event buttons */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        {TARGET_EVENTS.map(ev => (
          <button
            key={ev}
            onClick={() => sendEvent(ev)}
            disabled={loading === ev}
            style={{
              padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: loading === ev ? '#E5E7EB' : 'linear-gradient(135deg,#F647A9,#7B61FF)',
              color: loading === ev ? C.muted : '#fff',
              fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
              opacity: loading !== null && loading !== ev ? 0.55 : 1,
              transition: 'opacity .15s',
            }}
          >
            {loading === ev ? '⏳ Sending…' : `Send ${ev}`}
          </button>
        ))}
        <button
          onClick={checkDB}
          disabled={dbLoading}
          style={{
            padding: '10px 16px', borderRadius: 10, border: `1.5px solid ${C.purple}`,
            background: '#F4F0FF', color: C.purple, fontSize: 13, fontWeight: 700,
            fontFamily: 'inherit', cursor: 'pointer',
            opacity: dbLoading ? 0.55 : 1,
          }}
        >
          {dbLoading ? '⏳ Checking…' : '🔍 Check DB'}
        </button>
      </div>

      {/* Last response */}
      {lastResult && (
        <div style={{ marginBottom: 24, background: C.card, border: `1px solid ${C.line}`,
          borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.line}`,
            display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>{lastResult.ok ? '✅' : '❌'}</span>
            <strong style={{ fontSize: 14 }}>{lastResult.eventType}</strong>
            <span style={{ fontSize: 13, color: lastResult.ok ? C.green : C.red, fontWeight: 700 }}>
              HTTP {lastResult.status}
            </span>
            <span style={{ fontSize: 11, color: C.muted, marginLeft: 'auto' }}>{lastResult.ts}</span>
          </div>
          <pre style={{
            margin: 0, padding: '12px 16px', fontSize: 12, lineHeight: 1.6,
            background: '#1E1E2E', color: '#CDD6F4', overflowX: 'auto',
            maxHeight: 240,
          }}>
            {JSON.stringify(lastResult.body, null, 2)}
          </pre>
        </div>
      )}

      {/* Matrix */}
      <div style={{ marginBottom: 24, background: C.card, border: `1px solid ${C.line}`,
        borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.line}`,
          fontSize: 14, fontWeight: 700 }}>
          Validation Matrix
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['Evento','Request enviada','HTTP Status','Insert en Supabase','Visible en DB'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left',
                  fontWeight: 600, color: C.ink2, fontSize: 12, whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TARGET_EVENTS.map(ev => {
              const row = matrix[ev]
              const dbCount = dbResult?.counts?.[ev] ?? null
              return (
                <tr key={ev} style={{ borderTop: `1px solid ${C.line}` }}>
                  <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 12,
                    fontWeight: 700, color: C.purple }}>
                    {ev}
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                    {row.sent ? '✅' : '—'}
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'center',
                    fontWeight: 700, color: row.status === 200 ? C.green : row.status ? C.red : C.muted }}>
                    {row.status ?? '—'}
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                    {row.inserted === null ? '—' : row.inserted ? '✅' : '❌'}
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                    {dbCount === null ? '—' : dbCount > 0
                      ? <span style={{ color: C.green, fontWeight: 700 }}>✅ {dbCount} row{dbCount > 1 ? 's' : ''}</span>
                      : <span style={{ color: C.red, fontWeight: 700 }}>❌ 0 rows</span>
                    }
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* DB events table */}
      {dbResult && (
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>
              Últimos eventos en analytics_events
            </span>
            <span style={{ fontSize: 12, color: C.muted }}>
              {dbResult.events.length} rows
            </span>
          </div>
          {dbResult.error ? (
            <div style={{ padding: 16, color: C.red, fontSize: 13 }}>
              ❌ {dbResult.error} {dbResult.code && `(code: ${dbResult.code})`}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    {['created_at','event_type','page_id','session_id','id'].map(h => (
                      <th key={h} style={{ padding: '8px 14px', textAlign: 'left',
                        fontWeight: 600, color: C.ink2, fontSize: 11, whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dbResult.events.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '20px 14px', textAlign: 'center',
                        color: C.red, fontWeight: 700 }}>
                        ❌ No rows found in analytics_events for this page_id
                      </td>
                    </tr>
                  ) : dbResult.events.map(e => (
                    <tr key={e.id} style={{ borderTop: `1px solid ${C.line}` }}>
                      <td style={{ padding: '8px 14px', color: C.ink2, whiteSpace: 'nowrap' }}>
                        {new Date(e.created_at).toLocaleTimeString()}
                      </td>
                      <td style={{ padding: '8px 14px', fontWeight: 700,
                        color: TARGET_EVENTS.includes(e.event_type as TargetEvent) ? C.purple : C.ink }}>
                        {e.event_type}
                      </td>
                      <td style={{ padding: '8px 14px', fontFamily: 'monospace', color: C.muted }}>
                        {e.page_id?.slice(0, 12)}…
                      </td>
                      <td style={{ padding: '8px 14px', fontFamily: 'monospace', color: C.muted }}>
                        {e.session_id ? e.session_id.slice(0, 12) + '…' : '(null)'}
                      </td>
                      <td style={{ padding: '8px 14px', fontFamily: 'monospace', color: C.muted, fontSize: 11 }}>
                        {e.id?.slice(0, 12)}…
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SQL hints */}
      <div style={{ marginTop: 24, background: '#1E1E2E', borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#CDD6F4', marginBottom: 10 }}>
          SQL para verificar en Supabase SQL Editor:
        </div>
        <pre style={{ margin: 0, fontSize: 12, color: '#A6E3A1', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
{`-- Conteo por event_type
SELECT event_type, count(*)
FROM analytics_events
WHERE page_id = '${selectedId}'
GROUP BY event_type;

-- Últimas 20 filas
SELECT id, event_type, session_id, created_at
FROM analytics_events
WHERE page_id = '${selectedId}'
ORDER BY created_at DESC
LIMIT 20;`}
        </pre>
      </div>

      {/* All results log */}
      {results.length > 1 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: C.ink2 }}>
            All sends ({results.length}):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {results.slice(1).map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10,
                background: C.card, border: `1px solid ${C.line}`, borderRadius: 8,
                padding: '8px 12px', fontSize: 12 }}>
                <span>{r.ok ? '✅' : '❌'}</span>
                <code style={{ color: C.purple, fontWeight: 700 }}>{r.eventType}</code>
                <span style={{ color: r.ok ? C.green : C.red }}>HTTP {r.status}</span>
                <span style={{ color: C.muted, marginLeft: 'auto' }}>{new Date(r.ts).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
