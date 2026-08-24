import { CATEGORIES } from './categories'
import { toBaseAmount, humanizeAmount } from './unitConversion'

// Takes an array of recipe objects (each with an `ingredients` array) and
// returns { toBuy, pantry }:
//   toBuy   - [{ category, items: [{ name, amount, recipes }] }], ordered by
//             aisle, for ingredients you actually need to shop for.
//   pantry  - [{ name, amount, recipes }], alphabetical, for bulk staples
//             you likely already have — a "check before you go" list rather
//             than a shopping list.
export function aggregateIngredients(recipes) {
  const merged = new Map() // key -> { name, unitType, unitLabel, baseAmount, category, isPantryStaple, recipes: Set }

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
          isPantryStaple: Boolean(ing.isPantryStaple),
          recipes: new Set([recipe.title]),
        })
      }
    }
  }

  const toBuyGrouped = {}
  for (const category of CATEGORIES) toBuyGrouped[category] = []
  const pantryItems = []

  for (const item of merged.values()) {
    const displayAmount = humanizeAmount(item.baseAmount, item.unitType, item.unitLabel)
    const entry = {
      name: item.name,
      amount: displayAmount,
      recipes: Array.from(item.recipes),
    }

    if (item.isPantryStaple) {
      pantryItems.push(entry)
    } else {
      const category = CATEGORIES.includes(item.category) ? item.category : 'Other'
      toBuyGrouped[category].push(entry)
    }
  }

  const toBuy = CATEGORIES
    .map((category) => ({
      category,
      items: toBuyGrouped[category].sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter((group) => group.items.length > 0)

  pantryItems.sort((a, b) => a.name.localeCompare(b.name))

  return { toBuy, pantry: pantryItems }
}
