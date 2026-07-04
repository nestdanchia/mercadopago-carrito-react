import { useEffect } from "react";
import { collection, getDocs ,query,orderBy} from "firebase/firestore";
import { db } from "../firebase/config.js"; 

export default function PruebaLectura() {
  useEffect(() => {
    async function probarObtenerProductos() {
      console.log("--- INICIANDO PRUEBA DE LECTURA DESDE FIRESTORE ---");
      try {
        const productosRef = collection(db, "productos");
        //Creamos la consulta ordenada numéricamente por el id interno
        const q = query(productosRef, orderBy("id", "asc")); 

        const snapshot = await getDocs(q);

        const productos = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("¡Éxito! Productos recuperados de Firestore:", productos);
        console.table(productos); // Te lo muestra ordenado en forma de tabla en la consola

      } catch (errorFirebase) {
        console.warn(
          "Firestore falló en la prueba, intentando fallback JSON local...",
          errorFirebase.message
        );

        try {
          const localResponse = await fetch("/data/productos.json"); // Ajustá a tu ruta de fallback
          if (!localResponse.ok) throw new Error("No se pudo cargar el JSON local");
          
          const localData = await localResponse.json();
          console.log("Productos recuperados desde Fallback Local:", localData);

        } catch (errorLocal) {
          console.error("Error total: No se pudo leer de ninguna fuente.", errorLocal.message);
        }
      }
      console.log("--- FIN DE LA PRUEBA ---");
    }

    probarObtenerProductos();
  }, []);

  return null; // Invisible, no rompe  renderizado actual
}
