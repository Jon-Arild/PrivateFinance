import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { fmt, MONTHS, AREA_COLORS, AREA_ICONS, moIdx } from '../lib/utils'
import { useFilter } from '../hooks/useFilter'
import Card from '../components/Card'

const IMI  = [49377,65565,34840,36192,43072,0]
const NOEN = [1563,6292,4937,5756,4325,0]
const NAV  = [20459,19583,19583,19583,19583,0]
const LANTOT = [22830,0,43760,23057,22316,22316]

export default function Maaneder({ tx }) {
  const { filtered } = useFilter(tx)

  const incMo = MONTHS.map((_,i) => IMI[i]+NOEN[i]+NAV[i])

  const expMo = useMemo(() => {
    const r = Array(6).fill(0)
    tx.filter(t=>t.belop<0&&t.area!=='Inntekt')
      .forEach(t=>{ const m=moIdx(t.dato); if(m>=0&&m<6) r[m]+=Math.abs(t.belop) })
    return r
  }, [tx])

  const areaTotals = useMemo(() => {
    const m = {}
    tx.filter(t=>t.belop<0&&t.area!=='Inntekt')
      .forEach(t=>{ m[t.area]=(m[t.area]||0)+Math.abs(t.belop) })
    return Object.entries(m).sort((a,b)=>b[1]-a[1])
  }, [tx])

  const top8 = areaTotals.slice(0,8).map(([a])=>a)

  const stackData = MONTHS.map((m,i) => {
    const row = { name:m }
    top8.forEach(a => {
      row[a] = Math.round(
        tx.filter(t=>t.belop<0&&t.area===a&&moIdx(t.dato)===i)
          .reduce((s,t)=>s+Math.abs(t.belop),0)
      )
    })
    return row
  })

  const areaMonthData = areaTotals.map(([area,tot]) => {
    const moVals = MONTHS.map((_,i) =>
      tx.filter(t=>t.belop<0&&t.area===area&&moIdx(t.dato)===i)
        .reduce((s,t)=>s+Math.abs(t.belop),0)
    )
    return { area, tot, moVals }
  })

  const fmtS = v => (v>=0?'+':'')+fmt(v)

  return (
    <div>
      <Card title='Månedsoversikt'>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr>{['Måned','Inntekt','Forbruk','Netto'].map((h,i)=>(
              <th key={i} style={{ textAlign:i>0?'right':'left', padding:'7px 10px',
                fontWeight:500, fontSize:12, color:'#5f5e5a', borderBottom:'.5px solid #d3d1c7'}}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {MONTHS.map((m,i)=>{
              const net=incMo[i]-expMo[i]
              return (
                <tr key={m} style={{ borderBottom:'.5px solid #f1efe8' }}>
                  <td style={{ padding:'7px 10px', fontWeight:500 }}>{m}</td>
                  <td style={{ padding:'7px 10px', textAlign:'right', color:'#3B6D11' }}>{fmt(incMo[i])}</td>
                  <td style={{ padding:'7px 10px', textAlign:'right', color:'#A32D2D' }}>{fmt(expMo[i])}</td>
                  <td style={{ padding:'7px 10px', textAlign:'right', fontWeight:500,
                    color:net>=0?'#3B6D11':'#A32D2D' }}>{fmtS(net)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      <Card title='Forbruk per område per måned'>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:10, fontSize:12 }}>
          {top8.map(a=>(
            <span key={a} style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ width:10,height:10,borderRadius:2,
                background:AREA_COLORS[a]||'#888',display:'inline-block' }}/>
              {AREA_ICONS[a]||''} {a}
            </span>
          ))}
        </div>
        <ResponsiveContainer width='100%' height={280}>
          <BarChart data={stackData} barSize={20}>
            <XAxis dataKey='name' tick={{fontSize:11}} />
            <YAxis tickFormatter={v=>(v/1000).toFixed(0)+'k'} tick={{fontSize:11}} />
            <Tooltip formatter={v=>fmt(v)} />
            {top8.map(a=>(
              <Bar key={a} dataKey={a} fill={AREA_COLORS[a]||'#888'}
                stackId='a' radius={[0,0,0,0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title='Alle områder per måned'>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12, minWidth:700 }}>
            <thead>
              <tr>
                <th style={{ textAlign:'left', padding:'7px 10px', fontWeight:500,
                  fontSize:11, color:'#5f5e5a', borderBottom:'.5px solid #d3d1c7' }}>Område</th>
                {MONTHS.map(m=>(
                  <th key={m} style={{ textAlign:'right', padding:'7px 10px', fontWeight:500,
                    fontSize:11, color:'#5f5e5a', borderBottom:'.5px solid #d3d1c7' }}>{m}</th>
                ))}
                <th style={{ textAlign:'right', padding:'7px 10px', fontWeight:500,
                  fontSize:11, color:'#5f5e5a', borderBottom:'.5px solid #d3d1c7' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {areaMonthData.map(({ area, tot, moVals })=>(
                <tr key={area} style={{ borderBottom:'.5px solid #f1efe8' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#f8f7f4'}
                  onMouseLeave={e=>e.currentTarget.style.background=''}>
                  <td style={{ padding:'7px 10px', display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:8,height:8,borderRadius:2,flexShrink:0,
                      background:AREA_COLORS[area]||'#888',display:'inline-block' }}/>
                    {AREA_ICONS[area]||''} {area}
                  </td>
                  {moVals.map((v,i)=>(
                    <td key={i} style={{ padding:'7px 10px', textAlign:'right', color:'#5f5e5a' }}>
                      {v>0?fmt(v):'—'}
                    </td>
                  ))}
                  <td style={{ padding:'7px 10px', textAlign:'right', fontWeight:500 }}>{fmt(tot)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
