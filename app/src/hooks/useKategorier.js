import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

let _cache   = null
let _promise = null

async function fetchKategorier() {
  if (_cache) return _cache
  if (!_promise) {
    _promise = (async () => {
      const [{ data: omraderData }, { data: subcatData }] = await Promise.all([
        supabase.from('omrader').select('*').eq('aktiv', true).order('sort_order'),
        supabase.from('underkategorier').select('*').eq('aktiv', true).order('sort_order'),
      ])
      const subcatMap = {}, colorMap = {}, iconMap = {}
      ;(omraderData || []).forEach(o => {
        colorMap[o.navn] = o.farge || '#888780'
        iconMap[o.navn]  = o.ikon  || ''
        subcatMap[o.navn] = []
      })
      ;(subcatData || []).forEach(s => {
        if (subcatMap[s.area]) subcatMap[s.area].push(s.navn)
      })
      _cache = { omrader: omraderData || [], subcatMap, colorMap, iconMap }
      return _cache
    })()
  }
  return _promise
}

export function clearKategorierCache() {
  _cache   = null
  _promise = null
}

export function useKategorier() {
  const [data,    setData]    = useState(_cache)
  const [loading, setLoading] = useState(!_cache)

  useEffect(() => {
    if (_cache) { setData(_cache); setLoading(false); return }
    let cancelled = false
    fetchKategorier().then(d => {
      if (!cancelled) { setData(d); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [])

  return {
    omrader:   data?.omrader   || [],
    subcatMap: data?.subcatMap || {},
    colorMap:  data?.colorMap  || {},
    iconMap:   data?.iconMap   || {},
    loading,
  }
}
