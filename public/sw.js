self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()))

self.addEventListener('push', (e) => {
  if (!e.data) return
  let d = {}
  try { d = e.data.json() } catch { d = { title: 'ChoreQuest', body: e.data.text() } }
  e.waitUntil(self.registration.showNotification(d.title || 'ChoreQuest 🏆', {
    body: d.body || '',
    icon: '/icon-192.png',
    tag: d.tag || 'cq',
    data: { url: d.url || '/' },
  }))
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  e.waitUntil(clients.matchAll({ type: 'window' }).then(cs => {
    for (const c of cs) { if ('focus' in c) return c.focus() }
    if (clients.openWindow) return clients.openWindow(e.notification.data?.url || '/')
  }))
})
