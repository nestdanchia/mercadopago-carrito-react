import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { actualizarEstadoOrden } from "../../services/ordenesService";

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
    <div style={{ textAlign: "center", padding: "3rem" }}>
      <h2 style={{ color: "#c62828" }}>❌ El pago no se pudo completar</h2>
      <p>Tu orden no fue procesada. Podés intentarlo nuevamente.</p>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1.5rem" }}>
        <button
          onClick={() => navigate("/carrito")}
          style={{
            backgroundColor: "#4caf50",
            color: "#fff",
            border: "none",
            padding: "0.6rem 1.4rem",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Volver al carrito
        </button>
        <button
          onClick={() => navigate("/")}
          style={{
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
    </div>
  );
}

export default PagoFallido;
