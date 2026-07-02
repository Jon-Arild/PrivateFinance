import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { fmt, moIdx } from '../lib/utils'
import { useKategorier } from '../hooks/useKategorier'
import { useFilter } from '../hooks/useFilter'
import MonthFilter from '../components/MonthFilter'
import Card from '../components/Card'
import DrillPanel from '../components/DrillPanel'

export default function Omrader({ tx }) {
  const { filtered, month, setMonth, nMnd } = useFilter(tx)
  const { colorMap, iconMap } = useKategorier()
  const [drill, setDrill] = useState(null)

  const areaTotals = useMemo(() => {
    const m = {}
    filtered.forEach(t => { m[t.area]=(m[t.area]||0)+Math.abs(t.belop) })
    return Object.entries(m).sort((a,b)=>b[1]-a[1])
  }, [filtered])

  const subcatTotals = (area) => {
    const m = {}
    filtered.filter(t=>t.area===area).forEach(t => { m[t.subcat]=(m[t.subcat]||0)+Math.abs(t.belop) })
    return Object.entries(m).sort((a,b)=>b[1]-a[1])
  }

  const barData = areaTotals.map(([a,v]) => ({
    name: (iconMap[a]||'')+' '+a, value:Math.round(v), color:colorMap[a]||'#888'
  }))

  return (
    <div>
      <MonthFilter month={month} setMonth={setMonth} />

      <Card title='Alle områder'>
        <ResponsiveContainer width='100%' height={Math.max(300, areaTotals.length*38+80)}>
          <BarChart data={barData} layout='vertical' barSize={16}
            onClick={d=>d?.activePayload && setDrill(areaTotals[d.activeTooltipIndex]?.[0]||null)}>
            <XAxis type='number' tickFormatter={v=>(v/1000).toFixed(0)+'k'} tick={{fontSize:11}} />
            <YAxis type='category' dataKey='name' width={140} tick={{fontSize:12}} />
            <Tooltip formatter={v=>fmt(v)} />
            <Bar dataKey='value' radius={[0,3,3,0]}>
              {barData.map((d,i)=><Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {areaTotals.map(([area, total]) => {
        const subs = subcatTotals(area)
        const color = colorMap[area]||'#888'
        const icon  = iconMap[area]||''
        return (
          <div key={area}
            onClick={()=>setDrill(drill===area?null:area)}
            style={{ border:`.5px solid ${color}`, borderRadius:10, padding:'12px 14px',
              marginBottom:8, cursor:'pointer', background:drill===area?color+'15':color+'0d',
              transition:'box-shadow .15s' }}
            onMouseEnter={e=>e.currentTarget.style.boxShadow=`0 0 0 2px ${color}`}
            onMouseLeave={e=>e.currentTarget.style.boxShadow=''}>
            <div style={{ fontSize:14, fontWeight:500, display:'flex',
              alignItems:'center', gap:8, marginBottom:8 }}>
              <span style={{ display:'inline-block', width:12, height:12,
                borderRadius:3, background:color }}/>
              {icon} {area}
              <span style={{ marginLeft:'auto', fontWeight:500 }}>{fmt(total)}</span>
              <span style={{ color:'#888780', fontSize:12, fontWeight:400 }}>{fmt(total/nMnd)}/mnd</span>
              <span style={{ color:'#d3d1c7' }}>▶</span>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {subs.map(([s,v]) => (
                <span key={s}
                  onClick={e=>{ e.stopPropagation(); setDrill(area) }}
                  style={{ fontSize:11, padding:'2px 8px', borderRadius:4,
                    background:'#f1efe8', color:'#5f5e5a' }}>
                  {s}: {fmt(v)}
                </span>
              ))}
            </div>
          </div>
        )
      })}

      {drill && (
        <div style={{ marginTop:14 }}>
          <DrillPanel area={drill} tx={filtered} onClose={()=>setDrill(null)} />
        </div>
      )}
    </div>
  )
}
