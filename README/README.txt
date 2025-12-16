
Read-Only Activity Feed Patch

Adds:
- /api/activity mock endpoint
- ActivityFeed React component (read-only)

Integration:
1. Place api/activity.js into your Next.js /pages/api folder
2. Import ActivityFeed into your dashboard page
3. Fetch from /api/activity and pass data prop

No mutations. Display-only.
