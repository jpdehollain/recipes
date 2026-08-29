import { useState, useMemo, useEffect } from 'react'
import { doc, onSnapshot, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import RecipeList from './RecipeList'
import StaplesChecklist from './StaplesChecklist'
import PantryCheck from './PantryCheck'
import GroceryReceipt from './GroceryReceipt'
import { aggregateIngredients, mergeCheckedPantryItems } from '../utils/aggregateIngredients'

// A single shared document for the household's current shopping list. There's
// only ever one active list at a time, so a fixed id keeps this simple and
// lets both of you see the same live tick progress from any device.
const ACTIVE_LIST_REF = doc(db, 'activeGroceryList', 'current')

export default function GroceryListBuilder({ recipes, staples }) {
  const [selectedIds, setSelectedIds] = useState([])
  const [step, setStep] = useState('select') // 'select' | 'pantry'
  const [checkedPantryNames, setCheckedPantryNames] = useState(new Set())
  const [activeList, setActiveList] = useState(undefined) // undefined = loading, null = no active list
  const [showCompleteModal, setShowCompleteModal] = useState(false)

  useEffect(() => {
    return onSnapshot(ACTIVE_LIST_REF, (snap) => {
      setActiveList(snap.exists() ? snap.data() : null)
    })
  }, [])

  function toggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function togglePantryItem(name) {
    setCheckedPantryNames((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const selectedRecipes = useMemo(
    () => recipes.filter((r) => selectedIds.includes(r.id)),
    [recipes, selectedIds],
  )

  const selectedStaples = useMemo(() => staples.filter((s) => s.needed), [staples])

  const { toBuy, pantry } = useMemo(
    () => aggregateIngredients(selectedRecipes, selectedStaples),
    [selectedRecipes, selectedStaples],
  )

  const finalToBuy = useMemo(
    () => mergeCheckedPantryItems(toBuy, pantry, checkedPantryNames),
    [toBuy, pantry, checkedPantryNames],
  )

  const totalSelected = selectedIds.length + selectedStaples.length

  function goToPantryOrBuild() {
    if (pantry.length > 0) {
      setCheckedPantryNames(new Set())
      setStep('pantry')
    } else {
      buildList(toBuy)
    }
  }

  async function buildList(groups) {
    const groupsWithChecked = groups.map((group) => ({
      category: group.category,
      items: group.items.map((item) => ({ ...item, checked: false })),
    }))
    await setDoc(ACTIVE_LIST_REF, {
      groups: groupsWithChecked,
      recipeTitles: selectedRecipes.map((r) => r.title),
      createdAt: serverTimestamp(),
    })
    setSelectedIds([])
    setStep('select')
  }

  async function toggleItem(category, name) {
    const newGroups = activeList.groups.map((group) => {
      if (group.category !== category) return group
      return {
        ...group,
        items: group.items.map((item) =>
          item.name === name ? { ...item, checked: !item.checked } : item,
        ),
      }
    })
    await updateDoc(ACTIVE_LIST_REF, { groups: newGroups })

    const allChecked = newGroups.every((group) => group.items.every((item) => item.checked))
    if (allChecked) setShowCompleteModal(true)
  }

  async function finishShopping() {
    await deleteDoc(ACTIVE_LIST_REF)
    setShowCompleteModal(false)
  }

  if (activeList === undefined) {
    return null // brief loading state while we check for an active list
  }

  if (activeList) {
    return (
      <div>
        <GroceryReceipt
          toBuy={activeList.groups}
          recipeTitles={activeList.recipeTitles || []}
          onToggleItem={toggleItem}
        />
        <button
          className="btn btn-secondary"
          onClick={() => {
            if (confirm('Finish shopping and clear this list?')) finishShopping()
          }}
          style={{ marginTop: 16 }}
        >
          Finished shopping
        </button>

        {showCompleteModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <p>Happy shopping, you grabbed all items on the list! 🎉</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={finishShopping}>
                  Clear list
                </button>
                <button className="btn btn-secondary" onClick={() => setShowCompleteModal(false)}>
                  Keep list
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (step === 'pantry') {
    return (
      <PantryCheck
        items={pantry}
        checkedNames={checkedPantryNames}
        onToggle={togglePantryItem}
        onContinue={() => buildList(finalToBuy)}
        onBack={() => setStep('select')}
      />
    )
  }

  return (
    <div>
      <p style={{ color: 'var(--color-ink-light)', marginTop: 0 }}>
        Pick the recipes you're making this week.
      </p>
      <RecipeList
        recipes={recipes}
        selectable
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
      />

      <StaplesChecklist staples={staples} />

      <button
        className="btn btn-primary"
        disabled={totalSelected === 0}
        onClick={goToPantryOrBuild}
        style={{ marginTop: 16 }}
      >
        Build grocery list ({totalSelected})
      </button>
    </div>
  )
}
