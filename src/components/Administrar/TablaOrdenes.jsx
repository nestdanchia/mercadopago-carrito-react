import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config";
import styles from "./TablaOrdenes.module.css";

// Muestra todas las órdenes generadas, ordenadas por fecha descendente.
// Solo accesible desde /privada (protegida por RutaPrivadaElemental).
function TablaOrdenes() {
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
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Órdenes generadas</h3>
      </div>

      {ordenes.length === 0 ? (
        <p className={styles.emptyMessage}>No hay órdenes registradas todavía.</p>
      ) : (
        <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>Fecha</th>
              <th className={styles.th}>Usuario</th>
              <th className={styles.th}>Total</th>
              <th className={styles.th}>Estado</th>
              <th className={styles.th}>Items</th>
              <th className={styles.th}>Eliminar</th>
            </tr>
          </thead>
          {ordenes.map((orden) => (
              <tbody key={orden.id} className={styles.tbody}>
                <tr>
                  <td className={styles.td}>{formatearFecha(orden.fechaJS)}</td>
                  <td className={styles.td}>{orden.usuarioEmail}</td>
                  <td className={styles.td}>${orden.total}</td>
                  <td className={styles.td}>
                    <span className={styles.estadoBadge}>
                      {orden.estado}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <button
                      onClick={() => toggleExpandir(orden.id)}
                      className={styles.actionButton}
                    >
                      {expandida === orden.id ? "Ocultar" : `Ver (${orden.items?.length ?? 0})`}
                    </button>
                  </td>
                  <td className={styles.td}>
                    <button
                      onClick={() => eliminarOrden(orden.id)}
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>

                {/* Fila de detalle de items — visible solo cuando está expandida */}
                {expandida === orden.id && (
                  <tr className={styles.expandedRow}>
                    <td colSpan={5} className={styles.expandedCell}>
                      <table className={styles.subTable}>
                        <thead className={styles.subThead}>
                          <tr>
                            <th className={styles.subTh}>Producto</th>
                            <th className={styles.subTh}>Precio unitario</th>
                            <th className={styles.subTh}>Cantidad</th>
                            <th className={styles.subTh}>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className={styles.subTbody}>
                          {orden.items?.map((item, i) => (
                            <tr key={i}>
                              <td className={styles.subTd}>{item.nombre}</td>
                              <td className={styles.subTd}>${item.precio}</td>
                              <td className={styles.subTd}>{item.cantidad}</td>
                              <td className={styles.subTd}>${item.precio * item.cantidad}</td>
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

export default TablaOrdenes;
