
// ==========================
// API
// ==========================
const API_URL = "https://script.google.com/macros/s/AKfycbxXp0Pc68WK2bUpELbV715hvvxVC0TROr6Xr4_v6sUCnvEWd3PCebqYeyDLf7Q-55lImw/exec";


// ==========================
// NAVEGAÇÃO
// ==========================
const prevButton = document.querySelector('.prev-button');
const nextButton = document.querySelector('.next-button');
const navLinks = document.querySelectorAll('.nav-link');

if (prevButton && nextButton) {
  prevButton.addEventListener('click', () => {
    const activeLink = document.querySelector('.nav-link.active');
    if (activeLink) {
      const prevIndex = Number(activeLink.dataset.index) - 1;
      if (prevIndex >= 0 && navLinks[prevIndex]) {
        navLinks[prevIndex].click();
      }
    }
  });

  nextButton.addEventListener('click', () => {
    const activeLink = document.querySelector('.nav-link.active');
    if (activeLink) {
      const nextIndex = Number(activeLink.dataset.index) + 1;
      if (nextIndex < navLinks.length && navLinks[nextIndex]) {
        navLinks[nextIndex].click();
      }
    }
  });
}


// ==========================
// CARRINHO
// ==========================
let carrinho = [];

function addToCart(nome, preco) {
  carrinho.push({ nome, preco });
  atualizarCarrinho();
  mostrarToast(nome);
}

function mostrarToast(nome) {
  const toast = document.getElementById("toast-carrinho");
  if (!toast) return;

  toast.innerText = `✨ ${nome} adicionado ao carrinho!`;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

function atualizarCarrinho() {
  const lista = document.getElementById("lista-carrinho");
  const totalEl = document.getElementById("total");
  const contador = document.getElementById("contador-carrinho");

  if (!lista || !totalEl || !contador) return;

  lista.innerHTML = "";
  let total = 0;

  carrinho.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";

    li.innerHTML = `
      <span>${item.nome} - R$ ${item.preco}</span>
      <button class="btn btn-sm btn-danger" onclick="removerItem(${index})">
        🗑️ Remover
      </button>
    `;

    lista.appendChild(li);
    total += Number(item.preco) || 0;
  });

  totalEl.innerText = `Total: R$ ${total}`;
  contador.innerText = `(${carrinho.length})`;

  salvarCarrinho();
}

function removerItem(index) {
  carrinho.splice(index, 1);
  atualizarCarrinho();
}

function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function carregarCarrinho() {
  const dados = localStorage.getItem("carrinho");
  if (dados) {
    carrinho = JSON.parse(dados);
    atualizarCarrinho();
  }
}


// ==========================
// PAGAMENTO
// ==========================
async function finalizarCompra() {
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }

  const itens = carrinho.map(item => ({
    title: item.nome || "Produto",
    quantity: 1,
    unit_price: Number(item.preco) || 1,
    currency_id: "BRL"
  }));

  try {
    const resposta = await fetch("http://127.0.0.1:3000/criar-pagamento", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ itens })
    });

    const data = await resposta.json();
    console.log("Resposta backend:", data);

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Erro ao gerar pagamento.");
    }
  } catch (erro) {
    console.error("Erro:", erro);
    alert("Erro ao conectar com pagamento.");
  }
}


// ==========================
// PRODUTOS
// ==========================
function atualizarProdutos() {
  fetch(API_URL)
    .then(res => res.json())
    .then(produtos => {
      const cardsBaralhos = document.querySelectorAll("#baralhos .col-md-3");
      const cardsRituais = document.querySelectorAll("#rituais .col-md-3");
      const cardsMesas = document.querySelectorAll("#mesas-radionicas .col-md-3");

      // limpar restos de botões/explicações antes de preencher
      limparCards(cardsBaralhos);
      limparCards(cardsRituais);
      limparCards(cardsMesas);

    preencherBaralhos(produtos, cardsBaralhos);
preencherCategoriaSimples(produtos, cardsRituais, "ritual");
preencherCategoriaSimples(produtos, cardsMesas, "mesa");
      
      
    })
    .catch(err => {
      console.error("Erro ao carregar produtos:", err);
    });
}

function limparCards(cards) {
  cards.forEach(card => {
    card.querySelectorAll("button").forEach(btn => btn.remove());

    const explicacao = card.querySelector(".explicacao-tipos");
    if (explicacao) explicacao.remove();
  });
}

function preencherBaralhos(produtos, cards) {
  const agrupados = {};

  produtos.forEach(produto => {
    if (String(produto.ativo).toLowerCase() !== "sim") return;
    if (String(produto.categoria).toLowerCase() !== "baralho") return;

    const nome = produto.nome?.trim();
    if (!nome) return;

    if (!agrupados[nome]) {
      agrupados[nome] = [];
    }

    agrupados[nome].push(produto);
  });

  let i = 0;

  Object.keys(agrupados).forEach(nome => {
    const card = cards[i];
    if (!card) return;

    const itens = agrupados[nome]
      .filter(item => ["basica", "completa"].includes(String(item.tipo).toLowerCase()))
      .sort((a, b) => {
        const ordem = { basica: 1, completa: 2 };
        return ordem[String(a.tipo).toLowerCase()] - ordem[String(b.tipo).toLowerCase()];
      });

    const titulo = card.querySelector("h5");
    const descricao = card.querySelector("p");

    if (titulo) titulo.innerText = nome;

    if (descricao) {
      const textoDescricao = itens[0]?.descricao || "";
      descricao.innerHTML = `
        ${textoDescricao}
        <div class="mt-2 explicacao-tipos">
          <small>
             <strong>Básica:</strong> resposta rápida e objetiva<br>
             <strong>Completa:</strong> análise mais profunda da situação
          </small>
        </div>
      `;
    }

    itens.forEach(item => {
      const tipo = String(item.tipo).toLowerCase();
      const btn = document.createElement("button");
      btn.className = "btn btn-warning mt-2 me-1";
      btn.innerText = `${tipo} - R$ ${item.preco}`;

      btn.onclick = () => {
        addToCart(`${nome} - ${tipo}`, item.preco);
      };

      card.appendChild(btn);
    });

    i++;
  });
}

function preencherCategoriaSimples(produtos, cards, categoriaDesejada) {
  const filtrados = produtos.filter(produto => {
    return (
      String(produto.ativo).toLowerCase() === "sim" &&
      String(produto.categoria).trim().toLowerCase() === categoriaDesejada
    );
  });

  cards.forEach((card, i) => {
    const produto = filtrados[i];

    const titulo = card.querySelector("h5");
    const descricao = card.querySelector("p");

    // 🧹 limpa botão antigo
    card.querySelectorAll("button").forEach(b => b.remove());

    if (!produto) {
      // 🔥 ESCONDE CARD QUE NÃO TEM PRODUTO
      card.style.display = "none";
      return;
    }

    // mostra card normal
    card.style.display = "";

    if (titulo) titulo.innerText = produto.nome;
    if (descricao) descricao.innerText = produto.descricao || "";

    const btn = document.createElement("button");
    btn.className = "btn btn-warning mt-2 me-1";
    btn.innerText = `Adicionar ao carrinho - R$ ${produto.preco}`;

    btn.onclick = () => {
      addToCart(produto.nome, produto.preco);
    };

    card.appendChild(btn);
  });
}


// ==========================
// INICIALIZAÇÃO
// ==========================
window.onload = () => {
  carregarCarrinho();
  atualizarProdutos();
};