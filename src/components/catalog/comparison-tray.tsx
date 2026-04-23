
import { X, GitCompareArrows } from 'lucide-react'
import { type Fridge, FRIDGE_TYPE_LABELS, FRIDGE_TYPE_COLORS } from '@/lib/fridge-types'
import { cn } from '@/lib/utils'

interface ComparisonTrayProps {
  fridges: Fridge[]
  onRemove: (id: string) => void
  onClear: () => void
}

type SpecValue = string | number | boolean | null

type SpecRow = {
  label: string
  getValue: (f: Fridge) => SpecValue
  format: (v: SpecValue) => string
  bestIs?: 'higher' | 'lower'
}

const SPEC_ROWS: SpecRow[] = [
  {
    label: 'Type',
    getValue: (f) => FRIDGE_TYPE_LABELS[f.type],
    format: (v) => String(v),
  },
  {
    label: 'Capacity',
    getValue: (f) => f.capacity,
    format: (v) => `${v} L`,
    bestIs: 'higher',
  },
  {
    label: 'Width',
    getValue: (f) => f.width,
    format: (v) => `${v} cm`,
    bestIs: 'lower',
  },
  {
    label: 'Height',
    getValue: (f) => f.height,
    format: (v) => `${v} cm`,
    bestIs: 'lower',
  },
  {
    label: 'Depth',
    getValue: (f) => f.depth,
    format: (v) => `${v} cm`,
    bestIs: 'lower',
  },
  {
    label: 'Depth (doors 90°)',
    getValue: (f) => f.depthWithDoors,
    format: (v) => v != null ? `${v} cm` : '—',
    bestIs: 'lower',
  },
  {
    label: 'Porta reversível',
    getValue: (f) => f.reversibleDoors,
    format: (v) => v === null ? '—' : v ? 'Sim' : 'Não',
  },
  {
    label: 'Inverter',
    getValue: (f) => f.inverterCompressor,
    format: (v) => v === null ? '—' : v ? 'Sim' : 'Não',
  },
  {
    label: 'kWh/mês',
    getValue: (f) => f.monthlyKwh,
    format: (v) => v != null ? `${v} kWh` : '—',
    bestIs: 'lower',
  },
  {
    label: 'Preço',
    getValue: (f) => f.price,
    format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`,
    bestIs: 'lower',
  },
]

function getBestIndex(fridges: Fridge[], row: SpecRow): number {
  if (!row.bestIs) return -1
  const values = fridges.map((f) => row.getValue(f))
  const nums = values.filter((v): v is number => typeof v === 'number')
  if (nums.length === 0) return -1
  const best = row.bestIs === 'higher' ? Math.max(...nums) : Math.min(...nums)
  const bestCount = nums.filter((n) => n === best).length
  if (bestCount > 1) return -1
  return values.findIndex((v) => v === best)
}

export default function ComparisonTray({ fridges, onRemove, onClear }: ComparisonTrayProps) {
  if (fridges.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <GitCompareArrows className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Comparing {fridges.length} {fridges.length === 1 ? 'fridge' : 'fridges'}
          </span>
          <span className="text-xs text-muted-foreground">— up to 3</span>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          Clear all
        </button>
      </div>

      {/* Comparison grid */}
      <div className="overflow-x-auto">
        <div
          className="grid min-w-[520px]"
          style={{ gridTemplateColumns: `120px repeat(${fridges.length}, 1fr)` }}
        >
          {/* Fridge headers */}
          <div className="border-r border-border" />
          {fridges.map((fridge) => (
            <div
              key={fridge.id}
              className="flex items-start justify-between px-3 py-2 border-r border-border last:border-r-0 bg-muted/30"
            >
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium truncate">
                  {fridge.brand}
                </div>
                <div className="text-xs font-semibold text-foreground truncate">{fridge.model}</div>
                <span className={cn('inline-flex mt-1 items-center px-1.5 py-0.5 rounded text-[10px] font-medium', FRIDGE_TYPE_COLORS[fridge.type])}>
                  {FRIDGE_TYPE_LABELS[fridge.type]}
                </span>
              </div>
              <button
                onClick={() => onRemove(fridge.id)}
                className="ml-2 mt-0.5 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 cursor-pointer"
                aria-label={`Remove ${fridge.brand} ${fridge.model} from comparison`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Spec rows */}
          {SPEC_ROWS.map((row) => {
            const bestIdx = getBestIndex(fridges, row)
            return (
              <>
                <div
                  key={`label-${row.label}`}
                  className="flex items-center px-3 py-1.5 border-r border-b border-border bg-muted/10"
                >
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium whitespace-nowrap">
                    {row.label}
                  </span>
                </div>
                {fridges.map((fridge, i) => {
                  const val = row.getValue(fridge)
                  const isBest = bestIdx === i
                  return (
                    <div
                      key={`val-${row.label}-${fridge.id}`}
                      className={cn(
                        'flex items-center px-3 py-1.5 border-r border-b border-border last:border-r-0',
                        isBest && 'bg-primary/5',
                      )}
                    >
                      {(() => {
                        const formatted = row.format(val)
                        if (formatted === '—') return <span className="text-xs text-muted-foreground/40">—</span>
                        if (formatted === 'Sim') return <span className="text-xs font-medium text-success">Sim</span>
                        if (formatted === 'Não') return <span className="text-xs text-muted-foreground/50">Não</span>
                        return (
                          <span className={cn('text-xs', isBest ? 'text-primary font-semibold' : 'text-foreground')}>
                            {formatted}
                          </span>
                        )
                      })()}
                      {isBest && (
                        <span className="ml-1.5 text-[9px] text-primary/70 font-medium uppercase tracking-wide">
                          melhor
                        </span>
                      )}
                    </div>
                  )
                })}
              </>
            )
          })}
        </div>
      </div>
    </div>
  )
}
