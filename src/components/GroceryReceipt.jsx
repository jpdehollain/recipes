export default function GroceryReceipt({ toBuy, pantry, recipeTitles }) {
  const buyCount = toBuy.reduce((sum, g) => sum + g.items.length, 0)
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
            <div className="receipt-item" key={item.name}>
              <span className="name">{item.name}</span>
              {item.amount && <span className="amount">{item.amount}</span>}
            </div>
          ))}
        </div>
      ))}

      <hr className="receipt-divider" />
      <div className="receipt-total">{buyCount} item{buyCount === 1 ? '' : 's'} to buy</div>

      {pantry.length > 0 && (
        <>
          <hr className="receipt-divider" />
          <div className="receipt-category receipt-category-pantry">Check Pantry</div>
          <div className="receipt-pantry-note">Staples you likely already have — top up if running low.</div>
          {pantry.map((item) => (
            <div className="receipt-item receipt-item-pantry" key={item.name}>
              <span className="name">{item.name}</span>
              <span className="amount">{item.amount} needed</span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}