import { useState } from 'react'
import { signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { ALLOWED_EMAILS } from '../allowedEmails'
import logo from '/recipes/android-chrome-512x512.png'

export default function Login() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGoogleSignIn() {
    setError('')
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const email = result.user.email

      if (!ALLOWED_EMAILS.includes(email)) {
        await signOut(auth)
        setError(`${email} isn't authorized to use this app.`)
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Something went wrong signing in. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-card">
      <img src={logo} style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover', opacity: '.9' }} />
      <h1>Anano's Recipe App</h1>
      <p style={{ color: 'var(--color-ink-light)', fontSize: '0.9rem' }}>
        Sign in with Google to view and plan your household's recipes.
      </p>
      {error && <p className="error-text">{error}</p>}
      <button className="btn btn-primary" onClick={handleGoogleSignIn} disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in with Google'}
      </button>
    </div>
  )
}
