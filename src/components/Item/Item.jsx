import { useState } from "react";
import styles from "./Item.module.css";
import { Link } from "react-router-dom";

export function Item({ id,nombre, precio, stock, imagen, onCompra }) {
  console.log("imagen  *****", imagen);
  // cantidadSeleccionada: estado local de este componente.
  // Representa cuantas unidades el usuario eligio con + / - antes de confirmar.
  // No es la cantidad que va al carrito todavia — es el selector previo al click en Comprar.
  // Distinto de "cantidad" en CartProvider, que es la cantidad ya confirmada dentro del carrito.
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(0);

  const sumar = () => {
    if (cantidadSeleccionada < stock) setCantidadSeleccionada((c) => c + 1);
  };

  const restar = () => {
    if (cantidadSeleccionada > 0) setCantidadSeleccionada((c) => c - 1);
  };

  const comprar = () => {
    if (cantidadSeleccionada === 0)
      return;
    // onCompra es el callback creado por crearCallbackCompra(productoId) 
    // en CatalogoProductos.
    // Item no sabe el id del producto ni a donde va el dato.
    // Solo informa cuantas unidades quiere el usuario — el padre
    //  ya tiene el id capturado en el closure.
    onCompra(cantidadSeleccionada);
    setCantidadSeleccionada(0);
  };

  return (
    <article className={styles.card}>
      {id && <Link to={`/producto/${id}`}>Ver detalle</Link>}

      <img
        src={imagen}
        alt={nombre}
        className={styles.image}
        onError={(e) => {
           e.target.onerror = null;
          const imagenesRespaldo = [
            "/carrito1.png",
            "/carrito2.png",
            "/carrito3.png",
            "/carrito4.png",
            "/carrito5.png",
            "/carrito6.png",
            "/carrito7.png",
            "/carrito8.png",
            "/carrito9.png",
            "/carrito10.png",
            "/carrito11.png",
            "/carrito12.png",
            "/carrito13.png",
            "/carrito14.png",
            "/carrito15.png",
          ];

          // elige una imagen aleatoria
          const random =
            imagenesRespaldo[
              Math.floor(Math.random() * imagenesRespaldo.length)
            ];

          e.target.src = random;
        }}
      />

      <h3>{nombre}</h3>
      <p>${precio}</p>
      <p translate="no">Stock: {stock}</p>

      {stock <= 2 && <p className={styles.alerta}>⚠ Stock bajo - Reponer</p>}

      <div className={styles.quantityControl}>
        <button
          className={styles.quantityButton}
          onClick={restar}
          disabled={cantidadSeleccionada === 0}
        >
          -
        </button>
        <span className={styles.quantity}>{cantidadSeleccionada}</span>
        <button
          className={styles.quantityButton}
          onClick={sumar}
          disabled={cantidadSeleccionada >= stock}
        >
          +
        </button>
      </div>

      <button
        onClick={comprar}
        disabled={cantidadSeleccionada === 0}
        className={cantidadSeleccionada === 0 ? styles.buttonDisabled : styles.buttonActive}
      >
        Comprar
      </button>
    </article>
  );
}
