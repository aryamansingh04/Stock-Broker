# Deployment Guide - Business Trading Game

This guide will walk you through deploying the Business Trading Game to Firebase Hosting.

## Prerequisites

- Node.js (v16 or higher)
- Firebase account
- Access to the Firebase project: `stock-broker-a8511`

## Deployment Steps

### 1. Build the Project

The project has already been built. If you need to rebuild:

```bash
npm run build
```

This creates a `dist` folder with the production build.

### 2. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 3. Login to Firebase

Run this command and follow the instructions to authenticate:

```bash
firebase login
```

This will open a browser window for authentication.

### 4. Initialize Firebase Hosting (if not already done)

```bash
firebase init hosting
```

When prompted:
- Select an existing project: `stock-broker-a8511`
- Public directory: `dist`
- Configure as single-page app: `Yes`
- Set up automatic builds and deploys with GitHub: `No`

### 5. Deploy Firestore Rules

Deploy the Firestore security rules:

```bash
firebase deploy --only firestore:rules
```

### 6. Deploy to Firebase Hosting

Deploy the application:

```bash
firebase deploy --only hosting
```

Or deploy everything (hosting + firestore rules):

```bash
firebase deploy
```

### 7. Access Your Live Site

After deployment, Firebase will provide you with a URL like:
```
https://stock-broker-a8511.web.app
```
or
```
https://stock-broker-a8511.firebaseapp.com
```

## Environment Variables

⚠️ **Important**: Environment variables are embedded during the build process. Make sure your `.env` file contains all necessary variables before running `npm run build`.

## Post-Deployment Steps

### 1. Enable Google Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** > **Sign-in method**
4. Enable **Google** provider
5. Add your production domain to **Authorized domains**

### 2. Deploy Firestore Security Rules

```bash
firebase deploy --only firestore:rules
```

Or manually copy the contents of `firestore.rules` and paste them into the Firebase Console.

### 3. Update Authorized Domains

Add your Firebase Hosting domain to the authorized domains in:
- Firebase Console > Authentication > Settings > Authorized domains

Add:
- `stock-broker-a8511.web.app`
- `stock-broker-a8511.firebaseapp.com`

## Troubleshooting

### Error: "No Firebase project found"

Make sure you're logged in and the `.firebaserc` file contains the correct project ID.

### Error: "Build folder not found"

Run `npm run build` to create the `dist` folder before deploying.

### Environment Variables Not Working

Remember that Vite embeds environment variables at build time. You need to rebuild after changing `.env` variables.

## Continuous Deployment (Optional)

To set up automatic deployments from GitHub:

1. Connect your GitHub repository to Firebase Console
2. Set up automatic deployments in Firebase Console > Hosting
3. Every push to the main branch will automatically deploy

## Rollback

If you need to rollback to a previous version:

```bash
firebase hosting:channel:list
firebase hosting:rollback
```

## Useful Commands

```bash
# Preview deployment locally
firebase emulators:start --only hosting

# List hosting channels
firebase hosting:channel:list

# Deploy to a preview channel
firebase hosting:channel:deploy preview-channel-name

# View hosting history
firebase hosting:clone <source> <destination>
```

## Project URLs

After deployment, your project will be available at:
- Primary: `https://stock-broker-a8511.web.app`
- Secondary: `https://stock-broker-a8511.firebaseapp.com`

## Support

For issues with Firebase deployment, visit:
- [Firebase Documentation](https://firebase.google.com/docs/hosting)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
