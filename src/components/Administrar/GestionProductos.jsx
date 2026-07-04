import { useState, useEffect, useRef } from "react";
import FormularioProducto from "./FormularioProducto";
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "../../services/cargaProductos";

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
    <div>
      {/* Encabezado con título y botón Agregar alineado a la derecha */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0 }}>Gestión de Productos</h2>
        {!modo && (
          <button
            onClick={iniciarAlta}
            style={{ backgroundColor: "#42a5f5", color: "#fff", border: "none", padding: "0.5rem 1.2rem", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
          >
            + Agregar Producto
          </button>
        )}
      </div>

      {/* Formulario compartido — aparece en modo alta o edición */}
      {modo && (
        <div ref={formularioRef}>
          <FormularioProducto
            datosForm={datosForm}
            manejarCambio={manejarCambio}
            manejarEnvio={manejarEnvio}
            titulo={modo === "alta" ? "Agregar Nuevo Producto" : `Editar: ${productoEditando.nombre}`}
          />
          <button
            onClick={cancelar}
            style={{ marginTop: "0.5rem", backgroundColor: "#757575", color: "#fff", border: "none", padding: "0.4rem 1rem", borderRadius: "4px", cursor: "pointer" }}
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Listado de productos */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={thStyle}>Nombre</th>
            <th style={thStyle}>Categoria</th>
            <th style={thStyle}>Precio</th>
            <th style={thStyle}>Stock</th>
            <th style={thStyle}>Imagen</th>
            <th style={thStyle}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={tdStyle}>{producto.nombre}</td>
              <td style={tdStyle}>{producto.categoria}</td>
              <td style={tdStyle}>${producto.precio}</td>
              <td style={tdStyle}>{producto.stock}</td>
              <td style={tdStyle}>{producto.imagen}</td>
              <td style={tdStyle}>
                <button
                  onClick={() => iniciarEdicion(producto)}
                  style={{ marginRight: "0.5rem", backgroundColor: "#1976d2", color: "#fff", border: "none", padding: "0.3rem 0.8rem", borderRadius: "4px", cursor: "pointer" }}
                >
                  Editar
                </button>
                <button
                  onClick={() => manejarEliminar(producto.id, producto.nombre)}
                  style={{ backgroundColor: "#d32f2f", color: "#fff", border: "none", padding: "0.3rem 0.8rem", borderRadius: "4px", cursor: "pointer" }}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  padding: "0.6rem 1rem",
  textAlign: "left",
  fontWeight: "bold",
  borderBottom: "2px solid #ccc",
};

const tdStyle = {
  padding: "0.5rem 1rem",
};
/*
  En React, los inputs controlados reciben su valor desde el estado.
  Los eventos onChange de input, select y textarea suelen exponer:
  
  evento.target.name
  evento.target.value

  Esto permite identificar qué campo cambió y actualizar
  el estado del formulario en el componente padre.
*/