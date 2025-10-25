# Google Authentication Troubleshooting Guide

## Quick Fix Checklist

Follow these steps in order:

### 1. Enable Google Authentication in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **stock-broker-a8511**
3. Navigate to: **Authentication** → **Sign-in method**
4. Find **Google** in the list
5. Click on it and toggle **Enable**
6. Enter your support email (your email address)
7. Click **Save**

### 2. Add Authorized Domains

1. In Firebase Console, go to **Authentication** → **Settings** tab
2. Scroll down to **Authorized domains** section
3. Make sure these domains are listed:
   - `localhost`
   - `127.0.0.1`
   - `stock-broker-a8511.web.app`
   - `stock-broker-a8511.firebaseapp.com`
4. If any are missing, click **Add domain** and add them

### 3. Check Browser Console

Open your browser's Developer Tools (F12) and check the Console for specific error messages:

#### Common Errors and Solutions:

**Error: `auth/unauthorized-domain`**
- **Solution**: Add your current domain to the authorized domains list in Firebase Console

**Error: `auth/popup-blocked`**
- **Solution**: 
  - Allow pop-ups for localhost in browser settings
  - Or use `signInWithRedirect` instead of `signInWithPopup` (see code changes below)

**Error: `auth/popup-closed-by-user`**
- **Solution**: User closed the pop-up. Just try again.

**Error: `auth/configuration-not-found`**
- **Solution**: The Firebase project might not be properly configured. Re-run the setup steps.

### 4. Test in Browser

1. Open your app: `http://localhost:5173`
2. Open Developer Tools (F12) → Console tab
3. Click "Sign in with Google"
4. Watch the console for any errors
5. Report back with the exact error message

### 5. Alternative: Use Redirect Instead of Popup

If pop-ups are blocked, we can switch to redirect method. Here's the code change:

**In src/App.jsx**, replace the `handleGoogleSignIn` function:

```javascript
import { signInWithRedirect, getRedirectResult } from 'firebase/auth';

// Add this useEffect after the auth state listener
useEffect(() => {
  // Check for redirect result when component mounts
  getRedirectResult(auth)
    .then((result) => {
      if (result) {
        console.log('Sign-in successful:', result);
        setUser(result.user);
        showAlert(`Welcome, ${result.user.displayName}!`, 'success');
      }
    })
    .catch((error) => {
      console.error('Error getting redirect result:', error);
    });
}, []);

// Update the handleGoogleSignIn function
const handleGoogleSignIn = async () => {
  try {
    console.log('Attempting Google sign-in with redirect...');
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error('Error initiating sign-in:', error);
    showAlert('Failed to initiate sign-in. Please try again.', 'error');
  }
};
```

### 6. Verify Firebase Project Setup

Make sure your Firebase project has:
- Authentication enabled
- Firestore database created
- Security rules deployed

Run these commands to verify:

```bash
# Check if you're logged in
firebase projects:list

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

## Step-by-Step Setup (If Starting Fresh)

If authentication still doesn't work, follow these complete setup steps:

### Step 1: Create Firebase Project (if not exists)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Project name: `stock-broker-a8511` (or use the ID already configured)
4. Enable Google Analytics (optional)
5. Create project

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Google** provider
5. Enter support email
6. Save

### Step 3: Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Start in **production mode** (we'll add security rules later)
4. Choose a location
5. Enable

### Step 4: Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

Or manually in Firebase Console:
1. Go to **Firestore Database** → **Rules** tab
2. Paste the contents of `firestore.rules`
3. Click **Publish**

### Step 5: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the Web icon (`</>`)
4. Register app with nickname: "Web App"
5. Copy the configuration values
6. Add them to your `.env` file (optional, since we have fallback values)

## Debugging Code

Add this to your `src/App.jsx` to debug authentication:

```javascript
// Add this useEffect to monitor auth state changes
useEffect(() => {
  console.log('Current user:', user);
  console.log('Auth instance:', auth);
  
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    console.log('Auth state changed:', currentUser);
    setUser(currentUser);
  });
  
  return () => unsubscribe();
}, []);
```

## Common Issues and Solutions

### Issue: "FirebaseError: auth/operation-not-allowed"

**Solution**: The Google sign-in method is not enabled in Firebase Console.

1. Go to Firebase Console → Authentication → Sign-in method
2. Click on Google
3. Enable it
4. Save

### Issue: Popup keeps closing immediately

**Solution**: Try the redirect method instead (see step 5 above)

### Issue: "CONFIGURATION_NOT_FOUND" error

**Solution**: 
1. Check that your Firebase project ID is correct in `.firebaserc`
2. Make sure you're logged in: `firebase login`
3. Verify project exists: `firebase projects:list`

### Issue: Works locally but not in production

**Solution**: Make sure production domains are added to authorized domains:
- `stock-broker-a8511.web.app`
- `stock-broker-a8511.firebaseapp.com`

## Testing the Fix

After making changes:

1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5 or Cmd+Shift+R)
3. Try signing in again
4. Check browser console for errors

## Still Having Issues?

If Google authentication still doesn't work after following all steps:

1. Share the exact error message from browser console
2. Share a screenshot of Firebase Console → Authentication → Sign-in method
3. Check if the project "stock-broker-a8511" exists and you have access

## Quick Reference: Firebase Console URLs

- Main Console: https://console.firebase.google.com/
- Your Project: https://console.firebase.google.com/project/stock-broker-a8511
- Authentication: https://console.firebase.google.com/project/stock-broker-a8511/authentication
- Firestore: https://console.firebase.google.com/project/stock-broker-a8511/firestore
- Hosting: https://console.firebase.google.com/project/stock-broker-a8511/hosting
