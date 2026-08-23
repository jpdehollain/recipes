import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { auth, db } from './firebase'
import { ALLOWED_EMAILS } from './allowedEmails'
import Login from './components/Login'
import RecipeForm from './components/RecipeForm'
import RecipeList from './components/RecipeList'
import RecipeDetail from './components/RecipeDetail'
import GroceryListBuilder from './components/GroceryListBuilder'

const TABS = ['Recipes', 'New recipe', 'Grocery list']

export default function App() {
  const [user, setUser] = useState(undefined) // undefined = still checking, null = signed out
  const [recipes, setRecipes] = useState([])
  const [activeTab, setActiveTab] = useState('Recipes')
  const [selectedRecipe, setSelectedRecipe] = useState(null)

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && !ALLOWED_EMAILS.includes(firebaseUser.email)) {
        signOut(auth)
        setUser(null)
        return
      }
      setUser(firebaseUser)
    })
  }, [])

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'recipes'), orderBy('title'))
    return onSnapshot(q, (snapshot) => {
      setRecipes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
  }, [user])

  if (user === undefined) {
    return null // brief auth check, avoid flashing the login screen
  }

  if (!user) {
    return (
      <div className="app-shell">
        <Login />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <img src="android-chrome-512x512.png" style="width:80px;height:80px;border-radius:16px;object-fit:cover;opacity:.9"></img>
        <h1 className="app-title">Anano's Recipe App</h1>
        <button className="sign-out-link" onClick={() => signOut(auth)}>
          Sign out
        </button>
      </header>

      <nav className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => {
              setActiveTab(tab)
              setSelectedRecipe(null)
            }}
          >
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === 'Recipes' &&
        (selectedRecipe ? (
          <RecipeDetail
            recipe={selectedRecipe}
            onBack={() => setSelectedRecipe(null)}
            onDeleted={() => setSelectedRecipe(null)}
          />
        ) : (
          <RecipeList recipes={recipes} onSelectRecipe={setSelectedRecipe} />
        ))}

      {activeTab === 'New recipe' && (
        <RecipeForm onSaved={() => setActiveTab('Recipes')} />
      )}

      {activeTab === 'Grocery list' && <GroceryListBuilder recipes={recipes} />}
    </div>
  )
}
