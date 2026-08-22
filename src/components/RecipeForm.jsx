import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { CATEGORIES, guessCategory } from '../utils/categories'
import { UNIT_TYPES } from '../utils/unitConversion'

function emptyIngredient() {
  return { name: '', quantity: '', unitType: 'count', unit: '', category: 'Other' }
}

export default function RecipeForm({ onSaved }) {
  const [title, setTitle] = useState('')
  const [procedure, setProcedure] = useState('')
  const [ingredients, setIngredients] = useState([emptyIngredient()])
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
      .map(({ _categoryTouched, ...ing }) => ({
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
      await addDoc(collection(db, 'recipes'), {
        title: title.trim(),
        procedure: procedure.trim(),
        ingredients: cleanedIngredients,
        createdAt: serverTimestamp(),
      })
      setTitle('')
      setProcedure('')
      setIngredients([emptyIngredient()])
      onSaved?.()
    } catch (err) {
      setError('Something went wrong saving the recipe. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
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

      <button className="btn btn-primary" type="submit" disabled={saving}>
        {saving ? 'Saving…' : 'Save recipe'}
      </button>
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
