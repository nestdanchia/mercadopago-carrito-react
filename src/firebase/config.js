import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
// cre la conexion con firebase
 const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
/*

// ============================================================
// ¿Qué significa "auth" según el contexto?
// ============================================================
//
// 1) "firebase/auth"
//    Es el MÓDULO DE AUTENTICACIÓN del SDK de Firebase.
//    Contiene todas las funciones relacionadas con la autenticación,
//    por ejemplo:
//      - getAuth()
//      - signInWithEmailAndPassword()
//      - createUserWithEmailAndPassword()
//      - signOut()
//      - onAuthStateChanged()
//
//    Ejemplo:
//      import { getAuth } from "firebase/auth";
//
//
// 2) getAuth(app)
//    Es una FUNCIÓN del módulo "firebase/auth".
//    Recibe el objeto "app" (la aplicación Firebase inicializada)
//    y crea o devuelve el servicio de autenticación asociado a
//    esa aplicación.
//
//    Ejemplo:
//      const auth = getAuth(app);
//
//
// 3) auth
//    Es una VARIABLE creada por nosotros.
//    Guarda el objeto devuelto por getAuth(app).
//    Ese objeto representa el SERVICIO DE AUTENTICACIÓN de nuestro
//    proyecto Firebase.
//
//    El nombre "auth" es solo una convención.
//    Podría llamarse perfectamente:
//
//      const servicioAuth = getAuth(app);
//      const authService = getAuth(app);
//      const autenticacion = getAuth(app);
//
//    Ese objeto contiene, entre otras cosas:
//
//      - auth.currentUser   → usuario autenticado
//      - auth.app           → aplicación Firebase asociada
//      - auth.config        → configuración interna
//      - métodos y estado internos del servicio
//
//    Luego se exporta para reutilizarlo en toda la aplicación:
//
//      export const auth = getAuth(app);
//
//    y en cualquier componente se importa:
//
//      import { auth } from "../../firebase/config";
//
// ============================================================
app
│
├── apiKey
├── projectId
├── authDomain
├── storageBucket
└── ...


========================
FIRESTORE - RESUMEN
========================

doc(db, coleccion, id)

Qué hace:
- Crea una referencia a un documento.

Parámetros:
- db: instancia de Firestore.
- coleccion: nombre de la colección.
- id: identificador del documento.

Devuelve:
- DocumentReference.

Efecto:
- Ninguno. No lee ni escribe datos.


collection(db, coleccion)

Qué hace:
- Crea una referencia a una colección.

Parámetros:
- db: instancia de Firestore.
- coleccion: nombre de la colección.

Devuelve:
- CollectionReference.

Efecto:
- Ninguno.


setDoc(ref, datos)

Qué hace:
- Crea o reemplaza completamente un documento.

Parámetros:
- ref: referencia del documento.
- datos: objeto a guardar.

Devuelve:
- Promise<void>

Efecto:
- Escribe datos en Firestore.


addDoc(collectionRef, datos)

Qué hace:
- Crea un documento con id automático.

Parámetros:
- collectionRef: referencia de colección.
- datos: objeto a guardar.

Devuelve:
- DocumentReference del documento creado.

Efecto:
- Inserta un nuevo documento.


getDoc(ref)

Qué hace:
- Lee un documento.

Parámetros:
- ref: referencia del documento.

Devuelve:
- DocumentSnapshot.

Efecto:
- Lectura de Firestore.


getDocs(queryOCollection)

Qué hace:
- Lee múltiples documentos.

Parámetros:
- queryOCollection: consulta o colección.

Devuelve:
- QuerySnapshot.

Efecto:
- Lectura de Firestore.


updateDoc(ref, datos)

Qué hace:
- Actualiza campos específicos.

Parámetros:
- ref: referencia del documento.
- datos: campos a modificar.

Devuelve:
- Promise<void>

Efecto:
- Modifica solo los campos indicados.


deleteDoc(ref)

Qué hace:
- Elimina un documento.

Parámetros:
- ref: referencia del documento.

Devuelve:
- Promise<void>

Efecto:
- Borra el documento.


query(...)

Qué hace:
- Construye una consulta.

Parámetros:
- colección y filtros.

Devuelve:
- Query.

Efecto:
- Ninguno. Solo prepara la consulta.


where(campo, operador, valor)

Qué hace:
- Agrega un filtro a una consulta.

Ejemplo:
- where("categoria", "==", "Notebook")

Devuelve:
- QueryConstraint.

Efecto:
- Ninguno por sí solo.


orderBy(campo, direccion)

Qué hace:
- Ordena resultados.

Ejemplo:
- orderBy("precio", "asc")

Devuelve:
- QueryConstraint.

Efecto:
- Ninguno por sí solo.


limit(cantidad)

Qué hace:
- Limita cantidad de resultados.

Ejemplo:
- limit(10)

Devuelve:
- QueryConstraint.

Efecto:
- Ninguno por sí solo.


serverTimestamp()

Qué hace:
- Inserta fecha y hora del servidor Firebase.

Devuelve:
- Timestamp especial.

Efecto:
- Guarda la fecha del servidor.


========================
SECUENCIA MÁS COMÚN
========================

Crear referencia:
const ref = doc(db, "productos", "1");

Guardar:
await setDoc(ref, datos);

Leer:
const snap = await getDoc(ref);

Actualizar:
await updateDoc(ref, datos);

Eliminar:
await deleteDoc(ref);

Consultar varios:
const q = query(
  collection(db, "productos"),
  where("categoria", "==", "Notebook"),
  orderBy("precio", "asc")
);

const snapshot = await getDocs(q);

*/
