import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { actualizarEstadoOrden } from "../../services/ordenesService";
import styles from "./PagoPendiente.module.css";

export function PagoPendiente() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    if (!orderId) return;

    const actualizar = async () => {
      try {
        await actualizarEstadoOrden(orderId, "pendiente", {
          payment_id: searchParams.get("payment_id") || null,
          payment_status: searchParams.get("status") || "pending",
        });
      } catch (error) {
        console.error("Error actualizando orden:", error);
      }
    };

    actualizar();
  }, [searchParams]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>⏳ Tu pago está pendiente de acreditación</h2>
      <p className={styles.message}>Una vez acreditado, tu orden será confirmada automáticamente.</p>
      <p className={styles.infoText}>
        Podés revisar el estado de tu orden en tu historial de compras.
      </p>
      <button
        onClick={() => navigate("/")}
        className={styles.actionButton}
      >
        Ir a la tienda
      </button>
    </div>
  );
}

export default PagoPendiente;
