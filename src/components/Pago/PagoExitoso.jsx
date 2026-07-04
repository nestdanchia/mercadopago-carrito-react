import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { actualizarEstadoOrden } from "../../services/ordenesService";

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
    <div style={{ textAlign: "center", padding: "3rem" }}>
      {estado === "procesando" && (
        <p>Procesando tu pago...</p>
      )}

      {estado === "ok" && (
        <>
          <h2 style={{ color: "#2e7d32" }}>✅ ¡Pago realizado con éxito!</h2>
          <p>Tu orden fue confirmada y guardada correctamente.</p>
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
            Volver a la tienda
          </button>
        </>
      )}

      {estado === "error" && (
        <>
          <h2 style={{ color: "#c62828" }}>⚠️ No pudimos confirmar tu pago</h2>
          <p>Si el pago se realizó correctamente, contactanos para verificarlo.</p>
          <button
            onClick={() => navigate("/")}
            style={{
              marginTop: "1.5rem",
              backgroundColor: "#c62828",
              color: "#fff",
              border: "none",
              padding: "0.6rem 1.4rem",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Volver a la tienda
          </button>
        </>
      )}
    </div>
  );
}

export default PagoExitoso;
