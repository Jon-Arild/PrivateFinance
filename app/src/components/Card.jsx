export default function Card({ title, sub, children, style }) {
  return (
    <div style={{ background:'#fff', border:'.5px solid #d3d1c7',
      borderRadius:12, padding:16, marginBottom:14, ...style }}>
      {title && <div style={{ fontSize:14, fontWeight:500, color:'#5f5e5a', marginBottom:sub?3:12 }}>{title}</div>}
      {sub   && <div style={{ fontSize:12, color:'#888780', marginBottom:12 }}>{sub}</div>}
      {children}
    </div>
  )
}
