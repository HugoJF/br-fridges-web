import type { Fridge, FilterState, SortField, SortDirection } from './fridge-types'

export function applyFilters(fridges: Fridge[], filters: FilterState): Fridge[] {
  return fridges.filter((fridge) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (
        !fridge.brand.toLowerCase().includes(q) &&
        !fridge.model.toLowerCase().includes(q) &&
        !fridge.type.toLowerCase().includes(q)
      )
        return false
    }
    if (filters.brands.length > 0 && !filters.brands.includes(fridge.brand)) return false
    if (filters.types.length > 0 && !filters.types.includes(fridge.type)) return false
    if (fridge.capacity < filters.capacityRange[0] || fridge.capacity > filters.capacityRange[1]) return false
    // fridges with unknown price (null) pass the price filter — they're not excluded by price constraints
    if (fridge.price != null && (fridge.price < filters.priceRange[0] || fridge.price > filters.priceRange[1])) return false
    // same null-pass-through for kWh
    if (fridge.monthlyKwh != null && (fridge.monthlyKwh < filters.kwhRange[0] || fridge.monthlyKwh > filters.kwhRange[1])) return false
    if (filters.reversibleDoors !== null && fridge.reversibleDoors !== filters.reversibleDoors) return false
    if (filters.inverterCompressor !== null && fridge.inverterCompressor !== filters.inverterCompressor) return false
    return true
  })
}

export function applySort(fridges: Fridge[], field: SortField, direction: SortDirection): Fridge[] {
  return [...fridges].sort((a, b) => {
    const aVal = a[field]
    const bVal = b[field]
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return 1
    if (bVal == null) return -1
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal
    }
    return 0
  })
}
