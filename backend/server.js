import express from "express";
import { MercadoPagoConfig, Preference } from "mercadopago";
import cors from "cors";

const app = express();
app.use(cors()); // Permite que o seu site fale com este servidor
app.use(express.json());

// Configura sua chave do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: "APP_USR-3487066174908994-032510-b92663bbb935700749867cf1e1942be5-3287775563"
});

app.post("/criar-pagamento", async (req, res) => {
  try {
    const { itens } = req.body;

    const preference = new Preference(client);
    const response = await preference.create({
      body: {
        items: itens,
        back_urls: {
            success: "http://localhost:5500/sucesso.html", // Mude para seu link real depois
            failure: "http://localhost:5500/erro.html"
        },
        auto_return: "approved",
      }
    });

    // Envia o link de volta para o seu site
    res.json({ url: response.init_point });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: error.message });
  }
});

app.listen(3000, () => console.log("Servidor de Pagamento Ligado na Porta 3000"));