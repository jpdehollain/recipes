import { useState } from 'react'
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { CATEGORIES, guessCategory } from '../utils/categories'

export default function StaplesManager({ staples }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Other')
  const [categoryTouched, setCategoryTouched] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleNameChange(value) {
    setName(value)
    if (!categoryTouched) setCategory(guessCategory(value))
  }

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Give the item a name.')
      return
    }
    setSaving(true)
    try {
      await addDoc(collection(db, 'staples'), {
        name: name.trim(),
        category,
        needed: false,
        createdAt: serverTimestamp(),
      })
      setName('')
      setCategory('Other')
      setCategoryTouched(false)
    } catch (err) {
      setError('Something went wrong adding that item. Try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleCategoryChange(staple, newCategory) {
    await updateDoc(doc(db, 'staples', staple.id), { category: newCategory })
  }

  async function handleDelete(staple) {
    await deleteDoc(doc(db, 'staples', staple.id))
  }

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 0 }}>Staples</h3>
      <p style={{ color: 'var(--color-ink-light)', fontSize: '0.9rem' }}>
        Regular items that don't come from a recipe — milk, bread, coffee, and so on.
        You'll pick which ones you actually need each week from the Grocery list tab.
      </p>

      <form
        onSubmit={handleAdd}
        style={{ display: 'flex', gap: 8, marginBottom: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}
      >
        <input
          type="text"
          placeholder="e.g. Milk"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          style={{
            flex: '1 1 160px',
            padding: '10px 12px',
            border: '1px solid var(--color-line)',
            borderRadius: 'var(--radius-card)',
          }}
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value)
            setCategoryTouched(true)
          }}
          style={{ padding: '10px 12px', border: '1px solid var(--color-line)', borderRadius: 'var(--radius-card)' }}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Adding…' : 'Add'}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {staples.length === 0 ? (
        <div className="empty-state">No staples yet — add your first one above.</div>
      ) : (
        <ul className="staples-list">
          {staples.map((staple) => (
            <li key={staple.id} className="staples-list-item">
              <span className="name">{staple.name}</span>
              <select value={staple.category} onChange={(e) => handleCategoryChange(staple, e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                type="button"
                className="remove-row"
                onClick={() => handleDelete(staple)}
                aria-label={`Remove ${staple.name}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
