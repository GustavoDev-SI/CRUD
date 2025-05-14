const SUPABASE_URL = 'https://sesnpxwhnzgexhdkachw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlc25weHdobnpnZXhoZGthY2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNTA4MzEsImV4cCI6MjA2MjYyNjgzMX0.ju5JUUn4iNF8GfYPo17TSSVjWw_OjqpYatdxIEL6xhQ';
const HEADERS = {
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
};

// Elementos DOM
const nomeInput = document.getElementById('nomeInput');
const idEdicao = document.getElementById('idEdicao');
const btnAcao = document.getElementById('btnAcao');
const listaNomesUI = document.getElementById('listaNomes');
const mensagemEl = document.getElementById('mensagem');

// Ícones SVG - definidos como strings para evitar problemas de clonagem
const SVG_ICONS = {
    adicionar: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/></svg>',
    editar: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16"><path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/></svg>',
    excluir: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16"><path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/></svg>',
    atualizar: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/></svg>'
};

/**
 * Exibe mensagem de erro ou sucesso
 * @param {string} texto Texto da mensagem
 * @param {string} tipo Tipo da mensagem ('success', 'danger', 'warning', 'info')
 * @param {number} duracao Duração em ms (0 para não ocultar automaticamente)
 */
function exibirMensagem(texto, tipo = 'info', duracao = 3000) {
    mensagemEl.textContent = texto;
    mensagemEl.className = `alert alert-${tipo}`;
    mensagemEl.classList.remove('d-none');
    
    if (duracao > 0) {
        setTimeout(() => {
            mensagemEl.classList.add('d-none');
        }, duracao);
    }
}

/**
 * Carrega lista de nomes do servidor
 */
async function carregarNomes() {
    try {
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/nomes?select=*&order=nome.asc`, { 
            headers: HEADERS 
        });
        
        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(`Erro ao carregar nomes: ${resposta.status} - ${erro.message || erro.error}`);
        }
        
        const nomes = await resposta.json();
        exibirNomes(nomes);
    } catch (erro) {
        console.error("Falha ao carregar nomes:", erro);
        exibirMensagem(`Não foi possível carregar a lista de nomes: ${erro.message}`, 'danger');
    }
}

/**
 * Exibe nomes na interface
 * @param {Array} nomes Lista de objetos com nomes
 */
function exibirNomes(nomes) {
    listaNomesUI.innerHTML = '';
    
    if (nomes.length === 0) {
        const mensagem = document.createElement('div');
        mensagem.className = 'alert alert-info w-100 text-center';
        mensagem.textContent = 'Nenhum nome cadastrado.';
        listaNomesUI.appendChild(mensagem);
        return;
    }
    
    nomes.forEach(nomeObj => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            <span>${nomeObj.nome}</span>
            <div class="acoes">
                <button class="btn btn-sm btn-warning btn-editar" aria-label="Editar ${nomeObj.nome}">${SVG_ICONS.editar}</button>
                <button class="btn btn-sm btn-danger btn-excluir" aria-label="Excluir ${nomeObj.nome}">${SVG_ICONS.excluir}</button>
            </div>
        `;
        
        li.querySelector('.btn-editar').addEventListener('click', () => prepararEdicao(nomeObj.id, nomeObj.nome));
        li.querySelector('.btn-excluir').addEventListener('click', () => removerNome(nomeObj.id, nomeObj.nome));
        
        listaNomesUI.appendChild(li);
    });
}

/**
 * Prepara o formulário para edição
 * @param {number} id ID do nome
 * @param {string} nome Nome a ser editado
 */
function prepararEdicao(id, nome) {
    nomeInput.value = nome;
    idEdicao.value = id;
    btnAcao.innerHTML = `${SVG_ICONS.atualizar} Atualizar`;
    btnAcao.classList.remove('btn-primary');
    btnAcao.classList.add('btn-success');
    nomeInput.focus();
}

/**
 * Reseta o formulário para o modo de adição
 */
function resetarFormulario() {
    nomeInput.value = '';
    idEdicao.value = '';
    btnAcao.innerHTML = `${SVG_ICONS.adicionar} Adicionar`;
    btnAcao.classList.remove('btn-success');
    btnAcao.classList.add('btn-primary');
}

/**
 * Salva um novo nome
 */
async function salvarNome() {
    const nome = nomeInput.value.trim();
    if (!nome) {
        exibirMensagem('Por favor, digite um nome.', 'warning');
        nomeInput.focus();
        return;
    }

    try {
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/nomes`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({ nome })
        });
        
        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(`Erro ao salvar: ${resposta.status} - ${erro.message || erro.error}`);
        }
        
        exibirMensagem(`Nome "${nome}" adicionado com sucesso!`, 'success');
        resetarFormulario();
        carregarNomes();
    } catch (erro) {
        console.error("Falha ao salvar nome:", erro);
        exibirMensagem(`Não foi possível salvar o nome: ${erro.message}`, 'danger');
    }
}

/**
 * Atualiza um nome existente
 */
async function atualizarNome() {
    const nome = nomeInput.value.trim();
    const id = idEdicao.value;
    
    if (!nome) {
        exibirMensagem('Por favor, digite um nome.', 'warning');
        nomeInput.focus();
        return;
    }
    
    if (!id) {
        console.error("ID para edição não encontrado.");
        exibirMensagem("Erro interno: ID para edição não encontrado.", 'danger');
        return;
    }

    try {
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/nomes?id=eq.${id}`, {
            method: 'PATCH',
            headers: HEADERS,
            body: JSON.stringify({ nome })
        });
        
        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(`Erro ao atualizar: ${resposta.status} - ${erro.message || erro.error}`);
        }
        
        exibirMensagem(`Nome atualizado para "${nome}" com sucesso!`, 'success');
        resetarFormulario();
        carregarNomes();
    } catch (erro) {
        console.error("Falha ao atualizar nome:", erro);
        exibirMensagem(`Não foi possível atualizar o nome: ${erro.message}`, 'danger');
    }
}

/**
 * Decide entre salvar ou atualizar nome
 */
async function salvarOuAtualizarNome() {
    if (idEdicao.value) {
        await atualizarNome();
    } else {
        await salvarNome();
    }
}

/**
 * Remove um nome
 * @param {number} id ID do nome
 * @param {string} nome Nome a ser excluído
 */
async function removerNome(id, nome) {
    if (!confirm(`Tem certeza que deseja excluir "${nome}"?`)) {
        return;
    }
    
    try {
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/nomes?id=eq.${id}`, {
            method: 'DELETE',
            headers: HEADERS
        });
        
        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(`Erro ao excluir: ${resposta.status} - ${erro.message || erro.error}`);
        }
        
        exibirMensagem(`Nome "${nome}" excluído com sucesso!`, 'success');
        resetarFormulario();
        carregarNomes();
    } catch (erro) {
        console.error("Falha ao excluir nome:", erro);
        exibirMensagem(`Não foi possível excluir o nome: ${erro.message}`, 'danger');
    }
}

/**
 * Manipulador para tecla Enter no campo de input
 * @param {KeyboardEvent} event 
 */
function handleEnterKey(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        salvarOuAtualizarNome();
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    carregarNomes();
    resetarFormulario();
});

btnAcao.addEventListener('click', salvarOuAtualizarNome);
nomeInput.addEventListener('keypress', handleEnterKey);

// Botão para cancelar edição
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && idEdicao.value) {
        resetarFormulario();
        exibirMensagem('Edição cancelada.', 'info', 2000);
    }
});