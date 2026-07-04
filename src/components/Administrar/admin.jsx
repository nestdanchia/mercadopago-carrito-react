import { useAuth } from "../../context/auth/AuthProvider";
import { Navigate } from "react-router-dom";
import GestionProductos from "./GestionProductos";

export default function Adminl() {
  const { rol, loading } = useAuth();

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (rol !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <h1>Panel de Administración</h1>
      <GestionProductos />
    </div>
  );
}
/**
 * loading = true  →  muestra "Cargando..." (guarda para el caso de re-renders)
rol !== "admin" →  Navigate to="/" (redirige, nunca muestra el panel)
rol === "admin" →  renderiza <GestionProductos />
 *  (el componente GestionProductos se encarga de mostrar un mensaje si no hay productos)
 * 
 */