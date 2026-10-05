export const BUSINESS = {
  name: 'La Comuna',
  fullName: 'La Comuna Smash & Tacos',
  phoneDisplay: '623 62 26 96',
  phoneE164: '+34623622696',
  instagram: 'lacomunaburgers',
  address: {
    street: 'C. Virgen de las Mercedes, N4, Bajo B',
    postalCode: '04712',
    locality: 'Balerma',
    municipality: 'El Ejido',
    region: 'Almería',
  },
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('La Comuna Smash & Tacos, C. Virgen de las Mercedes 4, 04712 Balerma, El Ejido'),
  // 0 = domingo … 6 = sábado. Lunes cerrado.
  openDays: [0, 2, 3, 4, 5, 6],
  opens: '19:30',
  closes: '23:30',
  timeZone: 'Europe/Madrid',
  deliveryArea: 'Balerma',
}

export const telHref = `tel:${BUSINESS.phoneE164}`
export const instagramUrl = `https://www.instagram.com/${BUSINESS.instagram}/`

// `?&body=` funciona tanto en iOS como en Android.
export const smsHref = (body) => `sms:${BUSINESS.phoneE164}?&body=${encodeURIComponent(body)}`
