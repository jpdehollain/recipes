// Only these Google accounts are allowed to use the app. Anyone else who
// signs in with Google gets immediately signed back out.
//
// IMPORTANT: this list must also be kept in sync with the allowlist inside
// firestore.rules, since this file only controls the app's UI — the
// Firestore rules are what actually protect your data. Edit both together.
export const ALLOWED_EMAILS = [
  'jpdehollain@gmail.com',
  'anaparismogna@gmail.com',
]
