import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { FiShoppingBag } from "react-icons/fi";
import { Item } from "../Item/Item";
import styles from "./CatalogoProductos.module.css";
import { CartContext } from "../../context/cart/CartContext";
import { obtenerProductos, actualizarProducto } from "../../services/cargaProductos";
/*
Orquestador de la tienda. Carga el catalogo y renderiza la grilla de productos.
 Delega la carga de datos a cargaProductos — no sabe de fetch ni URLs.

Comunicacion con Carrito: ambos componentes estan en rutas distintas y nunca
 se hablan directamente. CatalogoProductos escribe en CartContext via
 agregarAlCarrito(), Carrito lee del mismo contexto. CartProvider (en App.jsx)
 mantiene el estado vivo mientras el usuario navega entre paginas.
   CatalogoProductos  →  escribe en el contexto via agregarAlCarrito()
  Carrito            →  lee del contexto via carrito[]
  El intermediario es CartProvider (en App.jsx), que vive por encima de ambas
 rutas y mantiene el estado vivo aunque el usuario navegue entre páginas lo use por ejemplo 
 con el contador de unidades compradas
 crearCallbackCompra(productoId)  ← CatalogoProductos crea un callback por producto, 
 capturando el id
  devuelve (cantidad) => { ... } ← esa funcion se pasa a Item como prop onCompra

Item opera con su estado local cantidadSeleccionada (+ / - / Comprar)
  al hacer click en Comprar llama onCompra(cantidadSeleccionada)
  Item no sabe el id ni donde va el dato, solo informa cuanto quiere el usuario

El callback recibe la cantidad, busca el producto por el id que ya tenia capturado
y ejecuta agregarAlCarrito + descuenta stock

*/

export function CatalogoProductos({ mensaje }) {
  const [productos, setProductos]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const { agregarAlCarrito, totalUnidades } = useContext(CartContext);

  // Carga inicial — se ejecuta una sola vez al montar el componente.
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        setError(null);
        const productosCargados = await obtenerProductos();
        console.log("productosCargados",productosCargados)

        // la actualizacion del estado rovoca que el componente se re-renderice
        setProductos(productosCargados);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  // Patron closure: crearCallbackCompra(id) devuelve una funcion personalizada
  // para ese producto. El hijo (Item) la recibe como prop onCompra y la llama
  // con la cantidad cuando el usuario hace clic en "Comprar".
  //
  // Hace dos cosas:
  //   1. Agrega el producto al carrito global (CartContext)
  //   2. Descuenta el stock en el estado local para actualizar la UI
  //
  // El parametro "cantidad" que llega aqui es el valor final confirmado por el usuario.
  // En Item.jsx ese mismo valor se llama "cantidadSeleccionada" mientras el usuario
  // usa + / - para elegir. Al hacer click en Comprar, cantidadSeleccionada se pasa
  // como argumento a onCompra() y llega aqui como "cantidad" — ya es el valor definitivo.
  const crearCallbackCompra = (productoId) => {
    return async (cantidad) => {
      const productoComprado = productos.find((p) => p.id === productoId);
      console.log("Producto comprado:", productoComprado);
      if (productoComprado) {
        // 1. Agrega el producto al carrito global en memoria (Frontend)
        agregarAlCarrito(productoComprado, cantidad);

        // Calcular el nuevo stock restante
        const nuevoStock = productoComprado.stock - cantidad;

        try {
          // 2. IMPACTO EN FIRESTORE: Actualiza el stock definitivo en la base de datos
          // Pasamos el ID del producto y solo el campo que queremos modificar
          await actualizarProducto(productoId, { stock: nuevoStock });

          // 3. Si la base de datos se actualizó con éxito, actualizamos la UI localmente
          setProductos((productosActuales) =>
            productosActuales.map((p) =>
              p.id === productoId ? { ...p, stock: nuevoStock } : p
            )
          );
        } catch (errorFirebase) {
          console.error("No se pudo actualizar el stock en Firestore:", errorFirebase);
          alert("Hubo un problema de conexión al procesar el stock en el servidor.");
        }
      }
    };
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <h2>Cargando productos...</h2>
          <p>Por favor, espera un momento mientras cargamos el catalogo.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <div className={styles.errorIcon}>aviso</div>
          <h2>Error al cargar los productos</h2>
          <p className={styles.errorMessage}>{error}</p>
          <div className={styles.errorActions}>
            <button onClick={() => window.location.reload()} className={styles.retryButton}>
              Reintentar
            </button>
            <button onClick={() => window.location.reload()} className={styles.reloadButton}>
              Recargar pagina
            </button>
          </div>
          <div className={styles.errorHelp}>
            <h3>Posibles soluciones:</h3>
            <ul>
              <li>Verifica tu conexion a internet</li>
              <li>Comprueba que la URL de firestore sea correcta</li>
              <li>Revisa la consola para mas detalles del error</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>

      <header className={styles.header}>
        <h1>{mensaje || "Tienda Virtual"}</h1>

        <div className={styles.stats}>
          <span className={styles.stat}>{productos.length} Productos</span>
         <span className={styles.stat}>{totalUnidades} Unidades Compradas Hoy </span>

        </div>

        <div>
          <Link to="/carrito" className={styles.linkCarrito}>
            <h1 className={styles.textoEnlace}>
              <FiShoppingBag className={styles.iconoEnlace} /> Ver Compras realizadas
            </h1>
          </Link>
        </div>
      </header>

      {productos.length === 0 ? (
        <div className={styles.empty}>
          <h2>No hay productos disponibles</h2>
          <p>El catalogo esta vacio en este momento.</p>
        </div>
      ) : (
        <main className={styles.catalogo}>
          <div className={styles.grid}>
            {productos.map((producto) => (
              <Item
                key={producto.id}
                id={producto.id}
                categoria={producto.categoria}
                nombre={producto.nombre}
                precio={producto.precio}
                stock={producto.stock}
                imagen={producto.imagen}
                onCompra={crearCallbackCompra(producto.id)}
              />
            ))}
          </div>
        </main>
      )}

      

    </div>
  );
}

export default CatalogoProductos;
