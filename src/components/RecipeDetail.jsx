import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'

export default function RecipeDetail({ recipe, onBack, onDeleted }) {
  async function handleDelete() {
    if (!confirm(`Delete "${recipe.title}"? This can't be undone.`)) return
    await deleteDoc(doc(db, 'recipes', recipe.id))
    onDeleted?.()
  }

  return (
    <div className="recipe-detail">
      <button className="btn-text" onClick={onBack} style={{ marginBottom: 16 }}>
        ← Back to recipes
      </button>
      <h2 style={{ fontFamily: 'var(--font-display)' }}>{recipe.title}</h2>

      <h4>Ingredients</h4>
      <ul className="ingredient-list">
        {recipe.ingredients.map((ing, i) => (
          <li key={i}>
            <span>{ing.name}</span>
            <span className="meta">
              {ing.quantity} {ing.unit}
            </span>
          </li>
        ))}
      </ul>

      <h4>Procedure</h4>
      <p className="steps">{recipe.procedure || 'No procedure added.'}</p>

      <button className="btn btn-secondary" onClick={handleDelete} style={{ marginTop: 24 }}>
        Delete recipe
      </button>
    </div>
  )
}
