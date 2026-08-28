import { useState, useMemo } from 'react'
import RecipeList from './RecipeList'
import StaplesChecklist from './StaplesChecklist'
import PantryCheck from './PantryCheck'
import GroceryReceipt from './GroceryReceipt'
import { aggregateIngredients, mergeCheckedPantryItems } from '../utils/aggregateIngredients'

export default function GroceryListBuilder({ recipes, staples }) {
  const [selectedIds, setSelectedIds] = useState([])
  const [step, setStep] = useState('select') // 'select' | 'pantry' | 'receipt'
  const [checkedPantryNames, setCheckedPantryNames] = useState(new Set())

  function toggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function togglePantryItem(name) {
    setCheckedPantryNames((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const selectedRecipes = useMemo(
    () => recipes.filter((r) => selectedIds.includes(r.id)),
    [recipes, selectedIds],
  )

  // Staple selection ("needed") lives on the staple documents themselves
  // (see StaplesChecklist), not local state, so it isn't reset here.
  const selectedStaples = useMemo(() => staples.filter((s) => s.needed), [staples])

  const { toBuy, pantry } = useMemo(
    () => aggregateIngredients(selectedRecipes, selectedStaples),
    [selectedRecipes, selectedStaples],
  )

  const finalToBuy = useMemo(
    () => mergeCheckedPantryItems(toBuy, pantry, checkedPantryNames),
    [toBuy, pantry, checkedPantryNames],
  )

  const totalSelected = selectedIds.length + selectedStaples.length

  function startBuilding() {
    setCheckedPantryNames(new Set())
    setStep(pantry.length > 0 ? 'pantry' : 'receipt')
  }

  if (step === 'pantry') {
    return (
      <PantryCheck
        items={pantry}
        checkedNames={checkedPantryNames}
        onToggle={togglePantryItem}
        onContinue={() => setStep('receipt')}
        onBack={() => setStep('select')}
      />
    )
  }

  if (step === 'receipt') {
    return (
      <div>
        <button className="btn-text" onClick={() => setStep('select')} style={{ marginBottom: 16 }}>
          ← Edit selection
        </button>
        <GroceryReceipt toBuy={finalToBuy} recipeTitles={selectedRecipes.map((r) => r.title)} />
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

      <StaplesChecklist staples={staples} />

      <button
        className="btn btn-primary"
        disabled={totalSelected === 0}
        onClick={startBuilding}
        style={{ marginTop: 16 }}
      >
        Build grocery list ({totalSelected})
      </button>
    </div>
  )
}
