import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth/AuthProvider";

//  useEffect corre después de que el componente ya renderizó, 
// por eso no sirve para controlar qué se muestra 
// no sirve en logica de renderizadio condicional

export function RutaPrivadaElemental({ children }) {

     const { rol, loading } = useAuth();
      
     if (loading) return null
    
     if (rol !="admin") return <Navigate to ="/" />  
// admin renderiza lo que le pasamos y lo puede ver el admin
     return children
  
}