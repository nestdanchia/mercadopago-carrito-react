import { useState } from "react";
import { useAuth } from "../../context/auth/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function Registro() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, user } = useAuth();
  const navigate = useNavigate();

  // Si el usuario ya está logueado, mostrar mensaje en lugar del formulario
  if (user) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <h2>Ya estás registrado e iniciaste sesión</h2>
        <p>Estás logueado como <strong>{user.email}</strong>.</p>
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "1rem",
            backgroundColor: "#1976d2",
            color: "#fff",
            border: "none",
            padding: "0.6rem 1.4rem",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Ir a la tienda
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // El provider se encarga de:
      // 1. Crear usuario en Authentication
      // 2. Crear documento en Firestore
      // 3. Guardar rol = "cliente"
      // 4. Devolver la credencial
      const credencial = await register(email, password);
      const user = credencial.user;
      console.log("usuario registrado", user);
      console.log("Usuario creado:", credencial.user.email);
    } catch (error) {
      console.error(error.code);
      console.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registro:</h2>
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Registrarse</button>
    </form>
  );
}
