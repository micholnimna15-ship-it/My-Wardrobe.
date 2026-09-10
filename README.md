# My Wardrobe — iPhone PWA package

This package contains the wardrobe web app plus the files needed for an iPhone Home Screen installation:
- manifest.json
- service-worker.js
- iPhone/Android app icons
- index.html configured as an installable PWA

Important: the files still need to be hosted on an HTTPS web address before Safari can install them as a Home Screen web app. GitHub Pages, Cloudflare Pages, Netlify, or similar hosting can do this.

After hosting:
1. Open the HTTPS address in Safari on your iPhone.
2. Tap Share.
3. Tap Add to Home Screen.
4. Name it My Wardrobe.
5. Tap Add.

The current prototype stores wardrobe entries in the browser's local storage. The next build can add stronger persistent storage, edit/delete, and photo handling.
