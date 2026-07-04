import { useState } from "react";
import { CartContext } from "./CartContext";

// CartProvider administra el estado global del carrito y lo comparte
// con todos los componentes hijos via CartContext.Provider.
export function CartProvider({ children }) {
  // El useState provoca el render de los componentes que lo usan.
  const [carrito, setCarrito] = useState([]);
/**
 * 
 evitar la dependencia de dos estados (lo que en programación se conoce
  como Single Source of Truth o Fuente Única de Verdad). Al tener un solo 
  estado (carrito), eliminamos
  la posibilidad de que un estado diga una cosa y el otro diga algo diferente.
 */
  //const [totalUnidades, setTotalUnidades] = useState(0);
  // no es necesario porque se calcula automaticamentede 
  // acuerdo al estado del carrito
  // ademas produciria una dependencia de dos estados 

  // Agrega un producto al carrito. Si ya existe, suma la cantidad.
  const agregarAlCarrito = (producto, cantidad) => {
    setCarrito((prev) => {
      console.log("Estado anterior del carrito:", prev);
      // uso el estado más actualizado que React entrega.
      const existe = prev.find((item) => item.id === producto.id);

      if (existe) {
        return prev.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }
      // ...prev (Spread Operator en Arrays): Copia todos los productos que ```8
 

      // { ...producto, cantidad }: Crea un nuevo objeto
      //  con todos los campos del producto original, pero sobrescribe 
      // la cantidad con el valor que se quiere agregar.
//devolvemos el carrito con el nuevo producto
// como en este caso carrito estaba !!! vacio se agrega el producto y su cantidad al array vacio
      return [...prev, { ...producto, cantidad }];
    });
    // actualizamos el contadr de unidades que luego consumira CatalogoProductos
   // setTotalUnidades((prev) => prev + cantidad) 
  };

  // Resetea el carrito a vacio. Se llama al finalizar la compra.
  const vaciarCarrito = () => {
    setCarrito([]);
  };
 // ESTADO DERIVADO: Se calcula automáticamente en cada renderizado
  const totalUnidades = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <CartContext.Provider value={{ carrito, agregarAlCarrito, vaciarCarrito, totalUnidades  }}>
      {children}
    </CartContext.Provider>
  );
}
/**
 Usuario hace clic: Se ejecuta agregarAlCarrito.El estado cambia: Llama a setCarrito(...). 
 Esto le avisa a React que el estado carrito tiene nuevos datos.React re-renderiza: 
 Al cambiar el estado, React vuelve a ejecutar todo el código dentro de CartProvider
  de arriba a abajo.Cálculo instantáneo: Al ejecutarse el código otra vez, 
  la línea del .reduce() se vuelve a leer, pero ahora usa el carrito actualizado.Componentes al día: El Provider recibe el nuevo valor de
  totalUnidades y lo distribuye a todos los componentes (como tu catálogo) al instante.
 * 
 */