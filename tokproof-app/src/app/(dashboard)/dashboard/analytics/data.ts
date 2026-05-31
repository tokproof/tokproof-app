// ─── Types ────────────────────────────────────────────────────────────────────

export type Tint = 'purple' | 'pink' | 'blue' | 'green'

export interface KpiItem {
  label:      string
  val:        string
  delta:      string
  tint:       Tint
  sparkColor: string
  sparkSeed:  number
  icoPath:    string
}

export interface FunnelItem {
  label:   string
  val:     string
  bg:      string   // background gradient for fcard
  barGrad: string
  icoSvg:  string
  drop?:   string   // drop% to next step (undefined for last item)
}

export interface Country {
  flag: string
  name: string
  pct:  number
}

export interface Device {
  name:  string
  color: string
  pct:   number
}

export interface TrafficSource {
  name:     string
  pct:      number
  barWidth: number
  iconBg:   string
  iconSvg:  string
}

export interface ChartSeries {
  color: string
  label: string
  data:  number[]
}

export interface PageRow {
  name:     string
  url:      string
  gradient: string
  cols:     string[]
}

// ─── KPI Data ────────────────────────────────────────────────────────────────

export const KPI_DATA: KpiItem[] = [
  {
    label: 'Landing Views', val: '12.4K', delta: '18.2%',
    tint: 'purple', sparkColor: '#8B5CF6', sparkSeed: 11,
    icoPath: '<circle cx="12" cy="12" r="3"/><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>',
  },
  {
    label: 'Visitantes únicos', val: '9.1K', delta: '16.7%',
    tint: 'purple', sparkColor: '#8B5CF6', sparkSeed: 48,
    icoPath: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 4.5a3.2 3.2 0 0 1 0 6.3"/><path d="M21 20c0-2.5-1.4-4.6-3.5-5.4"/>',
  },
  {
    label: 'Clicks', val: '3.8K', delta: '22.6%',
    tint: 'pink', sparkColor: '#F43F6B', sparkSeed: 85,
    icoPath: '<path d="M5 4l6.5 15 2-6 6-2z"/>',
  },
  {
    label: 'CTR', val: '30.6%', delta: '14.5%',
    tint: 'blue', sparkColor: '#3B82F6', sparkSeed: 122,
    icoPath: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
  },
  {
    label: 'Rescue Rate', val: '72.8%', delta: '12.1%',
    tint: 'green', sparkColor: '#16B368', sparkSeed: 159,
    icoPath: '<path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>',
  },
  {
    label: 'Exit Guide Views', val: '8.4K', delta: '19.3%',
    tint: 'purple', sparkColor: '#8B5CF6', sparkSeed: 196,
    icoPath: '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/>',
  },
  {
    label: 'Open Browser Clicks', val: '6.1K', delta: '21.7%',
    tint: 'pink', sparkColor: '#F43F6B', sparkSeed: 233,
    icoPath: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/>',
  },
]

// ─── Funnel Data ──────────────────────────────────────────────────────────────

export const FUNNEL_DATA: FunnelItem[] = [
  {
    label: 'TikTok Clicks',
    val: '12.430',
    bg: 'linear-gradient(180deg,#FFEAF3,#FFF5F9)',
    barGrad: 'linear-gradient(90deg,#FB2C7D,#F35BA6)',
    icoSvg: '<path d="M16.5 5.5c1 1.2 2.3 2 3.9 2.1v3c-1.6 0-3.1-.5-4.4-1.4v6.3a5.5 5.5 0 1 1-5.5-5.5c.3 0 .6 0 .9.1v3.1a2.5 2.5 0 1 0 1.7 2.4V2.5h3.1c.1 1.1.5 2.1 1.3 3z" fill="#111"/>',
    drop: '-32.3%',
  },
  {
    label: 'Exit Guide Views',
    val: '8.412',
    bg: 'linear-gradient(180deg,#F0EBFC,#FAF8FE)',
    barGrad: 'linear-gradient(90deg,#8B5CF6,#A78BFA)',
    icoSvg: '<path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" stroke="#8B5CF6" fill="none" stroke-width="2"/><polyline points="9 12 11.5 14.5 16 9.5" stroke="#8B5CF6" fill="none" stroke-width="2"/>',
    drop: '-27.2%',
  },
  {
    label: 'Open Browser Clicks',
    val: '6.121',
    bg: 'linear-gradient(180deg,#E9F1FE,#F7FAFE)',
    barGrad: 'linear-gradient(90deg,#3B82F6,#6AA4F8)',
    icoSvg: '<path d="M14 4h6v6" stroke="#3B82F6" fill="none" stroke-width="2"/><path d="M20 4l-9 9" stroke="#3B82F6" fill="none" stroke-width="2"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" stroke="#3B82F6" fill="none" stroke-width="2"/>',
    drop: '-2.2%',
  },
  {
    label: 'Landing Views',
    val: '5.983',
    bg: 'linear-gradient(180deg,#E4F7EC,#F6FCF8)',
    barGrad: 'linear-gradient(90deg,#16B368,#3FCE86)',
    icoSvg: '<circle cx="12" cy="12" r="9" stroke="#16B368" fill="none" stroke-width="2"/><polyline points="8.5 12 11 14.5 15.5 9.5" stroke="#16B368" fill="none" stroke-width="2"/>',
  },
]

// ─── Countries ────────────────────────────────────────────────────────────────

export const COUNTRIES: Country[] = [
  { flag: '🇲🇽', name: 'México',    pct: 34 },
  { flag: '🇪🇸', name: 'España',    pct: 17 },
  { flag: '🇦🇷', name: 'Argentina', pct: 11 },
  { flag: '🇨🇱', name: 'Chile',     pct:  8 },
  { flag: '🇨🇴', name: 'Colombia',  pct:  6 },
]

// ─── Devices ──────────────────────────────────────────────────────────────────

export const DEVICES: Device[] = [
  { name: 'iPhone',  color: '#FB2C7D', pct: 72 },
  { name: 'Android', color: '#7C3AED', pct: 24 },
  { name: 'Desktop', color: '#3B82F6', pct:  4 },
]

// ─── Traffic Sources ─────────────────────────────────────────────────────────

export const SOURCES: TrafficSource[] = [
  {
    name: 'TikTok', pct: 81, barWidth: 100,
    iconBg: '#111',
    iconSvg: '<path d="M16.5 5.5c1 1.2 2.3 2 3.9 2.1v3c-1.6 0-3.1-.5-4.4-1.4v6.3a5.5 5.5 0 1 1-5.5-5.5c.3 0 .6 0 .9.1v3.1a2.5 2.5 0 1 0 1.7 2.4V2.5h3.1c.1 1.1.5 2.1 1.3 3z" fill="#fff"/>',
  },
  {
    name: 'Instagram', pct: 12, barWidth: 15,
    iconBg: 'linear-gradient(45deg,#F58529,#DD2A7B,#8134AF)',
    iconSvg: '<rect x="3" y="3" width="18" height="18" rx="5" stroke="#fff" fill="none" stroke-width="2"/><circle cx="12" cy="12" r="4" stroke="#fff" fill="none" stroke-width="2"/><circle cx="17" cy="7" r="1" fill="#fff"/>',
  },
  {
    name: 'YouTube', pct: 4, barWidth: 7,
    iconBg: '#FF0000',
    iconSvg: '<path d="M3 8.5c.2-1.6 1-2.4 2.6-2.6C7.5 5.6 12 5.6 12 5.6s4.5 0 6.4.3c1.6.2 2.4 1 2.6 2.6.2 1.4.2 3.5.2 3.5s0 2.1-.2 3.5c-.2 1.6-1 2.4-2.6 2.6-1.9.3-6.4.3-6.4.3s-4.5 0-6.4-.3c-1.6-.2-2.4-1-2.6-2.6C2.8 14.1 2.8 12 2.8 12s0-2.1.2-3.5z" fill="#fff"/><polygon points="10,9 16,12 10,15" fill="#FF0000"/>',
  },
  {
    name: 'Directo', pct: 2, barWidth: 4,
    iconBg: '#EEF0F4',
    iconSvg: '<circle cx="12" cy="12" r="9" stroke="#8B90A0" fill="none" stroke-width="2"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" stroke="#8B90A0" fill="none" stroke-width="2"/>',
  },
  {
    name: 'Otros', pct: 1, barWidth: 2,
    iconBg: '#EEF0F4',
    iconSvg: '<circle cx="6" cy="12" r="1" fill="#8B90A0"/><circle cx="12" cy="12" r="1" fill="#8B90A0"/><circle cx="18" cy="12" r="1" fill="#8B90A0"/>',
  },
]

// ─── Performance Chart ────────────────────────────────────────────────────────

export const CHART_DAYS = ['12 May', '13 May', '14 May', '15 May', '16 May', '17 May', '18 May']

export const CHART_SERIES: ChartSeries[] = [
  { color: '#F62E8E', label: 'Landing Views',        data: [4.3, 5.6, 5.0, 6.6, 8.3, 9.9, 8.6] },
  { color: '#8B5CF6', label: 'Clicks',               data: [3.0, 3.7, 3.4, 4.1, 4.9, 6.0, 4.5] },
  { color: '#3B82F6', label: 'Open Browser Clicks',  data: [1.6, 2.0, 1.9, 2.3, 2.6, 3.1, 1.9] },
]

export const CHART_MAX = 10

// ─── Pages Table ─────────────────────────────────────────────────────────────

export const TABLE_HEADERS = [
  'Página', 'Landing Views', 'Visitantes únicos', 'Clicks',
  'CTR', 'Rescue Rate', 'Exit Guide Views', 'Open Browser Clicks',
]

export const TABLE_ROWS: PageRow[] = [
  {
    name: 'RevHair', url: '/revhair',
    gradient: 'linear-gradient(135deg,#F9A8C9,#C084FC)',
    cols: ['4.892', '3.462', '1.532', '31.3%', '75.2%', '3.420', '1.156'],
  },
  {
    name: 'Pet Product', url: '/pet-product',
    gradient: 'linear-gradient(135deg,#FCD34D,#FB923C)',
    cols: ['3.214', '2.341', '923', '28.7%', '71.4%', '2.210', '658'],
  },
  {
    name: 'Beauty Product', url: '/beauty-product',
    gradient: 'linear-gradient(135deg,#F472B6,#A78BFA)',
    cols: ['2.101', '1.543', '611', '29.0%', '69.8%', '1.655', '452'],
  },
  {
    name: 'Creator Links', url: '/creator-links',
    gradient: 'linear-gradient(135deg,#93C5FD,#C4B5FD)',
    cols: ['1.243', '932', '412', '33.1%', '76.9%', '1.120', '315'],
  },
]
