import { MONTHS } from '../lib/utils'

export default function MonthFilter({ month, setMonth }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
      <span style={{ fontSize:12, color:'#888780' }}>Periode:</span>
      <select
        value={month ?? ''}
        onChange={e => setMonth(e.target.value === '' ? null : parseInt(e.target.value))}
        style={{ fontSize:13, padding:'4px 10px', borderRadius:8,
          border:'.5px solid #d3d1c7', background:'#fff' }}
      >
        <option value=''>Alle måneder</option>
        {MONTHS.map((m,i) => <option key={i} value={i}>{m}</option>)}
      </select>
      <span style={{ fontSize:12, color:'#888780', background:'#f1efe8',
        padding:'3px 10px', borderRadius:6 }}>
        {month === null ? 'Jan–Jun 2026' : `${MONTHS[month]} 2026`}
      </span>
    </div>
  )
}
