import { useState, useEffect, useRef } from "react";
import FormularioProducto from "./FormularioProducto";
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "../../services/cargaProductos";
import styles from "./GestionProductos.module.css";

// Vista de administración de productos.
// Lista todos los productos con acciones Agregar, Editar y Eliminar.
// Reutiliza FormularioProducto para alta y edición via prop 'titulo' y estado 'modo'.
export default function GestionProductos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // modo: null = solo tabla | "alta" = formulario nuevo | "edicion" = formulario con datos
  const [modo, setModo] = useState(null);
  const [productoEditando, setProductoEditando] = useState(null);

  const datosVacios = { nombre: "", stock: "", precio: "", categoria: "", imagen: "" };
  const [datosForm, setDatosForm] = useState(datosVacios);
  const formularioRef = useRef(null);

  // Carga inicial de productos desde Firestore
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await obtenerProductos();
        setProductos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  // Scroll automático al formulario cuando cambia el modo
  useEffect(() => {
    if (!modo) return;
    formularioRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [modo]);

  // Abre el formulario en modo alta con campos vacíos
  const iniciarAlta = () => {
    // el cambio lo identifica react al renderizar nuevamente por cambio de estado
    // Un cambio de estado provoca un re-render.
    // vuelve a ejecutar la función componente para obtener un nuevo JSX.
    setModo("alta");
    setProductoEditando(null);
    setDatosForm(datosVacios);
  };

  // Abre el formulario en modo edición con los datos del producto seleccionado
  const iniciarEdicion = (producto) => {
    // los hooks (useState, useRef, useReducer) guardan sus valores fuera de la función,
    //  dentro de React, y por eso sobreviven entre ejecuciones entre re-renderes por cambio de estado
    setModo("edicion");
    setProductoEditando(producto);
    setDatosForm({
      nombre:    producto.nombre,
      stock:     producto.stock,
      precio:    producto.precio,
      categoria: producto.categoria,
      imagen:    producto.imagen || "",
    });
  };

  // Cierra el formulario y limpia el estado
  const cancelar = () => {
    setModo(null);
    setProductoEditando(null);
    setDatosForm(datosVacios);
  };

  // Maneja los cambios en el formulario (compartido para alta y edición)
  // React crea el objeto evento cuando el usuario interactúa con el formulario.
//El hijo recibe ese evento y lo pasa al callback del padre manejarCambio,
//que actualiza el estado correspondiente.
  const manejarCambio = (evento) => {
    const { name, value } = evento.target;
    console.log("Campo:", name, "Valor:", value);
    setDatosForm({
      ...datosForm,
      /*: el navegador siempre devuelve el value como un texto (string), 
      incluso si el input es de tipo type="number". 
      si es verdadero lo transformamos en un numero real si no queda como string : value, */
      [name]: name === "stock" || name === "precio" ? Number(value) : value,
    });
  };

  // Envia el formulario — llama a crearProducto o actualizarProducto según el modo
  //El padre le habla al hijo mediante props.
//El hijo le responde al padre mediante eventos.
  const manejarEnvio = async (evento) => {
    // const manejarCambio = (algoQueMeVanAPasar que es el evento que se creo en el hijo) => {
    evento.preventDefault();
    try {
      if (modo === "alta") {
        const nuevo = await crearProducto(datosForm);
        setProductos((prev) => [...prev, nuevo]);
        alert("Producto agregado correctamente");
      } else if (modo === "edicion") {
        await actualizarProducto(productoEditando.id, datosForm);
        setProductos((prev) =>
          prev.map((p) =>
            p.id === productoEditando.id ? { ...p, ...datosForm } : p
          )
        );
        alert("Producto actualizado correctamente");
      }
      cancelar();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // Elimina el producto de Firestore y lo quita de la lista local
  const manejarEliminar = async (id, nombre) => {
    if (!confirm(`¿Seguro que querés eliminar "${nombre}"?`)) return;
    try {
      await eliminarProducto(id);
      setProductos((prev) => prev.filter((p) => p.id !== id));
      alert("Producto eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className={styles.container}>
      {/* Encabezado con título y botón Agregar alineado a la derecha */}
      <div className={styles.header}>
        <h2>Gestión de Productos</h2>
        {!modo && (
          <button
            onClick={iniciarAlta}
            className={styles.addButton}
          >
            + Agregar Producto
          </button>
        )}
      </div>

      {/* Formulario compartido — aparece en modo alta o edición */}
      {modo && (
        <div className={styles.formularioContainer} ref={formularioRef}>
          <FormularioProducto
            datosForm={datosForm}
            manejarCambio={manejarCambio}
            manejarEnvio={manejarEnvio}
            titulo={modo === "alta" ? "Agregar Nuevo Producto" : `Editar: ${productoEditando.nombre}`}
          />
          <button
            onClick={cancelar}
            className={styles.cancelButton}
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Listado de productos */}
      <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>Nombre</th>
            <th className={styles.th}>Categoria</th>
            <th className={styles.th}>Precio</th>
            <th className={styles.th}>Stock</th>
            <th className={styles.th}>Imagen</th>
            <th className={styles.th}>Acciones</th>
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {productos.map((producto) => (
            <tr key={producto.id}>
              <td className={styles.td}>{producto.nombre}</td>
              <td className={styles.td}>{producto.categoria}</td>
              <td className={styles.td}>${producto.precio}</td>
              <td className={styles.td}>{producto.stock}</td>
              <td className={styles.td}>{producto.imagen}</td>
              <td className={styles.td}>
                <button
                  onClick={() => iniciarEdicion(producto)}
                  className={styles.editButton}
                >
                  Editar
                </button>
                <button
                  onClick={() => manejarEliminar(producto.id, producto.nombre)}
                  className={styles.deleteButton}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export default GestionProductos;