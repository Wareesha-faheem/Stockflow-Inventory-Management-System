// Groups bill totals by date for a revenue-over-time chart, sorted oldest -> newest.
export function groupRevenueByDate(billHistory) {
  const map = {};
  billHistory.forEach((b) => {
    map[b.date] = (map[b.date] || 0) + b.total;
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, revenue }));
}

// Aggregates line-item sales into per-product totals, best sellers first.
export function topProducts(salesHistory, limit = 5) {
  const map = {};
  salesHistory.forEach((s) => {
    if (!map[s.product]) map[s.product] = { product: s.product, units: 0, revenue: 0 };
    map[s.product].units += s.quantity;
    map[s.product].revenue += s.total;
  });
  return Object.values(map)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}
