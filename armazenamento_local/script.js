// Arrays que guardam o estado atual da aplicação em memória.
// Mantemos as referências desses arrays para poder alterá-los sem
// quebrar outras partes do código que possam referenciar as mesmas variáveis.
const tarefasPendentes = [];
const tarefasFeitas = [];

/**
 * Cria um objeto tarefa capturando o estado atual dos inputs do formulário.
 * Observação: usamos trim() em strings de texto para evitar entradas com espaços vazios.
 */
function criarObjetoTarefa() {
    return {
        titulo: document.getElementById("titulo").value.trim(),
        responsavel: document.getElementById("responsavel").value.trim(),
        dataInicio: document.getElementById("dataInicio").value,
        dataFim: document.getElementById("dataFim").value,
        prioridade: document.getElementById("prioridade").value,
        obs: document.getElementById("obs").value.trim(),
        // Flag que indica se a tarefa está concluída. Importante para reconstrução do estado.
        feita: false
    };
}

/**
 * Reseta o formulário HTML sem interferir no estado em memória.
 * Separar essa responsabilidade evita efeitos colaterais indesejados.
 */
function limparFormulario() {
    document.getElementById("taskForm").reset();
}

/**
 * Renderiza as listas de tarefas no DOM a partir do estado em memória.
 * Chamamos essa função sempre que o estado for modificado para garantir consistência.
 */
function atualizarListas() {
    const pendentes = document.getElementById("listaPendentes");
    const feitas = document.getElementById("listaFeitas");

    // Limpa o HTML atual antes de re-renderizar (evita duplicações).
    pendentes.innerHTML = "";
    feitas.innerHTML = "";

    // Renderiza pendentes
    tarefasPendentes.forEach((tarefa, index) => {
        const li = document.createElement("li");
        li.className = "list-group-item";

        li.innerHTML = `
            <div class="task-info">
                <strong>${tarefa.titulo}</strong><br>
                Resp.: ${tarefa.responsavel} | ${tarefa.dataInicio} → ${tarefa.dataFim} |
                Prioridade: ${tarefa.prioridade} <br>
                <small>${tarefa.obs}</small>
            </div>
        `;

        const btns = document.createElement("div");
        btns.className = "task-buttons";

        const btnFeita = document.createElement("button");
        btnFeita.className = "btn btn-success btn-sm";
        btnFeita.textContent = "Concluir";

        // Ao concluir, movemos a tarefa para a lista de feitas.
        // Também gravamos automaticamente depois da alteração.
        btnFeita.onclick = () => {
            concluirTarefa(index);
            gravarDados(); // Persistência imediata para evitar perda de dados
        };

        btns.appendChild(btnFeita);
        li.appendChild(btns);

        pendentes.appendChild(li);
    });

    // Renderiza feitas
    tarefasFeitas.forEach((tarefa, index) => {
        const li = document.createElement("li");
        li.className = "list-group-item text-muted";

        li.innerHTML = `
            <div class="task-info">
                <strong>${tarefa.titulo}</strong> (Concluída)<br>
                Resp.: ${tarefa.responsavel} | ${tarefa.dataInicio} → ${tarefa.dataFim} |
                Prioridade: ${tarefa.prioridade} <br>
                <small>${tarefa.obs}</small>
            </div>
        `;

        const btns = document.createElement("div");
        btns.className = "task-buttons";

        const btnExcluir = document.createElement("button");
        btnExcluir.className = "btn btn-danger btn-sm";
        btnExcluir.textContent = "Excluir";

        // Exclusão definitiva da tarefa concluída.
        // Persistimos logo em seguida.
        btnExcluir.onclick = () => {
            excluirFeita(index);
            gravarDados(); // Persistência imediata após exclusão
        };

        btns.appendChild(btnExcluir);
        li.appendChild(btns);

        feitas.appendChild(li);
    });
}

/**
 * Move uma tarefa da lista de pendentes para a lista de feitas.
 * Não grava aqui — gravação é feita pelo chamador (ou automaticamente).
 */
function concluirTarefa(indice) {
    const tarefa = tarefasPendentes.splice(indice, 1)[0]; // remove e obtém o item
    if (!tarefa) return; // proteção contra índices inválidos
    tarefa.feita = true;
    tarefasFeitas.push(tarefa);
    atualizarListas();
}

/**
 * Exclui permanentemente uma tarefa da lista de feitas.
 */
function excluirFeita(indice) {
    tarefasFeitas.splice(indice, 1);
    atualizarListas();
}

/**
 * Tratador do evento submit do formulário.
 * Cria a tarefa, atualiza a lista, reseta o formulário e persiste os dados.
 */
document.getElementById("taskForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const tarefa = criarObjetoTarefa();

    // Validações básicas (evitar inserir tarefas sem título)
    if (!tarefa.titulo) {
        // Em vez de alert, poderíamos mostrar um feedback visual no formulário.
        // Aqui retornamos silenciosamente para manter UX controlado.
        // Poderíamos acender uma borda vermelha no campo, por exemplo.
        document.getElementById("titulo").focus();
        return;
    }

    tarefasPendentes.push(tarefa);
    limparFormulario();
    atualizarListas();

    // Persistimos automaticamente após a inserção
    gravarDados();
});

// =======================================================================
// ========================== LOCAL STORAGE ===============================
// =======================================================================

/**
 * Serializa e grava os arrays principais no localStorage.
 * Usamos chaves separadas para manter a distinção entre pendentes e feitas.
 */
function gravarDados() {
    try {
        localStorage.setItem("pendentes", JSON.stringify(tarefasPendentes));
        localStorage.setItem("feitas", JSON.stringify(tarefasFeitas));
        // Se quiseres, podemos também armazenar um timestamp de quando foi gravado.
    } catch (err) {
        // Em caso de erro (ex.: storage cheio), poderíamos notificar o usuário de forma amigável.
        // Aqui apenas logamos no console para devs (sem interromper a UX).
        console.error("Erro ao gravar no localStorage:", err);
    }
}

/**
 * Recupera dados do localStorage e popula os arrays em memória.
 * Importante: mantemos as mesmas referências dos arrays (limpando e empurrando)
 * para não invalidar eventuais referências externas.
 */
function recuperarDados() {
    try {
        const pendentesSalvos = JSON.parse(localStorage.getItem("pendentes")) || [];
        const feitasSalvas = JSON.parse(localStorage.getItem("feitas")) || [];

        // Mantém as referências originais, limpa e re-insere
        tarefasPendentes.length = 0;
        tarefasFeitas.length = 0;

        pendentesSalvos.forEach(t => tarefasPendentes.push(t));
        feitasSalvas.forEach(t => tarefasFeitas.push(t));

        atualizarListas();
    } catch (err) {
        // Proteção contra JSON inválido ou outro erro de parse
        console.error("Erro ao recuperar dados do localStorage:", err);
    }
}

/**
 * Limpa o localStorage e também o estado em memória e a UI.
 * Assim o comportamento do botão fica previsível: limpar tudo.
 */
function limparStorage() {
    try {
        localStorage.removeItem("pendentes");
        localStorage.removeItem("feitas");
    } catch (err) {
        console.error("Erro ao limpar o localStorage:", err);
    }

    // Limpa também as listas em memória e atualiza a interface
    tarefasPendentes.length = 0;
    tarefasFeitas.length = 0;
    atualizarListas();
}

/**
 * Liga os botões do DOM às funções de persistência/recuperação.
 * Mantemos os botões para o controle manual, mesmo com gravação automática.
 */
document.getElementById("gravarBtn").onclick = () => {
    gravarDados();
    // Aqui poderíamos exibir um feedback visual "gravado" (ex.: um toast)
};

document.getElementById("recuperarBtn").onclick = () => {
    recuperarDados();
    // Feedback visual também seria útil aqui
};

document.getElementById("limparBtn").onclick = () => {
    limparStorage();
    // Confirm dialog não é permitido pelo exercício; se quiser confirmações,
    // implementar um modal próprio na interface.
};

/**
 * Ao carregar a página, recuperamos automaticamente os dados salvos
 * para reconstruir o estado exatamente como estava.
 * Isso faz com que o app restaure o snapshot salvo no localStorage.
 */
document.addEventListener("DOMContentLoaded", () => {
    recuperarDados();
});
