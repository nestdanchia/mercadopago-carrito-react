import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { actualizarEstadoOrden } from "../../services/ordenesService";
import styles from "./PagoExitoso.module.css";

export function PagoExitoso() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [estado, setEstado] = useState("procesando");

  useEffect(() => {
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      setEstado("error");
      return;
    }

    const actualizar = async () => {
      try {
        await actualizarEstadoOrden(orderId, "pagada", {
          payment_id: searchParams.get("payment_id") || null,
          payment_status: searchParams.get("status") || "approved",
        });
        setEstado("ok");
      } catch (error) {
        console.error("Error actualizando orden:", error);
        setEstado("error");
      }
    };

    actualizar();
  }, [searchParams]);

  return (
    <div className={styles.container}>
      {estado === "procesando" && (
        <p className={styles.processing}>Procesando tu pago...</p>
      )}

      {estado === "ok" && (
        <>
          <h2 className={styles.successTitle}>✅ ¡Pago realizado con éxito!</h2>
          <p className={styles.successMessage}>Tu orden fue confirmada y guardada correctamente.</p>
          <button
            onClick={() => navigate("/")}
            className={styles.actionButton}
          >
            Volver a la tienda
          </button>
        </>
      )}

      {estado === "error" && (
        <>
          <h2 className={styles.errorTitle}>⚠️ No pudimos confirmar tu pago</h2>
          <p className={styles.errorMessage}>Si el pago se realizó correctamente, contactanos para verificarlo.</p>
          <button
            onClick={() => navigate("/")}
            className={`${styles.actionButton} ${styles.errorButton}`}
          >
            Volver a la tienda
          </button>
        </>
      )}
    </div>
  );
}

export default PagoExitoso;
