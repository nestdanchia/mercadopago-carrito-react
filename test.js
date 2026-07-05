fetch("https://mercadopago-carrito-react.onrender.com/pagos", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    items: [{ title: "test", quantity: 1, unit_price: 1000 }],
    totalFinal: 1000,
    orderId: "123"
  })
})
.then(r => r.json())
.then(console.log);
// ejectar node test.js