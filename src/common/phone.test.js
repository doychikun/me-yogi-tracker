import { COUNTRIES, findCountry, formatPhone, phoneError, splitPhone } from './phone'

it('lists countries with their dial codes', () => {
  expect(findCountry('BG')).toEqual({ iso: 'BG', name: 'Bulgaria', dialCode: '+359' })
  expect(COUNTRIES.length).toBeGreaterThan(200)
})

it('accepts numbers of any reasonable length for the country', () => {
  expect(phoneError('888 123 456', 'BG')).toBeNull()
  expect(phoneError('0888123456', 'BG')).toBeNull()
  expect(phoneError('7911 123456', 'GB')).toBeNull()
  expect(phoneError('', 'BG')).toBeNull()
})

it('flags numbers that are clearly too short, too long or not numbers', () => {
  expect(phoneError('12', 'BG')).toMatch(/too short/)
  expect(phoneError('1234567890123456', 'BG')).toMatch(/too long/)
  expect(phoneError('call me', 'BG')).toMatch(/digits/)
})

it('stores numbers with the country code and without the trunk 0', () => {
  expect(formatPhone('BG', '0888 123 456')).toBe('+359 888123456')
  expect(formatPhone('BG', '888123456')).toBe('+359 888123456')
  expect(formatPhone('BG', '')).toBe('')
})

it('reads stored numbers back, including old ones without a country code', () => {
  expect(splitPhone('+359 888123456', 'BG')).toEqual({ iso: 'BG', national: '888123456' })
  expect(splitPhone('+1 4165550123', 'CA')).toEqual({ iso: 'CA', national: '4165550123' })
  expect(splitPhone('0888123456')).toEqual({ iso: 'BG', national: '0888123456' })
  expect(splitPhone(undefined)).toEqual({ iso: 'BG', national: '' })
})
