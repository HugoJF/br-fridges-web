import type { Fridge } from './fridge-types'

const DATA_URL = 'https://raw.githubusercontent.com/HugoJF/br-fridges/main/fridges.json'

export async function fetchFridges(): Promise<Fridge[]> {
  const res = await fetch(DATA_URL)
  if (!res.ok) throw new Error(`Failed to fetch fridges: ${res.status}`)
  return res.json() as Promise<Fridge[]>
}
