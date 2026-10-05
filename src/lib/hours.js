import { BUSINESS } from '../data/business'

const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function nowInMadrid(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: BUSINESS.timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (t) => parts.find((p) => p.type === t).value
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'))
  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) }
}

export function openStatus(date) {
  const { day, minutes } = nowInMadrid(date)
  const open = toMin(BUSINESS.opens)
  const close = toMin(BUSINESS.closes)
  const isOpenDay = BUSINESS.openDays.includes(day)

  if (isOpenDay && minutes >= open && minutes < close) {
    return { open: true, label: `Abierto · cocina hasta las ${BUSINESS.closes}` }
  }
  if (isOpenDay && minutes < open) {
    return { open: false, label: `Cerrado · hoy abrimos a las ${BUSINESS.opens}` }
  }
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7
    if (BUSINESS.openDays.includes(d)) {
      const when = i === 1 ? 'mañana' : `el ${DAY_NAMES[d]}`
      return { open: false, label: `Cerrado · abrimos ${when} a las ${BUSINESS.opens}` }
    }
  }
  return { open: false, label: 'Cerrado' }
}
