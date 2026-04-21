export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.error('Este navegador no soporta notificaciones de escritorio');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function showLocalNotification(title, body, icon = '/favicon.ico') {
  if (Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, {
        body,
        icon,
        vibrate: [100, 50, 100],
        badge: '/favicon.ico'
      });
    });
  }
}

export async function subscribeUserToPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  
  if (subscription) return subscription;

  const response = await fetch('/api/push/public-key');
  const publicKey = await response.text();
  
  if (!publicKey || publicKey.trim() === '' || publicKey.includes('<!DOCTYPE')) {
    console.warn('⚠️ No se encontró una clave VAPID válida en el servidor.');
    return null;
  }

  const convertedVapidKey = urlBase64ToUint8Array(publicKey.trim());

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedVapidKey
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
