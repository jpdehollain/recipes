export default function GroceryReceipt({ toBuy, recipeTitles, onToggleItem }) {
  const totalCount = toBuy.reduce((sum, g) => sum + g.items.length, 0)
  const checkedCount = toBuy.reduce(
    (sum, g) => sum + g.items.filter((item) => item.checked).length,
    0,
  )
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="receipt">
      <div className="receipt-title">Shopping List</div>
      <div className="receipt-subtitle">
        {today} · {recipeTitles.length} recipe{recipeTitles.length === 1 ? '' : 's'}
      </div>

      {toBuy.map((group) => (
        <div key={group.category}>
          <div className="receipt-category">{group.category}</div>
          {group.items.map((item) => (
            <label className={`receipt-item${item.checked ? ' checked' : ''}`} key={item.name}>
              <input
                type="checkbox"
                checked={Boolean(item.checked)}
                onChange={() => onToggleItem(group.category, item.name)}
              />
              <span className="name">{item.name}</span>
              {item.amount && <span className="amount">{item.amount}</span>}
            </label>
          ))}
        </div>
      ))}

      <hr className="receipt-divider" />
      <div className="receipt-total">{checkedCount} of {totalCount} item{totalCount === 1 ? '' : 's'} picked up</div>
    </div>
  )
}