// ==========================
// CONFIG
// ==========================
const API_URL = "https://script.google.com/macros/s/AKfycbxZDJ6HvJFRZmnMLW4msPpk4xdOoCChXMu-_xmdqdrmWS7BopSTCz-MT6ZsezV6N8KdDw/exec";

let carrinho = JSON.parse(localStorage.getItem("carrinho_mariah")) || [];

// ==========================
// INICIAR
// ==========================
window.onload = () => {
    carregarProdutos();
    renderizarCarrinho();
};

// ==========================
// PRODUTOS
// ==========================
async function carregarProdutos() {
    try {
        const res = await fetch(API_URL);
        const produtos = await res.json();

        const containers = {
            baralho: document.getElementById("container-baralhos"),
            baralhos: document.getElementById("container-baralhos"),
            ritual: document.getElementById("container-rituais"),
            rituais: document.getElementById("container-rituais"),
            mesa: document.getElementById("container-mesas-radionicas"),
            mesas: document.getElementById("container-mesas-radionicas"),
            cursos: document.getElementById("lista-cursos"),
        };

        Object.values(containers).forEach(c => c && (c.innerHTML = ""));

        produtos.forEach((p, index) => {
            if (String(p.ativo).toLowerCase() !== "sim") return;

            const categoria = String(p.categoria || "").toLowerCase().trim();
            const target = containers[categoria];

            if (!target) return;

            target.innerHTML += criarCardHTML(p, index);
        });

    } catch (erro) {
        console.error("Erro produtos:", erro);
    }
}

// ==========================
// CARD
// ==========================
function criarCardHTML(p, index) {
    const idCarousel = `carousel-${index}`;
    const fotos = p.imagem ? p.imagem.split(",") : ["https://picsum.photos/300/200"];

    const imagens = fotos.map((img, i) => `
        <div class="carousel-item ${i === 0 ? "active" : ""}">
            <img src="${img.trim()}" class="d-block w-100" style="height:220px; object-fit:cover;">
        </div>
    `).join("");

    let botoes = "";
    const categoria = String(p.categoria || "").toLowerCase().trim();

    if (categoria.includes("baralho") && p.opcoes) {
        const lista = p.opcoes.replace(/\n/g, ",").split(",");

        lista.forEach(item => {
            let nome = "";
            let preco = 0;

            if (item.includes(":")) {
                const partes = item.split(":");
                nome = partes[0].trim();
                preco = Number(partes[1]);
            }

            if (!preco || isNaN(preco)) return;

            botoes += `
                <button class="btn-comprar mb-2"
                    onclick="addToCart('${p.nome} - ${nome}', ${preco})">
                    ${nome} - R$ ${preco.toFixed(2)}
                </button>
            `;
        });
    } else {
        let preco = Number(p.opcoes);

        if (!preco || isNaN(preco)) return "";

        botoes = `
            <p>R$ ${preco.toFixed(2)}</p>
            <button class="btn-comprar"
                onclick="addToCart('${p.nome}', ${preco})">
                🛒 Adicionar
            </button>
        `;
    }

    return `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <div id="${idCarousel}" class="carousel slide">
                    <div class="carousel-inner">${imagens}</div>
                </div>

                <div class="card-body text-center">
                    <h5>${p.nome}</h5>
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
    preco = Number(preco);

    if (!preco || isNaN(preco)) {
        alert("Erro no preço");
        return;
    }

    carrinho.push({ nome, preco });
    salvar();
    renderizarCarrinho();

    new bootstrap.Modal(document.getElementById('modalCarrinho')).show();
}

function salvar() {
    localStorage.setItem("carrinho_mariah", JSON.stringify(carrinho));
}

function renderizarCarrinho() {
    const lista = document.getElementById("lista-carrinho");
    const totalEl = document.getElementById("total");

    if (!lista) return;

    lista.innerHTML = "";
    let total = 0;

    carrinho.forEach((item, i) => {
        total += item.preco;

        lista.innerHTML += `
            <li class="list-group-item d-flex justify-content-between">
                ${item.nome} - R$ ${item.preco}
                <button onclick="removerItem(${i})">❌</button>
            </li>
        `;
    });

    totalEl.innerText = `Total: R$ ${total.toFixed(2)}`;
}

function removerItem(i) {
    carrinho.splice(i, 1);
    salvar();
    renderizarCarrinho();
}

// ==========================
// PAGAMENTO + PEDIDO
// ==========================
window.finalizarCompra = async function () {

    const nome = document.getElementById("cliente-nome").value.trim();
    const whatsapp = document.getElementById("cliente-telefone").value.trim();

    if (!nome || !whatsapp) {
        alert("Preencha nome e WhatsApp");
        return;
    }

    if (carrinho.length === 0) {
        alert("Carrinho vazio");
        return;
    }

    const itens = carrinho.map(i => ({
        title: i.nome,
        quantity: 1,
        unit_price: i.preco
    }));

    const total = carrinho.reduce((s, i) => s + i.preco, 0);

    // 💾 SALVA PEDIDO
    localStorage.setItem("pedido_mariah", JSON.stringify({
        nome,
        whatsapp,
        itens,
        total
    }));

    try {
        const res = await fetch("https://backend-mariah.onrender.com/criar-pagamento", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                itens,
                cliente: { nome, whatsapp }
            })
        });

        const data = await res.json();

        if (data.init_point) {
            window.location.href = data.init_point;
        } else {
            alert("Erro ao gerar pagamento");
        }

    } catch (erro) {
        console.error(erro);
        alert("Erro servidor");
    }
};