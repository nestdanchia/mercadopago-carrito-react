import { doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../../firebase/config";
import styles from "./ProductoDetalle.module.css";

function ProductoDetalle() {

  const [productoDetalle, setProductoDetalle] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const obtenerProducto = async () => {

      //doc apunta al documento específico en la colección "productos" a diferencia 
      //de collection que apunta a la colección completa

      const productoRef = doc(db, "productos", id);

      const producto = await getDoc(productoRef);

       if(!producto.exists()){
        console.log("Producto no encontrado");
        return;
       }
      setProductoDetalle({
        id: producto.id,
        ...producto.data()
      });

      console.log("producto :", producto, "data :", producto.data());

      // data() es un método del snapshot
      //  que extrae el contenido del documento


      console.log("imagen *****", producto.data().imagen);
    };
    obtenerProducto();
  }, [id]);

  // correctamente modelada la dependencia 
  //el array de dependencias [id] asegura que el hook se
  //vuelva a ejecutar si el ID en la URL cambia

  if (!productoDetalle) {
    return <h2>Cargando producto...</h2>;
  }


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Detalle del Producto</h2>
        <p className={styles.productId}>ID: {id}</p>
      </div>

      <div className={styles.content}>
        <div className={styles.imageContainer}>
          <img
            src={productoDetalle.imagen}
            alt={productoDetalle.nombre}
            className={styles.image}
          />
        </div>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Nombre</span>
            <p className={styles.detailValue}>{productoDetalle.nombre}</p>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Precio</span>
            <p className={styles.price}>${productoDetalle.precio}</p>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Stock</span>
            <p className={`${styles.detailValue} ${styles.stock}`}>
              {productoDetalle.stock} unidades
            </p>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Categoría</span>
            <span className={styles.category}>{productoDetalle.categoria}</span>
          </div>
        </div>
      </div>

      <Link to="/" className={styles.backLink}>
        Volver al Catálogo
      </Link>
    </div>
  );
}

export default ProductoDetalle;