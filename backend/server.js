import express from "express";
import { MercadoPagoConfig, Preference } from "mercadopago";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

// 🔐 TOKEN (coloque o seu aqui)
const client = new MercadoPagoConfig({
  accessToken:"APP_USR-3487066174908994-032510-b92663bbb935700749867cf1e1942be5-3287775563"
});

app.post("/criar-pagamento", async (req, res) => {
  try {
    const { itens } = req.body;

    // 🔴 VALIDAÇÃO IMPORTANTE
    if (!itens || !Array.isArray(itens)) {
      return res.status(400).json({
        erro: "Itens inválidos"
      });
    }

    console.log("Itens recebidos:", itens);

    const preferenceClient = new Preference(client);

    const resposta = await preferenceClient.create({
      body: {
        items: itens,
        back_urls: {
          success: "http://localhost:5500/sucesso.html",
          failure: "http://localhost:5500/falha.html",
          pending: "http://localhost:5500/pendente.html"
        },
        
      }
    });

    console.log("Resposta MP:", resposta);

    res.json({
      url: resposta.init_point
    });

  } catch (erro) {
    console.error("ERRO COMPLETO:", erro);

    res.status(500).json({
      erro: erro.message,
      detalhes: erro.cause || null
    });
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});