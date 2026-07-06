import { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
// Firebase es quien sabe si hay un usuario autenticado.
//  React espera esa respuesta antes de renderizar la aplicación.
import {
  // getAuth, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../../firebase/config';

// 1. Creamos el contexto (la "burbuja" de datos)
const AuthContext = createContext();
const register = async (email, password) => {

  const credencial =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

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
  // Cuando React monta AuthProvider: no sabemos nada sobre la autenticacion
  const [rol, setRol] = useState(null);
  const [user, setUser] = useState(null);
  // App arranca → loading = true → la app no muestra
  // el contenido hasta que se resuelva el estado de autentificación
  const [loading, setLoading] = useState(true);
  

  // 2. Conectamos el Observador al ciclo de vida del componente
  useEffect(() => {
    // useEffect solamente registra el callback para que lo use luego firebase
    console.log("Registro de observador de autenticación");
    // instalamos un oyente hacia firebase paar que nos de el estado de autenticacion
    //useEffect registra el callback pero no lo ejecuta. Firebase es quien lo ejecuta más tarde
    // escuchara los cambios de estado de autenticacion y firebase enviara ae ste callback 
    // funcion de respuesta a currentuser 
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {

      console.log("onAuthStateChanged:", currentUser);
      console.log("Estado de carga:", loading);
      console.log("Rol:", rol);
      console.log("Usuario:", currentUser);

      setUser(currentUser); // Notifica a React y actualiza el estado global

      // Firebase llamo al callback con currentUser
      // cgequea si existe o no existe y paar ambos casos 
      if (currentUser) {
        //  hay usuario → busca el rol en Firestore
        console.log("usuario conectado con UID:", currentUser.uid);
        console.log("Usuario autenticado:", currentUser);
        // referencia al documento se construye con doc(db, "colección", "documento")
        const docRef = doc(
          db,
          "usuarios",
          currentUser.uid
        );

        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {

          setRol(
            docSnap.data().rol
          );

        }

      }
      else {

        // no hay usuario → limpio todo
        setUser(null)
        setRol(null); 
        
         
        console.log("No hay usuario autenticado");
      }
      setLoading(false); // Firebase ya respondió, ahora sí podés mostrar la app
    });

    return () => unsubscribe(); // Limpieza al desmontar
  }, [auth]);

  // 3. Funciones de logueo que interactúan con el mismo objeto 'auth'
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  // Envía un email de restablecimiento de contraseña al email indicado.
  // Firebase Authentication maneja todo el flujo — no impacta en Firestore.
  const resetPassword = (email) => {
    // su parametro sera el valor en el scope que tiene 
    // el estado de emailReset en login
    return sendPasswordResetEmail(auth, email);
  };

  // 4. Exportamos los datos y las funciones para que la app los use
  // user: el usuario autenticado (o null si no hay) de Firebase
  // login: función para iniciar sesión
  // logout: función para cerrar sesión
  // loading: booleano que indica si se está cargando el estado inicial
  // register: función para registrar un nuevo usuario
  return (
    // quien llama a register recibe credencial con const { register } = useAuth();
    //La aplicación permanece "congelada" mientras se averigua el estado de autenticación y el rol.
    // hasta que setLoading(false)siempre se hace paar que muestre lo que corresponde a cada usuario
    <AuthContext.Provider value={{ user, login, logout, loading, register, rol, resetPassword }}>
      {!loading && children}
      
    </AuthContext.Provider>
  );
}
//  Primer render ESPERA {!loading && children} La aplicación queda "esperando a Firebase".***
//  no renderices hasta que sepas si hay usuario o no 
// Hook personalizado para consumir el contexto de forma fácil

export const useAuth = () => useContext(AuthContext);
/**
 * El useEffect Se ejecuta una sola vez cuando AuthProvider se monta (porque el valor de auth no cambia en la práctica).
Instala el observador (onAuthStateChanged) para que Firebase pueda avisar cada cambio de autenticación.
Actualiza el estado global de React (user, rol y loading) cuando Firebase notifica un cambio.
Elimina el observador al desmontarse el componente mediante:
return () => unsubscribe();
 * Sin loading, cuando la app arranca, user es null por un instante 
 * (Firebase todavía no respondió). Una ruta privada vería user = null 
 * y mandaría al usuario al login aunque ya estuviera autenticado. 
 * Con loading = true le decís "no tomes decisiones todavía".
 * loading es el semáforo entre "Firebase todavía no me contestó" y "ya sé todo, podés mostrar la app". Sin él, React renderiza con datos incompletos y 
 * toma decisiones equivocadas en ese intervalo.
 * 
 */
