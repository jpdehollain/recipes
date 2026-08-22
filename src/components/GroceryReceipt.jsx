export default function GroceryReceipt({ groups, recipeTitles }) {
  const itemCount = groups.reduce((sum, g) => sum + g.items.length, 0)
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

      {groups.map((group) => (
        <div key={group.category}>
          <div className="receipt-category">{group.category}</div>
          {group.items.map((item) => (
            <div className="receipt-item" key={item.name}>
              <span className="name">{item.name}</span>
              <span className="amount">{item.amount}</span>
            </div>
          ))}
        </div>
      ))}

      <hr className="receipt-divider" />
      <div className="receipt-total">{itemCount} item{itemCount === 1 ? '' : 's'} total</div>
    </div>
  )
}
