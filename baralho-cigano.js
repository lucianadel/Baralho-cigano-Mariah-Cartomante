// ==========================
// NAVEGAÇÃO (SEU CÓDIGO)
// ==========================

const prevButton = document.querySelector('.prev-button');
const nextButton = document.querySelector('.next-button');
const navLinks = document.querySelectorAll('.nav-link');

if (prevButton && nextButton) {

  prevButton.addEventListener('click', () => {
    let activeLink = document.querySelector('.nav-link.active');
    if (activeLink) {
      let prevIndex = activeLink.dataset.index - 1;
      if (prevIndex >= 0) {
        navLinks[prevIndex].click();
      }
    }
  });

  nextButton.addEventListener('click', () => {
    let activeLink = document.querySelector('.nav-link.active');
    if (activeLink) {
      let nextIndex = activeLink.dataset.index + 1;
      if (nextIndex < navLinks.length) {
        navLinks[nextIndex].click();
      }
    }
  });

}


// ==========================
// CARRINHO (FORA DE TUDO)
// ==========================

let carrinho = [];

// adicionar item
function addToCart(nome, preco) {
  carrinho.push({ nome, preco });
  atualizarCarrinho();
}

// atualizar carrinho
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
    total += item.preco;
  });

  totalEl.innerText = `Total: R$ ${total}`;
  contador.innerText = `(${carrinho.length})`;

  salvarCarrinho();
}

// remover item
function removerItem(index) {
  carrinho.splice(index, 1);
  atualizarCarrinho();
}

// salvar carrinho
function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

// carregar carrinho
function carregarCarrinho() {
  const dados = localStorage.getItem("carrinho");

  if (dados) {
    carrinho = JSON.parse(dados);
    atualizarCarrinho();
  }
}

// finalizar compra
function finalizarCompra() {
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }

  let mensagem = "✨ Olá, gostaria de contratar os seguintes serviços:\n\n";

  carrinho.forEach(item => {
    mensagem += `🔮 ${item.nome} — R$ ${item.preco}\n`;
  });

  let total = carrinho.reduce((soma, item) => soma + item.preco, 0);

  mensagem += `\n💰 Total: R$ ${total}\n\n`;
  mensagem += "🙏 Aguardo retorno para dar continuidade ao atendimento.";

  let url = "https://wa.me/5521999999999?text=" + encodeURIComponent(mensagem);

  window.open(url, "_blank");
}

// carregar ao abrir o site
window.onload = carregarCarrinho;