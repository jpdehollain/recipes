// The order here doubles as the walking order through a typical grocery store,
// used to sort the final shopping list.
export const CATEGORIES = [
  'Produce',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Bakery',
  'Pantry',
  'Frozen',
  'Spices & Condiments',
  'Other',
]

// Lightweight keyword match used to pre-fill a guessed category when someone
// types an ingredient name. It's just a starting suggestion — always editable.
const KEYWORD_MAP = {
  Produce: [
    'onion', 'garlic', 'tomato', 'potato', 'carrot', 'lettuce', 'spinach',
    'pepper', 'capsicum', 'apple', 'banana', 'lemon', 'lime', 'herb',
    'cilantro', 'coriander', 'parsley', 'basil', 'mushroom', 'broccoli',
    'cucumber', 'avocado', 'ginger', 'zucchini', 'cabbage', 'celery', 'kale',
  ],
  'Meat & Seafood': [
    'chicken', 'beef', 'pork', 'lamb', 'mince', 'bacon', 'sausage',
    'fish', 'salmon', 'shrimp', 'prawn', 'tuna', 'turkey',
  ],
  'Dairy & Eggs': [
    'milk', 'cheese', 'butter', 'yogurt', 'yoghurt', 'cream', 'egg', 'parmesan',
  ],
  Bakery: ['bread', 'bun', 'roll', 'tortilla', 'bagel', 'pita', 'baguette'],
  Pantry: [
    'flour', 'sugar', 'rice', 'pasta', 'noodle', 'oil', 'vinegar', 'can',
    'stock', 'broth', 'bean', 'lentil', 'oat', 'cereal', 'nut', 'honey',
  ],
  Frozen: ['frozen', 'ice cream', 'peas'],
  'Spices & Condiments': [
    'salt', 'pepper', 'cumin', 'paprika', 'chilli', 'chili', 'spice',
    'sauce', 'ketchup', 'mustard', 'mayo', 'soy sauce', 'cinnamon',
    'oregano', 'thyme', 'stock cube',
  ],
}

export function guessCategory(ingredientName) {
  const name = ingredientName.toLowerCase()
  for (const category of CATEGORIES) {
    const keywords = KEYWORD_MAP[category]
    if (keywords && keywords.some((k) => name.includes(k))) {
      return category
    }
  }
  return 'Other'
}
