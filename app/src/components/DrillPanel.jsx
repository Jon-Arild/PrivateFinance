import { useState, useMemo } from 'react'
import { fmt, MONTHS, AREA_ICONS, AREA_COLORS, moIdx } from '../lib/utils'

const ACC = { '64794':'Lønn','64808':'Regning','64743':'Spare','platinum':'Platinum','rammela':'Rammelån' }

// Nivå 1 — underkategorier
function SubcatList({ area, tx, onSelect, onClose }) {
  const subs = useMemo(() => {
    const m = {}
    tx.filter(t => t.area === area).forEach(t => {
      if (!m[t.subcat]) m[t.subcat] = { total:0, count:0 }
      m[t.subcat].total += Math.abs(t.belop)
      m[t.subcat].count++
    })
    return Object.entries(m).sort((a,b) => b[1].total - a[1].total)
  }, [area, tx])

  const total = subs.reduce((s,[,v]) => s+v.total, 0)
  const color = AREA_COLORS[area] || '#888'
  const icon  = AREA_ICONS[area]  || ''

  return (
    <div style={{ background:'#fff', border:`.5px solid ${color}`, borderRadius:12,
      marginBottom:14, overflow:'hidden' }}>
      <div style={{ padding:'11px 16px', background:color+'22',
        borderBottom:`.5px solid ${color}44`, display:'flex',
        alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:14, fontWeight:500 }}>
          {icon} {area} — {fmt(total)}
        </span>
        <span onClick={onClose} style={{ cursor:'pointer', color:'#888780', fontSize:20 }}>×</span>
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
        <thead>
          <tr>
            {['Underkategori','Antall','Total','Snitt/mnd',''].map((h,i) => (
              <th key={i} style={{ textAlign: i>0?'right':'left', padding:'7px 10px',
                fontWeight:500, fontSize:12, color:'#5f5e5a',
                borderBottom:'.5px solid #d3d1c7' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {subs.map(([s,v]) => (
            <tr key={s} onClick={() => onSelect(s)}
              style={{ cursor:'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background='#f8f7f4'}
              onMouseLeave={e => e.currentTarget.style.background=''}>
              <td style={{ padding:'7px 10px', fontWeight:500 }}>{s}</td>
              <td style={{ padding:'7px 10px', textAlign:'right', color:'#888780' }}>{v.count}</td>
              <td style={{ padding:'7px 10px', textAlign:'right', fontWeight:500 }}>{fmt(v.total)}</td>
              <td style={{ padding:'7px 10px', textAlign:'right', color:'#888780', fontSize:12 }}>{fmt(v.total/6)}/mnd</td>
              <td style={{ padding:'7px 10px', color:'#d3d1c7' }}>▶</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ background:'#f8f7f4', borderTop:'.5px solid #d3d1c7' }}>
            <td style={{ padding:'6px 10px', fontWeight:500, fontSize:12 }}>Totalt</td>
            <td style={{ padding:'6px 10px', textAlign:'right', fontSize:12, color:'#888780' }}>
              {subs.reduce((s,[,v])=>s+v.count,0)}
            </td>
            <td style={{ padding:'6px 10px', textAlign:'right', fontWeight:500, fontSize:12 }}>{fmt(total)}</td>
            <td style={{ padding:'6px 10px', textAlign:'right', fontSize:12, color:'#888780' }}>{fmt(total/6)}/mnd</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// Nivå 2 — transaksjoner
function TxList({ area, subcat, tx, onBack, onClose }) {
  const [search, setSearch] = useState('')
  const [mo, setMo]         = useState('')
  const [acc, setAcc]       = useState('')

  const color = AREA_COLORS[area] || '#888'
  const icon  = AREA_ICONS[area]  || ''

  const rows = useMemo(() => {
    return tx
      .filter(t => t.area === area && t.subcat === subcat)
      .filter(t => !search || t.beskrivelse.toLowerCase().includes(search.toLowerCase()))
      .filter(t => mo === '' || moIdx(t.dato) === parseInt(mo))
      .filter(t => !acc || t.konto_id === acc)
      .sort((a,b) => b.dato.localeCompare(a.dato))
  }, [area, subcat, tx, search, mo, acc])

  const total = rows.reduce((s,t) => s+Math.abs(t.belop), 0)

  return (
    <div style={{ background:'#fff', border:`.5px solid ${color}`, borderRadius:12,
      marginBottom:14, overflow:'hidden' }}>
      <div style={{ padding:'11px 16px', background:color+'22',
        borderBottom:`.5px solid ${color}44`, display:'flex',
        alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
        <span style={{ fontSize:14, fontWeight:500, display:'flex', alignItems:'center', gap:8 }}>
          <span onClick={onBack}
            style={{ cursor:'pointer', color:'#185FA5', fontSize:13, fontWeight:400 }}>
            ← {icon} {area}
          </span>
          {subcat} — {fmt(total)}
        </span>
        <span onClick={onClose} style={{ cursor:'pointer', color:'#888780', fontSize:20 }}>×</span>
      </div>
      <div style={{ padding:'8px 16px', borderBottom:'.5px solid #f1efe8',
        display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder='Søk beskrivelse...'
          style={{ fontSize:12, padding:'4px 8px', borderRadius:6,
            border:'.5px solid #d3d1c7', width:170 }} />
        <select value={mo} onChange={e=>setMo(e.target.value)}
          style={{ fontSize:12, padding:'4px 8px', borderRadius:6, border:'.5px solid #d3d1c7' }}>
          <option value=''>Alle måneder</option>
          {MONTHS.map((m,i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select value={acc} onChange={e=>setAcc(e.target.value)}
          style={{ fontSize:12, padding:'4px 8px', borderRadius:6, border:'.5px solid #d3d1c7' }}>
          <option value=''>Alle kontoer</option>
          {Object.entries(ACC).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <span style={{ fontSize:12, color:'#888780' }}>{rows.length} transaksjoner · {fmt(total)}</span>
      </div>
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
          <thead>
            <tr>{['Dato','Beskrivelse','Beløp'].map((h,i) => (
              <th key={i} style={{ textAlign:i===2?'right':'left', padding:'7px 10px',
                fontWeight:500, color:'#5f5e5a', borderBottom:'.5px solid #d3d1c7' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {rows.map((t,i) => (
              <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#f8f7f4'}
                onMouseLeave={e=>e.currentTarget.style.background=''}>
                <td style={{ padding:'6px 10px', color:'#888780', whiteSpace:'nowrap' }}>
                  {t.dato.slice(5).replace('-','.')}
                </td>
                <td style={{ padding:'6px 10px' }}>
                  {t.beskrivelse.slice(0,55)}{t.beskrivelse.length>55?'…':''}
                  <span style={{ display:'inline-block', fontSize:10, padding:'1px 5px',
                    borderRadius:3, background:'#f1efe8', color:'#888780', marginLeft:4 }}>
                    {ACC[t.konto_id]||t.konto_id}
                  </span>
                </td>
                <td style={{ padding:'6px 10px', textAlign:'right',
                  color:'#A32D2D', fontWeight:500 }}>
                  {fmt(t.belop)}
                </td>
              </tr>
            ))}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr style={{ background:'#f8f7f4' }}>
                <td colSpan={2} style={{ padding:'6px 10px', fontWeight:500, fontSize:12 }}>Sum</td>
                <td style={{ padding:'6px 10px', textAlign:'right', fontWeight:500, fontSize:12 }}>{fmt(total)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}

// Eksportert DrillPanel
export default function DrillPanel({ area, tx, onClose }) {
  const [subcat, setSubcat] = useState(null)
  if (!area) return null
  if (subcat) return (
    <TxList area={area} subcat={subcat} tx={tx}
      onBack={() => setSubcat(null)} onClose={onClose} />
  )
  return (
    <SubcatList area={area} tx={tx}
      onSelect={setSubcat} onClose={onClose} />
  )
}
