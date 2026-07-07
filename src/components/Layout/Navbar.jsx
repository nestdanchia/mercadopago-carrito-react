import { useState } from "react";
import styles from "./Navbar.module.css";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/auth/AuthProvider";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, rol } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const cerrarMenu = () => setMenuAbierto(false);

  const getClass = ({ isActive }) =>
    isActive
      ? `${styles.link} ${styles.active}`
      : styles.link;

  return (
    <nav className={styles.navbar}>
      {/* Botón hamburguesa — solo visible en mobile */}
      <button
        className={styles.hamburger}
        onClick={() => setMenuAbierto((prev) => !prev)}
        aria-label="Abrir menú"
      >
        ☰
      </button>

      {/* Links — en desktop siempre visibles, en mobile se muestran/ocultan */}
      <div className={`${styles.links} ${menuAbierto ? styles.linksAbierto : ""}`}>
        <NavLink to="/" className={getClass} end onClick={cerrarMenu}>Inicio</NavLink>
        <NavLink to="/chat" className={getClass} onClick={cerrarMenu}>Chat IA</NavLink>
        <NavLink to="/carrito" className={getClass} onClick={cerrarMenu}>Ver carrito</NavLink>

        {!user && (
          <NavLink to="/registro" className={getClass} end onClick={cerrarMenu}>Registrarse</NavLink>
        )}

        {/* PUERTA VISUAL — control en el Navbar:
            Muestra el link "Administración" solo si el rol es "admin".
            Misma lógica que RutaPrivadaElemental pero aplicada a visibilidad,
            no a acceso. Un cliente no ve la opción, un admin sí. */}
        {rol === "admin" && (
          <NavLink to="/admin" className={getClass} onClick={cerrarMenu}>Administración</NavLink>
        )}

        {user ? (
          <>
            <NavLink to="/privada" className={getClass} onClick={cerrarMenu}>Ordenes</NavLink>
            <button onClick={() => { handleLogout(); cerrarMenu(); }} className={styles.logoutButton}>
              Salir
            </button>
          </>
        ) : (
          <NavLink to="/login" className={getClass} onClick={cerrarMenu}>Login</NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
// NavLink es igual a Link pero agrega la clase "active" automaticamente
// cuando la ruta actual coincide con el "to". Usamos la prop className
// como funcion para combinar el estilo base con el activo.
/**
 *  mantener el efecto visual (fondo naranja cuando está activo), 
 * entonces necesito getClass y .activ
 *  envía el objeto { isActive }?

NavLink lo envía automáticamente
Si la ruta actual coincide con el to, envía { isActive: true }
Si no coincide, envía { isActive: false }
mecanismo de React Router para poder aplicar estilos condicionales al link activo.
 
const Navbar = () => {
  const getClass = ({ isActive }) =>
    isActive ? `${styles.link} ${styles.active}` : styles.link;

  return (
    <nav className={styles.navbar}>
      <NavLink to="/" className={getClass} end>Inicio</NavLink>
      <NavLink to="/chat" className={getClass}>Chat IA</NavLink>
      <NavLink to="/alta" className={getClass}>Alta Producto</NavLink>
      <NavLink to="/privada" className={getClass}>Área Privada</NavLink>
      <NavLink to="/carrito" className={getClass}>Ver carrito</NavLink>
    </nav>
  );
};

export default Navbar;*/
