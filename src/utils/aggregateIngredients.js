import { CATEGORIES } from './categories'
import { toBaseAmount, humanizeAmount } from './unitConversion'

// Takes an array of recipe objects (each with an `ingredients` array) and
// returns a list of { category, items: [{ name, amount, recipes }] } groups,
// ordered by aisle, with items sorted alphabetically inside each group.
export function aggregateIngredients(recipes) {
  const merged = new Map() // key -> { name, unitType, unitLabel, baseAmount, category, recipes: Set }

  for (const recipe of recipes) {
    for (const ing of recipe.ingredients || []) {
      const name = (ing.name || '').trim()
      if (!name) continue

      const unitType = ing.unitType || 'count'
      const unitLabel = unitType === 'count' ? (ing.unit || '').trim() : ing.unit
      // Items only combine when name + unitType + unit label all match, so we
      // don't accidentally merge "2 onions" with "150g onion".
      const key = `${name.toLowerCase()}__${unitType}__${(unitLabel || '').toLowerCase()}`

      const baseAmount = toBaseAmount(Number(ing.quantity) || 0, ing.unit, unitType)

      if (merged.has(key)) {
        const existing = merged.get(key)
        existing.baseAmount += baseAmount
        existing.recipes.add(recipe.title)
      } else {
        merged.set(key, {
          name,
          unitType,
          unitLabel,
          baseAmount,
          category: ing.category || 'Other',
          recipes: new Set([recipe.title]),
        })
      }
    }
  }

  const grouped = {}
  for (const category of CATEGORIES) grouped[category] = []

  for (const item of merged.values()) {
    const displayAmount = humanizeAmount(item.baseAmount, item.unitType, item.unitLabel)
    const category = CATEGORIES.includes(item.category) ? item.category : 'Other'
    grouped[category].push({
      name: item.name,
      amount: displayAmount,
      recipes: Array.from(item.recipes),
    })
  }

  return CATEGORIES
    .map((category) => ({
      category,
      items: grouped[category].sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter((group) => group.items.length > 0)
}
