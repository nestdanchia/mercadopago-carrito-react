import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/config";

// 1. Declaramos la referencia global para que la usen todas las funciones del archivo
const productosRef = collection(db, "productos");

// ==========================================
// R - READ (función original intacta)
// ==========================================
export async function obtenerProductos() {
  try {
    // =========================
    // FIRESTORE
    // =========================
    // peticion a la base de datos en forma asincronica usando la referencia global
    const snapshot = await getDocs(productosRef);

    const productos = snapshot.docs.map((doc) => ({
      ...doc.data(),
      // id del documento (string) va al final para que no sea pisado
      // por el campo numérico "id" que viene dentro de doc.data()
      id: doc.id,
    }));

    return productos;

  } catch (errorFirebase) {

    console.warn(
      "Firestore fallo, cargando JSON local...",
      errorFirebase.message
    );

    // =========================
    // FALLBACK LOCAL
    // =========================

    try {

      const localResponse = await fetch("/data/productos.json");

      if (!localResponse.ok) {
        throw new Error("No se pudo cargar el JSON local");
      }

      const localData = await localResponse.json();

      return localData;

    } catch (errorLocal) {

      throw new Error(
        "No se pudieron cargar productos desde ninguna fuente."
      );
    }
  }
}

// ==========================================
// C - CREATE (Nueva función para el Alta)
// ==========================================
export async function crearProducto(productoData) {
  try {
    // Usamos la misma referencia global 'productosRef'
    const docRef = await addDoc(productosRef, productoData);
    return { id: docRef.id, ...productoData };
  } catch (error) {
    console.error("Error al guardar en Firestore:", error.message);
    throw error;
  }
}

// ==========================================
// U - UPDATE (Nueva función para Modificar)
// ==========================================
export async function actualizarProducto(id, datosActualizados) {
  try {
    const productoDocRef = doc(db, "productos", id);
    await updateDoc(productoDocRef, datosActualizados);
    return { id, ...datosActualizados };
  } catch (error) {
    console.error("Error al actualizar en Firestore:", error.message);
    throw error;
  }
}

// ==========================================
// D - DELETE (Nueva función para Eliminar)
// ==========================================
export async function eliminarProducto(id) {
  try {
    const productoDocRef = doc(db, "productos", id);
    await deleteDoc(productoDocRef);
    return id;
  } catch (error) {
    console.error("Error al eliminar de Firestore:", error.message);
    throw error;
  }
}
