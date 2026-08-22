export default function RecipeList({ recipes, onSelectRecipe, selectable, selectedIds, onToggleSelect }) {
  if (recipes.length === 0) {
    return (
      <div className="empty-state">
        No recipes yet. Add your first one from the "New recipe" tab.
      </div>
    )
  }

  return (
    <div>
      {recipes.map((recipe) => {
        const ingredientCount = recipe.ingredients?.length || 0

        if (selectable) {
          const checked = selectedIds.includes(recipe.id)
          return (
            <label className="recipe-card selectable" key={recipe.id}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggleSelect(recipe.id)}
              />
              <div>
                <h3>{recipe.title}</h3>
                <div className="meta">{ingredientCount} ingredient{ingredientCount === 1 ? '' : 's'}</div>
              </div>
            </label>
          )
        }

        return (
          <div className="recipe-card" key={recipe.id} onClick={() => onSelectRecipe(recipe)}>
            <h3>{recipe.title}</h3>
            <div className="meta">{ingredientCount} ingredient{ingredientCount === 1 ? '' : 's'}</div>
          </div>
        )
      })}
    </div>
  )
}
