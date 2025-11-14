// Arrays principais que mantêm o estado atual da aplicação.
// São mantidos em memória enquanto a página estiver aberta.
const tarefasPendentes = [];
const tarefasFeitas = [];

/**
 * Cria um objeto tarefa com base nos campos do formulário.
 * Cada tarefa captura um "snapshot" do estado dos inputs no momento da criação.
 */
function criarObjetoTarefa() {
    return {
        titulo: document.getElementById("titulo").value.trim(),
        responsavel: document.getElementById("responsavel").value.trim(),
        dataInicio: document.getElementById("dataInicio").value,
        dataFim: document.getElementById("dataFim").value,
        prioridade: document.getElementById("prioridade").value,
        obs: document.getElementById("obs").value.trim(),

        // Flag necessária para reconstrução fiel ao recuperar do localStorage
        feita: false
    };
}

/**
 * Reseta apenas o formulário, sem interferir no estado atual da aplicação.
 * Isso evita limpar listas acidentalmente.
 */
function limparFormulario() {
    document.getElementById("taskForm").reset();
}

/**
 * Atualiza visualmente as listas de tarefas pendentes e concluídas.
 * Essa função "renderiza" o estado atual para o DOM.
 * Ao chamar sempre esta função após qualquer alteração,
 * garantimos consistência entre memória e interface.
 */
function atualizarListas() {
    const pendentes = document.getElementById("listaPendentes");
    const feitas = document.getElementById("listaFeitas");

    // Reset da UI antes da re-renderização para evitar duplicações.
    pendentes.innerHTML = "";
    feitas.innerHTML = "";

    // ------- RENDERIZAÇÃO DAS TAREFAS PENDENTES -------
    tarefasPendentes.forEach((tarefa, index) => {

        // Item visual da tarefa
        const li = document.createElement("li");
        li.className = "list-group-item";

        // Conteúdo textual estruturado
        li.innerHTML = `
            <div class="task-info">
                <strong>${tarefa.titulo}</strong><br>
                Resp.: ${tarefa.responsavel} | ${tarefa.dataInicio} → ${tarefa.dataFim} |
                Prioridade: ${tarefa.prioridade} <br>
                <small>${tarefa.obs}</small>
            </div>
        `;

        // Botões de interação
        const btns = document.createElement("div");
        btns.className = "task-buttons";

        const btnFeita = document.createElement("button");
        btnFeita.className = "btn btn-success btn-sm";
        btnFeita.textContent = "Concluir";

        // Ação: mover a tarefa para a lista de concluídas
        btnFeita.onclick = () => concluirTarefa(index);

        btns.appendChild(btnFeita);
        li.appendChild(btns);

        pendentes.appendChild(li);
    });

    // ------- RENDERIZAÇÃO DAS TAREFAS CONCLUÍDAS -------
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

        // Aqui a exclusão é definitiva — não volta para pendentes
        btnExcluir.onclick = () => excluirFeita(index);

        btns.appendChild(btnExcluir);
        li.appendChild(btns);

        feitas.appendChild(li);
    });
}

/**
 * Marca uma tarefa pendente como concluída.
 * Isso envolve:
 * - removê-la da lista de pendentes
 * - marcar a flag "feita"
 * - movê-la para a lista de concluídas
 */
function concluirTarefa(indice) {
    const tarefa = tarefasPendentes.splice(indice, 1)[0]; // remove + retorna
    tarefa.feita = true;
    tarefasFeitas.push(tarefa);
    atualizarListas();
}

/**
 * Exclusão permanente de tarefas concluídas.
 * Essa decisão segue o requisito do trabalho: tarefas concluídas
 * podem ser removidas completamente e não voltam ao fluxo.
 */
function excluirFeita(indice) {
    tarefasFeitas.splice(indice, 1);
    atualizarListas();
}

/**
 * Evento de submit do formulário:
 * - Captura os dados
 * - Gera a tarefa
 * - Adiciona à lista
 * - Atualiza a interface
 */
document.getElementById("taskForm").addEventListener("submit", function (e) {
    e.preventDefault();

    // Criação da nova tarefa a partir do estado atual do formulário
    const tarefa = criarObjetoTarefa();

    // Inserção no conjunto de pendentes
    tarefasPendentes.push(tarefa);

    limparFormulario();
    atualizarListas();
});


// =======================================================================
// ========================== LOCAL STORAGE ===============================
// =======================================================================

/**
 * Grava arrays inteiros no localStorage.
 * A serialização via JSON garante preservação total das propriedades.
 */
function gravarDados() {
    localStorage.setItem("pendentes", JSON.stringify(tarefasPendentes));
    localStorage.setItem("feitas", JSON.stringify(tarefasFeitas));
}

/**
 * Restaura o estado da aplicação a partir dos dados gravados.
 * Aqui é importante reconstruir os arrays manualmente para evitar
 * substituição da referência original.
 */
function recuperarDados() {
    const pendentesSalvos = JSON.parse(localStorage.getItem("pendentes")) || [];
    const feitasSalvas = JSON.parse(localStorage.getItem("feitas")) || [];

    // Evitar perder a referência dos arrays principais
    tarefasPendentes.length = 0;
    tarefasFeitas.length = 0;

    pendentesSalvos.forEach(t => tarefasPendentes.push(t));
    feitasSalvas.forEach(t => tarefasFeitas.push(t));

    atualizarListas();
}

/**
 * Limpa completamente o localStorage.
 * Por design, isso não apaga as listas em memória — apenas o armazenamento.
 */
function limparStorage() {
    localStorage.clear();
}

// Botões principais de persistência
document.getElementById("gravarBtn").onclick = gravarDados;
document.getElementById("recuperarBtn").onclick = recuperarDados;
document.getElementById("limparBtn").onclick = limparStorage;
