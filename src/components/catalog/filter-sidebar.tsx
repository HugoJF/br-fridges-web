import { Ruler, RotateCcw, Zap, ChevronDown, ChevronUp } from 'lucide-react'
import { useState, useMemo } from 'react'
import type { ReactNode } from 'react'
import { Slider } from '@/components/ui/slider'
import type { FilterState, FridgeType, SpaceConstraints } from '@/lib/fridge-types'
import { FRIDGE_TYPE_LABELS } from '@/lib/fridge-types'
import { cn } from '@/lib/utils'

interface FilterSidebarProps {
  filters: FilterState
  onFiltersChange: (f: FilterState) => void
  constraints: SpaceConstraints
  onConstraintsChange: (c: SpaceConstraints) => void
  eliminatedCount: number
  showEliminated: boolean
  onToggleShowEliminated: () => void
  brands: string[]
  types: FridgeType[]
  capacityBounds: [number, number]
  priceBounds: [number, number]
  kwhBounds: [number, number]
}

function SectionHeader({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">{count}</span>
      )}
    </div>
  )
}

type TriState = true | false | null

function TriStateToggle({
  label,
  value,
  onChange,
  icon,
}: {
  label: string
  value: TriState
  onChange: (v: TriState) => void
  icon?: ReactNode
}) {
  const options: { label: string; value: TriState }[] = [
    { label: 'All', value: null },
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ]
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="text-xs text-foreground">{label}</span>
      </div>
      <div className="flex rounded-md border border-border overflow-hidden">
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 py-1 text-[11px] font-medium transition-colors cursor-pointer',
              value === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function RangeSlider({
  label,
  min,
  max,
  value,
  step,
  format,
  onChange,
}: {
  label: string
  min: number
  max: number
  value: [number, number]
  step: number
  format: (v: number) => string
  onChange: (v: [number, number]) => void
}) {
  const isDefault = value[0] === min && value[1] === max
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-foreground">{label}</span>
        {!isDefault && (
          <button
            onClick={() => onChange([min, max])}
            className="text-[10px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={(v) => onChange([v[0], v[1]])}
        className="mb-2"
      />
      <div className="flex justify-between">
        <span className="text-[10px] font-mono text-muted-foreground">{format(value[0])}</span>
        <span className="text-[10px] font-mono text-muted-foreground">{format(value[1])}</span>
      </div>
    </div>
  )
}

export default function FilterSidebar({
  filters,
  onFiltersChange,
  constraints,
  onConstraintsChange,
  eliminatedCount,
  showEliminated,
  onToggleShowEliminated,
  brands,
  types,
  capacityBounds,
  priceBounds,
  kwhBounds,
}: FilterSidebarProps) {
  const [fitOpen, setFitOpen] = useState(false)

  const update = (partial: Partial<FilterState>) => onFiltersChange({ ...filters, ...partial })

  const toggleBrand = (brand: string) => {
    const next = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand]
    update({ brands: next })
  }

  const toggleType = (type: FridgeType) => {
    const next = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type]
    update({ types: next })
  }

  const activeFilterCount = useMemo(
    () =>
      [
        filters.brands.length > 0,
        filters.types.length > 0,
        filters.capacityRange[0] !== capacityBounds[0] || filters.capacityRange[1] !== capacityBounds[1],
        filters.priceRange[0] !== priceBounds[0] || filters.priceRange[1] !== priceBounds[1],
        filters.kwhRange[0] !== kwhBounds[0] || filters.kwhRange[1] !== kwhBounds[1],
        filters.reversibleDoors !== null,
        filters.inverterCompressor !== null,
      ].filter(Boolean).length,
    [filters, capacityBounds, priceBounds, kwhBounds],
  )

  const fitActive = Boolean(constraints.maxWidth || constraints.maxHeight || constraints.maxDepth)

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col border-r border-border bg-card overflow-y-auto">
      {/* Logo / title */}
      <div className="px-4 py-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-foreground tracking-tight">FridgeFinder</h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">{brands.length > 0 ? `${brands.length} brands` : 'Loading…'}</p>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={() =>
                onFiltersChange({
                  search: filters.search,
                  brands: [],
                  types: [],
                  capacityRange: capacityBounds,
                  priceRange: priceBounds,
                  kwhRange: kwhBounds,
                  reversibleDoors: null,
                  inverterCompressor: null,
                })
              }
              className="text-[10px] text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Brands */}
        <div>
          <SectionHeader label="Brand" count={filters.brands.length} />
          <div className="space-y-1">
            {brands.map((brand) => {
              const checked = filters.brands.includes(brand)
              return (
                <label
                  key={brand}
                  className="flex items-center gap-2.5 py-1 cursor-pointer group"
                >
                  <div
                    onClick={() => toggleBrand(brand)}
                    className={cn(
                      'w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer',
                      checked ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50',
                    )}
                  >
                    {checked && (
                      <svg className="w-2 h-2 text-primary-foreground" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span
                    onClick={() => toggleBrand(brand)}
                    className={cn(
                      'text-xs transition-colors select-none',
                      checked ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground',
                    )}
                  >
                    {brand}
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Types */}
        <div>
          <SectionHeader label="Type" count={filters.types.length} />
          <div className="space-y-1">
            {types.map((type) => {
              const checked = filters.types.includes(type)
              return (
                <label
                  key={type}
                  className="flex items-center gap-2.5 py-1 cursor-pointer group"
                >
                  <div
                    onClick={() => toggleType(type)}
                    className={cn(
                      'w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer',
                      checked ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50',
                    )}
                  >
                    {checked && (
                      <svg className="w-2 h-2 text-primary-foreground" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span
                    onClick={() => toggleType(type)}
                    className={cn(
                      'text-xs transition-colors select-none',
                      checked ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground',
                    )}
                  >
                    {FRIDGE_TYPE_LABELS[type]}
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Capacity slider */}
        <RangeSlider
          label="Capacity (L)"
          min={capacityBounds[0]}
          max={capacityBounds[1]}
          step={10}
          value={filters.capacityRange}
          format={(v) => `${v} L`}
          onChange={(v) => update({ capacityRange: v })}
        />

        {/* Price slider */}
        <RangeSlider
          label="Preço (BRL)"
          min={priceBounds[0]}
          max={priceBounds[1]}
          step={50}
          value={filters.priceRange}
          format={(v) => `R$${v.toLocaleString('pt-BR')}`}
          onChange={(v) => update({ priceRange: v })}
        />

        {/* kWh slider */}
        <RangeSlider
          label="Consumo (kWh/mês)"
          min={kwhBounds[0]}
          max={kwhBounds[1]}
          step={1}
          value={filters.kwhRange}
          format={(v) => `${v} kWh`}
          onChange={(v) => update({ kwhRange: v })}
        />

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Boolean filters */}
        <div className="space-y-3">
          <TriStateToggle
            label="Reversible Doors"
            value={filters.reversibleDoors}
            onChange={(v) => update({ reversibleDoors: v })}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          />
          <TriStateToggle
            label="Inverter Compressor"
            value={filters.inverterCompressor}
            onChange={(v) => update({ inverterCompressor: v })}
            icon={<Zap className="w-3.5 h-3.5" />}
          />
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Fit Check */}
        <div>
          <button
            onClick={() => setFitOpen((o) => !o)}
            className="w-full flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Ruler className={cn('w-3.5 h-3.5 transition-colors', fitActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
              <span className={cn('text-xs font-medium transition-colors', fitActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')}>
                Fit Check
              </span>
              {fitActive && (
                <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            {fitOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>

          {fitOpen && (
            <div className="mt-3 space-y-2.5">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Enter your available space. Depth is checked against doors-open depth.
              </p>
              {[
                { key: 'maxWidth', label: 'Max Width (cm)' },
                { key: 'maxHeight', label: 'Max Height (cm)' },
                { key: 'maxDepth', label: 'Max Depth (cm)' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{label}</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="—"
                    value={constraints[key as keyof SpaceConstraints]}
                    onChange={(e) =>
                      onConstraintsChange({ ...constraints, [key]: e.target.value })
                    }
                    className="w-full bg-input border border-border rounded px-2.5 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring transition-shadow"
                  />
                </div>
              ))}
              {fitActive && (
                <button
                  onClick={() => onConstraintsChange({ maxWidth: '', maxHeight: '', maxDepth: '' })}
                  className="text-[10px] text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                >
                  Clear fit check
                </button>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        {eliminatedCount > 0 && <div className="border-t border-border" />}

        {/* Eliminated section */}
        {eliminatedCount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {eliminatedCount} eliminated
            </span>
            <button
              onClick={onToggleShowEliminated}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {showEliminated ? 'Hide' : 'Show'}
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
