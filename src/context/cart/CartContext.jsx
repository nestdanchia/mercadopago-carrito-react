import { createContext } from "react";

// Crea el canal de comunicacion global del carrito.
// No tiene estado ni logica — solo define el contexto.
// CartProvider es quien inyecta los datos.
export const CartContext = createContext();
