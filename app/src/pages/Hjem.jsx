export default function Hjem({ tx }) {
  return (
    <div>
      <h2 style={{ fontSize:18, fontWeight:500, marginBottom:12 }}>Hjem</h2>
      <p style={{ color:'#888780', fontSize:13 }}>{tx.length} transaksjoner lastet — bygges ut neste steg</p>
    </div>
  )
}
