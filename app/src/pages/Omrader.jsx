export default function Omrader({ tx }) {
  return (
    <div>
      <h2 style={{ fontSize:18, fontWeight:500, marginBottom:12 }}>Omrader</h2>
      <p style={{ color:'#888780', fontSize:13 }}>{tx.length} transaksjoner lastet — bygges ut neste steg</p>
    </div>
  )
}
