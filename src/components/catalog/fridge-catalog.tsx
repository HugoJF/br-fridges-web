import { useState, useMemo, useEffect, useRef } from 'react'
import { fetchFridges } from '@/lib/data'
import { applyFilters, applySort } from '@/lib/fridge-data'
import type { Fridge, FilterState, FridgeType, SortField, SortDirection, SpaceConstraints } from '@/lib/fridge-types'
import FilterSidebar from './filter-sidebar'
import CatalogHeader from './catalog-header'
import TableView from './table-view'
import CardView from './card-view'
import ComparisonTray from './comparison-tray'

const DEFAULT_CONSTRAINTS: SpaceConstraints = {
  maxWidth: '',
  maxHeight: '',
  maxDepth: '',
}

const TRAY_HEIGHT = 288

function minOf(arr: number[]): number {
  return arr.reduce((a, b) => (b < a ? b : a), Infinity)
}
function maxOf(arr: number[]): number {
  return arr.reduce((a, b) => (b > a ? b : a), -Infinity)
}

export default function FridgeCatalog() {
  const [fridges, setFridges] = useState<Fridge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    brands: [],
    types: [],
    capacityRange: [0, 9999],
    priceRange: [0, 999999],
    reversibleDoors: null,
    inverterCompressor: null,
  })
  const [sortField, setSortField] = useState<SortField>('brand')
  const [sortDir, setSortDir] = useState<SortDirection>('asc')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [eliminatedIds, setEliminatedIds] = useState<string[]>([])
  const [showEliminated, setShowEliminated] = useState(false)
  const [constraints, setConstraints] = useState<SpaceConstraints>(DEFAULT_CONSTRAINTS)

  useEffect(() => {
    const controller = new AbortController()
    fetchFridges(controller.signal)
      .then(setFridges)
      .catch((e: unknown) => {
        if (e instanceof Error && e.name === 'AbortError') return
        setError(String(e instanceof Error ? e.message : e))
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  // Initialize filter ranges once data loads — useMemo bounds are the single source of truth
  const boundsInitialized = useRef(false)

  const allBrands = useMemo(() => [...new Set(fridges.map((f) => f.brand))].sort(), [fridges])
  const allTypes = useMemo(() => [...new Set(fridges.map((f) => f.type))] as FridgeType[], [fridges])
  const capacityBounds = useMemo((): [number, number] => {
    if (!fridges.length) return [0, 9999]
    const caps = fridges.map((f) => f.capacity)
    return [minOf(caps), maxOf(caps)]
  }, [fridges])
  const priceBounds = useMemo((): [number, number] => {
    const prices = fridges.map((f) => f.price).filter((p): p is number => p != null)
    if (!prices.length) return [0, 999999]
    return [minOf(prices), maxOf(prices)]
  }, [fridges])

  useEffect(() => {
    if (fridges.length > 0 && !boundsInitialized.current) {
      boundsInitialized.current = true
      setFilters((prev) => ({ ...prev, capacityRange: capacityBounds, priceRange: priceBounds }))
    }
  }, [fridges, capacityBounds, priceBounds])

  const eliminatedIdsSet = useMemo(() => new Set(eliminatedIds), [eliminatedIds])

  const filteredFridges = useMemo(() => applyFilters(fridges, filters), [fridges, filters])

  const displayFridges = useMemo(() => {
    if (showEliminated) return filteredFridges
    return filteredFridges.filter((f) => !eliminatedIdsSet.has(f.id))
  }, [filteredFridges, eliminatedIdsSet, showEliminated])

  const sortedFridges = useMemo(
    () => applySort(displayFridges, sortField, sortDir),
    [displayFridges, sortField, sortDir],
  )

  const compareFridges = useMemo(
    () => compareIds.map((id) => fridges.find((f) => f.id === id)).filter((f): f is Fridge => f != null),
    [compareIds, fridges],
  )

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const handleToggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  const handleToggleEliminate = (id: string) => {
    setEliminatedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    setCompareIds((prev) => prev.filter((x) => x !== id))
  }

  const trayOpen = compareIds.length > 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <span className="text-muted-foreground text-sm">Carregando geladeiras…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <span className="text-destructive text-sm">Erro: {error}</span>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <FilterSidebar
        filters={filters}
        onFiltersChange={setFilters}
        constraints={constraints}
        onConstraintsChange={setConstraints}
        eliminatedCount={eliminatedIds.length}
        showEliminated={showEliminated}
        onToggleShowEliminated={() => setShowEliminated((p) => !p)}
        brands={allBrands}
        types={allTypes}
        capacityBounds={capacityBounds}
        priceBounds={priceBounds}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <CatalogHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filters={filters}
          onFiltersChange={setFilters}
          resultCount={sortedFridges.length}
          totalCount={fridges.length}
          capacityBounds={capacityBounds}
          priceBounds={priceBounds}
        />
        <div
          className="flex-1 overflow-auto"
          style={{ paddingBottom: trayOpen ? TRAY_HEIGHT : 0 }}
        >
          {viewMode === 'table' ? (
            <TableView
              fridges={sortedFridges}
              sortField={sortField}
              sortDir={sortDir}
              onSort={handleSort}
              compareIds={compareIds}
              onToggleCompare={handleToggleCompare}
              eliminatedIds={eliminatedIds}
              onToggleEliminate={handleToggleEliminate}
              showEliminated={showEliminated}
              constraints={constraints}
            />
          ) : (
            <CardView
              fridges={sortedFridges}
              compareIds={compareIds}
              onToggleCompare={handleToggleCompare}
              eliminatedIds={eliminatedIds}
              onToggleEliminate={handleToggleEliminate}
              showEliminated={showEliminated}
              constraints={constraints}
            />
          )}
        </div>
      </div>

      {trayOpen && (
        <ComparisonTray
          fridges={compareFridges}
          onRemove={(id) => setCompareIds((prev) => prev.filter((x) => x !== id))}
          onClear={() => setCompareIds([])}
        />
      )}
    </div>
  )
}
