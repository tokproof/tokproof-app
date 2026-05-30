const KEY = 'tp_sid'

/** Returns a stable session ID for this browser, creating one if needed. */
export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sid = localStorage.getItem(KEY)
  if (!sid) {
    sid = crypto.randomUUID()
    localStorage.setItem(KEY, sid)
  }
  return sid
}
