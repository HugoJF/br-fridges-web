
import { ArrowUp, ArrowDown, ArrowUpDown, EyeOff, RotateCcw, Zap, CheckCircle2, XCircle, Minus } from 'lucide-react'
import { type Fridge, FRIDGE_TYPE_LABELS, FRIDGE_TYPE_COLORS, type SortField, type SortDirection, type SpaceConstraints, getFitResult, isFitCheckActive } from '@/lib/fridge-types'
import { cn } from '@/lib/utils'

interface TableViewProps {
  fridges: Fridge[]
  sortField: SortField
  sortDir: SortDirection
  onSort: (field: SortField) => void
  compareIds: string[]
  onToggleCompare: (id: string) => void
  eliminatedIds: string[]
  onToggleEliminate: (id: string) => void
  showEliminated: boolean
  constraints: SpaceConstraints
}

interface SortHeaderProps {
  label: string
  field: SortField
  currentField: SortField
  currentDir: SortDirection
  onSort: (field: SortField) => void
  className?: string
}

function SortHeader({ label, field, currentField, currentDir, onSort, className }: SortHeaderProps) {
  const active = currentField === field
  return (
    <th
      className={cn(
        'px-3 py-2.5 text-left whitespace-nowrap cursor-pointer select-none group',
        className,
      )}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        <span
          className={cn(
            'text-[10px] uppercase tracking-widest font-semibold transition-colors',
            active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
          )}
        >
          {label}
        </span>
        <span className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
          {active ? (
            currentDir === 'asc' ? (
              <ArrowUp className="w-3 h-3 text-primary" />
            ) : (
              <ArrowDown className="w-3 h-3 text-primary" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3" />
          )}
        </span>
      </div>
    </th>
  )
}

function BooleanBadge({ value }: { value: boolean | null }) {
  if (value === null) {
    return <span className="text-xs text-muted-foreground/40">—</span>
  }
  return value ? (
    <span className="text-xs font-medium text-success">Sim</span>
  ) : (
    <span className="text-xs text-muted-foreground/50">Não</span>
  )
}

function FitBadge({ fridge, constraints }: { fridge: Fridge; constraints: SpaceConstraints }) {
  if (!isFitCheckActive(constraints)) return null
  const { fits, failedDimensions } = getFitResult(fridge, constraints)
  if (fits) {
    return <CheckCircle2 className="w-4 h-4 text-success" />
  }
  return (
    <span title={`Fails: ${failedDimensions.join(', ')}`}>
      <XCircle className="w-4 h-4 text-destructive" />
    </span>
  )
}

export default function TableView({
  fridges,
  sortField,
  sortDir,
  onSort,
  compareIds,
  onToggleCompare,
  eliminatedIds,
  onToggleEliminate,
  showEliminated: _showEliminated,
  constraints,
}: TableViewProps) {
  const fitActive = isFitCheckActive(constraints)

  if (fridges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Minus className="w-8 h-8 mb-3 opacity-40" />
        <p className="text-sm">No fridges match your filters.</p>
      </div>
    )
  }

  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-sm border-collapse">
        <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm border-b border-border">
          <tr>
            {/* Compare */}
            <th className="w-10 px-3 py-2.5">
              <span className="sr-only">Compare</span>
            </th>
            <SortHeader label="Brand" field="brand" currentField={sortField} currentDir={sortDir} onSort={onSort} />
            <SortHeader label="Model" field="model" currentField={sortField} currentDir={sortDir} onSort={onSort} />
            <th className="px-3 py-2.5 text-left">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Type</span>
            </th>
            <SortHeader label="Cap." field="capacity" currentField={sortField} currentDir={sortDir} onSort={onSort} />
            <SortHeader label="Width" field="width" currentField={sortField} currentDir={sortDir} onSort={onSort} />
            <SortHeader label="Height" field="height" currentField={sortField} currentDir={sortDir} onSort={onSort} />
            <SortHeader label="Depth" field="depth" currentField={sortField} currentDir={sortDir} onSort={onSort} />
            <SortHeader
              label="Depth 90°"
              field="depthWithDoors"
              currentField={sortField}
              currentDir={sortDir}
              onSort={onSort}
            />
            <th className="px-3 py-2.5 text-left">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Rev.
              </span>
            </th>
            <th className="px-3 py-2.5 text-left">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-1">
                <Zap className="w-3 h-3" /> Inv.
              </span>
            </th>
            <SortHeader label="kWh/mês" field="monthlyKwh" currentField={sortField} currentDir={sortDir} onSort={onSort} />
            <SortHeader label="Preço" field="price" currentField={sortField} currentDir={sortDir} onSort={onSort} />
            {fitActive && (
              <th className="px-3 py-2.5 text-left">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-primary">Fit</span>
              </th>
            )}
            <th className="w-10 px-3 py-2.5">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {fridges.map((fridge, i) => {
            const eliminated = eliminatedIds.includes(fridge.id)
            const inCompare = compareIds.includes(fridge.id)
            const canCompare = compareIds.length < 3 || inCompare

            return (
              <tr
                key={fridge.id}
                className={cn(
                  'border-b border-border transition-colors',
                  eliminated
                    ? 'opacity-30 bg-background'
                    : i % 2 === 0
                      ? 'bg-background hover:bg-muted/30'
                      : 'bg-card/50 hover:bg-muted/30',
                  inCompare && !eliminated && 'ring-1 ring-inset ring-primary/30',
                )}
              >
                {/* Compare checkbox */}
                <td className="px-3 py-2.5">
                  <button
                    onClick={() => !eliminated && canCompare && onToggleCompare(fridge.id)}
                    disabled={eliminated || (!inCompare && !canCompare)}
                    title={
                      !inCompare && !canCompare ? 'Maximum 3 fridges to compare' : inCompare ? 'Remove from comparison' : 'Add to comparison'
                    }
                    className={cn(
                      'w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer',
                      inCompare
                        ? 'bg-primary border-primary'
                        : 'border-border hover:border-primary/50',
                      (eliminated || (!inCompare && !canCompare)) && 'opacity-40 cursor-not-allowed',
                    )}
                    aria-label={`${inCompare ? 'Remove' : 'Add'} ${fridge.brand} ${fridge.model} ${inCompare ? 'from' : 'to'} comparison`}
                  >
                    {inCompare && (
                      <svg className="w-2.5 h-2.5 text-primary-foreground" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </td>

                {/* Brand */}
                <td className="px-3 py-2.5">
                  <span className={cn('text-xs font-semibold', eliminated ? 'line-through' : 'text-foreground')}>
                    {fridge.brand}
                  </span>
                </td>

                {/* Model */}
                <td className="px-3 py-2.5">
                  <span className={cn('text-xs text-muted-foreground', eliminated && 'line-through')}>
                    {fridge.model}
                  </span>
                </td>

                {/* Type */}
                <td className="px-3 py-2.5">
                  <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap', FRIDGE_TYPE_COLORS[fridge.type])}>
                    {FRIDGE_TYPE_LABELS[fridge.type]}
                  </span>
                </td>

                {/* Capacity */}
                <td className="px-3 py-2.5">
                  <span className="text-xs tabular-nums text-foreground">{fridge.capacity} L</span>
                </td>

                {/* Width */}
                <td className="px-3 py-2.5">
                  <span className="text-xs tabular-nums text-foreground">{fridge.width} cm</span>
                </td>

                {/* Height */}
                <td className="px-3 py-2.5">
                  <span className="text-xs tabular-nums text-foreground">{fridge.height} cm</span>
                </td>

                {/* Depth */}
                <td className="px-3 py-2.5">
                  <span className="text-xs tabular-nums text-foreground">{fridge.depth} cm</span>
                </td>

                {/* Depth with doors */}
                <td className="px-3 py-2.5">
                  {fridge.depthWithDoors != null
                    ? <span className="text-xs tabular-nums text-foreground">{fridge.depthWithDoors} cm</span>
                    : <span className="text-xs text-muted-foreground/50">—</span>
                  }
                </td>

                {/* Reversible */}
                <td className="px-3 py-2.5">
                  <BooleanBadge value={fridge.reversibleDoors} />
                </td>

                {/* Inverter */}
                <td className="px-3 py-2.5">
                  <BooleanBadge value={fridge.inverterCompressor} />
                </td>

                {/* Monthly kWh */}
                <td className="px-3 py-2.5">
                  {fridge.monthlyKwh != null
                    ? <span className="text-xs tabular-nums text-foreground">{fridge.monthlyKwh} kWh</span>
                    : <span className="text-xs text-muted-foreground/40">—</span>
                  }
                </td>

                {/* Price */}
                <td className="px-3 py-2.5">
                  <span className="text-xs font-semibold tabular-nums text-foreground">
                    R$ {fridge.price.toLocaleString('pt-BR')}
                  </span>
                </td>

                {/* Fit indicator */}
                {fitActive && (
                  <td className="px-3 py-2.5">
                    <FitBadge fridge={fridge} constraints={constraints} />
                  </td>
                )}

                {/* Actions */}
                <td className="px-3 py-2.5">
                  <button
                    onClick={() => onToggleEliminate(fridge.id)}
                    title={eliminated ? 'Restore fridge' : 'Eliminate fridge'}
                    className={cn(
                      'p-1 rounded transition-colors cursor-pointer',
                      eliminated
                        ? 'text-muted-foreground hover:text-foreground'
                        : 'text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted',
                    )}
                    aria-label={`${eliminated ? 'Restore' : 'Eliminate'} ${fridge.brand} ${fridge.model}`}
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
