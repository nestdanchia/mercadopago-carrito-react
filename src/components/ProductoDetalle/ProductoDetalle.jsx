import { doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
//import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { db } from "../../firebase/config";

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


  //const navigate = useNavigate();
  return (
    <div>
      <h2>Detalle del Producto</h2>
      <p>Mostrando información para el producto con ID: {id}</p>

      <img src={productoDetalle.imagen} alt="Detalle del producto" />
      <p>Precio: ${productoDetalle.precio}</p>

      <p>Stock: {productoDetalle.stock}</p>

      <p>Categoría: {productoDetalle.categoria}</p>

      <Link to="/" style={{ textDecoration: "underline", color: "blue" }}>
        Volver al Catalogo
      </Link>
    </div>
  );
}

export default ProductoDetalle;