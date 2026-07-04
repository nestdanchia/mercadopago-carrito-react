// MIGRACIÓN INICIAL DESACTIVADA
// Este componente fue usado para cargar los datos iniciales a Firestore
// por primera vez. Una vez que los datos existen en la base, ya no es necesario.
// Se mantiene comentado como referencia histórica del proceso de seed.
//
// Para reactivar: descomentar el código y montar <CargaInicial /> en App.jsx

/*
import { useEffect } from "react";
import { db } from "../firebase/config.js"; 
import productosNew from "../data/productosNew.json"; 
import { doc, setDoc, collection, getDocs, limit, query  } from "firebase/firestore";

export default function CargaInicial() {
  useEffect(() => {
    async function cargarDatosIniciales() {
      try {
        await setDoc(doc(db, "test", "123"), { nombre: "prueba" });

        const productosRef = collection(db, "productos");
        const q = query(productosRef, limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          console.log("Firebase ya cuenta con datos iniciales.");
          return; 
        }

        console.log("Firestore detectado como vacío. Cargando productos por primera vez...");
       // doc() Su propósito es:

//Crear una referencia a un documento de Firestore.
// db es la conexión a Firestore.

        for (const producto of productosNew) {
          const ref = doc(db, "productos", producto.id);
          // setDoc() guarda datos en la referencia indicada ref indica dónde guardar.
          // pára el primero sera 
          // productos 
          // └── 1
          console.log("Migrando producto:", producto.id);

 
          await setDoc(ref, {
            id: Number(producto.id),
            nombre: producto.nombre,
            precio: producto.precio,
            stock: producto.stock,
            categoria: producto.categoria,
            imagen: producto.imagen,
          });
          console.log(`Producto ${producto.id} migrado correctamente.`);
        }

        console.log("¡Todos los datos iniciales se inyectaron con éxito!");

      } catch (error) {
        console.error("Error crítico en el proceso de carga inicial:", error);
      }
    }
    cargarDatosIniciales();
  }, []);
  return null;
}
*/

// Exportamos null para que App.jsx no rompa si aún lo importa
export default function CargaInicial() {
  return null;
}
