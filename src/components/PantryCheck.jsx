export default function PantryCheck({ items, checkedNames, onToggle, onContinue, onBack }) {
  return (
    <div>
      <button className="btn-text" onClick={onBack} style={{ marginBottom: 16 }}>
        ← Edit selection
      </button>
      <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 0 }}>Check your pantry</h3>
      <p style={{ color: 'var(--color-ink-light)', fontSize: '0.9rem' }}>
        These are used in this week's recipes but are usually stocked in bulk. Tick anything
        you're out of — everything else is assumed to already be on hand.
      </p>

      {items.map((item) => (
        <label className="recipe-card selectable" key={item.name} style={{ padding: '10px 14px' }}>
          <input
            type="checkbox"
            checked={checkedNames.has(item.name)}
            onChange={() => onToggle(item.name)}
          />
          <div>
            <div>{item.name}</div>
            <div className="meta">{item.amount} needed</div>
          </div>
        </label>
      ))}

      <button className="btn btn-primary" onClick={onContinue} style={{ marginTop: 16 }}>
        Continue to grocery list
      </button>
    </div>
  )
}
