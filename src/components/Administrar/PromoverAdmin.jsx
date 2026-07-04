import { useState } from "react";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config";

// Permite al administrador promover un usuario cliente a administrador.
// Busca el documento en la colección "usuarios" por email y cambia el rol a "admin".
// Solo accesible desde /privada, que ya está protegida por RutaPrivadaElemental.
export default function PromoverAdmin() {
  const [emailBuscado, setEmailBuscado] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handlePromover = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);
    setCargando(true);

    try {
      // Busca en la colección "usuarios" el documento cuyo campo email coincida
      const usuariosRef = collection(db, "usuarios");
      const q = query(usuariosRef, where("email", "==", emailBuscado));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError(`No se encontró ningún usuario con el email: ${emailBuscado}`);
        return;
      }

      // Toma el primer documento que coincida (el email es único)
      const usuarioDoc = snapshot.docs[0];

      if (usuarioDoc.data().rol === "admin") {
        setMensaje(`${emailBuscado} ya es administrador.`);
        return;
      }

      // Actualiza solo el campo rol en el documento encontrado
      await updateDoc(doc(db, "usuarios", usuarioDoc.id), { rol: "admin" });

      setMensaje(`✓ ${emailBuscado} ahora es administrador.`);
      setEmailBuscado("");

    } catch (err) {
      console.error("Error al promover usuario:", err.message);
      setError("Hubo un error al intentar promover el usuario. Revisá la consola.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ marginTop: "2rem", padding: "1.5rem", border: "1px solid #ddd", borderRadius: "8px", maxWidth: "480px" }}>
      <h3 style={{ marginTop: 0 }}>Promover usuario a administrador</h3>
      <p style={{ color: "#555", fontSize: "0.9rem" }}>
        Ingresá el email de un usuario registrado para darle rol de administrador.
      </p>

      <form onSubmit={handlePromover}>
        <input
          type="email"
          placeholder="Email del usuario"
          value={emailBuscado}
          onChange={(e) => setEmailBuscado(e.target.value)}
          required
          style={{ width: "100%", padding: "0.5rem", marginBottom: "0.8rem", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }}
        />
        <button
          type="submit"
          disabled={cargando}
          style={{ backgroundColor: "#1976d2", color: "#fff", border: "none", padding: "0.6rem 1.2rem", borderRadius: "4px", cursor: "pointer" }}
        >
          {cargando ? "Procesando..." : "Promover a admin"}
        </button>
      </form>

      {mensaje && <p style={{ color: "#2e7d32", marginTop: "1rem" }}>{mensaje}</p>}
      {error   && <p style={{ color: "#c62828", marginTop: "1rem" }}>{error}</p>}
    </div>
  );
}
