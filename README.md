# Anano's Recipe App

A small app for planning weekly recipes and building a combined grocery list,
sorted by store aisle. Built with React + Vite, data stored in Firebase, hosted
on GitHub Pages.

## 1. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a new project (free "Spark" plan is enough).
2. In the project, go to **Security > Authentication > Get started**, enable the **Google** sign-in method (you'll need to set a support email, which can be your own).
3. Go to **Databases & Storage > Firestore**, click **Create database**, choose **Standard edition**, pick a location near you, and continue through the prompts (any starting security rules mode is fine — you'll overwrite it in step 5).
4. Go to **Project settings** (gear icon) > **General** > scroll to "Your apps" > click the **</>** (web) icon to register a new web app. Copy the `firebaseConfig` values shown — you'll need them in step 2 below.
5. In the Firestore section, go to the **Rules** tab and paste in the contents of `firestore.rules` from this repo (with your real emails filled in), then publish.
6. Edit `src/allowedEmails.js` and replace the placeholder emails with the actual Google account emails you and your wife will sign in with. Do the same for the matching list inside `firestore.rules` (in the console, not just this repo file) — both need to match or the rules will reject you.
7. Once you deploy to GitHub Pages (step 3 below), come back to **Authentication > Settings > Authorized domains** in the Firebase console and add your GitHub Pages domain (e.g. `yourname.github.io`), or Google sign-in will be blocked on the live site.

## 2. Local development

```bash
npm install
cp .env.example .env
```

Fill in `.env` with the Firebase config values from step 1.4 above. Then:

```bash
npm run dev
```

Visit the local URL it prints (typically `http://localhost:5173`) and sign in with Google using one of the allowed emails. Note: Google sign-in via popup works fine on `localhost` without any extra "authorized domain" setup — that's only needed once you deploy.

## 3. Deploy to GitHub Pages

1. Create a new GitHub repo and push this project to it.
2. In `vite.config.js`, set `base` to `/your-repo-name/` (matching your actual repo name).
3. In your GitHub repo, go to **Settings > Pages**, and under "Build and deployment", set **Source** to **GitHub Actions**.
4. Go to **Settings > Secrets and variables > Actions**, and add each of these as a repository secret (values from step 1.5):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
5. Push to the `main` branch. The included GitHub Actions workflow (`.github/workflows/deploy.yml`) will build and publish automatically. Check the **Actions** tab for progress, then find your live URL under **Settings > Pages**.

Note: since the Firebase config is baked into the built JS bundle (this is normal for client-side Firebase apps), your data itself is protected by the Firestore security rules and email/password login, not by hiding these values.

## How the grocery list combines ingredients

Each ingredient has a quantity, a unit, and a "unit type" (Volume, Weight, or Count).
When you select multiple recipes, ingredients with the same name and unit type are
converted to a common base unit (ml for volume, g for weight) and summed, then
converted back into a readable amount (e.g. cups, kg). Count-based ingredients
(like "2 cloves garlic") only combine when the unit label matches exactly, since
counts aren't convertible the way volume and weight are.

## Project structure

```
src/
  App.jsx                     tab navigation + auth gating
  firebase.js                 Firebase init (reads from env vars)
  components/
    Login.jsx
    RecipeForm.jsx             add a new recipe
    RecipeList.jsx             browse / select recipes
    RecipeDetail.jsx           view + delete a recipe
    GroceryListBuilder.jsx      select recipes -> build list
    GroceryReceipt.jsx         the aggregated, receipt-styled list
  utils/
    categories.js              aisle categories + name-based guessing
    unitConversion.js          unit tables + conversion math
    aggregateIngredients.js    combines ingredients across recipes
```