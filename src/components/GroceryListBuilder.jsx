import { useState, useMemo } from 'react'
import RecipeList from './RecipeList'
import GroceryReceipt from './GroceryReceipt'
import { aggregateIngredients } from '../utils/aggregateIngredients'

export default function GroceryListBuilder({ recipes }) {
  const [selectedIds, setSelectedIds] = useState([])
  const [showReceipt, setShowReceipt] = useState(false)

  function toggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const selectedRecipes = useMemo(
    () => recipes.filter((r) => selectedIds.includes(r.id)),
    [recipes, selectedIds],
  )

  const { toBuy, pantry } = useMemo(() => aggregateIngredients(selectedRecipes), [selectedRecipes])

  if (showReceipt) {
    return (
      <div>
        <button className="btn-text" onClick={() => setShowReceipt(false)} style={{ marginBottom: 16 }}>
          ← Edit selection
        </button>
        <GroceryReceipt toBuy={toBuy} pantry={pantry} recipeTitles={selectedRecipes.map((r) => r.title)} />
      </div>
    )
  }

  return (
    <div>
      <p style={{ color: 'var(--color-ink-light)', marginTop: 0 }}>
        Pick the recipes you're making this week.
      </p>
      <RecipeList
        recipes={recipes}
        selectable
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
      />
      <button
        className="btn btn-primary"
        disabled={selectedIds.length === 0}
        onClick={() => setShowReceipt(true)}
        style={{ marginTop: 16 }}
      >
        Build grocery list ({selectedIds.length})
      </button>
    </div>
  )
}
