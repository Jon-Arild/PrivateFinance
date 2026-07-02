import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { clearKategorierCache } from '../hooks/useKategorier'

function AreaForm({ value, onChange, onSave, onCancel, busy, label }) {
  return (
    <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', padding:'10px 14px' }}>
      <input value={value.navn} onChange={e => onChange({ ...value, navn: e.target.value })}
        placeholder='Navn på område' autoFocus
        onKeyDown={e => e.key === 'Enter' && onSave()}
        style={{ fontSize:13, padding:'4px 8px', borderRadius:5,
          border:'.5px solid #d3d1c7', width:160 }} />
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <input type='color' value={value.farge}
          onChange={e => onChange({ ...value, farge: e.target.value })}
          style={{ width:32, height:28, borderRadius:4, border:'.5px solid #d3d1c7',
            cursor:'pointer', padding:2 }} />
        <span style={{ fontSize:11, color:'#888780', fontFamily:'monospace' }}>{value.farge}</span>
      </div>
      <input value={value.ikon} onChange={e => onChange({ ...value, ikon: e.target.value })}
        placeholder='Ikon (emoji)'
        style={{ fontSize:13, padding:'4px 8px', borderRadius:5,
          border:'.5px solid #d3d1c7', width:100 }} />
      <button onClick={onSave} disabled={busy || !value.navn.trim()}
        style={{ fontSize:12, padding:'4px 14px', borderRadius:5, cursor:'pointer',
          background:'#185FA5', color:'#fff', border:'none',
          opacity:(busy || !value.navn.trim()) ? 0.5 : 1 }}>
        {busy ? '…' : label}
      </button>
      <button onClick={onCancel}
        style={{ fontSize:12, padding:'4px 12px', borderRadius:5, cursor:'pointer',
          background:'transparent', border:'.5px solid #d3d1c7', color:'#5f5e5a' }}>
        Avbryt
      </button>
    </div>
  )
}

function SubcatForm({ value, onChange, onSave, onCancel, busy }) {
  return (
    <div style={{ display:'flex', gap:6, alignItems:'center',
      padding:'6px 14px 6px 32px' }}>
      <input value={value} onChange={e => onChange(e.target.value)}
        placeholder='Navn på underkategori' autoFocus
        onKeyDown={e => { if (e.key === 'Enter') onSave(); if (e.key === 'Escape') onCancel() }}
        style={{ fontSize:12, padding:'3px 8px', borderRadius:5,
          border:'.5px solid #d3d1c7', width:220 }} />
      <button onClick={onSave} disabled={busy || !value.trim()}
        style={{ fontSize:11, padding:'2px 10px', borderRadius:4, cursor:'pointer',
          background:'#185FA5', color:'#fff', border:'none',
          opacity:(busy || !value.trim()) ? 0.5 : 1 }}>
        {busy ? '…' : 'Lagre'}
      </button>
      <button onClick={onCancel}
        style={{ fontSize:11, padding:'2px 10px', borderRadius:4, cursor:'pointer',
          background:'transparent', border:'.5px solid #d3d1c7', color:'#5f5e5a' }}>
        Avbryt
      </button>
    </div>
  )
}

export default function Innstillinger() {
  const [omrader,  setOmrader]  = useState([])
  const [subcats,  setSubcats]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState(new Set())

  const [editArea,   setEditArea]   = useState(null)
  const [editSubcat, setEditSubcat] = useState(null)
  const [newArea,    setNewArea]    = useState(null)
  const [newSubcat,  setNewSubcat]  = useState(null)
  const [busy,  setBusy]  = useState(false)
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true)
    const [{ data: o, error: e1 }, { data: s, error: e2 }] = await Promise.all([
      supabase.from('omrader').select('*').eq('aktiv', true).order('sort_order'),
      supabase.from('underkategorier').select('*').eq('aktiv', true).order('sort_order'),
    ])
    if (e1 || e2) setError((e1 || e2).message)
    setOmrader(o || [])
    setSubcats(s || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function toggleExpand(id) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function saveArea(id, patch) {
    setBusy(true); setError(null)
    const original = omrader.find(o => o.id === id)
    const { error: err } = await supabase.from('omrader').update(patch).eq('id', id)
    if (err) { setError(err.message); setBusy(false); return }
    if (patch.navn && patch.navn !== original.navn) {
      // FK ON UPDATE CASCADE oppdaterer underkategorier.area automatisk
      await supabase.from('transaksjoner').update({ area: patch.navn }).eq('area', original.navn)
    }
    clearKategorierCache(); setEditArea(null); await load(); setBusy(false)
  }

  async function deleteArea(id, navn) {
    const { count } = await supabase
      .from('transaksjoner').select('id', { count:'exact', head:true }).eq('area', navn)
    if (count > 0 &&
      !window.confirm(`"${navn}" har ${count} transaksjoner. De flyttes til Annet / Ukategorisert. Slett området?`))
      return
    setBusy(true); setError(null)
    if (count > 0)
      await supabase.from('transaksjoner')
        .update({ area:'Annet', subcat:'Ukategorisert' }).eq('area', navn)
    await supabase.from('underkategorier').delete().eq('area', navn)
    await supabase.from('omrader').delete().eq('id', id)
    clearKategorierCache(); await load(); setBusy(false)
  }

  async function addArea({ navn, farge, ikon }) {
    if (!navn.trim()) return
    setBusy(true); setError(null)
    const maxOrder = omrader.reduce((m, o) => Math.max(m, o.sort_order), 0)
    const { error: err } = await supabase.from('omrader')
      .insert({ navn: navn.trim(), farge, ikon, sort_order: maxOrder + 1 })
    if (err) { setError(err.message); setBusy(false); return }
    clearKategorierCache(); setNewArea(null); await load(); setBusy(false)
  }

  async function saveSubcat(id, { navn, area, oldNavn }) {
    if (!navn.trim()) return
    setBusy(true); setError(null)
    const { error: err } = await supabase.from('underkategorier').update({ navn: navn.trim() }).eq('id', id)
    if (err) { setError(err.message); setBusy(false); return }
    if (navn.trim() !== oldNavn)
      await supabase.from('transaksjoner')
        .update({ subcat: navn.trim() }).eq('area', area).eq('subcat', oldNavn)
    clearKategorierCache(); setEditSubcat(null); await load(); setBusy(false)
  }

  async function deleteSubcat(id, area, navn) {
    const { count } = await supabase
      .from('transaksjoner').select('id', { count:'exact', head:true }).eq('area', area).eq('subcat', navn)
    if (count > 0 &&
      !window.confirm(`"${navn}" har ${count} transaksjoner. De flyttes til Ukategorisert. Slett underkategorien?`))
      return
    setBusy(true); setError(null)
    if (count > 0)
      await supabase.from('transaksjoner')
        .update({ subcat:'Ukategorisert' }).eq('area', area).eq('subcat', navn)
    await supabase.from('underkategorier').delete().eq('id', id)
    clearKategorierCache(); await load(); setBusy(false)
  }

  async function addSubcat({ area, navn }) {
    if (!navn.trim()) return
    setBusy(true); setError(null)
    const areaSubcats = subcats.filter(s => s.area === area)
    const maxOrder = areaSubcats.reduce((m, s) => Math.max(m, s.sort_order), 0)
    const { error: err } = await supabase.from('underkategorier')
      .insert({ area, navn: navn.trim(), sort_order: maxOrder + 1 })
    if (err) { setError(err.message); setBusy(false); return }
    clearKategorierCache(); setNewSubcat(null); await load(); setBusy(false)
  }

  if (loading) return (
    <div style={{ padding:24, color:'#888780', fontSize:14 }}>Laster kategorier…</div>
  )

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:16, fontWeight:500 }}>Kategorier og områder</div>
          <div style={{ fontSize:12, color:'#888780', marginTop:2 }}>
            Administrer hovedområder, underkategorier, farger og ikoner
          </div>
        </div>
        <button onClick={() => { setNewArea({ navn:'', farge:'#888780', ikon:'' }); setEditArea(null) }}
          disabled={busy}
          style={{ fontSize:12, padding:'6px 16px', borderRadius:6,
            background:'#185FA5', color:'#fff', border:'none', cursor:'pointer' }}>
          + Nytt område
        </button>
      </div>

      {error && (
        <div style={{ padding:'8px 12px', background:'#fff0f0', color:'#A32D2D',
          borderRadius:6, marginBottom:12, fontSize:12 }}>
          {error}
        </div>
      )}

      {newArea && (
        <div style={{ border:'.5px solid #185FA5', borderRadius:10, marginBottom:10,
          background:'#f0f6ff', overflow:'hidden' }}>
          <div style={{ padding:'8px 14px', fontSize:12, color:'#185FA5', fontWeight:500,
            borderBottom:'.5px solid #cce0ff' }}>
            Nytt område
          </div>
          <AreaForm value={newArea} onChange={setNewArea}
            onSave={() => addArea(newArea)}
            onCancel={() => setNewArea(null)}
            busy={busy} label='Opprett' />
        </div>
      )}

      {omrader.map(o => {
        const areaSubs  = subcats.filter(s => s.area === o.navn)
        const isExpanded = expanded.has(o.id)

        return (
          <div key={o.id}
            style={{ border:'.5px solid #d3d1c7', borderRadius:10, marginBottom:8,
              background:'#fff', overflow:'hidden' }}>

            {/* Overskrift / redigeringsrad for området */}
            {editArea?.id === o.id ? (
              <>
                <div style={{ padding:'8px 14px', fontSize:12, color:'#5f5e5a', fontWeight:500,
                  background:'#f8f7f4', borderBottom:'.5px solid #d3d1c7' }}>
                  Rediger område
                </div>
                <AreaForm value={editArea} onChange={setEditArea}
                  onSave={() => saveArea(o.id, { navn:editArea.navn, farge:editArea.farge, ikon:editArea.ikon })}
                  onCancel={() => setEditArea(null)}
                  busy={busy} label='Lagre' />
              </>
            ) : (
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px' }}>
                <span style={{ width:14, height:14, borderRadius:3, background:o.farge,
                  display:'inline-block', flexShrink:0 }} />
                <span style={{ fontSize:14 }}>{o.ikon}</span>
                <span style={{ fontSize:13, fontWeight:500, flex:1 }}>{o.navn}</span>
                <span style={{ fontSize:11, fontFamily:'monospace', color:'#888780',
                  background:'#f1efe8', padding:'1px 6px', borderRadius:3 }}>
                  {o.farge}
                </span>
                <span style={{ fontSize:11, color:'#888780' }}>
                  {areaSubs.length} underkategorier
                </span>
                <button onClick={() => { toggleExpand(o.id); setNewSubcat(null) }}
                  style={{ fontSize:11, padding:'2px 8px', borderRadius:4, cursor:'pointer',
                    background:'transparent', border:'.5px solid #d3d1c7', color:'#5f5e5a' }}>
                  {isExpanded ? '↑ Skjul' : '↓ Vis'}
                </button>
                <button
                  onClick={() => { setEditArea({ id:o.id, navn:o.navn, farge:o.farge, ikon:o.ikon||'' }); setNewArea(null) }}
                  style={{ fontSize:11, padding:'2px 8px', borderRadius:4, cursor:'pointer',
                    background:'transparent', border:'.5px solid #d3d1c7', color:'#5f5e5a' }}>
                  Rediger
                </button>
                <button onClick={() => deleteArea(o.id, o.navn)} disabled={busy}
                  style={{ fontSize:11, padding:'2px 8px', borderRadius:4, cursor:'pointer',
                    background:'transparent', border:'.5px solid #e0b0b0', color:'#A32D2D' }}>
                  Slett
                </button>
              </div>
            )}

            {/* Underkategorier */}
            {isExpanded && (
              <div style={{ borderTop:'.5px solid #f1efe8' }}>
                {areaSubs.map(s => (
                  <div key={s.id}
                    style={{ borderBottom:'.5px solid #f8f7f4' }}>
                    {editSubcat?.id === s.id ? (
                      <SubcatForm
                        value={editSubcat.navn}
                        onChange={v => setEditSubcat({ ...editSubcat, navn:v })}
                        onSave={() => saveSubcat(s.id, { navn:editSubcat.navn, area:s.area, oldNavn:s.navn })}
                        onCancel={() => setEditSubcat(null)}
                        busy={busy} />
                    ) : (
                      <div style={{ display:'flex', alignItems:'center', gap:8,
                        padding:'5px 14px 5px 32px' }}>
                        <span style={{ fontSize:12, flex:1, color:'#5f5e5a' }}>• {s.navn}</span>
                        <button
                          onClick={() => { setEditSubcat({ id:s.id, navn:s.navn, area:s.area }); setNewSubcat(null) }}
                          style={{ fontSize:11, padding:'1px 6px', borderRadius:3, cursor:'pointer',
                            background:'transparent', border:'.5px solid #d3d1c7', color:'#5f5e5a' }}>
                          Rediger
                        </button>
                        <button onClick={() => deleteSubcat(s.id, s.area, s.navn)} disabled={busy}
                          style={{ fontSize:11, padding:'1px 6px', borderRadius:3, cursor:'pointer',
                            background:'transparent', border:'.5px solid #e0b0b0', color:'#A32D2D' }}>
                          Slett
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {newSubcat?.area === o.navn ? (
                  <SubcatForm
                    value={newSubcat.navn}
                    onChange={v => setNewSubcat({ ...newSubcat, navn:v })}
                    onSave={() => addSubcat(newSubcat)}
                    onCancel={() => setNewSubcat(null)}
                    busy={busy} />
                ) : (
                  <div style={{ padding:'6px 14px 6px 32px' }}>
                    <button
                      onClick={() => { setNewSubcat({ area:o.navn, navn:'' }); setEditSubcat(null) }}
                      style={{ fontSize:11, padding:'2px 8px', borderRadius:4, cursor:'pointer',
                        background:'transparent', border:'.5px dashed #d3d1c7', color:'#888780' }}>
                      + Ny underkategori
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
