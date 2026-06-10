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

export const AREA_SUBCATS = {
  'Annet':    ['Ukategorisert'],
  'Barna':    ['Barnebarn','Emilie','Jonathan','Sarah'],
  'Bil':      ['Billån Nissan Ariya','Drivstoff & parkering'],
  'Båt':      ['Båtplass','Forsikring','Opplag & havn','Renter','Service & vedlikehold','Strøm'],
  'Dagligliv':['Abonnement & medier','Kontantuttak','Mat & dagligvarer','Restaurant & café'],
  'Enebolig': ['Bygg & utstyr','Forsikring','Hage & gartner','Interiør & kunst','Kommunale avgifter','Oppussing','Renter','Strøm','TV & internett'],
  'Familie':  ['Kone brukskonto'],
  'Ferie':    ['Barcelona','Ferietur','Fly & reise','Overnatting & reise','Påsketur'],
  'Fritid':   ['Sport & aktiviteter'],
  'Hytta':    ['Oppussing','Renter','Strøm','TV & internett','Vedlikehold','Velforening'],
  'Inntekt':  ['Jalco','Lønn IMI','Lønn Noen AS','NAV Pensjon'],
  'Personlig':['Helse & trening','Klær & mote','Velvære & pleie'],
  'Økonomi':  ['Bankgebyrer','Gjeld','Restskatt','Sparing & investering','Ukjent lån'],
}
