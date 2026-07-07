import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config";

// Muestra todas las órdenes generadas, ordenadas por fecha descendente.
// Solo accesible desde /privada (protegida por RutaPrivadaElemental).
export default function TablaOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // id de la orden expandida para ver el detalle de items
  const [expandida, setExpandida] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const q = query(
          collection(db, "ordenes"),
          orderBy("fecha", "desc")   // más reciente primero
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Firestore Timestamp → Date de JS para formatear
          fechaJS: doc.data().fecha?.toDate() ?? null,
        }));
        setOrdenes(data);
      } catch (err) {
        console.error("Error al cargar órdenes:", err.message);
        setError("No se pudieron cargar las órdenes. Revisá la consola.");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";
    return fecha.toLocaleString("es-AR", {
      day:    "2-digit",
      month:  "2-digit",
      year:   "numeric",
      hour:   "2-digit",
      minute: "2-digit",
    });
  };

  const toggleExpandir = (id) => {
    setExpandida((prev) => (prev === id ? null : id));
  };

  const eliminarOrden = async (id) => {
    if (!window.confirm("¿Seguro que querés eliminar esta orden?")) return;
    try {
      await deleteDoc(doc(db, "ordenes", id));
      setOrdenes((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error("Error al eliminar la orden:", err.message);
      alert("No se pudo eliminar la orden. Revisá la consola.");
    }
  };

  if (loading) return <p>Cargando órdenes...</p>;
  if (error)   return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3 style={{ marginBottom: "1rem" }}>Órdenes generadas :columna eliminar </h3>

      {ordenes.length === 0 ? (
        <p>No hay órdenes registradas todavía.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={th}>Fecha</th>
              <th style={th}>Usuario</th>
              <th style={th}>Total</th>
              <th style={th}>Estado</th>
              <th style={th}>Items</th>
              <th style={th}>Eliminar</th>
            </tr>
          </thead>
          {ordenes.map((orden) => (
              <tbody key={orden.id}>
                <tr style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={td}>{formatearFecha(orden.fechaJS)}</td>
                  <td style={td}>{orden.usuarioEmail}</td>
                  <td style={td}>${orden.total}</td>
                  <td style={td}>
                    <span style={{
                      backgroundColor: "#e8f5e9",
                      color: "#2e7d32",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "12px",
                      fontSize: "0.85rem"
                    }}>
                      {orden.estado}
                    </span>
                  </td>
                  <td style={td}>
                    <button
                      onClick={() => toggleExpandir(orden.id)}
                      style={{
                        background: "none",
                        border: "1px solid #1976d2",
                        color: "#1976d2",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.85rem"
                      }}
                    >
                      {expandida === orden.id ? "Ocultar" : `Ver (${orden.items?.length ?? 0})`}
                    </button>
                  </td>
                  <td style={td}>
                    <button
                      onClick={() => eliminarOrden(orden.id)}
                      style={{
                        background: "none",
                        border: "1px solid #c62828",
                        color: "#c62828",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.85rem"
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>

                {/* Fila de detalle de items — visible solo cuando está expandida */}
                {expandida === orden.id && (
                  <tr>
                    <td colSpan={5} style={{ backgroundColor: "#fafafa", padding: "0.8rem 1.5rem" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ backgroundColor: "#eeeeee" }}>
                            <th style={thSub}>Producto</th>
                            <th style={thSub}>Precio unitario</th>
                            <th style={thSub}>Cantidad</th>
                            <th style={thSub}>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orden.items?.map((item, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid #e0e0e0" }}>
                              <td style={tdSub}>{item.nombre}</td>
                              <td style={tdSub}>${item.precio}</td>
                              <td style={tdSub}>{item.cantidad}</td>
                              <td style={tdSub}>${item.precio * item.cantidad}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </tbody>
            ))}
        </table>
        </div>
      )}
    </div>
  );
}

const th    = { padding: "0.6rem 1rem", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #ccc" };
const td    = { padding: "0.5rem 1rem" };
const thSub = { padding: "0.4rem 0.8rem", textAlign: "left", fontWeight: "bold", color: "#555" };
const tdSub = { padding: "0.4rem 0.8rem" };
