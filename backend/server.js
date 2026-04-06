import express from "express";
import cors from "cors";
import { MercadoPagoConfig, Preference } from "mercadopago";

const app = express();

app.use(cors());
app.use(express.json());

const client = new MercadoPagoConfig({
  accessToken: "SEU_TOKEN_AQUI"
});

app.post("/criar-pagamento", async (req, res) => {
  try {
    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            title: "Produto Teste",
            quantity: 1,
            unit_price: 50
          }
        ]
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