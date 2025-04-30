export const normalizeDate = (date: Date | string): Date => {
  return typeof date === 'string' ? new Date(date) : date
}
