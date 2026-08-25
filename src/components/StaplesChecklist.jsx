export default function StaplesChecklist({ staples, selectedIds, onToggle }) {
  if (staples.length === 0) return null

  return (
    <div style={{ marginTop: 24 }}>
      <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: 4 }}>Staples</h4>
      <p style={{ color: 'var(--color-ink-light)', fontSize: '0.85rem', marginTop: 0 }}>
        Tick anything you're running low on.
      </p>
      {staples.map((staple) => (
        <label className="recipe-card selectable" key={staple.id} style={{ padding: '10px 14px' }}>
          <input
            type="checkbox"
            checked={selectedIds.includes(staple.id)}
            onChange={() => onToggle(staple.id)}
          />
          <div>{staple.name}</div>
        </label>
      ))}
    </div>
  )
}
