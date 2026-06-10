import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { fmt, MONTHS, moIdx } from '../lib/utils'
import { useFilter } from '../hooks/useFilter'
import MonthFilter from '../components/MonthFilter'
import Card from '../components/Card'
import { MetricGrid, Metric } from '../components/MetricGrid'

const IMI  = [49377,65565,34840,36192,43072,0]
const NOEN = [1563,6292,4937,5756,4325,0]
const NAV  = [20459,19583,19583,19583,19583,0]

export default function Inntekter({ tx }) {
  const { filtered, month, setMonth } = useFilter(tx)

  const activeMos = month===null?[0,1,2,3,4,5]:[month]
  const totalIMI  = activeMos.reduce((s,i)=>s+IMI[i],0)
  const totalNoen = activeMos.reduce((s,i)=>s+NOEN[i],0)
  const totalNAV  = activeMos.reduce((s,i)=>s+NAV[i],0)
  const totalAlt  = totalIMI+totalNoen+totalNAV

  const jalcoTx = [{mo:0,amt:500000,label:'Januar'},{mo:2,amt:1500000,label:'Mars'}]
  const jalcoFiltered = jalcoTx.filter(t=>month===null||t.mo===month)
  const jalcoInn = jalcoFiltered.reduce((s,t)=>s+t.amt,0)
  const restskatt = filtered.filter(t=>t.subcat==='Restskatt').reduce((s,t)=>s+Math.abs(t.belop),0)
  const jalcoNetto = jalcoInn - restskatt

  const barData = MONTHS.map((m,i) => ({
    name:m, IMI:IMI[i], NAV:NAV[i], 'Noen AS':NOEN[i]
  }))

  return (
    <div>
      <MonthFilter month={month} setMonth={setMonth} />

      <MetricGrid>
        <Metric label='IMI snitt/mnd' value={fmt(IMI.reduce((a,b)=>a+b)/6)} sub='Varierer' color='#185FA5' />
        <Metric label='NAV pensjon' value={fmt(19583)} sub='Fast hver måned' color='#639922' />
        <Metric label='Noen AS snitt/mnd' value={fmt(NOEN.reduce((a,b)=>a+b)/6)} color='#534AB7' />
        <Metric label='Lønn + pensjon total' value={fmt(totalAlt)} color='#3B6D11' />
      </MetricGrid>

      {jalcoInn > 0 && (
        <Card style={{ borderColor:'#185FA5', background:'#EBF4FF33' }}>
          <div style={{ fontSize:14, fontWeight:500, color:'#185FA5', marginBottom:3 }}>
            Jalco Consulting — utbytte og skatt
          </div>
          <div style={{ fontSize:12, color:'#888780', marginBottom:12 }}>
            Restskatt er direkte knyttet til Jalco-utbytte og vises som motpost
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <tbody>
              <tr>
                <td style={{ padding:'8px 0' }}>Utbytte overført fra Jalco</td>
                <td/>
                <td style={{ textAlign:'right', fontSize:16, fontWeight:500, color:'#3B6D11' }}>
                  +{fmt(jalcoInn)}
                </td>
              </tr>
              {jalcoFiltered.map(t=>(
                <tr key={t.mo}>
                  <td style={{ padding:'4px 0 4px 20px', fontSize:12, color:'#888780' }}>{t.label}</td>
                  <td style={{ textAlign:'right', fontSize:12, color:'#888780' }}>Sparekonto</td>
                  <td style={{ textAlign:'right', color:'#888780' }}>+{fmt(t.amt)}</td>
                </tr>
              ))}
              <tr style={{ borderTop:'.5px solid #d3d1c7' }}>
                <td style={{ padding:'8px 0' }}>Restskatt betalt</td>
                <td/>
                <td style={{ textAlign:'right', fontSize:16, fontWeight:500, color:'#A32D2D' }}>
                  -{fmt(restskatt)}
                </td>
              </tr>
              <tr style={{ background:'#f8f7f4', borderTop:'.5px solid #d3d1c7' }}>
                <td style={{ padding:'8px 0', fontWeight:500 }}>Netto Jalco etter skatt</td>
                <td/>
                <td style={{ textAlign:'right', fontSize:18, fontWeight:500,
                  color:jalcoNetto>=0?'#3B6D11':'#A32D2D' }}>
                  {jalcoNetto>=0?'+':''}{fmt(jalcoNetto)}
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
      )}

      <Card title='Inntekt per kilde'>
        <div style={{ display:'flex', gap:12, marginBottom:10, fontSize:12, color:'#5f5e5a' }}>
          {[['IMI','#185FA5'],['NAV','#639922'],['Noen AS','#534AB7']].map(([l,c])=>(
            <span key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ width:10,height:10,borderRadius:2,background:c,display:'inline-block' }}/>
              {l}
            </span>
          ))}
        </div>
        <ResponsiveContainer width='100%' height={220}>
          <BarChart data={barData} barSize={14}>
            <XAxis dataKey='name' tick={{fontSize:11}} />
            <YAxis tickFormatter={v=>(v/1000).toFixed(0)+'k'} tick={{fontSize:11}} />
            <Tooltip formatter={v=>fmt(v)} />
            <Bar dataKey='IMI'     fill='#185FA5' stackId='a' radius={[0,0,0,0]} />
            <Bar dataKey='NAV'     fill='#639922' stackId='a' radius={[0,0,0,0]} />
            <Bar dataKey='Noen AS' fill='#534AB7' stackId='a' radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title='Månedlig inntektsoversikt'>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr>
              <th style={{ textAlign:'left', padding:'7px 10px', fontWeight:500, fontSize:12,
                color:'#5f5e5a', borderBottom:'.5px solid #d3d1c7' }}>Kilde</th>
              {MONTHS.map(m=>(
                <th key={m} style={{ textAlign:'right', padding:'7px 10px', fontWeight:500,
                  fontSize:12, color:'#5f5e5a', borderBottom:'.5px solid #d3d1c7' }}>{m}</th>
              ))}
              <th style={{ textAlign:'right', padding:'7px 10px', fontWeight:500, fontSize:12,
                color:'#5f5e5a', borderBottom:'.5px solid #d3d1c7' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {[['Industri-Matematik',IMI,'#185FA5'],['NAV pensjon',NAV,'#639922'],['Noen AS',NOEN,'#534AB7']]
              .map(([n,v,c])=>(
              <tr key={n} style={{ borderBottom:'.5px solid #f1efe8' }}>
                <td style={{ padding:'7px 10px', display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ width:8,height:8,borderRadius:2,background:c,display:'inline-block',flexShrink:0 }}/>
                  {n}
                </td>
                {v.map((x,i)=>(
                  <td key={i} style={{ padding:'7px 10px', textAlign:'right' }}>{fmt(x)}</td>
                ))}
                <td style={{ padding:'7px 10px', textAlign:'right', fontWeight:500 }}>
                  {fmt(v.reduce((a,b)=>a+b))}
                </td>
              </tr>
            ))}
            <tr style={{ background:'#f8f7f4', borderTop:'.5px solid #d3d1c7', fontWeight:500 }}>
              <td style={{ padding:'7px 10px' }}>Totalt</td>
              {MONTHS.map((_,i)=>(
                <td key={i} style={{ padding:'7px 10px', textAlign:'right' }}>
                  {fmt(IMI[i]+NAV[i]+NOEN[i])}
                </td>
              ))}
              <td style={{ padding:'7px 10px', textAlign:'right' }}>
                {fmt([...IMI,...NAV,...NOEN].reduce((a,b,i)=>i<6?a+b:a+0,0)+totalNAV+totalNoen)}
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  )
}
