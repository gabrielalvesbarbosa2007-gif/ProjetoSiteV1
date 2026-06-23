const API_URL = "http://localhost:8080/api";

// --- FUNÇÕES DE SEGURANÇA E SESSÃO ---

function protegerPagina() {
    const paginasProtegidas = ["performance.html", "questoes.html", "simulados.html", "noticia.html"];
    const precisaLogin = paginasProtegidas.some(p => window.location.pathname.endsWith(p));

    if (precisaLogin && !localStorage.getItem("token")) {
        window.location.href = "index.html";
    }
}

function logout() {
    ["token", "usuario"].forEach(k => localStorage.removeItem(k));
    window.location.href = "index.html";
}

async function fetchProtegido(endpoint, opcoes = {}) {
    const configuracao = {
        ...opcoes,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            ...opcoes.headers
        }
    };

    const resposta = await fetch(`${API_URL}${endpoint}`, configuracao);
    if (resposta.status === 401) logout();
    
    return resposta;
}

const validarEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Auxiliar para gerenciar o estado visual dos botões de submit durante requisições
const alternarBotao = (form, desabilitar) => {
    const btn = form.querySelector("button[type='submit']");
    if (btn) btn.disabled = desabilitar;
};

// --- CONTROLE DE LOGIN ---
const loginForm = document.querySelector("#login-form");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const email = document.querySelector("#email").value.trim();
        const senha = document.querySelector("#senha").value;

        if (!email || !senha) return alert("Preencha todos os campos.");
        if (!validarEmail(email)) return alert("Por favor, insira um e-mail válido.");

        try {
            alternarBotao(loginForm, true);

            const resposta = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha })
            });

            if (!resposta.ok) throw new Error();

            const { token } = await resposta.json();
            localStorage.setItem("token", token);
            localStorage.setItem("usuario", JSON.stringify({ email }));
            window.location.href = "simulados.html";
        } catch {
            alert("E-mail ou senha incorretos.");
            alternarBotao(loginForm, false);
        }
    });
}

// --- CONTROLE DE CADASTRO (ATUALIZADO PARA CAPTURA DE TOKEN) ---
const cadastroForm = document.querySelector("#cadastro-form");
if (cadastroForm) {
    cadastroForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nome = document.querySelector("#nome").value.trim();
        const email = document.querySelector("#email").value.trim();
        const data_nascimento = document.querySelector("#data_nascimento").value;
        const senha = document.querySelector("#senha").value;

        if (nome.length < 3) return alert("O nome precisa ter pelo menos 3 caracteres.");
        if (!validarEmail(email)) return alert("Por favor, insira um e-mail válido.");
        if (!data_nascimento) return alert("Por favor, insira sua data de nascimento.");
        if (senha.length < 8) return alert("A senha precisa ter no mínimo 8 caracteres.");

        try {
            alternarBotao(cadastroForm, true);

            const resposta = await fetch(`${API_URL}/usuarios`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email, data_nascimento, senha })
            });

            if (!resposta.ok) throw new Error();

            // Captura o Token enviado pelo Go no momento do cadastro concluído
            const { token } = await resposta.json();
            localStorage.setItem("token", token);
            localStorage.setItem("usuario", JSON.stringify({ email }));

            alert("Cadastro realizado com sucesso! Seja bem-vindo à plataforma.");
            window.location.href = "simulados.html"; 
        } catch {
            alert("Erro ao processar o cadastro. Verifique se o e-mail já está em uso.");
            alternarBotao(cadastroForm, false);
        }
    });
}
/*// --- RESOLUÇÃO DE QUESTÕES ---
const btnResponder = document.querySelector("#btn-responder");
if (btnResponder) {
    btnResponder.addEventListener("click", async () => {
        const opcao = document.querySelector('input[name="q1"]:checked');
        if (!opcao) return alert("Por favor, selecione uma alternativa antes de responder.");

        const idAlternativa = parseInt(opcao.value);
        btnResponder.disabled = true;
        btnResponder.textContent = "Respondida";

        // Estilização simplificada usando uma função auxiliar interna
        const destacarAlternativa = (el, cor) => {
            el.parentElement.style.color = `var(--${cor}-color)`;
            el.parentElement.style.fontWeight = "700";
        };

        if (idAlternativa === 2) {
            destacarAlternativa(opcao, "success");
        } else {
            destacarAlternativa(opcao, "error");
            const correta = document.querySelector('input[value="2"]');
            if (correta) destacarAlternativa(correta, "success");
        }
    });
}*/

// --- INICIALIZAÇÃO E EVENTOS GLOBAIS ---
protegerPagina();

document.querySelectorAll('a[href="index.html"]').forEach(btn => {
    if (btn.textContent.includes("Sair")) {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            logout();
        });
    }
});
// --- CONTROLE DO CARROSSEL DE SIMULADOS
document.addEventListener("DOMContentLoaded", () => {
    
    const carrosseis = document.querySelectorAll(".carrossel-container");

    carrosseis.forEach((carrossel) => {
        const trilho = carrossel.querySelector(".trilho");
        const btnAnterior = carrossel.querySelector(".btn-anterior");
        const btnProximo = carrossel.querySelector(".btn-proximo");

        if (trilho && btnAnterior && btnProximo) {
            let indiceAtual = 0;
            const cards = trilho.children;
            const totalCards = cards.length;

            const moverCarrossel = () => {
                trilho.style.transform = `translateX(-${indiceAtual * 100}%)`;
            };

            btnProximo.addEventListener("click", () => {
                indiceAtual = (indiceAtual + 1) % totalCards;
                moverCarrossel();
            });

            btnAnterior.addEventListener("click", () => {
                indiceAtual = (indiceAtual - 1 + totalCards) % totalCards;
                moverCarrossel();
            });
        }
    });
});