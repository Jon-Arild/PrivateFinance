import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTransaksjoner() {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = useCallback(async () => {
    const { data: rows, error: err } = await supabase
      .from('transaksjoner')
      .select('*')
      .order('dato', { ascending: false })
    if (err) { setError(err.message); setLoading(false); return }
    setData(rows)
    setLoading(false)
  }, [])

  const updateTx = useCallback((id, changes) => {
    setData(prev => prev.map(t => t.id === id ? { ...t, ...changes } : t))
  }, [])

  useEffect(() => { setLoading(true); load() }, [load])
  return { data, loading, error, reload: load, updateTx }
}
