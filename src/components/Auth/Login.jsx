import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth/AuthProvider';
import styles from './Login.module.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // modoReset alterna entre el formulario de login y el de recuperación
  const [modoReset, setModoReset] = useState(false);
  const [emailReset, setEmailReset] = useState('');
  const [mensajeReset, setMensajeReset] = useState(null);
  const [errorReset, setErrorReset] = useState(null);

  const navigate = useNavigate();

  // user y rol vienen del contexto global — persisten aunque Login se desmonte y remonte.
  // Si el usuario ya está autenticado y vuelve a /login, user != null y se muestra
  // la pantalla de bienvenida en lugar del formulario.
  const { login, resetPassword, rol, logout, user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // No hace falta setear nada: user y rol del contexto ya se actualizan
      // solos via onAuthStateChanged. El re-render mostrará la bienvenida.
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
    }
  };

  // Llama a Firebase Auth para enviar el email de restablecimiento.
  // Firebase maneja el envío del link — no toca Firestore.
  const handleReset = async (e) => {
    e.preventDefault();
    setMensajeReset(null);
    setErrorReset(null);
    try {
      await resetPassword(emailReset);
      setMensajeReset("Te enviamos un email con el link para restablecer tu contraseña. Revisá también la carpeta de spam.");
      setEmailReset("");
    } catch (error) {
      // auth/user-not-found: el email no existe en Firebase Auth
      // auth/invalid-email: formato de email incorrecto
      setErrorReset("No encontramos una cuenta con ese email. Verificá que sea correcto.");
      console.error("Error al enviar reset:", error.message);
    }
  };

  // Vista de recuperación de contraseña
  if (modoReset) {
    return (
      <div className={styles.contenedor}>
        <h2>Recuperar contraseña</h2>
        <form className={styles.formularioVertical} onSubmit={handleReset}>
          <div className={styles.grupoCampo}>
            <input
              type="email"
              placeholder="Tu email registrado"
              value={emailReset}
              onChange={(e) => setEmailReset(e.target.value)}
              required
            />
          </div>
          <div className={styles.grupoAcciones}>
            <button type="submit" className={styles.btnPrincipal}>
              Enviar email de recuperación
            </button>
          </div>
        </form>
        {mensajeReset && <p className={styles.mensajeOk}>{mensajeReset}</p>}
        {errorReset   && <p className={styles.mensajeError}>{errorReset}</p>}
        <button
          className={styles.linkRecuperacion}
          onClick={() => { setModoReset(false); setMensajeReset(null); setErrorReset(null); }}
        >
          Volver al login
        </button>
      </div>
    );
  }

  // Si hay sesión activa (user del contexto), muestra bienvenida con accesos según rol.
  if (user) {
    return (
      <div className={styles.contenedor}>
        <h2 style={{ color: "#2e7d32" }}>¡Sesión iniciada!</h2>

        {rol === "admin" ? (
          <div>
            <p>Bienvenido, administrador. Tenés disponibles los siguientes accesos:</p>
            <div style={{ display: "flex", flexDirection: "column", marginTop: "1rem" }}>
              <button className={`${styles.btnNav} ${styles.btnAdmin}`}    onClick={() => navigate("/admin")}>Panel de Administración — gestionar productos</button>
              <button className={`${styles.btnNav} ${styles.btnOrdenes}`}  onClick={() => navigate("/privada")}>Órdenes</button>
              <button className={`${styles.btnNav} ${styles.btnCatalogo}`} onClick={() => navigate("/")}>Ir al catálogo</button>
              <button className={`${styles.btnNav} ${styles.btnSalir}`}    onClick={() => logout()}>Cerrar sesión</button>
            </div>
          </div>
        ) : (
          <div>
            <p>Bienvenido. Podés explorar el catálogo y realizar compras.</p>
            <div style={{ display: "flex", flexDirection: "column", marginTop: "1rem" }}>
              <button className={`${styles.btnNav} ${styles.btnCatalogo}`} onClick={() => navigate("/")}>Ir al catálogo</button>
              <button className={`${styles.btnNav} ${styles.btnSalir}`}    onClick={() => logout()}>Cerrar sesión</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Formulario de login — se muestra cuando no hay sesión activa
  return (
    <div className={styles.contenedor}>
      <form className={styles.formularioVertical} onSubmit={handleSubmit}>
        <h2>Iniciar Sesión:</h2>

        <div className={styles.grupoCampo}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.grupoCampo}>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className={styles.grupoAcciones}>
          <button type="submit" className={styles.btnPrincipal}>Ingresar</button>
          <p>
            <button
              type="button"
              className={styles.linkRecuperacion}
              onClick={() => setModoReset(true)}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Login;
