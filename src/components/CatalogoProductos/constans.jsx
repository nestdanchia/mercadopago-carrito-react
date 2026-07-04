// URL del mock REST — YA NO SE USA. Reemplazado por Firestore via cargaProductos.jsx
// export const URL_API =
//   "https://6a025e4b0d92f63dd2539b82.mockapi.io/api/v1/productos";
/*
React
↓
MockAPI (DEPRECADO)
fetch(URL_API) iba directo a la mock
↓
Ahora se usa: obtenerProductos() / crearProducto() / actualizarProducto() / eliminarProducto()
en src/services/cargaProductos.jsx conectados directamente a Firestore
*/