/** 
 * CarritoItem

Se ocupa de:

renderizar UN producto
mostrar subtotal individual
estilos visuales
*/

export default function CarritoItem({ item}) {
    return (
       
        <div
          //  key={item.id} ya no sirve para nada se define en Carrito
            style={{
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "1rem",
                marginBottom: "1rem",
                backgroundColor: "#f9f9f9",
                color: item.cantidad > 3 ? "green" : "black"
            }}
        >
            <h3>{item.nombre}</h3>

            <p>Cantidad: {item.cantidad}</p>

            <p>Precio unitario: ${item.precio}</p>

            <p>
                Subtotal: ${item.precio * item.cantidad}
            </p>
        </div>
       
        
    );
}
