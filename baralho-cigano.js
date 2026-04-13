// ==========================
// CONFIG
// ==========================
const appConfig = window.APP_CONFIG || {};
const API_URL =
  appConfig.PRODUCTS_API_URL ||
  "https://script.google.com/macros/s/AKfycbxZDJ6HvJFRZmnMLW4msPpk4xdOoCChXMu-_xmdqdrmWS7BopSTCz-MT6ZsezV6N8KdDw/exec";
const PAGAMENTO_API_URL =
  appConfig.PAYMENTS_API_URL ||
  "http://localhost:3000/criar-pagamento";

let carrinho = JSON.parse(localStorage.getItem("carrinho_mariah")) || [];
let quantidades = {};

// ==========================
// INIT
// ==========================
window.onload = () => {
  carregarProdutos();
  renderizarCarrinho();
  atualizarContadorCarrinho(); // 🔥 CORRIGIDO
};

// ==========================
// CONTADOR
// ==========================
function atualizarContadorCarrinho() {
  const contador = document.getElementById("contador-carrinho");
  if (!contador) return;

  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  contador.innerText = totalItens;
}

// ==========================
// CARREGAR PRODUTOS
// ==========================
async function carregarProdutos() {
  const res = await fetch(API_URL);
  const produtos = await res.json();

  const containers = {
    baralho: document.getElementById("container-baralhos"),
    ritual: document.getElementById("container-rituais"),
    mesa: document.getElementById("container-mesas-radionicas"),
    curso: document.getElementById("lista-cursos"),
  };

  Object.values(containers).forEach(c => c && (c.innerHTML = ""));

  produtos.forEach((p, index) => {
    if (String(p.ativo).toLowerCase() !== "sim") return;

    const categoria = String(p.categoria || "").toLowerCase().trim();
    const target = containers[categoria];

    if (!target) return;

    target.innerHTML += criarCardHTML(p, index);
  });
}

// ==========================
// CARD
// ==========================
function criarCardHTML(p, index) {

  const fotos = p.imagem ? p.imagem.split(",") : ["https://picsum.photos/300/200"];

  const imagens = fotos.map((img, i) => `
    <div class="carousel-item ${i === 0 ? "active" : ""}">
      <img src="${img.trim()}" class="d-block w-100" style="height:220px; object-fit:cover;">
    </div>
  `).join("");

  let opcoesHTML = "";

  if (p.opcoes && p.opcoes.includes(":")) {
    const lista = p.opcoes.replace(/\n/g, ",").split(",");

    lista.forEach((item, i) => {
      const [nome, preco] = item.split(":");
      const id = `${index}-${i}`;
      opcoesHTML += criarLinhaProduto(p.nome, nome.trim(), Number(preco), id);
    });

  } else {
    opcoesHTML = criarLinhaProduto(p.nome, "", Number(p.opcoes), index);
  }

  return `
    <div class="col-md-4 mb-4">
      <div class="card h-100">

        <div class="carousel slide">
          <div class="carousel-inner">${imagens}</div>
        </div>

        <div class="card-body text-center">
          <h5>${p.nome}</h5>
          ${opcoesHTML}
        </div>

      </div>
    </div>
  `;
}

// ==========================
// LINHA PRODUTO
// ==========================
function criarLinhaProduto(nomeBase, nome, preco, id) {

  return `
    <div class="produto-item">
      <div class="produto-linha">

        <div class="produto-info">
          <strong>${nome || nomeBase}</strong>
          <span>R$ ${preco.toFixed(2)}</span>
        </div>

        <div class="qtd">
          <button onclick="diminuir('${id}')">-</button>
          <span id="qtd-${id}">1</span>
          <button onclick="aumentar('${id}')">+</button>
        </div>

        <button class="btn-comprar"
          onclick="addToCart('${nomeBase} ${nome}', ${preco}, '${id}', this)">
          Adicionar
        </button>

      </div>
    </div>
  `;
}

// ==========================
// QUANTIDADE
// ==========================
function aumentar(id) {
  quantidades[id] = (quantidades[id] || 1) + 1;
  document.getElementById(`qtd-${id}`).innerText = quantidades[id];
}

function diminuir(id) {
  quantidades[id] = Math.max((quantidades[id] || 1) - 1, 1);
  document.getElementById(`qtd-${id}`).innerText = quantidades[id];
}

// ==========================
// ADD AO CARRINHO
// ==========================
function addToCart(nome, preco, id, botao) {

  const quantidade = quantidades[id] || 1;

  carrinho.push({ nome, preco, quantidade });

  localStorage.setItem("carrinho_mariah", JSON.stringify(carrinho));

  renderizarCarrinho();
  atualizarContadorCarrinho();

  mostrarToast("Adicionado ao carrinho 🛒");

  if (botao) {
    botao.innerText = "Adicionado";
    botao.classList.add("btn-comprar--adicionado");

    clearTimeout(botao._textoTimeout);
    botao._textoTimeout = setTimeout(() => {
      botao.innerText = "Adicionar";
      botao.classList.remove("btn-comprar--adicionado");
    }, 2000);
  }

}

// ==========================
// TOAST BONITO
// ==========================
function mostrarToast(msg) {

  let toast = document.getElementById("toast-mariah");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-mariah";

    Object.assign(toast.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      background: "linear-gradient(135deg, #0a58ca, #084298)",
      color: "white",
      padding: "12px 18px",
      borderRadius: "10px",
      boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
      zIndex: "9999",
      fontWeight: "bold",
      opacity: "0",
      transition: "0.3s"
    });

    document.body.appendChild(toast);
  }

  toast.innerText = msg;
  toast.style.opacity = "1";

  setTimeout(() => toast.style.opacity = "0", 2000);
}

// ==========================
// CARRINHO
// ==========================
function renderizarCarrinho() {

  const lista = document.getElementById("lista-carrinho");
  const totalEl = document.getElementById("total");
  const carrinhoVazioEl = document.getElementById("carrinho-vazio");
  const checkoutContainer = document.getElementById("checkout-container");

  lista.innerHTML = "";
  if (!lista || !totalEl || !carrinhoVazioEl || !checkoutContainer) return;

  if (carrinho.length === 0) {
    totalEl.innerText = "";
    carrinhoVazioEl.classList.remove("d-none");
    checkoutContainer.classList.add("d-none");
    return;
  }

  carrinhoVazioEl.classList.add("d-none");
  checkoutContainer.classList.remove("d-none");

  let total = 0;

  carrinho.forEach((item, i) => {

    const subtotal = item.preco * item.quantidade;
    total += subtotal;

    lista.innerHTML += `
      <li class="list-group-item d-flex justify-content-between">
        ${item.nome} (${item.quantidade}x) - R$ ${subtotal.toFixed(2)}
        <button onclick="removerItem(${i})">Remover</button>
      </li>
    `;
  });

  totalEl.innerText = `Total: R$ ${total.toFixed(2)}`;
}

// ==========================
// REMOVER
// ==========================
function removerItem(i) {
  carrinho.splice(i, 1);
  localStorage.setItem("carrinho_mariah", JSON.stringify(carrinho));
  renderizarCarrinho();
  atualizarContadorCarrinho();
}

function abrirTelaPosPagamento(urlPagamento) {
  const tela = document.getElementById("tela-pos-pagamento");
  const linkManual = document.getElementById("link-pagamento-manual");

  if (!tela || !linkManual) return;

  linkManual.href = urlPagamento;
  tela.classList.remove("d-none");
  document.body.classList.add("tela-pos-pagamento-aberta");
}

window.fecharTelaPosPagamento = function () {
  const tela = document.getElementById("tela-pos-pagamento");
  const modalCarrinhoEl = document.getElementById("modalCarrinho");

  if (!tela) return;

  tela.classList.add("d-none");
  document.body.classList.remove("tela-pos-pagamento-aberta");

  carrinho = [];
  localStorage.removeItem("carrinho_mariah");
  renderizarCarrinho();
  atualizarContadorCarrinho();

  if (modalCarrinhoEl && typeof bootstrap !== "undefined") {
    const modalCarrinho =
      bootstrap.Modal.getInstance(modalCarrinhoEl) ||
      new bootstrap.Modal(modalCarrinhoEl);

    modalCarrinho.hide();
  }
};

// ==========================
// PAGAMENTO
// ==========================
window.finalizarCompra = async function () {
  if (carrinho.length === 0) {
    renderizarCarrinho();
    return;
  }

  const pagamentoTab = window.open("", "_blank");

  const nome = document.getElementById("cliente-nome").value.trim();
  const whatsapp = document.getElementById("cliente-telefone").value.trim();

  if (!nome || !whatsapp) {
    if (pagamentoTab) {
      pagamentoTab.close();
    }
    alert("Preencha os dados");
    return;
  }

  const itens = carrinho.map(i => ({
    title: i.nome,
    quantity: i.quantidade,
    unit_price: i.preco
  }));

  try {

    const res = await fetch(PAGAMENTO_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itens,
        cliente: { nome, whatsapp }
      })
    });

    const data = await res.json();

    if (data.init_point) {
      if (pagamentoTab) {
        pagamentoTab.location.href = data.init_point;
      } else {
        window.open(data.init_point, "_blank", "noopener,noreferrer");
      }

      abrirTelaPosPagamento(data.init_point);
    } else {
      if (pagamentoTab) {
        pagamentoTab.close();
      }
      alert("Erro ao gerar pagamento");
    }

  } catch {
    if (pagamentoTab) {
      pagamentoTab.close();
    }
    alert("Erro no servidor");
  }
};
