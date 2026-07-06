import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth/AuthProvider';

export default function Login() {
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
      <div>
        <h2>Recuperar contraseña</h2>
        <form onSubmit={handleReset}>
          <input
            type="email"
            placeholder="Tu email registrado"
            value={emailReset}
            onChange={(e) => setEmailReset(e.target.value)}
            required
          />
          <button type="submit">Enviar email de recuperación</button>
        </form>
        {mensajeReset && <p style={{ color: "green" }}>{mensajeReset}</p>}
        {errorReset   && <p style={{ color: "red"   }}>{errorReset}</p>}
        <button onClick={() => { setModoReset(false); setMensajeReset(null); setErrorReset(null); }}>
          Volver al login
        </button>
      </div>
    );
  }

  // Si hay sesión activa (user del contexto), muestra bienvenida con accesos según rol.
  // Esta condición se cumple tanto al hacer login como al volver a /login
  // desde otra ruta — porque user persiste en el contexto mientras la sesión exista.
  if (user) {
    return (
      <div style={{ padding: "1.5rem" }}>
        <h2 style={{ color: "#2e7d32" }}>¡Sesión iniciada!</h2>

        {rol === "admin" ? (
          <div>
            <p>Bienvenido, administrador. Tenés disponibles los siguientes accesos:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "1rem" }}>
              <button
                onClick={() => navigate("/admin")}
                style={{ backgroundColor: "#1976d2", color: "#fff", border: "none", padding: "0.6rem 1.2rem", borderRadius: "4px", cursor: "pointer", textAlign: "left" }}
              >
                Panel de Administración — gestionar productos
              </button>
              <button
                onClick={() => navigate("/privada")}
                style={{ backgroundColor: "#6a1b9a", color: "#fff", border: "none", padding: "0.6rem 1.2rem", borderRadius: "4px", cursor: "pointer", textAlign: "left" }}
              >
                Ordenes
              </button>
              <button
                onClick={() => navigate("/")}
                style={{ backgroundColor: "#455a64", color: "#fff", border: "none", padding: "0.6rem 1.2rem", borderRadius: "4px", cursor: "pointer", textAlign: "left" }}
              >
                Ir al catálogo
              </button>
              <button
                onClick={() => logout()}
                style={{ backgroundColor: "#b71c1c", color: "#fff", border: "none", padding: "0.6rem 1.2rem", borderRadius: "4px", cursor: "pointer", textAlign: "left" }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p>Bienvenido. Podés explorar el catálogo y realizar compras.</p>
            <button
              onClick={() => navigate("/")}
              style={{ backgroundColor: "#1976d2", color: "#fff", border: "none", padding: "0.6rem 1.2rem", borderRadius: "4px", cursor: "pointer", marginTop: "1rem" }}
            >
              Ir al catálogo
            </button>
            <button
              onClick={() => logout()}
              style={{ backgroundColor: "#b71c1c", color: "#fff", border: "none", padding: "0.6rem 1.2rem", borderRadius: "4px", cursor: "pointer", marginTop: "0.6rem", display: "block" }}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    );
  }

  // Formulario de login — se muestra cuando no hay sesión activa
  return (
    <form onSubmit={handleSubmit}>
      <h2>Iniciar Sesión:</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Ingresar</button>
      <p>
        <button
          type="button"
          onClick={() => setModoReset(true)}
          style={{ background: "none", border: "none", color: "#1976d2", cursor: "pointer", textDecoration: "underline", padding: 0 }}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </p>
    </form>
  );
}
