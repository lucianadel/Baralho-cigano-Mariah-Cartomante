import express from "express";
import cors from "cors";
import { MercadoPagoConfig, Preference } from "mercadopago";

const app = express();

app.use(cors());
app.use(express.json());

const client = new MercadoPagoConfig({
  accessToken: "APP_USR-3300972170932574-033009-07c9baccad31572819984ff02b0bbd05-3303234066"
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