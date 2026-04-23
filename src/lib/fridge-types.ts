export type FridgeType =
  | 'french-door'
  | 'side-by-side'
  | 'bottom-freezer'
  | 'top-freezer'
  | 'compact'

export const FRIDGE_TYPE_LABELS: Record<FridgeType, string> = {
  'french-door': 'French Door',
  'side-by-side': 'Side by Side',
  'bottom-freezer': 'Freezer Baixo',
  'top-freezer': 'Freezer Cima',
  compact: 'Compacto',
}

export const FRIDGE_TYPE_COLORS: Record<FridgeType, string> = {
  'french-door': 'bg-violet-100 text-violet-700',
  'side-by-side': 'bg-blue-100 text-blue-700',
  'bottom-freezer': 'bg-teal-100 text-teal-700',
  'top-freezer': 'bg-orange-100 text-orange-700',
  compact: 'bg-rose-100 text-rose-700',
}

export interface Fridge {
  id: string
  brand: string
  model: string
  capacity: number // liters
  type: FridgeType
  width: number // cm
  height: number // cm
  depth: number // cm
  depthWithDoors: number | null // cm, doors at 90° — may be unknown
  reversibleDoors: boolean | null // null = unknown
  inverterCompressor: boolean | null // null = unknown
  monthlyKwh: number | null // estimated monthly kWh — may be unknown
  price: number | null // approximate BRL — null = unknown
}

export interface SpaceConstraints {
  maxWidth: string
  maxHeight: string
  maxDepth: string
}

export interface FilterState {
  search: string
  brands: string[]
  types: FridgeType[]
  capacityRange: [number, number]
  priceRange: [number, number]
  reversibleDoors: boolean | null
  inverterCompressor: boolean | null
}

export type SortField =
  | 'brand'
  | 'model'
  | 'capacity'
  | 'price'
  | 'width'
  | 'height'
  | 'depth'
  | 'depthWithDoors'
  | 'monthlyKwh'

export type SortDirection = 'asc' | 'desc'

export function getFitResult(
  fridge: Fridge,
  constraints: SpaceConstraints,
): { fits: boolean; failedDimensions: string[] } {
  const w = parseFloat(constraints.maxWidth)
  const h = parseFloat(constraints.maxHeight)
  const d = parseFloat(constraints.maxDepth)

  const failedDimensions: string[] = []
  if (!isNaN(w) && w > 0 && fridge.width > w) failedDimensions.push('W')
  if (!isNaN(h) && h > 0 && fridge.height > h) failedDimensions.push('H')
  if (!isNaN(d) && d > 0 && fridge.depthWithDoors != null && fridge.depthWithDoors > d) failedDimensions.push('D°')

  return { fits: failedDimensions.length === 0, failedDimensions }
}

export function isFitCheckActive(constraints: SpaceConstraints): boolean {
  return Boolean(constraints.maxWidth || constraints.maxHeight || constraints.maxDepth)
}
