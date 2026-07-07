import { useState } from "react";
import { useAuth } from "../../context/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

function Registro() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  // Si el usuario ya está logueado, mostrar mensaje en lugar del formulario
  if (user) {
    return (
      <div className={styles.contenedor} style={{ textAlign: "center" }}>
        <h2>Ya estás registrado e iniciaste sesión</h2>
        <p>Estás logueado como <strong>{user.email}</strong>.</p>
        <div style={{ display: "flex", flexDirection: "column", marginTop: "1rem" }}>
          <button
            className={`${styles.btnNav} ${styles.btnCatalogo}`}
            onClick={() => navigate("/")}
          >
            Ir a la tienda
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setExito(false);
    try {
      // El provider se encarga de:
      // 1. Crear usuario en Authentication
      // 2. Crear documento en Firestore
      // 3. Guardar rol = "cliente"
      // 4. Devolver la credencial
      const credencial = await register(email, password);
      const usuarioCreado = credencial.user;
      console.log("usuario registrado", usuarioCreado);
      setExito(true);
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error(err.code);
      console.error(err.message);
      setError("No se pudo crear la cuenta. Verificá que el email sea válido y la contraseña tenga al menos 6 caracteres.");
    }
  };

  return (
    <div className={styles.contenedor}>
      <form className={styles.formularioVertical} onSubmit={handleSubmit}>
        <h2>Crear cuenta:</h2>

        <div className={styles.grupoCampo}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.grupoCampo}>
          <input
            type="password"
            placeholder="Contraseña (mínimo 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className={styles.grupoAcciones}>
          <button type="submit" className={styles.btnPrincipal}>
            Registrarse
          </button>
          <p>
            <button
              type="button"
              className={styles.linkRecuperacion}
              onClick={() => navigate("/login")}
            >
              ¿Ya tenés cuenta? Iniciá sesión
            </button>
          </p>
        </div>
      </form>

      {exito && <p className={styles.mensajeOk}>✓ Cuenta creada correctamente. Ya podés iniciar sesión.</p>}
      {error && <p className={styles.mensajeError}>{error}</p>}
    </div>
  );
}

export default Registro;
