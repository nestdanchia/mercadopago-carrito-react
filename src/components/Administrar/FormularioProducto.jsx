import { useState } from "react";
import styles from "./FormularioProducto.module.css";

// Componente hijo presentacional — solo renderiza el formulario.
// No tiene logica ni estado propio. Recibe datos y callbacks del padre.
// Flujo de bajada: padre -> hijo via datosForm y titulo.
// Flujo de subida: hijo -> padre via manejarCambio y manejarEnvio.
// Reutilizable para Alta, Edicion y cualquier operacion CRUD via prop 'titulo'.
// El selector de archivo genera una preview visual local (no sube el archivo al servidor).
// El admin debe copiar el archivo manualmente a /public y escribir la ruta en el campo de texto.
// El formulario recibe desde el padre los datos (datosForm)
// y los callbacks (manejarCambio y manejarEnvio).
// Los inputs capturan lo que escribe el usuario y envían los eventos al padre.
// El padre actualiza el estado mediante setDatosForm y vuelve a pasar
// los datos actualizados al formulario.

function FormularioProducto({ datosForm, manejarCambio, manejarEnvio, titulo }) {
  // previewUrl: URL temporal generada por el browser para mostrar la imagen seleccionada.
  // Solo existe en memoria mientras el formulario está abierto, no se guarda en ningún lado.
  const [previewUrl, setPreviewUrl] = useState(null);

  // Cuando el usuario selecciona un archivo, genera una URL temporal para el preview.
  // No sube nada al servidor — solo muestra cómo se vería la imagen.
  const manejarSeleccionArchivo = (evento) => {
    const archivo = evento.target.files[0];
    if (!archivo) return;

    // Revoca la URL anterior para liberar memoria
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const urlTemporal = URL.createObjectURL(archivo);
    setPreviewUrl(urlTemporal);
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.titulo}>{titulo || "Producto"}</h3>

      <form onSubmit={manejarEnvio}>

        <div className={styles.campo}>
          <label className={styles.label}>Nombre del Producto</label>
          <input
            className={styles.input}
            type="text"
            name="nombre"
            placeholder="Ej: Teclado Mecanico"
            value={datosForm.nombre}
            onChange={manejarCambio}
            /*En React, los inputs controladosLos eventos onChange de inputs,
          selects y textareas suelen exponer
target.name y target.value.*/
          
           
          
           
          />
        </div>

        <div className={styles.campo}>
          <label className={styles.label}>Stock</label>
          <input
            className={styles.input}
            type="number"
            name="stock"
            placeholder="Ej: 10"
            value={datosForm.stock}
            onChange={manejarCambio}
          />
        </div>

        <div className={styles.campo}>
          <label className={styles.label}>Precio ($)</label>
          <input
            className={styles.input}
            type="number"
            name="precio"
            placeholder="Ej: 95"
            value={datosForm.precio}
            onChange={manejarCambio}
          />
        </div>

        <div className={styles.campo}>
          <label className={styles.label}>Categoria</label>
          {/* El select usa el mismo manejarCambio que los inputs via name="categoria" */}
          <select
            className={styles.select}
            name="categoria"
            value={datosForm.categoria}
            onChange={manejarCambio}
          >
            <option value="">Seleccionar...</option>
            <option value="computacion">Computacion</option>
            <option value="accesorios">Accesorios</option>
            <option value="audio">Audio</option>
            <option value="moviles">Moviles</option>
            <option value="almacenamiento">Almacenamiento</option>
            <option value="componentes">Componentes</option>
            <option value="redes">Redes</option>
            <option value="muebles">Muebles</option>
            <option value="gaming">Gaming</option>
            <option value="streaming">Streaming</option>
            <option value="fotografia">Fotografia</option>
            <option value="drones">Drones</option>
            <option value="wearables">Wearables</option>
            <option value="video">Video</option>
            <option value="seguridad">Seguridad</option>
          </select>
        </div>

        <div className={styles.campo}>
          <label className={styles.label}>Imagen</label>

          {/* Selector de archivo — solo genera preview, no sube nada */}
          <input
            type="file"
            accept="image/*"
            onChange={manejarSeleccionArchivo}
            className={styles.fileInput}
          />

          {/* Preview de la imagen seleccionada */}
          {previewUrl && (
            <div className={styles.previewContainer}>
              <img
                src={previewUrl}
                alt="Vista previa"
                className={styles.previewImage}
              />
              <p className={styles.previewWarning}>
                ⚠ Vista previa local. Para que la imagen funcione en la tienda,
                copiá el archivo a la carpeta <strong>/public</strong> y escribí la ruta abajo.
              </p>
            </div>
          )}

          {/* Campo de texto para la ruta final que se guarda en Firestore */}
          <input
            className={styles.input}
            type="text"
            name="imagen"
            placeholder="Ej: /11.jpeg"
            value={datosForm.imagen}
            onChange={manejarCambio}
          />
        </div>

        <button type="submit" className={styles.boton}>
          Guardar Producto
        </button>

      </form>
    </div>
  );
}

export default FormularioProducto;
