import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { fmt, MONTHS, moIdx } from '../lib/utils'
import { useKategorier } from '../hooks/useKategorier'
import { useFilter } from '../hooks/useFilter'
import MonthFilter from '../components/MonthFilter'
import Card from '../components/Card'
import { MetricGrid, Metric } from '../components/MetricGrid'
import DrillPanel from '../components/DrillPanel'

const fmtK = v => (Math.abs(v)/1000).toFixed(0)+'k'

export default function Hjem({ tx }) {
  const { filtered, filteredInc, month, setMonth, nMnd } = useFilter(tx)
  const { colorMap, iconMap } = useKategorier()
  const [drill, setDrill] = useState(null)

  // Inntekt per måned (fra transaksjoner)
  const incMo = useMemo(() => {
    const r = Array(6).fill(0)
    tx.filter(t => t.belop > 0 && t.area === 'Inntekt')
      .forEach(t => { const m = moIdx(t.dato); if(m>=0&&m<6) r[m]+=t.belop })
    return r
  }, [tx])

  // Forbruk per måned
  const expMo = useMemo(() => {
    const r = Array(6).fill(0)
    tx.filter(t => t.belop < 0 && t.area !== 'Inntekt')
      .forEach(t => { const m = moIdx(t.dato); if(m>=0&&m<6) r[m]+=Math.abs(t.belop) })
    return r
  }, [tx])

  const activeMos = month === null ? [0,1,2,3,4,5] : [month]
  const totalI = activeMos.reduce((s,i) => s+(incMo[i]||0), 0)
  const totalE = activeMos.reduce((s,i) => s+(expMo[i]||0), 0)

  // Jalco
  const jalcoTx = [{mo:0,amt:500000},{mo:2,amt:1500000}]
  const jalcoSum = jalcoTx.filter(t => month===null||t.mo===month).reduce((s,t)=>s+t.amt,0)

  // Areaoversikt
  const areaTotals = useMemo(() => {
    const m = {}
    filtered.forEach(t => { m[t.area]=(m[t.area]||0)+Math.abs(t.belop) })
    return Object.entries(m).sort((a,b)=>b[1]-a[1])
  }, [filtered])
  const grandTotal = areaTotals.reduce((s,[,v])=>s+v,0)

  // Grafdata
  const barData = MONTHS.map((m,i) => ({
    name:m, Inntekt:Math.round(incMo[i]), Forbruk:Math.round(expMo[i])
  }))
  const netData = MONTHS.map((m,i) => ({
    name:m, Netto:Math.round(incMo[i]-expMo[i])
  }))

  return (
    <div>
      <MonthFilter month={month} setMonth={setMonth} />

      <MetricGrid>
        <Metric label={`Lønn + pensjon${nMnd===1?' denne mnd':' total'}`}
          value={fmt(totalI)} sub='IMI + Noen AS + NAV' color='#3B6D11' />
        <Metric label={`Forbruk${nMnd===1?' denne mnd':' total'}`}
          value={fmt(totalE)} color='#A32D2D' />
        <Metric label='Netto' value={((totalI-totalE)>=0?'+':'') + fmt(totalI-totalE)}
          color={(totalI-totalE)>=0?'#3B6D11':'#A32D2D'} sub='Lønn minus forbruk' />
        {jalcoSum>0 && <Metric label='Jalco' value={fmt(jalcoSum)} color='#185FA5' />}
      </MetricGrid>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <Card title='Inntekt vs. forbruk'>
          <ResponsiveContainer width='100%' height={200}>
            <BarChart data={barData} barSize={14}>
              <XAxis dataKey='name' tick={{fontSize:11}} />
              <YAxis tickFormatter={fmtK} tick={{fontSize:11}} />
              <Tooltip formatter={v=>fmt(v)} />
              <Bar dataKey='Inntekt' fill='#639922' radius={[2,2,0,0]} />
              <Bar dataKey='Forbruk' fill='#E24B4A' radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title='Netto per måned' sub='Inntekt minus forbruk'>
          <ResponsiveContainer width='100%' height={200}>
            <BarChart data={netData} barSize={18}>
              <XAxis dataKey='name' tick={{fontSize:11}} />
              <YAxis tickFormatter={fmtK} tick={{fontSize:11}} />
              <Tooltip formatter={v=>fmt(v)} />
              <Bar dataKey='Netto' radius={[2,2,0,0]}>
                {netData.map((d,i) => <Cell key={i} fill={d.Netto>=0?'#639922':'#E24B4A'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title='Forbruk per område — klikk for detaljer'
        sub='Klikk en rad for å se underkategorier og transaksjoner'>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr>{['Område','Total','Snitt/mnd','Andel',''].map((h,i)=>(
              <th key={i} style={{ textAlign:i>0?'right':'left', padding:'7px 10px',
                fontWeight:500, fontSize:12, color:'#5f5e5a', borderBottom:'.5px solid #d3d1c7'}}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {areaTotals.map(([a,v]) => (
              <tr key={a} onClick={()=>setDrill(drill===a?null:a)}
                style={{ cursor:'pointer', background:drill===a?'#f1efe8':'' }}
                onMouseEnter={e=>{ if(drill!==a) e.currentTarget.style.background='#f8f7f4' }}
                onMouseLeave={e=>{ if(drill!==a) e.currentTarget.style.background='' }}>
                <td style={{ padding:'7px 10px', display:'flex', alignItems:'center', gap:7 }}>
                  <span style={{ display:'inline-block', width:10, height:10, borderRadius:2,
                    background:colorMap[a]||'#888', flexShrink:0 }}/>
                  {iconMap[a]||''} {a}
                </td>
                <td style={{ padding:'7px 10px', textAlign:'right', fontWeight:500 }}>{fmt(v)}</td>
                <td style={{ padding:'7px 10px', textAlign:'right', color:'#888780' }}>{fmt(v/nMnd)}</td>
                <td style={{ padding:'7px 10px', textAlign:'right', color:'#888780' }}>
                  {Math.round(v/grandTotal*100)}%
                </td>
                <td style={{ padding:'7px 10px', color:'#d3d1c7' }}>▶</td>
              </tr>
            ))}
            <tr style={{ background:'#f8f7f4', borderTop:'.5px solid #d3d1c7', fontWeight:500 }}>
              <td style={{ padding:'7px 10px' }}>Totalt</td>
              <td style={{ padding:'7px 10px', textAlign:'right' }}>{fmt(grandTotal)}</td>
              <td style={{ padding:'7px 10px', textAlign:'right', color:'#888780' }}>{fmt(grandTotal/nMnd)}</td>
              <td style={{ padding:'7px 10px', textAlign:'right' }}>100%</td>
              <td/>
            </tr>
          </tbody>
        </table>
      </Card>

      {drill && (
        <DrillPanel area={drill} tx={filtered} onClose={()=>setDrill(null)} />
      )}
    </div>
  )
}
