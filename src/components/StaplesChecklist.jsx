import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

// Tick state is stored on the staple document itself (`needed`) rather than
// local component state, so it persists across tab switches, page reloads,
// and syncs live between you and your wife — unlike the recipe selection,
// which intentionally does reset each time.
export default function StaplesChecklist({ staples }) {
  if (staples.length === 0) return null

  function toggleNeeded(staple) {
    updateDoc(doc(db, 'staples', staple.id), { needed: !staple.needed })
  }

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
            checked={Boolean(staple.needed)}
            onChange={() => toggleNeeded(staple)}
          />
          <div>{staple.name}</div>
        </label>
      ))}
    </div>
  )
}
