import { useState } from "react";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config";
import styles from "./PromoverAdmin.module.css";

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
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Promover usuario a administrador</h3>
      </div>
      <p className={styles.description}>
        Ingresá el email de un usuario registrado para darle rol de administrador.
      </p>

      <form onSubmit={handlePromover} className={styles.form}>
        <input
          type="email"
          placeholder="Email del usuario"
          value={emailBuscado}
          onChange={(e) => setEmailBuscado(e.target.value)}
          required
          className={styles.input}
        />
        <button
          type="submit"
          disabled={cargando}
          className={styles.submitButton}
        >
          {cargando ? "Procesando..." : "Promover a admin"}
        </button>
      </form>

      {mensaje && <p className={styles.successMessage}>{mensaje}</p>}
      {error   && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}
