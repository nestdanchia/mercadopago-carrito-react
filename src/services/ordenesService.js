import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
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
