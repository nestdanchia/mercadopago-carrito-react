import styles from "./Navbar.module.css";
import { NavLink } from "react-router-dom";
// NavLink Sirve para navegar entre rutas y además saber cuándo una ruta está activa.
// cambian la URL sin recargar la aplicación. SPA
import { useAuth } from "../../context/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
/* llamá a getClass manualmente. NavLink la ejecuta automáticamente y le pasa { isActive }, 
y según ese valor devolvés una clase o dos clases.
NavLink → navegación declarativa en el JSX.
navigate() → navegación imperativa desde una función o evento. */
const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, rol } = useAuth();
  const handleLogout = async () => {
  await logout();
  navigate("/login");
};
// isActive indica si la URL actual del navegador coincide con la ruta especificada en to
  const getClass = ({ isActive }) =>
    isActive
      ? `${styles.link} ${styles.active}`
      : styles.link;

  return (
    <nav className={styles.navbar}>
      <NavLink to="/" className={getClass} end>
        Inicio
      </NavLink>

      <NavLink to="/chat" className={getClass}>
        Chat IA
      </NavLink>

      <NavLink to="/carrito" className={getClass}>
        Ver carrito
      </NavLink>
      {!user && (
        <NavLink to="/registro" className={getClass} end>
          Registrarse
        </NavLink>
      )}
      {rol === "admin" && (
        <NavLink to="/admin" className={getClass}>
          Administración
        </NavLink>
      )}

      {user ? (
        <>
          <NavLink to="/privada" className={getClass}>
            Ordenes
          </NavLink>

          <button
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            Salir
          </button>
        </>
      ) : (
        <NavLink to="/login" className={getClass}>
          Login
        </NavLink>
      )}
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
