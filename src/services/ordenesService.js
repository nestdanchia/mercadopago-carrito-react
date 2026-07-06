import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
/**
 * Descripción de lo que hace la función
 * @param {tipo} nombre - Descripción del parámetro
 * @returns {tipo} Descripción de lo que devuelve
 * Utilidad:
 * l formato JSDoc. Es un estándar de documentación para
 *  JavaScript que los editores 
 * como VS Code leen y muestran como ayuda contextual.
 * crearOrden( en cualquier parte del proyecto, VS Cod
e sugiere los parámetros y muestra la descripción
 * de la función y sus parámetros.
 * La función recibe un objeto con los datos de la orden y
 * devuelve el ID del documento creado en Firestore.
 *  El tipado ayuda a prevenir errores y mejora la experiencia
 * de desarrollo al detectar errores en tiempo de escritura.
 *  El tipado también permite autocompletar propiedades de objetos
 *  y detectar errores si se accede a una propiedad inexistente.
 *  La anotación @returns indica el tipo de dato que devuelve la función.
 *  El tipado de parámetros evita errores al llamar a la función
 *  con argumentos incorrectos.
 *  El tipado de retorno evita errores al asignar el resultado
 *  de la función a una variable de tipo incorrecto.
 */


/**
 * Valida que el stock disponible en Firestore sea suficiente para cada item del carrito.
 * Se llama ANTES de crear la orden — es una red de seguridad contra overselling.
 *
 * IMPORTANTE: el stock ya fue descontado visualmente al agregar al carrito (comportamiento
 * actual del catálogo). Esta validación protege el caso en que dos usuarios compren
 * el mismo producto simultáneamente o el stock haya cambiado desde que se cargó el catálogo.
 * La compra aún NO está pagada en este punto — solo se verifica que haya stock real.
 *
 * @param {Array} items - Items del carrito [{ id, nombre, cantidad }]
 * @returns {{ valido: boolean, faltantes: Array }} valido = true si todo tiene stock,
 *          faltantes = lista de productos con stock insuficiente
 */
export const validarStockDisponible = async (items) => {
  const faltantes = [];

  for (const item of items) {
    const productoRef = doc(db, "productos", item.id);
    const productoSnap = await getDoc(productoRef);

    if (!productoSnap.exists()) {
      faltantes.push({ nombre: item.nombre, disponible: 0, pedido: item.cantidad });
      continue;
    }

    const stockActual = productoSnap.data().stock ?? 0;
    if (stockActual < item.cantidad) {
      faltantes.push({
        nombre: item.nombre,
        disponible: stockActual,
        pedido: item.cantidad,
      });
    }
  }

  return { valido: faltantes.length === 0, faltantes };
};

/**
 * Crea una nueva orden en Firestore con estado "pendiente".
 * @param {object} ordenData - Datos de la orden (usuarioId, items, totales, etc.)
 * @returns {string} ID del documento creado
 */
export const crearOrden = async (ordenData) => {
  const docRef = await addDoc(collection(db, "ordenes"), {
    ...ordenData,
    fecha: serverTimestamp(),
    estado: "pendiente",
  });
  return docRef.id;
};

/**
 * Actualiza el estado de una orden existente en Firestore.
 * @param {string} orderId - ID del documento en Firestore
 * @param {string} estado - Nuevo estado: "pagada" | "fallida" | "pendiente"
 * @param {object} datosPago - Campos adicionales del pago (payment_id, payment_status)
 */
export const actualizarEstadoOrden = async (orderId, estado, datosPago = {}) => {
  const ordenRef = doc(db, "ordenes", orderId);
  await updateDoc(ordenRef, {
    estado,
    ...datosPago,
  });
};
