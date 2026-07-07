import { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../../firebase/config';

// ============================================================
// AUTENTICACIÓN vs AUTORIZACIÓN — dos conceptos distintos
// ============================================================
//
// AUTENTICACIÓN: verificar QUIÉN es el usuario.
//   Firebase Auth lo maneja: valida credenciales y emite un Token JWT.
//
// AUTORIZACIÓN: determinar QUÉ puede hacer ese usuario.
//   Firestore + el campo "rol" lo manejan: el token JWT viaja en cada
//   petición a Firestore, que lo verifica y aplica las reglas de seguridad.
//
// FLUJO COMPLETO:
//
// PASO 1 — Login y activación de onAuthStateChanged:
//   El usuario ingresa email y contraseña.
//   Firebase Auth valida los datos y devuelve un Token JWT al navegador.
//   El SDK guarda ese token en LocalStorage / IndexedDB automáticamente.
//   onAuthStateChanged detecta el cambio y avisa: "usuario XYZ_123 autenticado".
//
// PASO 2 — setDoc asigna el rol (autorización inicial):
//   Con el usuario ya autenticado, se ejecuta:
//     setDoc(doc(db, "usuarios", "XYZ_123"), { rol: "cliente" })
//
// PASO 3 — Qué viaja por la red al ejecutar setDoc:
//   El SDK NO envía texto plano. Envía una petición HTTP/gRPC a Google con:
//     {
//       "Authorization": "Bearer eyJhbGciOiJSUzI1NiIs...",  ← Token JWT adjuntado automáticamente
//       "Payload": { "rol": { "stringValue": "cliente" } }   ← los datos a guardar
//     }
//   El SDK adjunta el token automáticamente — no hace falta escribirlo.
//
// PASO 4 — Firestore recibe y desempaqueta la petición:
//   Antes de escribir, Firestore verifica el token JWT.
//   Si es válido, extrae la identidad y la mapea en request.auth.uid = "XYZ_123".
//
// PASO 5 — Las Reglas de Seguridad deciden:
//   Firestore evalúa las reglas configuradas. Ejemplo:
//     allow write: if request.auth != null && request.auth.uid == usuarioId;
//   Si se cumple → escribe el dato. Si no → rechaza la petición.
//
// El Token JWT actúa como puente invisible entre lo que detecta Auth
// y lo que valida Firestore en cada operación de lectura/escritura.
// ============================================================

// Contexto que distribuye user, rol, loading y las funciones de auth
// a todos los componentes que lo consuman via useAuth()
const AuthContext = createContext();

// REGISTRO — primer paso del ciclo de autenticación:
// 1. Crea el usuario en Firebase Auth (autenticación).
// 2. Crea su documento en Firestore con rol = "cliente" (autorización inicial).
//    Todo usuario nuevo nace como "cliente" — solo un admin puede promoverlo.
// El SDK adjunta el Token JWT automáticamente en la petición a Firestore (Paso 3).
const register = async (email, password) => {
  console.log("========== AUTH ==========");
  console.log(auth);
  console.log("Proyecto asociado:", auth.app);
  console.log("Usuario actual antes del registro:", auth.currentUser);
  const credencial = await createUserWithEmailAndPassword(auth, email, password);
  console.log("========== CREDENCIAL ==========");
  console.log(credencial);

  console.log("UID:", credencial.user.uid);
  console.log("EMAIL:", credencial.user.email);
  console.log("EMAIL VERIFICADO:", credencial.user.emailVerified);

  await setDoc(
    doc(db, "usuarios", credencial.user.uid),
    {
      email,
      rol: "cliente"
    }
  );

  return credencial;
};

export function AuthProvider({ children }) {

  // DOCUMENTO DE IDENTIDAD del usuario (autorización):
  // rol = null     → Firebase todavía no respondió
  // rol = "cliente"→ usuario sin privilegios especiales
  // rol = "admin"  → acceso a rutas y funciones protegidas
  // Las "puertas" del sistema (RutaPrivadaElemental, Navbar, Carrito)
  // leen este valor para decidir qué mostrar o permitir.
  const [rol, setRol] = useState(null);

  // Objeto del usuario autenticado de Firebase Auth (o null si no hay sesión).
  // Contiene uid, email, etc. Dice QUIÉN es el usuario — el rol dice QUÉ puede hacer.
  const [user, setUser] = useState(null);

  // Semáforo que bloquea el renderizado hasta que Firebase confirme el estado.
  // true  → Firebase no respondió aún → la app no muestra nada ({!loading && children})
  // false → Firebase respondió → la app renderiza con user y rol correctos
  // Sin loading, ambos estados serían null un instante al arrancar y las puertas
  // tomarían decisiones incorrectas (ej: redirigir a un admin al login).
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // useEffect registra el callback — Firebase es quien lo ejecuta más tarde.
    // onAuthStateChanged se dispara tanto si hay sesión como si no hay —
    // en ambos casos llega a setLoading(false) y la app se renderiza.
    console.log("Registro de observador de autenticación");

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("onAuthStateChanged:", currentUser);
      console.log("Estado de carga:", loading);
      console.log("Rol:", rol);
      console.log("Usuario:", currentUser);


      setUser(currentUser); // actualiza la autenticación en el estado global

      if (currentUser) {
        // Hay usuario autenticado → busca su rol en Firestore (autorización).
        // El SDK adjunta el Token JWT automáticamente en esta petición (Paso 3).
        // Firestore verifica el token y aplica las reglas de seguridad (Pasos 4 y 5).
        console.log("usuario conectado con UID:", currentUser.uid);
        console.log("Usuario autenticado:", currentUser);
        const token = await currentUser.getIdToken();

        console.log("JWT:", token);
        console.log("Usuario autenticado, obteniendo rol desde Firestore...");
        const docRef = doc(db, "usuarios", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // EMISIÓN DEL DOCUMENTO DE IDENTIDAD:
          // setRol guarda el rol leído de Firestore en el contexto global.
          // A partir de acá ese valor viaja con el usuario durante toda la sesión
          // y cada "puerta" lo consulta para autorizar o denegar el acceso.
          setRol(docSnap.data().rol);
        }
      } else {
        // CIERRE DE SESIÓN o sesión inexistente:
        // Se limpia tanto la autenticación (user) como la autorización (rol).
        // Todas las puertas quedan cerradas hasta una nueva autenticación.
        setUser(null);
        setRol(null);
        console.log("No hay usuario autenticado");
      }

      setLoading(false); // Firebase ya respondió, ahora sí podés mostrar la app
    });

    return () => unsubscribe(); // limpieza al desmontar: cancela el observador
  }, [auth]);

  // Funciones de autenticación que interactúan con Firebase Auth
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  // Envía un email de restablecimiento de contraseña.
  // Firebase maneja el envío del link — no impacta en Firestore ni en el rol.
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Distribuye a toda la app:
  //   user     → QUIÉN es el usuario (autenticación)
  //   rol      → QUÉ puede hacer (autorización)
  //   loading  → semáforo hasta que Firebase responda
  //   login / logout / register / resetPassword → funciones de auth
  return (
    // La app permanece "congelada" mientras Firebase no confirme el estado.
    // {!loading && children} garantiza que user y rol ya tienen valores reales
    // cuando los componentes se renderizan por primera vez.
    <AuthContext.Provider value={{ user, login, logout, loading, register, rol, resetPassword }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para consumir el contexto desde cualquier componente
export const useAuth = () => useContext(AuthContext);
