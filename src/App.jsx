import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import { CatalogoProductos } from "./components/CatalogoProductos/CatalogoProductos";
import { ChatIA } from "./components/ChatIA/ChatIA";
import ProductoDetalle from "./components/ProductoDetalle/ProductoDetalle";
import { CartProvider } from "./context/cart/CartProvider";
import { AuthProvider } from "./context/auth/AuthProvider";
import { Carrito } from "./components/Carrito/Carrito";
import { RutaPrivadaElemental } from "./components/RutaPrivadaElementales";
import CargaInicial from "./services/migrarDatosIniciales";
import PruebaLectura from "./services/pruebaLectura";
import Login from "./components/Auth/Login";
import Registro from "./components/Auth/Registro";
import Admin from "./components/Administrar/admin";
import PromoverAdmin from "./components/Administrar/PromoverAdmin";
import TablaOrdenes from "./components/Administrar/TablaOrdenes";
import PagoExitoso from "./components/Pago/PagoExitoso";
import PagoFallido from "./components/Pago/PagoFallido";
import PagoPendiente from "./components/Pago/PagoPendiente";
// CartProvider comparte el estado global del carrito con todos los
// componentes hijos que consuman CartContext usando useContext().
// spa La página HTML principal es una sola, y React va cambiando qué componente
//  mostrar mediante re-renders.
function App() {
  //CargaInicial(); se incorpora como componente hijo de CartProvider no afecta 
  // el renderizado de la app pues retorna null  fue usado para cargar los datos iniciales a Firestore

  return (
    <AuthProvider>
      <CartProvider>
        <CargaInicial />
        <PruebaLectura />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/admin" element={<Admin />} />
            <Route
              path="/"
              element={
                <CatalogoProductos mensaje="Tienda Virtual - Productos Disponibles" />
              }
            />
            <Route path="/chat" element={<ChatIA />} />
            <Route
              path="/registro"
              element={<Registro />}
            />
            <Route path="/login" element={<Login />} />
            {/* Ruta protegida de ejemplo */}
            <Route
              path="/privada"
              element={
                <RutaPrivadaElemental>
                  <div>
                    <h2>Ordenes</h2>
                    <p>Ves este mensaje porque te autenticaste como administrador.</p>
                    <PromoverAdmin />
                    <TablaOrdenes />
                  </div>
                </RutaPrivadaElemental>
              }
            />
            <Route path="/producto/:id" element={<ProductoDetalle />} />
            <Route path="/pago-exitoso" element={<PagoExitoso />} />
            <Route path="/pago-fallido" element={<PagoFallido />} />
            <Route path="/pago-pendiente" element={<PagoPendiente />} />
          </Route>
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
