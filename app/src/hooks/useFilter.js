import { useState, useMemo } from 'react'
import { moIdx } from '../lib/utils'

export function useFilter(tx) {
  const [month, setMonth] = useState(null) // null = alle

  const filtered = useMemo(() => {
    const exp = tx.filter(t => t.belop < 0 && t.area !== 'Inntekt')
    if (month === null) return exp
    return exp.filter(t => moIdx(t.dato) === month)
  }, [tx, month])

  const filteredInc = useMemo(() => {
    const inc = tx.filter(t => t.belop > 0 && t.area === 'Inntekt')
    if (month === null) return inc
    return inc.filter(t => moIdx(t.dato) === month)
  }, [tx, month])

  const nMnd = month === null ? 6 : 1

  return { filtered, filteredInc, month, setMonth, nMnd }
}
