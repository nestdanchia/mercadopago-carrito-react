import styles from "./CarritoItem.module.css";
import { useContext } from "react";
import { CartContext } from "../../context/cart/CartContext";

/** 
 * CarritoItem

Se ocupa de:

renderizar UN producto
mostrar subtotal individual
estilos visuales
*/

function CarritoItem({ item }) {
    const { eliminarDelCarrito } = useContext(CartContext);
    return (
        <div className={`${styles.item} ${item.cantidad > 3 ? styles.highQuantity : ""}`}>
            <h3>{item.nombre}</h3>

            <p>Cantidad: {item.cantidad}</p>

            <p>Precio unitario: ${item.precio}</p>

            <p className={styles.subtotal}>
                Subtotal: ${item.precio * item.cantidad}
            </p>

            <button
                onClick={() => eliminarDelCarrito(item.id)}
                style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginTop: "10px"
                }}
            >
                Eliminar
            </button>
        </div>
    );
}

export default CarritoItem;
