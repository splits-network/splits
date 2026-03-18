/**
 * Service Worker — Push Notification Handler
 *
 * Minimal service worker for Web Push notifications.
 * No caching, no offline support — push display and click handling only.
 */

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Applicant Network', body: event.data.text() };
  }

  const options = {
    body: payload.body || '',
    icon: payload.icon || '/applicant-icon.png',
    badge: payload.badge || '/applicant-icon.png',
    tag: payload.tag || 'default',
    renotify: payload.renotify ?? true,
    data: payload.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || 'Applicant Network', options),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url;
  if (!url) return;

  // Focus existing tab or open new one
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
