import { useState, useMemo } from 'react'
import RecipeList from './RecipeList'
import StaplesChecklist from './StaplesChecklist'
import GroceryReceipt from './GroceryReceipt'
import { aggregateIngredients } from '../utils/aggregateIngredients'

export default function GroceryListBuilder({ recipes, staples }) {
  const [selectedIds, setSelectedIds] = useState([])
  const [selectedStapleIds, setSelectedStapleIds] = useState([])
  const [showReceipt, setShowReceipt] = useState(false)

  function toggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function toggleStaple(id) {
    setSelectedStapleIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const selectedRecipes = useMemo(
    () => recipes.filter((r) => selectedIds.includes(r.id)),
    [recipes, selectedIds],
  )

  const selectedStaples = useMemo(
    () => staples.filter((s) => selectedStapleIds.includes(s.id)),
    [staples, selectedStapleIds],
  )

  const { toBuy, pantry } = useMemo(
    () => aggregateIngredients(selectedRecipes, selectedStaples),
    [selectedRecipes, selectedStaples],
  )

  const totalSelected = selectedIds.length + selectedStapleIds.length

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

      <StaplesChecklist staples={staples} selectedIds={selectedStapleIds} onToggle={toggleStaple} />

      <button
        className="btn btn-primary"
        disabled={totalSelected === 0}
        onClick={() => setShowReceipt(true)}
        style={{ marginTop: 16 }}
      >
        Build grocery list ({totalSelected})
      </button>
    </div>
  )
}
