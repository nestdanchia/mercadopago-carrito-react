import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/cart/CartContext";
import { useAuth } from "../../context/auth/AuthProvider";
import CarritoItem from "./CarritoItem";
import { crearOrden, validarStockDisponible } from "../../services/ordenesService";
import styles from "./Carrito.module.css";

// Umbral a partir del cual se aplica el bono de descuento
const UMBRAL_BONO   = 1_000_000;
const PORCENTAJE_BONO = 0.30;

// Genera un código de bono único con prefijo BONO- y 8 caracteres aleatorios
const generarCodigoBono = () =>
  "BONO-" + Math.random().toString(36).toUpperCase().slice(2, 10);

export function Carrito() {
  const { carrito, vaciarCarrito } = useContext(CartContext);
  const { user } = useAuth();
  const navigate  = useNavigate();

  // codigoBono: null = no generado aún, string = bono activo
  const [codigoBono,    setCodigoBono]    = useState(null);
  // inputBono: lo que el usuario tipea para canjear
  const [inputBono,     setInputBono]     = useState("");
  const [bonoAplicado,  setBonoAplicado]  = useState(false);
  const [errorBono,     setErrorBono]     = useState(null);

  // Total bruto sin descuento
  const totalBruto = carrito.reduce(
    (acc, item) => acc + item.precio * item.cantidad, 0
  );

  // Si el total supera el umbral y aún no se generó el bono, lo generamos
  // La generación ocurre una sola vez: cuando el estado pasa de null a string
  const bonoDisponible = totalBruto >= UMBRAL_BONO;

  if (bonoDisponible && !codigoBono) {
    setCodigoBono(generarCodigoBono());
  }

  const descuento   = bonoAplicado ? Math.round(totalBruto * PORCENTAJE_BONO) : 0;
  const totalFinal  = totalBruto - descuento;

  // Valida el código ingresado contra el generado para esta sesión
  const aplicarBono = () => {
    setErrorBono(null);
    if (inputBono.trim() === codigoBono) {
      setBonoAplicado(true);
    } else {
      setErrorBono("Código incorrecto. Verificá el código que aparece arriba.");
    }
  };

  const continuarComprando = () => navigate("/");

  const finalizarCompra = async () => {
    if (carrito.length === 0) return;
    // PUERTA DE COMPRA — control en el carrito:
    // Verifica que user exista antes de procesar la compra.
    // user es el objeto de Firebase Auth — si es null, no hay sesión activa.
    // A diferencia de RutaPrivadaElemental que controla el rol,
    // esta puerta solo verifica autenticación (cualquier usuario logueado puede comprar).
    if (!user) {
      alert("Debés iniciar sesión para finalizar tu compra.");
      navigate("/login");
      return;
    }

    const nuevaOrden = {
      usuarioId:     user.uid,
      usuarioEmail:  user.email,
      items: carrito.map((item) => ({
        id:       item.id,
        nombre:   item.nombre,
        precio:   item.precio,
        cantidad: item.cantidad,
      })),
      totalBruto,
      descuento,
      total:     totalFinal,
      bonoUsado: bonoAplicado ? codigoBono : null,
    };

    try {
      // ── VALIDACIÓN DE STOCK ───────────────────────────────────────────────
      // Verificamos contra Firestore que el stock real sea suficiente ANTES de
      // crear la orden. La compra aún no está pagada en este punto — es solo
      // una red de seguridad contra overselling (dos usuarios comprando lo mismo
      // al mismo tiempo o stock desactualizado en pantalla).
      const itemsParaValidar = carrito.map((item) => ({
        id:       item.id,
        nombre:   item.nombre,
        cantidad: item.cantidad,
      }));
      const { valido, faltantes } = await validarStockDisponible(itemsParaValidar);

      if (!valido) {
        const detalle = faltantes
          .map((f) => `• ${f.nombre}: pedís ${f.pedido}, hay ${f.disponible}`)
          .join("\n");
        alert(`Stock insuficiente para los siguientes productos:\n\n${detalle}\n\nPor favor actualizá tu carrito.`);
        return;
      }
      // ─────────────────────────────────────────────────────────────────────
      // Para reactivar el flujo directo a Firestore: descomentar estas 4 líneas
      // y comentar el bloque de Mercado Pago de abajo
      //
      // const orderId = await crearOrden(nuevaOrden);
      // console.log("Orden guardada en Firestore. ID:", orderId);
      // alert(`¡Compra exitosa!\nNúmero de orden: ${orderId}`);
      // vaciarCarrito();
      // navigate("/");
      // ─────────────────────────────────────────────────────────────────────

      // ── MERCADO PAGO ──────────────────────────────────────────────────────

      // 1. Guardar orden en Firestore con estado "pendiente"
      const orderId = await crearOrden(nuevaOrden);
      console.log("Orden pendiente creada en Firestore. ID:", orderId);

      // 2. Crear preferencia de pago en MercadoPago pasando el orderId
      const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${BASE_URL}/pagos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: nuevaOrden.items,
          totalBruto: Number(totalBruto),
          descuento: Number(descuento),
          totalFinal: Number(totalFinal),
          orderId,
        }),
      });

      const data = await response.json();
      console.log("Respuesta del backend:", data);

      if (!response.ok || !data.id) {
        alert(`No se pudo iniciar el pago: ${data.error || "Error desconocido"}`);
        return;
      }

      // 3. Vaciar carrito y redirigir a MercadoPago
      vaciarCarrito();
     // window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${data.id}`;
     // window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${data.id}`;
     window.location.href = data.init_point;
     // ─────────────────────────────────────────────────────────────────────

    } catch (error) {
      console.error("Error al procesar la compra:", error);
      alert("Hubo un problema al procesar la compra. Intentá nuevamente.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Mi carrito</h2>
        <p className={styles.infoText}>
          ℹ️ Para probar el pago con tarjetas de prueba consultá el archivo <strong>INSTRUCCIONES_TARJETAS.txt</strong> en la raíz del proyecto.
        </p>
      </div>

      {carrito.length === 0 ? (
        <p className={styles.emptyMessage}>El carrito está vacío.</p>
      ) : (
        carrito.map((item) => (
          <CarritoItem key={item.id} item={item} />
        ))
      )}

      {/* Resumen de precios */}
      <div className={styles.priceSummary}>
        <p className={styles.priceRow}>Subtotal: ${totalBruto.toLocaleString("es-AR")}</p>

        {bonoAplicado && (
          <p className={styles.discountRow}>
            Descuento 30%: -${descuento.toLocaleString("es-AR")}
          </p>
        )}

        <h3 className={styles.totalRow}>
          Total a pagar: ${totalFinal.toLocaleString("es-AR")}
        </h3>
      </div>

      {/* Sección de bono — aparece solo si el total supera el umbral */}
      {bonoDisponible && (
        <div className={styles.bonoSection}>
          <p className={styles.bonoTitle}>
            🎉 ¡Comprá superó $1.000.000! Tenés un bono del 30%
          </p>
          <p className={styles.bonoCode}>
            Tu código de bono: <strong>{codigoBono}</strong>
          </p>

          {!bonoAplicado ? (
            <div className={styles.bonoInputContainer}>
              <input
                type="text"
                placeholder="Ingresá el código"
                value={inputBono}
                onChange={(e) => setInputBono(e.target.value.toUpperCase())}
                className={styles.bonoInput}
              />
              <button
                onClick={aplicarBono}
                className={styles.bonoButton}
              >
                Aplicar
              </button>
            </div>
          ) : (
            <p className={styles.bonoApplied}>✓ Bono aplicado correctamente</p>
          )}

          {errorBono && <p className={styles.bonoError}>{errorBono}</p>}
        </div>
      )}

      <div className={styles.actionButtons}>
        <button onClick={continuarComprando} className={`${styles.actionButton} ${styles.continueButton}`}>
          Continuar comprando
        </button>
        <button onClick={finalizarCompra} className={`${styles.actionButton} ${styles.checkoutButton}`}>
          Finalizar compra
        </button>
      </div>
    </div>
  );
}

export default Carrito;
