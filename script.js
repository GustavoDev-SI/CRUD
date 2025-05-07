// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    // API URL base
    const API_URL = '/api/items';
    
    // Elementos DOM
    const itemIdInput = document.getElementById('itemId');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const descriptionInput = document.getElementById('description');
    const createBtn = document.getElementById('createBtn');
    const updateBtn = document.getElementById('updateBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const clearBtn = document.getElementById('clearBtn');
    const dataTable = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
    const statusMessage = document.getElementById('statusMessage');
    const loadingIndicator = document.getElementById('loading');
    
    // Função para mostrar mensagem de status
    function showStatusMessage(message, isSuccess = true) {
        statusMessage.textContent = message;
        statusMessage.className = isSuccess ? 'status-message success' : 'status-message error';
        statusMessage.style.display = 'block';
        
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 3000);
    }
    
    // Função para mostrar/esconder indicador de carregamento
    function toggleLoading(show) {
        loadingIndicator.style.display = show ? 'block' : 'none';
    }
    
    // Função para limpar o formulário
    function clearForm() {
        itemIdInput.value = '';
        nameInput.value = '';
        emailInput.value = '';
        descriptionInput.value = '';
        updateBtn.disabled = true;
        deleteBtn.disabled = true;
        createBtn.disabled = false;
    }
    
    // Função para carregar os dados na tabela
    async function loadTableData() {
        try {
            toggleLoading(true);
            
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Erro ao carregar dados');
            }
            
            const data = await response.json();
            dataTable.innerHTML = '';
            
            if (data.length === 0) {
                const row = dataTable.insertRow();
                const cell = row.insertCell(0);
                cell.colSpan = 4;
                cell.textContent = 'Nenhum dado cadastrado';
                cell.style.textAlign = 'center';
                return;
            }
            
            data.forEach(item => {
                const row = dataTable.insertRow();
                
                row.insertCell(0).textContent = item.name;
                row.insertCell(1).textContent = item.email;
                row.insertCell(2).textContent = item.description;
                
                const actionsCell = row.insertCell(3);
                actionsCell.className = 'action-buttons';
                
                // Botão Editar
                const editBtn = document.createElement('button');
                editBtn.textContent = 'Editar';
                editBtn.className = 'edit-btn';
                editBtn.addEventListener('click', () => {
                    itemIdInput.value = item._id; // MongoDB usa _id
                    nameInput.value = item.name;
                    emailInput.value = item.email;
                    descriptionInput.value = item.description;
                    
                    updateBtn.disabled = false;
                    deleteBtn.disabled = false;
                    createBtn.disabled = true;
                });
                
                // Botão Excluir
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Excluir';
                deleteBtn.className = 'delete-btn';
                deleteBtn.addEventListener('click', () => {
                    if (confirm(`Deseja realmente excluir ${item.name}?`)) {
                        deleteItem(item._id); // MongoDB usa _id
                    }
                });
                
                actionsCell.appendChild(editBtn);
                actionsCell.appendChild(deleteBtn);
            });
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            showStatusMessage('Erro ao carregar dados: ' + error.message, false);
        } finally {
            toggleLoading(false);
        }
    }
    
    // Função para criar um novo item
    async function createItem(item) {
        try {
            toggleLoading(true);
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(item)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao criar item');
            }
            
            await loadTableData();
            clearForm();
            showStatusMessage('Item criado com sucesso!');
        } catch (error) {
            console.error('Erro ao criar item:', error);
            showStatusMessage('Erro ao criar item: ' + error.message, false);
        } finally {
            toggleLoading(false);
        }
    }
    
    // Função para atualizar um item
    async function updateItem(id, item) {
        try {
            toggleLoading(true);
            
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(item)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao atualizar item');
            }
            
            await loadTableData();
            clearForm();
            showStatusMessage('Item atualizado com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar item:', error);
            showStatusMessage('Erro ao atualizar item: ' + error.message, false);
        } finally {
            toggleLoading(false);
        }
    }
    
    // Função para excluir um item
    async function deleteItem(id) {
        try {
            toggleLoading(true);
            
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao excluir item');
            }
            
            await loadTableData();
            clearForm();
            showStatusMessage('Item excluído com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir item:', error);
            showStatusMessage('Erro ao excluir item: ' + error.message, false);
        } finally {
            toggleLoading(false);
        }
    }
    
    // Evento para criar um novo item
    createBtn.addEventListener('click', () => {
        if (!nameInput.value || !emailInput.value) {
            showStatusMessage('Por favor, preencha os campos obrigatórios.', false);
            return;
        }
        
        const newItem = {
            name: nameInput.value,
            email: emailInput.value,
            description: descriptionInput.value
        };
        
        createItem(newItem);
    });
    
    // Evento para atualizar um item
    updateBtn.addEventListener('click', () => {
        if (!nameInput.value || !emailInput.value) {
            showStatusMessage('Por favor, preencha os campos obrigatórios.', false);
            return;
        }
        
        const id = itemIdInput.value;
        const updatedItem = {
            name: nameInput.value,
            email: emailInput.value,
            description: descriptionInput.value
        };
        
        updateItem(id, updatedItem);
    });
    
    // Evento para excluir um item
    deleteBtn.addEventListener('click', () => {
        const id = itemIdInput.value;
        if (id && confirm('Deseja realmente excluir este item?')) {
            deleteItem(id);
        }
    });
    
    // Evento para limpar o formulário
    clearBtn.addEventListener('click', clearForm);
    
    // Carregar os dados iniciais
    loadTableData();
});