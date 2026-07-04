# Mi Tienda React - TP Entrega Final

Esta entrega final se encuentra en un repositorio nuevo porque incorpora funcionalidades adicionales (autenticación, CRUD, carrito e integración con Mercado Pago), por lo que se presenta como un proyecto independiente de la primera entrega.

---

## Demo en vivo

| Recurso | URL |
|---|---|
| Frontend (Vercel) | [URL] |
| Backend (Render) | [URL] |

**Usuario administrador para que el profesor pruebe el CRUD:**
Credenciales de administrador: fueron enviadas al docente docente.

- 

---

## Funcionalidades

- Catálogo de productos — listado con imágenes, precios y stock
- Ver detalle — página individual de cada producto con descripción
- Carrito de compras — agregar productos, ver resumen, aplicar bono de descuento
- Bono de descuento del 30% — se activa automáticamente cuando el total supera $1.000.000
- Autenticación — registro, login y logout con Firebase Authentication
- Recupero de contraseña — por email vía Firebase
- CRUD de productos — alta, edición y eliminación (solo administradores)
- Panel de administración — gestión de productos y visualización de órdenes
- Promover usuarios a administrador — desde el área privada
- Chat con IA — asistente integrado para consultas sobre laptops
- Integración con Mercado Pago — pago real en sandbox con preferencias y back_urls
- Órdenes en Firestore — se crean como "pendiente" y se actualizan según el resultado del pago

---

## Tecnologías utilizadas

**Frontend:**
- React 19
- Vite
- React Router DOM v7
- React Icons
- Context API (carrito y autenticación)

**Backend:**
- Node.js
- Express v5
- SDK oficial de Mercado Pago v3
- dotenv / cors

**Base de datos y autenticación:**
- Firebase Authentication
- Firebase Firestore

**IA:**
- Groq API (proveedor principal — modelo llama-3.1-8b-instant)
- OpenRouter API (fallback — modelo meta-llama/llama-3.1-8b-instruct)

**Pagos:**
- Mercado Pago Checkout Pro (SDK Node.js)

**Despliegue:**
- Vercel (frontend React)
- Render (backend Node + Express)

---

## Servicios externos

| Servicio | Función |
|---|---|
| Firebase Auth | Autenticación de usuarios |
| Firestore | Base de datos de productos, órdenes y usuarios |
| Mercado Pago | Procesamiento de pagos |
| Groq | IA principal del chat |
| OpenRouter | IA fallback del chat |
| Render | Hosting del backend |
| Vercel | Hosting del frontend |

---

## Estructura del proyecto

```
TPprimerEntrega/
│
├── public/
│   ├── data/
│   │   └── productos.json        ← fallback local si Firestore falla
│   └── *.jpeg / *.png            ← imágenes de productos
│
├── src/
│   ├── components/
│   │   ├── Administrar/          ← CRUD productos, tabla órdenes, promover admin
│   │   ├── Auth/                 ← Login y Registro
│   │   ├── Carrito/              ← Carrito y CarritoItem
│   │   ├── CatalogoProductos/    ← Grilla de productos
│   │   ├── ChatIA/               ← Asistente IA
│   │   ├── Item/                 ← Tarjeta individual de producto
│   │   ├── Layout/               ← Header, Navbar, Footer
│   │   ├── Pago/                 ← PagoExitoso, PagoFallido, PagoPendiente
│   │   └── ProductoDetalle/      ← Vista detalle de producto
│   │
│   ├── context/
│   │   ├── auth/                 ← AuthProvider, AuthContext
│   │   └── cart/                 ← CartProvider, CartContext
│   │
│   ├── firebase/
│   │   └── config.js             ← Configuración Firebase
│   │
│   ├── services/
│   │   ├── cargaProductos.jsx    ← CRUD Firestore + fallback JSON
│   │   ├── ordenesService.js     ← Crear y actualizar órdenes
│   │   ├── migrarDatosIniciales.js ← Seed inicial (comentado, histórico)
│   │   └── pruebaLectura.js      ← Diagnóstico de conexión al arrancar
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── server.js                     ← Backend Express (IA + Mercado Pago)
├── package.json
├── .env                          ← Variables de entorno (no se sube a Git)
└── README.md
```

---

## Flujo de compra

1. El usuario navega el catálogo y agrega productos al carrito
2. Si el total supera $1.000.000 se genera un código de bono del 30%
3. Al finalizar la compra, si no está logueado se lo redirige al login
4. Se crea la orden en Firestore con estado `"pendiente"`
5. El backend genera una preferencia en Mercado Pago y devuelve el `init_point`
6. El usuario paga en el checkout de Mercado Pago
7. Al volver, la página `/pago-exitoso`, `/pago-fallido` o `/pago-pendiente` actualiza el estado de la orden en Firestore

---

## Sistema de fallback de productos

Si Firestore no responde, la aplicación carga automáticamente el archivo `public/data/productos.json` sin mostrar ningún error al usuario. En ningún caso la app queda sin productos.

---

## Chat con IA

El asistente está disponible en la ruta `/chat`. Responde consultas sobre laptops y hace recomendaciones según el uso. El backend intenta primero con Groq y si falla usa OpenRouter como respaldo automático.

---

## Nota sobre el backend en Render

El backend está alojado en Render con el plan gratuito. Si no se usa por 15 minutos, se duerme automáticamente. La primera vez que se accede al chat con IA puede tardar hasta 60 segundos en responder mientras el servidor se reactiva. Esto es normal.

---

## Correr el proyecto localmente

El profesor no necesita hacer esto. La app ya está desplegada y funciona desde el navegador.

```bash
# Instalar dependencias
npm install

# Iniciar frontend (en una terminal)
npm run dev

# Iniciar backend (en otra terminal)
npm run server
```

El backend requiere un archivo `.env` con las siguientes variables:

```
VITE_API_URL=http://localhost:3001
GROQ_API_KEY=...
OPENROUTER_API_KEY=...
CLIENT_URL=http://localhost:5173
MERCADOPAGO_ACCESS_TOKEN=...
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## Integración con Mercado Pago

El token de acceso vive únicamente en el servidor (`.env`), nunca en el frontend.
Se usa el SDK oficial de Mercado Pago para Node.js (`mercadopago` v3).
El checkout está en modo sandbox con cuentas de prueba.
En producción se deben reemplazar las `back_urls` con las URLs públicas del frontend y activar `auto_return: "approved"` en `server.js`.

---

## Aclaracion sobre el repositorio

Esta es la entrega final del trabajo práctico. La primera entrega se encuentra en un repositorio separado e independiente. Este proyecto extiende aquella base con autenticación, roles, CRUD completo, órdenes y pago con Mercado Pago.
