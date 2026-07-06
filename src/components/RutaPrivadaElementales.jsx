import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth/AuthProvider";

// PUERTA DE ACCESO — control en la ruta /privada:
// Lee el rol del contexto (el "documento de identidad" emitido por AuthProvider).
// Si loading = true: espera — Firebase todavía no confirmó el estado de autenticación.
// Si rol !== "admin": redirige al catálogo — el usuario no tiene permiso.
// Si rol === "admin": renderiza children — el administrador puede ver el contenido.
export function RutaPrivadaElemental({ children }) {

     const { rol, loading } = useAuth();
      
     if (loading) return null
    
     if (rol !="admin") return <Navigate to ="/" />  
// admin renderiza lo que le pasamos y lo puede ver el admin
     return children
  
}