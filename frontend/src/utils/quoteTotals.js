export function calcQuote(items, taxRate) {
  const gross = items.reduce((t, i) => t + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0)
  const discount = items.reduce((t, i) => t + (Number(i.discount) || 0), 0)
  const taxable = Math.max(0, gross - discount)
  const tax = Math.round((taxable * (Number(taxRate) || 0)) / 100)

  return { subtotal: gross, discount, tax, total: taxable + tax }
}