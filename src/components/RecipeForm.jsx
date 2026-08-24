import { useState } from 'react'
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { CATEGORIES, guessCategory } from '../utils/categories'
import { UNIT_TYPES } from '../utils/unitConversion'
import { guessIsPantryStaple } from '../utils/pantryStaples'

function emptyIngredient() {
  return { name: '', quantity: '', unitType: 'count', unit: '', category: 'Other', isPantryStaple: false }
}

// Pass `recipe` to edit an existing one; omit it to create a new one.
// Render with a `key` tied to the recipe id (see App.jsx) so the form
// remounts with fresh state when switching between add/edit or between
// different recipes.
export default function RecipeForm({ recipe, onSaved, onCancel }) {
  const isEditing = Boolean(recipe)

  const [title, setTitle] = useState(recipe?.title || '')
  const [procedure, setProcedure] = useState(recipe?.procedure || '')
  const [ingredients, setIngredients] = useState(
    recipe?.ingredients?.length
      ? recipe.ingredients.map((ing) => ({ ...ing, _categoryTouched: true, _pantryTouched: true }))
      : [emptyIngredient()],
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function updateIngredient(index, changes) {
    setIngredients((prev) =>
      prev.map((ing, i) => {
        if (i !== index) return ing
        const updated = { ...ing, ...changes }
        // Auto-guess a category the first time a name is typed, but don't
        // override a category someone already picked on purpose.
        if (changes.name !== undefined && !ing._categoryTouched) {
          updated.category = guessCategory(changes.name)
        }
        // Same idea for the pantry-staple guess.
        if (changes.name !== undefined && !ing._pantryTouched) {
          updated.isPantryStaple = guessIsPantryStaple(changes.name)
        }
        // Reset unit when unit type changes so stale units (e.g. "cup" left
        // over after switching to weight) don't linger.
        if (changes.unitType !== undefined) {
          updated.unit = changes.unitType === 'count' ? ing.unit : ''
        }
        return updated
      }),
    )
  }

  function markCategoryTouched(index, category) {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, category, _categoryTouched: true } : ing)),
    )
  }

  function togglePantryStaple(index, isPantryStaple) {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, isPantryStaple, _pantryTouched: true } : ing)),
    )
  }

  function addIngredientRow() {
    setIngredients((prev) => [...prev, emptyIngredient()])
  }

  function removeIngredientRow(index) {
    setIngredients((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const cleanedIngredients = ingredients
      .filter((ing) => ing.name.trim())
      .map(({ _categoryTouched, _pantryTouched, ...ing }) => ({
        ...ing,
        quantity: Number(ing.quantity) || 0,
      }))

    if (!title.trim()) {
      setError('Give the recipe a title.')
      return
    }
    if (cleanedIngredients.length === 0) {
      setError('Add at least one ingredient.')
      return
    }

    setSaving(true)
    try {
      if (isEditing) {
        await updateDoc(doc(db, 'recipes', recipe.id), {
          title: title.trim(),
          procedure: procedure.trim(),
          ingredients: cleanedIngredients,
        })
      } else {
        await addDoc(collection(db, 'recipes'), {
          title: title.trim(),
          procedure: procedure.trim(),
          ingredients: cleanedIngredients,
          createdAt: serverTimestamp(),
        })
        setTitle('')
        setProcedure('')
        setIngredients([emptyIngredient()])
      }
      onSaved?.()
    } catch (err) {
      setError('Something went wrong saving the recipe. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 0 }}>
        {isEditing ? 'Edit recipe' : 'New recipe'}
      </h3>

      <div className="field-group">
        <label htmlFor="title">Recipe title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Weeknight chicken curry"
        />
      </div>

      <div className="field-group">
        <label>Ingredients</label>
        {ingredients.map((ing, index) => (
          <div className="ingredient-row" key={index}>
            <input
              type="text"
              placeholder="Ingredient name"
              value={ing.name}
              onChange={(e) => updateIngredient(index, { name: e.target.value })}
            />
            <input
              type="number"
              min="0"
              step="any"
              placeholder="Qty"
              value={ing.quantity}
              onChange={(e) => updateIngredient(index, { quantity: e.target.value })}
            />
            <UnitTypeSelect
              value={ing.unitType}
              onChange={(unitType) => updateIngredient(index, { unitType })}
            />
            <UnitSelect ingredient={ing} onChange={(changes) => updateIngredient(index, changes)} />
            <select
              value={ing.category}
              onChange={(e) => markCategoryTouched(index, e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <label className="pantry-checkbox">
              <input
                type="checkbox"
                checked={Boolean(ing.isPantryStaple)}
                onChange={(e) => togglePantryStaple(index, e.target.checked)}
              />
              Pantry
            </label>
            <button
              type="button"
              className="remove-row"
              onClick={() => removeIngredientRow(index)}
              aria-label="Remove ingredient"
            >
              ✕
            </button>
          </div>
        ))}
        <button type="button" className="btn-text" onClick={addIngredientRow}>
          + Add ingredient
        </button>
      </div>

      <div className="field-group">
        <label htmlFor="procedure">Procedure</label>
        <textarea
          id="procedure"
          value={procedure}
          onChange={(e) => setProcedure(e.target.value)}
          placeholder={'1. Chop the onions...\n2. Heat oil in a pan...'}
        />
      </div>

      {error && <p className="error-text">{error}</p>}

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving…' : isEditing ? 'Update recipe' : 'Save recipe'}
        </button>
        {isEditing && (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

function UnitSelect({ ingredient, onChange }) {
  const { unitType, unit } = ingredient

  if (unitType === 'count') {
    return (
      <input
        type="text"
        placeholder="e.g. clove, whole"
        value={unit}
        onChange={(e) => onChange({ unit: e.target.value })}
      />
    )
  }

  return (
    <select
      value={unit}
      onChange={(e) => onChange({ unit: e.target.value })}
    >
      <option value="">Unit…</option>
      {Object.entries(UNIT_TYPES[unitType].units).map(([key, def]) => (
        <option key={key} value={key}>{def.label}</option>
      ))}
    </select>
  )
}

export function UnitTypeSelect({ value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {Object.entries(UNIT_TYPES).map(([key, def]) => (
        <option key={key} value={key}>{def.label}</option>
      ))}
    </select>
  )
}
