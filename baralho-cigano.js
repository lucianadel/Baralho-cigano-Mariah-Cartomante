// ==========================
// CONFIG
// ==========================
const API_URL = "https://script.google.com/macros/s/AKfycby5qyss73txl8I3hkiiEJkS_rSxboG51Nfv0GvD_RnftCkITt5v-whufy_uPmt6yy6WKw/exec";

let carrinho = JSON.parse(localStorage.getItem("carrinho_mariah")) || [];

// ==========================
// INICIAR
// ==========================
window.onload = () => {
    carregarProdutos();
    renderizarCarrinho();
};

// ==========================
// BUSCAR PRODUTOS
// ==========================
async function carregarProdutos() {
    try {
        const res = await fetch(API_URL);
        const produtos = await res.json();

        const containers = {
            baralho: document.getElementById("container-baralhos"),
            ritual: document.getElementById("container-rituais"),
            mesa: document.getElementById("container-mesas-radionicas"),
            cursos: document.getElementById("lista-cursos"), // 👈 NOVO
        };

        Object.values(containers).forEach(c => {
            if (c) c.innerHTML = "";
        });

        produtos.forEach((p, index) => {

            if (!p.ativo || String(p.ativo).toLowerCase() !== "sim") return;
            if (!p.categoria) return;

            const categoria = String(p.categoria).toLowerCase().trim();
            const target = containers[categoria];

            if (!target) return;

            target.innerHTML += criarCardHTML(p, index);
        });

    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);
    }
}

// ==========================
// CRIAR CARD
// ==========================
function criarCardHTML(p, index) {

    const idCarousel = `carousel-${index}`;

    const fotos = p.imagem
        ? p.imagem.split(",")
        : ["https://picsum.photos/300/200"];

    const imagensHTML = fotos.map((img, i) => `
        <div class="carousel-item ${i === 0 ? "active" : ""}">
            <img src="${img.trim()}" class="d-block w-100" style="height:220px; object-fit:cover;">
        </div>
    `).join("");

    const controles = fotos.length > 1 ? `
        <button class="carousel-control-prev" data-bs-target="#${idCarousel}" data-bs-slide="prev">
            <span class="carousel-control-prev-icon"></span>
        </button>
        <button class="carousel-control-next" data-bs-target="#${idCarousel}" data-bs-slide="next">
            <span class="carousel-control-next-icon"></span>
        </button>
    ` : "";

    let botoes = "";

    // ==========================
    // BARALHOS (MÚLTIPLAS OPÇÕES)
    // ==========================
    if (p.categoria === "baralho" && p.opcoes) {

        const lista = p.opcoes.split(",");

        lista.forEach(op => {

            const [nome, valor] = op.split(":");
            const preco = Number(valor);

            if (!preco || isNaN(preco)) return;

            botoes += `
                <div class="mb-2">

                    <p class="preco">${nome} - R$ ${preco.toFixed(2)}</p>

                    <button class="btn-comprar"
                        onclick="addToCart('${p.nome} - ${nome}', ${preco})">
                        🛒 Adicionar ao carrinho
                    </button>

                </div>
            `;
        });
    }

    // ==========================
    // RITUAIS E MESAS (UM BOTÃO)
    // ==========================
    else {

        let preco = 0;

        if (p.opcoes) {
            const primeira = p.opcoes.split(",")[0];
            preco = Number(primeira.split(":")[1]);
        }

        botoes = `
            <p class="preco">R$ ${preco.toFixed(2)}</p>

            <button class="btn-comprar"
                onclick="addToCart('${p.nome}', ${preco})">
                🛒 Adicionar ao carrinho
            </button>
        `;
    }

    return `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100 shadow-sm border-0">

                <div id="${idCarousel}" class="carousel slide" data-bs-ride="carousel">
                    <div class="carousel-inner">
                        ${imagensHTML}
                    </div>
                    ${controles}
                </div>

                <div class="card-body text-center d-flex flex-column">

                    <h5 class="fw-bold text-colored">${p.nome}</h5>

                    <p class="small text-muted flex-grow-1">
                        ${p.descricao || ""}
                    </p>

                    ${botoes}

                </div>

            </div>
        </div>
    `;
}

// ==========================
// CARRINHO
// ==========================
function addToCart(nome, preco) {
    carrinho.push({ nome, preco });
    salvarERenderizar();
    mostrarToast();
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
    const totalEl = document.getElementById("total");
    const contador = document.getElementById("contador-carrinho");

    if (!lista || !totalEl || !contador) return;

    lista.innerHTML = "";

    let total = 0;

    carrinho.forEach((item, index) => {

        total += item.preco;

        lista.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                ${item.nome}
                <span>R$ ${item.preco.toFixed(2)}</span>
                <button class="btn btn-sm btn-outline-danger" onclick="removerItem(${index})">
                    <i class="bi bi-trash"></i>
                </button>
            </li>
        `;
    });

    totalEl.innerText = `Total: R$ ${total.toFixed(2)}`;
    contador.innerText = `(${carrinho.length})`;
}

// ==========================
// TOAST
// ==========================
function mostrarToast() {
    const toast = document.getElementById("toast-carrinho");
    if (!toast) return;

    toast.classList.add("mostrar");

    setTimeout(() => {
        toast.classList.remove("mostrar");
    }, 2000);
}

// ==========================
// PAGAMENTO
// ==========================
async function finalizarCompra() {

    if (carrinho.length === 0) {
        alert("Carrinho vazio!");
        return;
    }

    try {

        const res = await fetch("http://localhost:3000/criar-pagamento", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                itens: carrinho.map(i => ({
                    title: i.nome,
                    quantity: 1,
                    unit_price: i.preco
                }))
            })
        });

        const data = await res.json();

        if (data.url) {
            window.location.href = data.url;
        } else {
            alert("Erro ao gerar pagamento");
        }

    } catch (erro) {
        console.error("Erro pagamento:", erro);
        alert("Erro ao conectar com servidor");
    }
}