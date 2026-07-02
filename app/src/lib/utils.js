export const fmt = (n) =>
  Math.abs(n).toLocaleString('nb-NO', { maximumFractionDigits: 0 }) + ' kr'

export const MONTHS = ['Jan','Feb','Mar','Apr','Mai','Jun']

export const moIdx = (dato) =>
  parseInt(String(dato).replace(/\//g,'-').slice(5,7)) - 1
