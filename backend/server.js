import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MercadoPagoConfig, Preference } from "mercadopago";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

if (!accessToken) {
  throw new Error("MERCADO_PAGO_ACCESS_TOKEN nao foi definido no arquivo .env");
}

const client = new MercadoPagoConfig({
  accessToken
});

app.post("/criar-pagamento", async (req, res) => {
  try {

    const { itens } = req.body;

    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: itens
      }
    });

    res.json({ init_point: response.init_point });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro no pagamento" });
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando");
});
