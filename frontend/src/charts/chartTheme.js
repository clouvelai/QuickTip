// Shared chart theme constants for Recharts visualizations

export const COLORS = {
  accent: '#3b82f6',
  accentDark: '#1d4ed8',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
  amber: '#f59e0b',
  emerald: '#10b981',
  rose: '#ef4444',
  indigo: '#6366f1',
  pink: '#ec4899',
}

export const PALETTE = [
  COLORS.accent,
  COLORS.purple,
  COLORS.cyan,
  COLORS.amber,
  COLORS.emerald,
  COLORS.rose,
  COLORS.indigo,
  COLORS.pink,
]

export const POSITION_COLORS = {
  G: '#3b82f6',
  F: '#10b981',
  C: '#f59e0b',
  'G-F': '#8b5cf6',
  'F-G': '#8b5cf6',
  'F-C': '#06b6d4',
  'C-F': '#06b6d4',
}

export const TICK_STYLE = {
  fontSize: 11,
  fill: '#64748b',
  fontFamily: 'system-ui, -apple-system, sans-serif',
}

export const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#1f2937',
    border: '1px solid #1e293b',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#f1f5f9',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  itemStyle: { color: '#94a3b8' },
  labelStyle: { color: '#f1f5f9', fontWeight: 600 },
}

export const GRID_COLOR = '#1e293b'

export const ANIMATION = {
  duration: 800,
  easing: 'ease-out',
}

export function formatDollar(n) {
  if (n == null) return '-'
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}

export function formatDollarFull(n) {
  if (n == null) return '-'
  return '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })
}

export function formatStat(n) {
  if (n == null) return '-'
  return Number(n).toFixed(1)
}
