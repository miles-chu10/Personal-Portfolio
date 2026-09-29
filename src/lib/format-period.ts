export function formatPeriod(period: string) {
  return period.replaceAll(" ", "\u00A0").replaceAll("-", " - ");
}
