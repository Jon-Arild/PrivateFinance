import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useKategorier } from '../hooks/useKategorier'
import { fmt } from '../lib/utils'
import Card from '../components/Card'

const KONTOER = [
  { id: '64794',    label: 'Brukskonto Lønn (64794)' },
  { id: '64808',    label: 'Regningskonto (64808)' },
  { id: '64743',    label: 'Sparekonto (64743)' },
  { id: 'platinum', label: 'Platinum kort' },
  { id: 'rammela',  label: 'Rammelån' },
]

// Nordea eksporterer CSV med semikolonseparator og norske desimaler
function parseNordeaNum(str) {
  if (!str || !str.trim()) return 0
  return parseFloat(str.trim().replace(/\./g, '').replace(',', '.')) || 0
}

function parseNordeaDate(str) {
  // "25.06.2026" → "2026-06-25"
  const [d, m, y] = str.trim().split('.')
  if (!d || !m || !y) throw new Error(`Ukjent datoformat: ${str}`)
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

function parseCSV(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) throw new Error('Filen er tom eller har bare én linje')

  const clean = h => h.replace(/"/g, '').trim().toLowerCase()
  const header = lines[0].split(';').map(clean)

  const find = (...keys) => header.findIndex(h => keys.some(k => h.includes(k)))

  const datoIdx  = find('dato', 'bookingdate', 'bokføring')
  const descIdx  = find('forklaringstekst', 'forklaring', 'tekst', 'tittel', 'title', 'navn')
  const utIdx    = find('ut fra konto', 'ut fra', 'debit')
  const innIdx   = find('inn på konto', 'inn på', 'inn p', 'credit')
  const belopIdx = find('beløp', 'amount')

  if (datoIdx < 0)
    throw new Error(`Fant ikke datokolonne. Kolonner funnet: ${header.join(', ')}`)
  if (descIdx < 0)
    throw new Error(`Fant ikke beskrivelsekolonne. Kolonner funnet: ${header.join(', ')}`)
  if (utIdx < 0 && innIdx < 0 && belopIdx < 0)
    throw new Error(`Fant ikke beløpskolonne. Kolonner funnet: ${header.join(', ')}`)

  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(';').map(c => c.replace(/"/g, '').trim())
    const rawDate = cols[datoIdx]
    if (!rawDate || !rawDate.includes('.')) continue

    const dato        = parseNordeaDate(rawDate)
    const beskrivelse = (cols[descIdx] || '').slice(0, 255)
    if (!beskrivelse) continue

    let belop
    if (utIdx >= 0 || innIdx >= 0) {
      const ut  = utIdx  >= 0 ? parseNordeaNum(cols[utIdx])  : 0
      const inn = innIdx >= 0 ? parseNordeaNum(cols[innIdx]) : 0
      belop = inn > 0 ? inn : -ut
    } else {
      belop = parseNordeaNum(cols[belopIdx])
    }

    rows.push({ dato, beskrivelse, belop })
  }

  if (!rows.length) throw new Error('Ingen transaksjoner funnet i filen')
  return rows
}

// En rad i "Til gjennomgang"-køen
function QueueRow({ tx, subcatMap, iconMap, onDone }) {
  const allAreas = useMemo(
    () => Object.keys(subcatMap).filter(a => a !== 'Annet').sort(),
    [subcatMap]
  )
  const defaultArea = allAreas[0] || 'Dagligliv'

  const [editing, setEditing] = useState(false)
  const [area,    setArea]    = useState(defaultArea)
  const [subcat,  setSubcat]  = useState((subcatMap[defaultArea] || [])[0] || '')
  const [saving,  setSaving]  = useState(false)
  const [err,     setErr]     = useState(null)

  const subcats = subcatMap[area] || []

  function handleAreaChange(a) {
    setArea(a)
    setSubcat((subcatMap[a] || [])[0] || '')
  }

  async function save() {
    setSaving(true); setErr(null)
    const { error } = await supabase
      .from('transaksjoner').update({ area, subcat }).eq('id', tx.id)
    if (error) { setErr(error.message); setSaving(false); return }
    onDone(tx.id)
  }

  return (
    <tr style={{ borderBottom: '.5px solid #f1efe8' }}
      onMouseEnter={e => { if (!editing) e.currentTarget.style.background = '#f8f7f4' }}
      onMouseLeave={e => { if (!editing) e.currentTarget.style.background = '' }}>
      <td style={{ padding: '6px 10px', color: '#888780', whiteSpace: 'nowrap', fontSize: 12 }}>
        {tx.dato.slice(5).replace('-', '.')}
      </td>
      <td style={{ padding: '6px 10px', fontSize: 12 }}>
        {tx.beskrivelse.slice(0, 55)}{tx.beskrivelse.length > 55 ? '…' : ''}
      </td>
      <td style={{ padding: '6px 10px', textAlign: 'right', fontSize: 12, fontWeight: 500,
        color: tx.belop < 0 ? '#A32D2D' : '#3B6D11' }}>
        {fmt(tx.belop)}
      </td>
      <td style={{ padding: '6px 10px', minWidth: 280 }}>
        {editing ? (
          <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={area} onChange={e => handleAreaChange(e.target.value)}
              style={{ fontSize: 11, padding: '2px 5px', borderRadius: 4, border: '.5px solid #d3d1c7' }}>
              {allAreas.map(a => <option key={a} value={a}>{iconMap[a] || ''} {a}</option>)}
            </select>
            <select value={subcat} onChange={e => setSubcat(e.target.value)}
              style={{ fontSize: 11, padding: '2px 5px', borderRadius: 4, border: '.5px solid #d3d1c7' }}>
              {subcats.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={save} disabled={saving}
              style={{ fontSize: 11, padding: '2px 9px', borderRadius: 4, cursor: 'pointer',
                background: '#185FA5', color: '#fff', border: 'none', opacity: saving ? 0.6 : 1 }}>
              {saving ? '…' : 'Lagre'}
            </button>
            <button onClick={() => { setEditing(false); setErr(null) }}
              style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, cursor: 'pointer',
                background: 'transparent', border: '.5px solid #d3d1c7', color: '#5f5e5a' }}>
              ✕
            </button>
            {err && <span style={{ fontSize: 10, color: '#A32D2D' }}>{err}</span>}
          </div>
        ) : (
          <button onClick={() => setEditing(true)}
            style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, cursor: 'pointer',
              background: 'transparent', border: '.5px solid #d3d1c7', color: '#5f5e5a' }}>
            ✏️ Kategoriser
          </button>
        )}
      </td>
    </tr>
  )
}

export default function Importer() {
  const { subcatMap, iconMap, loading: katLoading } = useKategorier()

  const [kontoId,     setKontoId]     = useState('64794')
  const [file,        setFile]        = useState(null)
  const [preview,     setPreview]     = useState(null)
  const [checking,    setChecking]    = useState(false)
  const [importing,   setImporting]   = useState(false)
  const [importDone,  setImportDone]  = useState(null)
  const [parseErr,    setParseErr]    = useState(null)

  const [queue,        setQueue]        = useState([])
  const [queueLoading, setQueueLoading] = useState(true)

  async function loadQueue() {
    setQueueLoading(true)
    const { data } = await supabase
      .from('transaksjoner')
      .select('*')
      .eq('area', 'Annet')
      .eq('subcat', 'Ukategorisert')
      .order('dato', { ascending: false })
    setQueue(data || [])
    setQueueLoading(false)
  }

  useEffect(() => { loadQueue() }, [])

  async function handleCheck() {
    if (!file) return
    setParseErr(null); setPreview(null); setImportDone(null); setChecking(true)

    let parsed
    try {
      parsed = parseCSV(await file.text())
    } catch (e) {
      setParseErr(e.message); setChecking(false); return
    }

    parsed.sort((a, b) => a.dato.localeCompare(b.dato))
    const minDate = parsed[0].dato
    const maxDate = parsed[parsed.length - 1].dato

    // Hent eksisterende transaksjoner i samme periode og konto for duplikatsjekk
    const { data: existing, error } = await supabase
      .from('transaksjoner')
      .select('dato,beskrivelse,belop,konto_id')
      .gte('dato', minDate)
      .lte('dato', maxDate)
      .eq('konto_id', kontoId)

    if (error) { setParseErr(error.message); setChecking(false); return }

    const existingSet = new Set(
      (existing || []).map(r => `${r.dato}|${r.beskrivelse}|${r.belop}`)
    )

    const newRows = parsed.filter(r => !existingSet.has(`${r.dato}|${r.beskrivelse}|${r.belop}`))
    const dupRows = parsed.filter(r =>  existingSet.has(`${r.dato}|${r.beskrivelse}|${r.belop}`))

    setPreview({ newRows, dupRows, minDate, maxDate })
    setChecking(false)
  }

  async function handleImport() {
    if (!preview?.newRows.length) return
    setImporting(true)

    const rows = preview.newRows.map(r => ({
      dato:        r.dato,
      beskrivelse: r.beskrivelse,
      belop:       r.belop,
      konto_id:    kontoId,
      area:        'Annet',
      subcat:      'Ukategorisert',
      kilde:       'nordea_csv',
    }))

    const { error } = await supabase.from('transaksjoner').insert(rows)
    if (error) { setParseErr(error.message); setImporting(false); return }

    const count = rows.length
    setImportDone({ count })
    setPreview(null)
    setFile(null)
    // Reset file input
    document.getElementById('csv-input').value = ''
    await loadQueue()
    setImporting(false)
  }

  function handleFileChange(e) {
    setFile(e.target.files[0] || null)
    setPreview(null); setImportDone(null); setParseErr(null)
  }

  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 3 }}>Importer fra Nordea</div>
      <div style={{ fontSize: 12, color: '#888780', marginBottom: 16 }}>
        CSV-eksport fra Nordea nettbank. Allerede importerte transaksjoner hoppes over automatisk.
      </div>

      {/* Import-seksjon */}
      <Card>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: '#888780', marginBottom: 5 }}>Konto</div>
            <select value={kontoId}
              onChange={e => { setKontoId(e.target.value); setPreview(null) }}
              style={{ fontSize: 13, padding: '5px 8px', borderRadius: 6, border: '.5px solid #d3d1c7' }}>
              {KONTOER.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#888780', marginBottom: 5 }}>CSV-fil fra Nordea</div>
            <input id='csv-input' type='file' accept='.csv,.txt'
              onChange={handleFileChange}
              style={{ fontSize: 13 }} />
          </div>
          <button onClick={handleCheck} disabled={!file || checking}
            style={{ fontSize: 13, padding: '6px 18px', borderRadius: 6, cursor: 'pointer',
              border: 'none', color: '#fff',
              background: file && !checking ? '#185FA5' : '#b0b0ad',
              opacity: checking ? 0.8 : 1 }}>
            {checking ? 'Sjekker…' : 'Kontroller'}
          </button>
        </div>

        {parseErr && (
          <div style={{ marginTop: 14, padding: '8px 12px', background: '#fff0f0',
            color: '#A32D2D', borderRadius: 6, fontSize: 12 }}>
            {parseErr}
          </div>
        )}

        {importDone && (
          <div style={{ marginTop: 14, padding: '10px 14px', background: '#f0fff4',
            color: '#3B6D11', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>
            ✓ {importDone.count} transaksjoner importert — kategoriser dem i køen nedenfor
          </div>
        )}

        {/* Forhåndsvisning */}
        {preview && (
          <div style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', gap: 20, marginBottom: 14, alignItems: 'center',
              flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: '#888780' }}>
                Periode: {preview.minDate} – {preview.maxDate}
              </span>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#3B6D11',
                background: '#f0fff4', padding: '2px 10px', borderRadius: 4 }}>
                ✓ {preview.newRows.length} nye
              </span>
              {preview.dupRows.length > 0 && (
                <span style={{ fontSize: 12, color: '#888780',
                  background: '#f1efe8', padding: '2px 10px', borderRadius: 4 }}>
                  {preview.dupRows.length} allerede importert (hoppes over)
                </span>
              )}
            </div>

            {preview.newRows.length === 0 ? (
              <div style={{ padding: '12px 0', color: '#888780', fontSize: 13 }}>
                Alle transaksjoner i denne filen er allerede importert.
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto', marginBottom: 14,
                  border: '.5px solid #d3d1c7', borderRadius: 8, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr>{['Dato', 'Beskrivelse', 'Beløp'].map((h, i) => (
                        <th key={i} style={{ textAlign: i === 2 ? 'right' : 'left',
                          padding: '7px 10px', fontWeight: 500, color: '#5f5e5a',
                          borderBottom: '.5px solid #d3d1c7', background: '#f8f7f4' }}>{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {[...preview.newRows].reverse().slice(0, 50).map((r, i) => (
                        <tr key={i} style={{ borderBottom: '.5px solid #f1efe8' }}>
                          <td style={{ padding: '5px 10px', color: '#888780', whiteSpace: 'nowrap' }}>
                            {r.dato.slice(5).replace('-', '.')}
                          </td>
                          <td style={{ padding: '5px 10px' }}>{r.beskrivelse}</td>
                          <td style={{ padding: '5px 10px', textAlign: 'right',
                            color: r.belop < 0 ? '#A32D2D' : '#3B6D11', fontWeight: 500 }}>
                            {fmt(r.belop)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.newRows.length > 50 && (
                    <div style={{ padding: '6px 12px', fontSize: 11, color: '#888780',
                      background: '#f8f7f4', borderTop: '.5px solid #d3d1c7' }}>
                      … og {preview.newRows.length - 50} transaksjoner til
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleImport} disabled={importing}
                    style={{ fontSize: 13, padding: '7px 20px', borderRadius: 6, cursor: 'pointer',
                      background: '#185FA5', color: '#fff', border: 'none',
                      opacity: importing ? 0.7 : 1 }}>
                    {importing
                      ? 'Importerer…'
                      : `Importer ${preview.newRows.length} transaksjoner`}
                  </button>
                  <button onClick={() => setPreview(null)}
                    style={{ fontSize: 13, padding: '7px 16px', borderRadius: 6, cursor: 'pointer',
                      background: 'transparent', border: '.5px solid #d3d1c7', color: '#5f5e5a' }}>
                    Avbryt
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Card>

      {/* "Til gjennomgang"-kø */}
      <div style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Til gjennomgang</span>
          {!queueLoading && (
            <span style={{ fontSize: 12, color: '#888780' }}>
              {queue.length === 0
                ? '— ingen ukategoriserte'
                : `${queue.length} ukategoriserte transaksjoner`}
            </span>
          )}
          {!queueLoading && queue.length > 0 && (
            <button onClick={loadQueue}
              style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, cursor: 'pointer',
                background: 'transparent', border: '.5px solid #d3d1c7', color: '#888780',
                marginLeft: 'auto' }}>
              Oppdater
            </button>
          )}
        </div>

        {queueLoading ? (
          <div style={{ color: '#888780', fontSize: 13 }}>Laster…</div>
        ) : queue.length === 0 ? null : (
          <Card>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>{['Dato', 'Beskrivelse', 'Beløp', 'Kategori'].map((h, i) => (
                    <th key={i} style={{ textAlign: i === 2 ? 'right' : 'left',
                      padding: '7px 10px', fontWeight: 500, color: '#5f5e5a',
                      borderBottom: '.5px solid #d3d1c7' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {katLoading ? (
                    <tr><td colSpan={4} style={{ padding: 12, color: '#888780', fontSize: 12 }}>
                      Laster kategorier…
                    </td></tr>
                  ) : queue.map(tx => (
                    <QueueRow key={tx.id} tx={tx}
                      subcatMap={subcatMap} iconMap={iconMap}
                      onDone={id => setQueue(prev => prev.filter(t => t.id !== id))} />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
