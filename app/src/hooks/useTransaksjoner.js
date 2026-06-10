import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTransaksjoner() {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data: rows, error: err } = await supabase
      .from('transaksjoner')
      .select('*')
      .order('dato', { ascending: false })
    if (err) { setError(err.message); setLoading(false); return }
    setData(rows)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])
  return { data, loading, error, reload: load }
}
