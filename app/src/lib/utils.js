export const fmt = (n) =>
  Math.abs(n).toLocaleString('nb-NO', { maximumFractionDigits: 0 }) + ' kr'

export const MONTHS = ['Jan','Feb','Mar','Apr','Mai','Jun']

export const AREA_COLORS = {
  'Enebolig':'#185FA5','Hytta':'#5DCAA5','Båt':'#EF9F27',
  'Bil':'#BA7517','Dagligliv':'#3B6D11','Personlig':'#97C459',
  'Fritid':'#5DCAA5','Ferie':'#A32D2D','Barna':'#EF9F27',
  'Familie':'#97C459','Økonomi':'#534AB7','Inntekt':'#3B6D11','Annet':'#888780'
}

export const AREA_ICONS = {
  'Enebolig':'🏠','Hytta':'🏔️','Båt':'⛵','Bil':'🚗',
  'Dagligliv':'🛒','Personlig':'🧍','Fritid':'⛳','Ferie':'✈️',
  'Barna':'👶','Familie':'👨‍👩‍👧','Økonomi':'💰','Annet':'•'
}

export const moIdx = (dato) =>
  parseInt(String(dato).replace(/\//g,'-').slice(5,7)) - 1
