
import { EyeOff, RotateCcw, Zap, CheckCircle2, XCircle, Minus } from 'lucide-react'
import { type Fridge, FRIDGE_TYPE_LABELS, FRIDGE_TYPE_COLORS, type SpaceConstraints, getFitResult, isFitCheckActive } from '@/lib/fridge-types'
import { cn } from '@/lib/utils'

interface CardViewProps {
  fridges: Fridge[]
  compareIds: string[]
  onToggleCompare: (id: string) => void
  eliminatedIds: string[]
  onToggleEliminate: (id: string) => void
  showEliminated: boolean
  constraints: SpaceConstraints
}

function FitChip({ fridge, constraints }: { fridge: Fridge; constraints: SpaceConstraints }) {
  if (!isFitCheckActive(constraints)) return null
  const { fits, failedDimensions } = getFitResult(fridge, constraints)
  if (fits) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-success/15 text-success border border-success/20">
        <CheckCircle2 className="w-3 h-3" />
        Fits
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-destructive/10 text-destructive border border-destructive/20"
      title={`Fails: ${failedDimensions.join(', ')}`}
    >
      <XCircle className="w-3 h-3" />
      {failedDimensions.join(' ')} too big
    </span>
  )
}

export default function CardView({
  fridges,
  compareIds,
  onToggleCompare,
  eliminatedIds,
  onToggleEliminate,
  constraints,
}: CardViewProps) {
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
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {fridges.map((fridge) => {
        const eliminated = eliminatedIds.includes(fridge.id)
        const inCompare = compareIds.includes(fridge.id)
        const canCompare = compareIds.length < 3 || inCompare

        return (
          <div
            key={fridge.id}
            className={cn(
              'relative flex flex-col rounded-lg border bg-card transition-all',
              eliminated
                ? 'opacity-30 border-border'
                : inCompare
                  ? 'border-primary/50 shadow-[0_0_0_1px_var(--color-primary)]/20 bg-card'
                  : 'border-border hover:border-border/80',
            )}
          >
            {/* Card header */}
            <div className="px-4 pt-4 pb-3 border-b border-border">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-0.5">
                    {fridge.brand}
                  </div>
                  <div className={cn('text-sm font-semibold font-mono leading-tight', eliminated && 'line-through')}>
                    {fridge.model}
                  </div>
                </div>
                <button
                  onClick={() => onToggleEliminate(fridge.id)}
                  title={eliminated ? 'Restore' : 'Eliminate'}
                  className="flex-shrink-0 p-1 rounded text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                  aria-label={`${eliminated ? 'Restore' : 'Eliminate'} ${fridge.brand} ${fridge.model}`}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium', FRIDGE_TYPE_COLORS[fridge.type])}>
                    {FRIDGE_TYPE_LABELS[fridge.type]}
                  </span>
                {fitActive && <FitChip fridge={fridge} constraints={constraints} />}
              </div>
            </div>

            {/* Specs grid */}
            <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2.5 flex-1">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Capacity</div>
                <div className="text-sm font-mono font-semibold text-foreground">{fridge.capacity} L</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Preço</div>
                <div className="text-sm font-semibold text-primary">{fridge.price != null ? `R$ ${fridge.price.toLocaleString('pt-BR')}` : '—'}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">W × H × D</div>
                <div className="text-xs text-muted-foreground tabular-nums">
                  {fridge.width} × {fridge.height} × {fridge.depth}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Depth 90°</div>
                {fridge.depthWithDoors != null
                  ? <div className="text-xs text-foreground tabular-nums">{fridge.depthWithDoors} cm</div>
                  : <div className="text-xs text-muted-foreground/40">—</div>
                }
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">kWh/mês</div>
                {fridge.monthlyKwh != null
                  ? <div className="text-xs text-foreground tabular-nums">{fridge.monthlyKwh} kWh</div>
                  : <div className="text-xs text-muted-foreground/40">—</div>
                }
              </div>
            </div>

            {/* Features row */}
            <div className="px-4 py-2 border-t border-border flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <RotateCcw className="w-3 h-3" />
                {fridge.reversibleDoors === null
                  ? <span className="text-muted-foreground/40">—</span>
                  : fridge.reversibleDoors
                    ? <span className="font-medium text-success">Sim</span>
                    : <span className="text-muted-foreground/50">Não</span>
                }
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <Zap className="w-3 h-3" />
                {fridge.inverterCompressor === null
                  ? <span className="text-muted-foreground/40">—</span>
                  : fridge.inverterCompressor
                    ? <span className="font-medium text-success">Sim</span>
                    : <span className="text-muted-foreground/50">Não</span>
                }
              </span>
            </div>

            {/* Compare button */}
            <div className="px-4 pb-4 pt-2">
              <button
                onClick={() => !eliminated && canCompare && onToggleCompare(fridge.id)}
                disabled={eliminated || (!inCompare && !canCompare)}
                className={cn(
                  'w-full py-1.5 text-xs font-medium rounded border transition-colors cursor-pointer',
                  inCompare
                    ? 'bg-primary/10 border-primary/50 text-primary hover:bg-primary/20'
                    : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                  (eliminated || (!inCompare && !canCompare)) && 'opacity-40 cursor-not-allowed',
                )}
                aria-label={`${inCompare ? 'Remove from' : 'Add to'} comparison`}
              >
                {inCompare ? 'Remove from compare' : !canCompare ? 'Max 3 selected' : 'Add to compare'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
