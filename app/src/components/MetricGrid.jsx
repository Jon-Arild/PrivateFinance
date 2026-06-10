export function MetricGrid({ children }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',
      gap:10, marginBottom:18 }}>
      {children}
    </div>
  )
}

export function Metric({ label, value, sub, color }) {
  return (
    <div style={{ background:'#f1efe8', borderRadius:8, padding:'12px 14px' }}>
      <div style={{ fontSize:11, color:'#5f5e5a', marginBottom:4,
        textTransform:'uppercase', letterSpacing:'.3px' }}>{label}</div>
      <div style={{ fontSize:18, fontWeight:500, color: color||'#1a1a1a' }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:'#888780', marginTop:2 }}>{sub}</div>}
    </div>
  )
}
