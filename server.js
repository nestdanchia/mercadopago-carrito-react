import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MercadoPagoConfig, Preference } from 'mercadopago';

dotenv.config();
/**
 /**
 * process.env contiene las variables de entorno del proceso de Node.js.
 *
 * ¿De dónde salen?
 * - En desarrollo: del archivo .env mediante dotenv.
 * - En producción: de las variables configuradas en el servidor
 *   (por ejemplo, Render o Vercel).
 *
 * dotenv.config() lee el archivo .env y carga sus variables en process.env.
 *
 * Ejemplos:
 * process.env.MERCADOPAGO_ACCESS_TOKEN
 * process.env.GROQ_API_KEY
 * process.env.OPENROUTER_API_KEY
 * process.env.CLIENT_URL
  * Las URLs deben ser públicas para que servicios externos
 * (como Mercado Pago) puedan redirigir correctamente al frontend.
 * 
 * 
 */
/**
 * Variables de entorno según el entorno de ejecución
 *
 * ┌──────────────────────────────┬──────────────────────────────┬───────────────────────────────────────────────┐
 * │ Entorno                      │ Variables utilizadas         │ ¿Quién las proporciona?                       │
 * ├──────────────────────────────┼──────────────────────────────┼───────────────────────────────────────────────┤
 * │ Node (desarrollo)            │ process.env                 │ dotenv lee el archivo .env                    │
 * │ Render (backend producción)  │ process.env                 │ Render inyecta las variables configuradas     │
 * │ Vite (desarrollo)            │ import.meta.env.VITE_*      │ Vite lee el archivo .env automáticamente      │
 * │ Vercel (frontend producción) │ import.meta.env.VITE_*      │ Vercel inyecta las variables VITE_* del panel │
 * └──────────────────────────────┴──────────────────────────────┴───────────────────────────────────────────────┘
 *
 * Backend (Node / Render)
 * -----------------------
 * process.env.MERCADOPAGO_ACCESS_TOKEN
 * process.env.CLIENT_URL
 * process.env.GROQ_API_KEY
 * process.env.OPENROUTER_API_KEY
 *
 * Frontend (Vite / Vercel)
 * ------------------------
 * import.meta.env.VITE_API_URL
 * import.meta.env.VITE_FIREBASE_API_KEY
 * import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
 * import.meta.env.VITE_FIREBASE_PROJECT_ID
 * ...
 * Node
│
└── process
      │
      └── env

   Vite
│
└── import
      │
      └── meta
             │
             └── env
             
process.env → "las variables del proceso de Node".
import.meta.env → "las variables del entorno asociadas al módulo que Vite
 expone durante el desarrollo y la compilación".    
 */
const app = express();

app.use(cors());
app.use(express.json());

// CONFIGURAR EL CLIENTE CON TU TOKEN DEL .ENV
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});
console.log("¿El Token existe?:", !!process.env.MERCADOPAGO_ACCESS_TOKEN);
if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
  console.log("Inicio del token detectado:", process.env.MERCADOPAGO_ACCESS_TOKEN.substring(0, 10) + "...");
}
// ==========================================
// ENDPOINT: Crear pagos Mercado Pago
// ==========================================
app.post("/pagos", async (req, res) => {
  try {
    const { items, totalFinal, orderId } = req.body;
    console.log("orderId recibido:", orderId);
     // Validación de seguridad para confirmar que recibimos un número correcto
     console.log("totalFinal",totalFinal)
    if (!totalFinal || isNaN(totalFinal)) {
      return res.status(400).json({ error: "El precio total no es válido o está vacío." });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "El carrito está vacío" });
    }
     
    // Armamos un único item resumen con el total ya calculado en el frontend
    const itemsMercadoPago = [
      {
        title: "Compra tienda online",
        quantity: 1,
        unit_price: Math.round(Number(totalFinal) * 100) / 100,
        currency_id: "ARS",
      },
    ];

    const preference = new Preference(client);

    console.log(JSON.stringify(itemsMercadoPago, null, 2));

    const result = await preference.create({
      body: {
        items: itemsMercadoPago,
        back_urls: {
          success: `${CLIENT_URL}/pago-exitoso?orderId=${orderId}`,
          failure: `${CLIENT_URL}/pago-fallido?orderId=${orderId}`,
          pending: `${CLIENT_URL}/pago-pendiente?orderId=${orderId}`,
        },
        // auto_return: "approved" requiere URLs públicas.
        // En localhost funciona manualmente navegando a /pago-exitoso?orderId=...
        // En producción descomentar la siguiente línea:
        // auto_return: "approved",
      }
    });

    console.log(JSON.stringify(result, null, 2));

    res.json({
      id: result.id,
      init_point: result.init_point
    });
    console.log("Preference ID:", result.id);
    console.log("Collector ID:", result.collector_id);
    console.log("Init Point:", result.init_point);

  } catch (error) {
    console.error("Error creando preferencia:", error?.message || error);
    if (error?.cause) console.error("Causa:", error.cause);
    if (error?.status) console.error("HTTP status MP:", error.status);
    res.status(500).json({ error: "Error al generar el pago", detalle: error?.message });
  }
});

// =========================
// Variables de entorno para IA
// =========================
const GROQ_KEY = process.env.GROQ_API_KEY;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const GROQ_MODEL = "llama-3.1-8b-instant";
const OPENROUTER_MODEL = "meta-llama/llama-3.1-8b-instruct";

function buildBody(mensaje, model) {
  return JSON.stringify({
    model,
    messages: [
      {
        role: "system",
        content: "Eres un vendedor experto de laptops. Responde claro, concreto y recomienda modelos según uso.",
      },
      {
        role: "user",
        content: mensaje,
      },
    ],
  });
}

// =========================
// Endpoint IA Chat
// =========================
app.post("/chat", async (req, res) => {
  const { mensaje } = req.body;

  if (!mensaje) {
    return res.status(400).json({ texto: "Falta el mensaje del usuario." });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_KEY}`,
        "Content-Type": "application/json",
      },
      body: buildBody(mensaje, GROQ_MODEL),
    });

    const data = await response.json();

    if (data.choices?.[0]?.message?.content) {
      return res.json({ texto: data.choices[0].message.content });
    }
  } catch (error) {
    console.warn("Groq no disponible:", error.message);
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": CLIENT_URL,
        "X-Title": "Chat Laptop Store",
      },
      body: buildBody(mensaje, OPENROUTER_MODEL),
    });

    const data = await response.json();
    const texto = data.choices?.[0]?.message?.content || data.error?.message || "Sin respuesta";
    return res.json({ texto });

  } catch (error) {
    console.error("OpenRouter también falló:", error.message);
    return res.status(500).json({ texto: "El servicio de IA no está disponible." });
  }
});
// como para RENDER  En Render el sistema crea una variable de entorno llamada PORT.

console.log("Puerto donde se levanta el servidor en render :", process.env.PORT);
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});