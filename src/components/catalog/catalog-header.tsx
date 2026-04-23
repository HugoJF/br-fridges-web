import { Search, Table, LayoutGrid, X } from 'lucide-react'
import type { FilterState, FridgeType } from '@/lib/fridge-types'
import { FRIDGE_TYPE_LABELS } from '@/lib/fridge-types'
import { cn } from '@/lib/utils'

interface CatalogHeaderProps {
  viewMode: 'table' | 'cards'
  onViewModeChange: (mode: 'table' | 'cards') => void
  filters: FilterState
  onFiltersChange: (f: FilterState) => void
  resultCount: number
  totalCount: number
  capacityBounds: [number, number]
  priceBounds: [number, number]
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-primary/70 transition-colors cursor-pointer"
        aria-label={`Remove filter: ${label}`}
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}

export default function CatalogHeader({
  viewMode,
  onViewModeChange,
  filters,
  onFiltersChange,
  resultCount,
  totalCount,
  capacityBounds,
  priceBounds,
}: CatalogHeaderProps) {
  const update = (partial: Partial<FilterState>) => onFiltersChange({ ...filters, ...partial })

  const chips: { key: string; label: string; onRemove: () => void }[] = []

  filters.brands.forEach((brand) => {
    chips.push({
      key: `brand-${brand}`,
      label: brand,
      onRemove: () => update({ brands: filters.brands.filter((b) => b !== brand) }),
    })
  })

  filters.types.forEach((type: FridgeType) => {
    chips.push({
      key: `type-${type}`,
      label: FRIDGE_TYPE_LABELS[type],
      onRemove: () => update({ types: filters.types.filter((t) => t !== type) }),
    })
  })

  if (filters.capacityRange[0] !== capacityBounds[0] || filters.capacityRange[1] !== capacityBounds[1]) {
    chips.push({
      key: 'capacity',
      label: `${filters.capacityRange[0]}–${filters.capacityRange[1]} L`,
      onRemove: () => update({ capacityRange: capacityBounds }),
    })
  }

  if (filters.priceRange[0] !== priceBounds[0] || filters.priceRange[1] !== priceBounds[1]) {
    chips.push({
      key: 'price',
      label: `R$${filters.priceRange[0].toLocaleString('pt-BR')}–R$${filters.priceRange[1].toLocaleString('pt-BR')}`,
      onRemove: () => update({ priceRange: priceBounds }),
    })
  }

  if (filters.reversibleDoors !== null) {
    chips.push({
      key: 'reversible',
      label: `Rev. Doors: ${filters.reversibleDoors ? 'Yes' : 'No'}`,
      onRemove: () => update({ reversibleDoors: null }),
    })
  }

  if (filters.inverterCompressor !== null) {
    chips.push({
      key: 'inverter',
      label: `Inverter: ${filters.inverterCompressor ? 'Yes' : 'No'}`,
      onRemove: () => update({ inverterCompressor: null }),
    })
  }

  return (
    <div className="flex-shrink-0 border-b border-border bg-background">
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar marca ou modelo..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring transition-shadow"
          />
          {filters.search && (
            <button
              onClick={() => update({ search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Result count */}
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          <span className="font-semibold text-foreground">{resultCount}</span>
          <span> de {totalCount}</span>
        </div>

        <div className="flex-1" />

        {/* View toggle */}
        <div className="flex rounded-md border border-border overflow-hidden">
          <button
            onClick={() => onViewModeChange('table')}
            title="Table view"
            className={cn(
              'px-2.5 py-1.5 transition-colors cursor-pointer',
              viewMode === 'table'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
            aria-label="Switch to table view"
          >
            <Table className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange('cards')}
            title="Card view"
            className={cn(
              'px-2.5 py-1.5 transition-colors cursor-pointer border-l border-border',
              viewMode === 'cards'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
            aria-label="Switch to card view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      {chips.length > 0 && (
        <div className="flex items-center gap-1.5 px-4 pb-2.5 overflow-x-auto">
          {chips.map((chip) => (
            <FilterChip key={chip.key} label={chip.label} onRemove={chip.onRemove} />
          ))}
        </div>
      )}
    </div>
  )
}
