// Ingredients that are typically bought in bulk and used sparingly per
// recipe (oils, vinegars, dried herbs, baking staples) — the kind of thing
// you check you still have rather than re-buy every week.
const PANTRY_KEYWORDS = [
  'oil', 'vinegar', 'honey', 'sugar', 'flour', 'salt', 'rice', 'pasta',
  'noodle', 'stock', 'broth', 'soy sauce', 'oat', 'cereal',
  'baking powder', 'baking soda', 'vanilla', 'cornstarch', 'corn starch',
  'cumin', 'paprika', 'cinnamon', 'oregano', 'thyme', 'chilli flake',
  'chili flake', 'bay leaf', 'nutmeg', 'turmeric', 'peanut butter',
  'lentil', 'bean', 'nut', 'seed', 'spice', 'honey', 'syrup', 'yeast',
  'milk', 'butter', 'cheese', 'yogurt', 'yoghurt', 'egg', 'cheese',
]

export function guessIsPantryStaple(ingredientName) {
  const name = ingredientName.toLowerCase()
  return PANTRY_KEYWORDS.some((k) => name.includes(k))
}
