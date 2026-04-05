# BRIEFING — Push Notifications para chat (Vendor + Seller + Central Admin)

**Fecha:** 2026-04-05
**Estado Central:** completo y desplegado. VAPID keys configuradas, ws-server envía push a usuarios offline.
**Service Workers:** ya actualizados en vendor y seller con el handler de `push` + `notificationclick` (commits `dccfd9f` y `ad6c2c0`).

Falta en cada app:
1. Proxy routes para `/chat/push/subscribe`, `/chat/push/unsubscribe`, `/chat/vapid-key`
2. Hook `usePushNotifications` que pide permiso y se suscribe
3. Componente `<PushRegistrar />` montado en el layout
4. Env var `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (ya añadida en Coolify para vendor + seller)

---

## 1. Endpoints Central ya publicados

Todos requieren `Authorization: Bearer <JWT>`.

| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| GET | `/api/chat/vapid-key` | — | `{ vapidPublicKey: string }` |
| POST | `/api/chat/push/subscribe` | `{ endpoint, keys: {p256dh, auth}, userAgent?, app? }` | `{ subscription: { id } }` (upsert por userId+endpoint) |
| POST | `/api/chat/push/unsubscribe` | `{ endpoint }` | `{ unsubscribed: true }` |

Env var frontend: `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — ya configurada en Coolify para vendor + seller.

---

## 2. Proxy routes

### Vendor (`~/alephica-vendor-new`)

Crear `src/app/api/vendor/chat/push/subscribe/route.ts`:
```typescript
import { NextRequest } from "next/server";
import { proxyPost } from "@/lib/api-proxy"; // adaptar al helper de proxy existente

export async function POST(req: NextRequest) {
  return proxyPost(req, "/api/chat/push/subscribe");
}
```

Crear `src/app/api/vendor/chat/push/unsubscribe/route.ts`:
```typescript
import { NextRequest } from "next/server";
import { proxyPost } from "@/lib/api-proxy";

export async function POST(req: NextRequest) {
  return proxyPost(req, "/api/chat/push/unsubscribe");
}
```

Crear `src/app/api/vendor/chat/vapid-key/route.ts`:
```typescript
import { NextRequest } from "next/server";
import { proxyGet } from "@/lib/api-proxy";

export async function GET(req: NextRequest) {
  return proxyGet(req, "/api/chat/vapid-key");
}
```

### Seller (`~/alephica-seller`)

Idénticas pero con prefijo `/api/seller/chat/push/...`.

**Nota:** los patrones de proxy existentes en vendor/seller ya están (ej. rutas `/api/vendor/chat/conversations` existen). Reusar el mismo helper y pattern.

---

## 3. Hook `usePushNotifications`

`src/lib/use-push-notifications.ts`:
```typescript
"use client";
import { useEffect, useRef } from "react";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

/**
 * Llamar desde un componente montado SOLO cuando el usuario está autenticado.
 * Pide permiso de notificaciones, se suscribe al Push Manager del navegador
 * y registra la subscription en Central.
 *
 * `appKind`: "vendor" | "seller" | "admin"
 * `apiPrefix`: prefijo del proxy, ej. "/api/vendor/chat" o "/api/seller/chat"
 */
export function usePushNotifications(appKind: string, apiPrefix: string) {
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current) return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      console.warn("[push] NEXT_PUBLIC_VAPID_PUBLIC_KEY not set");
      return;
    }

    (async () => {
      try {
        // No re-pedir si ya está denegado
        if (Notification.permission === "denied") return;

        if (Notification.permission === "default") {
          const perm = await Notification.requestPermission();
          if (perm !== "granted") return;
        }

        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey),
          });
        }

        const sub = subscription.toJSON();
        const res = await fetch(`${apiPrefix}/push/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            endpoint: sub.endpoint,
            keys: sub.keys,
            userAgent: navigator.userAgent,
            app: appKind,
          }),
        });
        if (res.ok) {
          doneRef.current = true;
          console.log("[push] registered");
        }
      } catch (err) {
        console.warn("[push] register failed", err);
      }
    })();
  }, [appKind, apiPrefix]);
}
```

---

## 4. Componente `<PushRegistrar />`

`src/components/PushRegistrar.tsx` (vendor):
```typescript
"use client";
import { usePushNotifications } from "@/lib/use-push-notifications";

export function PushRegistrar() {
  usePushNotifications("vendor", "/api/vendor/chat");
  return null;
}
```

Seller: sustituir `"vendor"` por `"seller"` y `/api/vendor/chat` por `/api/seller/chat`.

---

## 5. Montar en layout

En el layout autenticado de cada app (ej. `src/app/(authenticated)/layout.tsx` o similar), renderizar `<PushRegistrar />` dentro del árbol cuando hay sesión activa. Sólo debe montarse una vez por sesión.

```tsx
import { PushRegistrar } from "@/components/PushRegistrar";

// Dentro del layout:
<>
  <PushRegistrar />
  {children}
</>
```

Debe renderizarse SÓLO dentro de la parte autenticada (después de login), nunca en páginas públicas.

---

## 6. Env var (ya configurada)

`NEXT_PUBLIC_VAPID_PUBLIC_KEY` está ya en Coolify para vendor + seller. Valor:
```
BEv7X7whgrtycU5SKh4irCf4U2h6r5peljaoCByNCYsYq04vFbulU2T8GgS9o6ia22O3pmjB03XNVYdV2HdGjMQ
```

---

## 7. Flujo end-to-end

1. Usuario abre app → login → layout monta `<PushRegistrar />`
2. Hook pide permiso (una vez, no molesta si ya está denegado)
3. Si concede: se suscribe al Push Manager + registra en Central
4. Usuario cierra la app (cliente WS se desconecta)
5. Otro usuario le envía mensaje → REST insert → publica en Redis
6. ws-server recibe evento → broadcast a WS conectados
7. **Para cada participante SIN WS activo** → ws-server llama `sendPushToUser()`
8. web-push envía al endpoint del navegador → service worker recibe `push` event
9. SW muestra notificación → click → abre/foco app en `/messages/{conversationId}`

---

## 8. Service Workers — ya desplegado

Vendor (`dccfd9f`) y Seller (`ad6c2c0`): añadido el handler de push + notificationclick al `public/sw.js` existente. No se tocaron los caches ni el fetch handler.

---

## 9. Central Admin

Si el admin panel tiene su propio service worker y hook, aplicar el mismo patrón con `appKind="admin"` y el prefijo de API correspondiente (típicamente llamadas directas a `/api/chat/*` sin proxy, ya que admin vive en el mismo dominio de Central).

---

## 10. Testing manual tras aplicar

Desde dos navegadores (o uno incógnito):

1. Login como admin en Chrome → autoriza notificaciones (aparecen en `push_subscriptions` tabla)
2. Login como vendor en Firefox → autoriza notificaciones
3. Cerrar Chrome (o deshabilitar WS)
4. Desde vendor (Firefox) enviar mensaje al admin
5. Chrome (cerrado) debe mostrar la notificación del sistema operativo
6. Click en la notificación → abre Chrome en `/messages/{conversationId}`

Diagnóstico si no llega push:
- Verificar `VAPID configured, push notifications enabled` en logs de ws-server
- `SELECT * FROM push_subscriptions WHERE user_id = <admin_id>` — debe existir
- `chrome://settings/content/notifications` — verificar que el origen no está bloqueado
- DevTools → Application → Service Workers → ver si está activo
