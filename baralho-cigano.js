
const API_URL = "https://script.google.com/macros/s/AKfycbxXp0Pc68WK2bUpELbV715hvvxVC0TROr6Xr4_v6sUCnvEWd3PCebqYeyDLf7Q-55lImw/exec";
let carrinho = JSON.parse(localStorage.getItem("carrinho_mariah")) || [];

window.onload = () => {
    atualizarProdutos();
    renderizarCarrinho();
};

// --- BUSCA PRODUTOS ---
async function atualizarProdutos() {
    try {
        const response = await fetch(API_URL);
        const produtos = await response.json();

        const containers = {
            "baralho": document.getElementById("container-baralhos"),
            "ritual": document.getElementById("container-rituais"),
            "mesa": document.getElementById("container-mesas")
        };

        // Limpa containers
        Object.values(containers).forEach(c => if(c) c.innerHTML = "");

        produtos.forEach((p, index) => {
            if (String(p.ativo).toLowerCase() !== "sim") return;
            
            const cat = String(p.categoria).toLowerCase().trim();
            const target = containers[cat];

            if (target) {
                target.innerHTML += criarCardHTML(p, index);
            }
        });
    } catch (e) { console.error("Erro ao carregar:", e); }
}

// --- GERA O CARD COM CARROSSEL ---
function criarCardHTML(p, i) {
    const idCarousel = `carrossel-item-${i}`;
    const fotos = p.imagem ? p.imagem.split(",") : ["./imagens/logo.png"];

    return `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100 shadow-sm border-0">
                <div id="${idCarousel}" class="carousel slide" data-bs-ride="carousel">
                    <div class="carousel-inner">
                        ${fotos.map((img, idx) => `
                            <div class="carousel-item ${idx === 0 ? 'active' : ''}">
                                <img src="${img.trim()}" class="d-block w-100" style="height:200px; object-fit:cover;">
                            </div>
                        `).join('')}
                    </div>
                    ${fotos.length > 1 ? `
                        <button class="carousel-control-prev" data-bs-target="#${idCarousel}" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span></button>
                        <button class="carousel-control-next" data-bs-target="#${idCarousel}" data-bs-slide="next"><span class="carousel-control-next-icon"></span></button>
                    ` : ''}
                </div>
                <div class="card-body text-center">
                    <h5 class="fw-bold text-colored">${p.nome}</h5>
                    <p class="small text-muted">${p.descricao || ""}</p>
                    <button class="btn btn-warning w-100 fw-bold" onclick="addToCart('${p.nome}', '${p.preco}')">
                        <i class="bi bi-plus-circle me-1"></i> R$ ${p.preco}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// --- CARRINHO ---
function addToCart(nome, preco) {
    const valor = Number(String(preco).replace(/[R$\s.]/g, "").replace(",", "."));
    carrinho.push({ nome, preco: valor });
    salvarERenderizar();
}

function removerItem(index) {
    carrinho.splice(index, 1);
    salvarERenderizar();
}

function salvarERenderizar() {
    localStorage.setItem("carrinho_mariah", JSON.stringify(carrinho));
    renderizarCarrinho();
}

function renderizarCarrinho() {
    const lista = document.getElementById("lista-carrinho");
    const totalEl = document.getElementById("total-carrinho");
    const contador = document.getElementById("contador-carrinho");

    lista.innerHTML = "";
    let total = 0;

    carrinho.forEach((item, i) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `<span>${item.nome}</span> <b>R$ ${item.preco.toFixed(2)}</b>
                        <button class="btn btn-sm btn-outline-danger" onclick="removerItem(${i})"><i class="bi bi-trash"></i></button>`;
        lista.appendChild(li);
        total += item.preco;
    });

    totalEl.innerText = `Total: R$ ${total.toFixed(2)}`;
    contador.innerText = `(${carrinho.length})`;
}

// --- PAGAMENTO ---
async function finalizarCompra() {
    if (carrinho.length === 0) return alert("Carrinho vazio!");

    try {
        const res = await fetch("http://localhost:3000/criar-pagamento", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itens: carrinho.map(i => ({ title: i.nome, quantity: 1, unit_price: i.preco })) })
        });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
    } catch (e) { alert("Erro ao conectar com o servidor de pagamento."); }
}