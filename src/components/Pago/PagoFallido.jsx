import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { actualizarEstadoOrden } from "../../services/ordenesService";
import styles from "./PagoFallido.module.css";

export function PagoFallido() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    if (!orderId) return;

    const actualizar = async () => {
      try {
        await actualizarEstadoOrden(orderId, "fallida", {
          payment_id: searchParams.get("payment_id") || null,
          payment_status: searchParams.get("status") || "rejected",
        });
      } catch (error) {
        console.error("Error actualizando orden:", error);
      }
    };

    actualizar();
  }, [searchParams]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>❌ El pago no se pudo completar</h2>
      <p className={styles.message}>Tu orden no fue procesada. Podés intentarlo nuevamente.</p>
      <div className={styles.actions}>
        <button
          onClick={() => navigate("/carrito")}
          className={styles.actionButton}
        >
          Volver al carrito
        </button>
        <button
          onClick={() => navigate("/")}
          className={`${styles.actionButton} ${styles.secondaryButton}`}
        >
          Ir a la tienda
        </button>
      </div>
    </div>
  );
}

export default PagoFallido;
