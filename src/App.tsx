import { ThemeProvider } from '@/components/theme-provider'
import FridgeCatalog from '@/components/catalog/fridge-catalog'

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="br-fridges-theme">
      <FridgeCatalog />
    </ThemeProvider>
  )
}
