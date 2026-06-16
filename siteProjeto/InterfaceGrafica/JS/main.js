const API_URL = "http://localhost:8080/api";

// --- FUNÇÕES DE SEGURANÇA E SESSÃO ---

function protegerPagina() {
    const paginasProtegidas = [
        "performance.html",
        "questoes.html",
        "simulados.html",
        "noticia.html"
    ];

    const urlAtual = window.location.pathname;
    const precisaLogin = paginasProtegidas.some(pagina => urlAtual.endsWith(pagina));

    if (precisaLogin) {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "index.html";
        }
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "index.html";
}

async function fetchProtegido(endpoint, opcoes = {}) {
    const token = localStorage.getItem("token");
    
    const configuracao = {
        ...opcoes,
        headers: {
            ...opcoes.headers,
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    };

    const resposta = await fetch(`${API_URL}${endpoint}`, configuracao);
    
    if (resposta.status === 401) {
        logout();
        throw new Error("Sessão expirada. Faça login novamente.");
    }

    return resposta;
}

function validarEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// --- CONTROLE DE LOGIN ---
const loginForm = document.querySelector("#login-form");
if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const btnSubmeter = loginForm.querySelector("button[type='submit']");
        const email = document.querySelector("#email").value.trim();
        const senha = document.querySelector("#senha").value;

        if (!email || !senha) {
            alert("Preencha todos os campos.");
            return;
        }

        if (!validarEmail(email)) {
            alert("Por favor, insira um e-mail válido.");
            return;
        }

        try {
            btnSubmeter.disabled = true;

            const resposta = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha })
            });

            if (!resposta.ok) throw new Error("Acesso negado");

            const dados = await resposta.json();
            
            localStorage.setItem("token", dados.token);
            localStorage.setItem("usuario", JSON.stringify({ email }));

            window.location.href = "simulados.html";
        } catch (erro) {
            alert("E-mail ou senha incorretos.");
            console.error(erro);
            btnSubmeter.disabled = false;
        }
    });
}

// --- CONTROLE DE CADASTRO ---
const cadastroForm = document.querySelector("#cadastro-form");
if (cadastroForm) {
    cadastroForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const btnSubmeter = cadastroForm.querySelector("button[type='submit']");
        const nome = document.querySelector("#nome").value.trim();
        const email = document.querySelector("#email").value.trim();
        const dataNascimento = document.querySelector("#data_nascimento").value; // Captura AAAA-MM-DD
        const senha = document.querySelector("#senha").value;

        if (nome.length < 3) {
            alert("O nome precisa ter pelo menos 3 caracteres.");
            return;
        }

        if (!validarEmail(email)) {
            alert("Por favor, insira um e-mail válido.");
            return;
        }

        if (!dataNascimento) {
            alert("Por favor, insira sua data de nascimento.");
            return;
        }

        if (senha.length < 8) {
            alert("A senha precisa ter no mínimo 8 caracteres.");
            return;
        }

        try {
            btnSubmeter.disabled = true;

            const resposta = await fetch(`${API_URL}/usuarios`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    nome, 
                    email, 
                    data_nascimento: dataNascimento, 
                    senha 
                })
            });

            if (!resposta.ok) throw new Error();

            alert("Cadastro Concluído!");
            window.location.href = "index.html";
        } catch (e) {
            alert("Erro ao processar o cadastro. Tente novamente mais tarde.");
            console.error(e);
            btnSubmeter.disabled = false;
        }
    });
}
// --- RESOLUÇÃO DE QUESTÕES (Corrigido: Devolvido o Listener do gabarito) ---
const btnResponder = document.querySelector("#btn-responder");
if (btnResponder) {
    btnResponder.addEventListener("click", async () => {
        const opcaoSelecionada = document.querySelector('input[name="q1"]:checked');
        
        if (!opcaoSelecionada) {
            alert("Por favor, selecione uma alternativa antes de responder.");
            return;
        }

        const idAlternativaEscolhida = parseInt(opcaoSelecionada.value);
        const idQuestao = 2481;

        const payloadProgresso = {
            id_questao: idQuestao,
            id_alternativa_escolhida: idAlternativaEscolhida
        };

        try {
            btnResponder.disabled = true;
            console.log("Enviando progresso para o Go (POST /api/progresso_usuario):", payloadProgresso);
            

            if (idAlternativaEscolhida === 2) {
                opcaoSelecionada.parentElement.style.color = "var(--success-color)";
                opcaoSelecionada.parentElement.style.fontWeight = "700";
            } else {
                opcaoSelecionada.parentElement.style.color = "var(--error-color)";
                const correta = document.querySelector('input[value="2"]');
                if (correta) {
                    correta.parentElement.style.color = "var(--success-color)";
                    correta.parentElement.style.fontWeight = "700";
                }
            }
        } catch (erro) {
            console.error("Erro ao registrar resposta:", erro);
        } finally {
            btnResponder.textContent = "Respondida";
        }
    });
}

// --- INICIALIZAÇÃO E EVENTOS GLOBAIS ---
protegerPagina();

document.querySelectorAll('a[href="index.html"]').forEach(botao => {
    if (botao.textContent.includes("Sair")) {
        botao.addEventListener("click", (e) => {
            e.preventDefault();
            logout();
        });
    }
});