import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { actualizarEstadoOrden } from "../../services/ordenesService";

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
    <div style={{ textAlign: "center", padding: "3rem" }}>
      <h2 style={{ color: "#f57f17" }}>⏳ Tu pago está pendiente de acreditación</h2>
      <p>Una vez acreditado, tu orden será confirmada automáticamente.</p>
      <p style={{ fontSize: "0.9rem", color: "#666" }}>
        Podés revisar el estado de tu orden en tu historial de compras.
      </p>
      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "1.5rem",
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

export default PagoPendiente;
