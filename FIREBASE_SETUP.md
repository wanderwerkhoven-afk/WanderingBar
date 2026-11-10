# WanderingBarBack – Firebase setup

The application is still deployed to **GitHub Pages** using the existing workflow on `main`.
This integration uses Firebase only for Google login and Cloud Firestore data storage.

## One-time Firebase Console setup

1. Open Firebase project **`barback-20df5`**.
2. Go to **Authentication → Sign-in method**, enable **Google**, and choose a support email.
3. Under **Authentication → Settings → Authorized domains**, add
   `wanderwerkhoven-afk.github.io` (without `https://` or `/WanderingBar/`).
   Add `localhost` separately when testing the login on your own computer.
4. Go to **Firestore Database**, create the default **Standard** database,
   preferably in `europe-west4` (Netherlands), and select **Production mode**.
5. Open **Firestore Database → Rules**. Replace the initial rules with the exact
   contents of [`firestore.rules`](./firestore.rules) and click **Publish**.
6. Once these steps are complete, merge the Firebase branch into `main`. The
   existing GitHub Actions workflow builds and publishes the app to GitHub Pages.

Firestore and Authentication cannot be activated simply by committing application
source; the Console actions above must also be completed in the Firebase project.

## Data model and migration

Cloud documents live at `users/{firebaseAuthUid}/{dataset}/{recordId}` with these
datasets: `events`, `deletedEvents`, `inventory`, `catalog`. Each record stores
its serialized JSON and its original list position. Firestore Security Rules
restrict access to the signed-in owner of that UID.
The `users/{uid}/meta/workspace` marker remembers that a workspace has been
initialized, even after all records have deliberately been deleted.

On first login the app checks the four existing `localStorage` keys:

- When the remote account is empty, existing local records are uploaded.
- When the remote account already contains different records, the app requires
  a downloadable backup of **both** versions before choosing to merge or use
  the cloud version.
- Merging retains unique records from either side. A conflicting record ID uses
  the local version; the exported backup retains both originals.
- Local keys are never deleted by the sync mechanism. They remain as an offline
  working copy and recoverable local history.
- The legacy inventory reset migration is marked complete before cloud-loaded
  inventory is mounted, so quantities cannot be reset on a second device.
- A browser is associated with its first Google account UID to prevent the next
  signed-in Google user from inheriting that browser's local data. For multiple
  accounts, use distinct browser profiles.
- When another device changes data while BarBack is open, a refresh banner
  appears. Writes from stale mounted screens pause until refreshed.

If Firebase is unavailable or Firestore rules are not published, the login
screen shows an error and **does not erase the existing local records**.

## Before activating production

- Verify that a Google login works at the GitHub Pages URL.
- Verify the first-account migration on a browser containing existing event data.
- Verify login on a second browser/profile and confirm the same events appear.
- Verify a changed event and inventory item survive reload on both devices.
- Download and keep a backup during the migration if a conflict is reported.

This initial integration uses last-write-wins at the record level; simultaneous
editing of the *same* record on two devices should be avoided. The integration
does not use Firebase Hosting or require Firebase Analytics.
