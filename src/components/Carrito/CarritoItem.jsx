import styles from "./CarritoItem.module.css";

/** 
 * CarritoItem

Se ocupa de:

renderizar UN producto
mostrar subtotal individual
estilos visuales
*/

function CarritoItem({ item}) {
    return (
        <div className={`${styles.item} ${item.cantidad > 3 ? styles.highQuantity : ""}`}>
            <h3>{item.nombre}</h3>

            <p>Cantidad: {item.cantidad}</p>

            <p>Precio unitario: ${item.precio}</p>

            <p className={styles.subtotal}>
                Subtotal: ${item.precio * item.cantidad}
            </p>
        </div>
    );
}

export default CarritoItem;
