export interface WeekRange {
  start: Date // Monday 00:00:00
  end: Date   // Sunday 23:59:59
}

/** Returns the Monday–Sunday range for the week containing `date` */
export function getWeekRangeMondayToSunday(date: Date): WeekRange {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay() // 0=Sun,1=Mon,...,6=Sat
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diffToMonday)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { start: monday, end: sunday }
}

/**
 * Payment rule: week closes on Sunday; payment is the Wednesday
 * immediately following that Sunday.
 */
export function getExpectedPaymentDate(saleDate: Date): Date {
  const { end: sunday } = getWeekRangeMondayToSunday(saleDate)
  // Sunday + 3 days = Wednesday
  const wednesday = new Date(sunday)
  wednesday.setDate(sunday.getDate() + 3)
  wednesday.setHours(0, 0, 0, 0)
  return wednesday
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function fromISODate(dateStr: string): Date {
  // Parse as local date to avoid timezone offset shifting the day
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatDateBR(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export function formatDateLongBR(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

export function todayISO(): string {
  return toISODate(new Date())
}
