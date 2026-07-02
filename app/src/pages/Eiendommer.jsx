import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { fmt, MONTHS, moIdx } from '../lib/utils'
import { useFilter } from '../hooks/useFilter'
import MonthFilter from '../components/MonthFilter'
import Card from '../components/Card'
import DrillPanel from '../components/DrillPanel'

const PROPS = [
  { area:'Enebolig', icon:'🏠', color:'#185FA5' },
  { area:'Hytta',    icon:'🏔️', color:'#5DCAA5' },
  { area:'Båt',      icon:'⛵', color:'#EF9F27' },
]

const VIBB = [
  { m:'Jan', e:6444, h:3459 },
  { m:'Feb', e:6801, h:6618 },
  { m:'Mar', e:6862, h:4963 },
  { m:'Apr', e:3745, h:4368 },
  { m:'Mai', e:2812, h:2897 },
]

export default function Eiendommer({ tx }) {
  const { filtered, month, setMonth, nMnd } = useFilter(tx)
  const [drill, setDrill] = useState(null)

  const propData = (area) => {
    const subs = {}
    const byMo = Array(6).fill(0)
    filtered.filter(t=>t.area===area).forEach(t => {
      subs[t.subcat]=(subs[t.subcat]||0)+Math.abs(t.belop)
      const m=moIdx(t.dato); if(m>=0&&m<6) byMo[m]+=Math.abs(t.belop)
    })
    const total = Object.values(subs).reduce((s,v)=>s+v,0)
    return { subs:Object.entries(subs).sort((a,b)=>b[1]-a[1]), total, byMo }
  }

  const chartData = MONTHS.map((m,i) => {
    const row = { name:m }
    PROPS.forEach(p => {
      row[p.area] = Math.round(filtered.filter(t=>t.area===p.area&&moIdx(t.dato)===i)
        .reduce((s,t)=>s+Math.abs(t.belop),0))
    })
    return row
  })

  const vibbFiltered = month===null ? VIBB : VIBB.filter((_,i)=>i===month)
  const eTot = vibbFiltered.reduce((s,r)=>s+r.e,0)
  const hTot = vibbFiltered.reduce((s,r)=>s+r.h,0)

  return (
    <div>
      <MonthFilter month={month} setMonth={setMonth} />

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:14 }}>
        {PROPS.map(({ area, icon, color }) => {
          const { subs, total } = propData(area)
          return (
            <div key={area} style={{ background:'#fff', border:`.5px solid ${color}`,
              borderRadius:12, padding:16 }}>
              <div style={{ fontSize:14, fontWeight:500, color, marginBottom:3 }}>{icon} {area}</div>
              <div style={{ fontSize:12, color:'#888780', marginBottom:10 }}>
                Snitt {fmt(total/nMnd)}/mnd
              </div>
              <div style={{ fontSize:26, fontWeight:500, color, marginBottom:14 }}>{fmt(total)}</div>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <tbody>
                  {subs.map(([s,v]) => (
                    <tr key={s} onClick={()=>setDrill({area,subcat:s})}
                      style={{ cursor:'pointer', borderBottom:'.5px solid #f1efe8' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#f8f7f4'}
                      onMouseLeave={e=>e.currentTarget.style.background=''}>
                      <td style={{ padding:'5px 6px' }}>{s}</td>
                      <td style={{ padding:'5px 6px', textAlign:'right', fontWeight:500 }}>{fmt(v)}</td>
                      <td style={{ padding:'5px 6px', textAlign:'right',
                        color:'#888780', fontSize:11 }}>{fmt(v/nMnd)}/mnd</td>
                      <td style={{ color:'#d3d1c7', fontSize:12 }}>▶</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}
      </div>

      <Card title='Hjem / Hytte / Båt — månedlig utvikling'>
        <div style={{ display:'flex', gap:12, marginBottom:10, fontSize:12, color:'#5f5e5a' }}>
          {PROPS.map(p=>(
            <span key={p.area} style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ width:10, height:10, borderRadius:2, background:p.color, display:'inline-block' }}/>
              {p.icon} {p.area}
            </span>
          ))}
        </div>
        <ResponsiveContainer width='100%' height={220}>
          <BarChart data={chartData} barSize={14}>
            <XAxis dataKey='name' tick={{fontSize:11}} />
            <YAxis tickFormatter={v=>(v/1000).toFixed(0)+'k'} tick={{fontSize:11}} />
            <Tooltip formatter={v=>fmt(v)} />
            {PROPS.map(p=>(
              <Bar key={p.area} dataKey={p.area} fill={p.color} radius={[2,2,0,0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title='Strøm — Hjem vs. Hytte per måned'
        sub='Basert på Vibb-fakturaer (minste beløp = hytte)'>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr>{['Måned','Hjem','Hytte','Total'].map((h,i)=>(
              <th key={i} style={{ textAlign:i>0?'right':'left', padding:'7px 10px',
                fontWeight:500, fontSize:12, color:'#5f5e5a', borderBottom:'.5px solid #d3d1c7' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {vibbFiltered.map(r=>(
              <tr key={r.m} style={{ borderBottom:'.5px solid #f1efe8' }}>
                <td style={{ padding:'7px 10px' }}>{r.m}</td>
                <td style={{ padding:'7px 10px', textAlign:'right' }}>{fmt(r.e)}</td>
                <td style={{ padding:'7px 10px', textAlign:'right' }}>{fmt(r.h)}</td>
                <td style={{ padding:'7px 10px', textAlign:'right', fontWeight:500 }}>{fmt(r.e+r.h)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background:'#f8f7f4', borderTop:'.5px solid #d3d1c7', fontWeight:500 }}>
              <td style={{ padding:'7px 10px' }}>{month===null?'Snitt/mnd':'Total'}</td>
              <td style={{ padding:'7px 10px', textAlign:'right' }}>{fmt(month===null?eTot/5:eTot)}</td>
              <td style={{ padding:'7px 10px', textAlign:'right' }}>{fmt(month===null?hTot/5:hTot)}</td>
              <td style={{ padding:'7px 10px', textAlign:'right' }}>{fmt(month===null?(eTot+hTot)/5:(eTot+hTot))}</td>
            </tr>
          </tfoot>
        </table>
      </Card>

      {drill && (
        <DrillPanel area={drill.area} tx={filtered} onClose={()=>setDrill(null)} />
      )}
    </div>
  )
}
