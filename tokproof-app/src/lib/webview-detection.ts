export interface WebViewInfo {
  isTikTokWebView: boolean
  isInstagramWebView: boolean
  isFacebookWebView: boolean
  isMobile: boolean
  browserName: string
}

export function detectWebView(): WebViewInfo {
  if (typeof navigator === 'undefined') {
    return { isTikTokWebView: false, isInstagramWebView: false, isFacebookWebView: false, isMobile: false, browserName: 'server' }
  }
  const ua = navigator.userAgent
  const ref = typeof document !== 'undefined' ? document.referrer : ''
  const isTikTokWebView = /TikTok|musical_ly|BytedanceWebview|ByteLocale|com\.zhiliaoapp/i.test(ua) || /tiktok\.com/i.test(ref)
  const isInstagramWebView = /Instagram/i.test(ua)
  const isFacebookWebView = /FBAN|FBAV|FB_IAB|FB4A/i.test(ua)
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua)
  let browserName = 'unknown'
  if (isTikTokWebView) browserName = 'TikTok'
  else if (isInstagramWebView) browserName = 'Instagram'
  else if (isFacebookWebView) browserName = 'Facebook'
  else if (/SamsungBrowser/i.test(ua)) browserName = 'Samsung'
  else if (/Firefox/i.test(ua)) browserName = 'Firefox'
  else if (/Edg/i.test(ua)) browserName = 'Edge'
  else if (/Chrome/i.test(ua)) browserName = 'Chrome'
  else if (/Safari/i.test(ua)) browserName = 'Safari'
  return { isTikTokWebView, isInstagramWebView, isFacebookWebView, isMobile, browserName }
}
