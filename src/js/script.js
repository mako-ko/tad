/**
 * TAD - Sistema Gerenciador de Tarefas
 * Versão final com IDs e seletores corrigidos
 */

// ==================== UTILITÁRIOS ====================

function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = isError ? '#ef4444' : '#10b981';
    notification.style.color = 'white';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '8px';
    notification.style.fontFamily = "var(--font-noto-sans-mono, monospace)";
    notification.style.fontSize = '0.875rem';
    notification.style.fontWeight = '500';
    notification.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    notification.style.zIndex = '9999';
    notification.style.transition = 'opacity 0.3s ease';
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ==================== USUÁRIOS ====================

function getUsers() {
    const users = localStorage.getItem('tad_users');
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem('tad_users', JSON.stringify(users));
}

function getCurrentUser() {
    const userJson = localStorage.getItem('tad_currentUser');
    return userJson ? JSON.parse(userJson) : null;
}

function setCurrentUser(user) {
    localStorage.setItem('tad_currentUser', JSON.stringify(user));
}

function logout() {
    localStorage.removeItem('tad_currentUser');
    showNotification('Logout realizado com sucesso!');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function requireAuth() {
    const publicPages = ['index.html', 'about.html', 'signin.html', 'login.html'];
    const currentPage = window.location.pathname.split('/').pop();
    if (!publicPages.includes(currentPage) && !getCurrentUser()) {
        showNotification('Você precisa estar logado para acessar esta página', true);
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return false;
    }
    return true;
}

function validateSignup(nome, email, senha) {
    if (nome.length < 5 || !nome.includes(' ')) {
        showNotification('Nome deve ter pelo menos 5 caracteres e conter um espaço entre nome e sobrenome', true);
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|com\.br)$/;
    if (!emailRegex.test(email)) {
        showNotification('Email inválido. Use o formato usuario@dominio.com ou .com.br', true);
        return false;
    }
    if (senha.length < 8) {
        showNotification('Senha deve ter pelo menos 8 caracteres', true);
        return false;
    }
    return true;
}

function handleSignup(event) {
    event.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    if (!validateSignup(nome, email, senha)) return;

    const users = getUsers();
    if (users.some(u => u.email === email)) {
        showNotification('Este e-mail já está cadastrado', true);
        return;
    }

    const newUser = { id: Date.now(), nome, email, senha };
    users.push(newUser);
    saveUsers(users);

    // Cria tarefas de exemplo para o novo usuário (IDs 1 a 7)
    const sampleTasks = [
        { id: 1, titulo: 'Tarefa Prioridade 1', descricao: 'Aqui deve aparecer uma descrição completa do que seria a tarefa prioridade 1. Seguindo o método Eat The Frog, essa seria a maior e mais importante tarefa a ser concluída no seu dia.', data: '06/04/2026', prioridade: 'frog', concluida: false },
        { id: 2, titulo: 'Tarefa Prioridade 2', descricao: 'Descrição da tarefa prioridade 2.', data: '06/04/2026', prioridade: 'frog', concluida: false },
        { id: 3, titulo: 'Tarefa 3', descricao: 'Descrição da tarefa 3.', data: '06/04/2026', prioridade: 'no-frog', concluida: false },
        { id: 4, titulo: 'Tarefa 4', descricao: 'Descrição da tarefa 4.', data: '06/04/2026', prioridade: 'no-frog', concluida: false },
        { id: 5, titulo: 'Tarefa 5', descricao: 'Descrição da tarefa 5.', data: '06/04/2026', prioridade: 'no-frog', concluida: false },
        { id: 6, titulo: 'Tarefa 6', descricao: 'Descrição da tarefa 6.', data: '06/04/2026', prioridade: 'no-frog', concluida: false },
        { id: 7, titulo: 'Tarefa 7', descricao: 'Descrição da tarefa 7.', data: '06/04/2026', prioridade: 'no-frog', concluida: false }
    ];
    const existingTasks = getTasks();
    sampleTasks.forEach(task => {
        task.userId = newUser.id;
        existingTasks.push(task);
    });
    saveTasks(existingTasks);

    showNotification('Conta criada com sucesso! Faça login.');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    if (!email || !senha) {
        showNotification('Preencha e-mail e senha', true);
        return;
    }

    const users = getUsers();
    const user = users.find(u => u.email === email && u.senha === senha);
    if (!user) {
        showNotification('E-mail ou senha inválidos', true);
        return;
    }

    setCurrentUser({ id: user.id, nome: user.nome, email: user.email });
    showNotification('Login realizado com sucesso!');
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1000);
}

// ==================== TAREFAS ====================

function getTasks() {
    const tasks = localStorage.getItem('tad_tasks');
    return tasks ? JSON.parse(tasks) : [];
}

function saveTasks(tasks) {
    localStorage.setItem('tad_tasks', JSON.stringify(tasks));
}

function getUserTasks() {
    const user = getCurrentUser();
    if (!user) return [];
    const allTasks = getTasks();
    return allTasks.filter(task => task.userId === user.id);
}

function getNextTaskId() {
    const userTasks = getUserTasks();
    const maxId = userTasks.reduce((max, t) => Math.max(max, t.id), 0);
    return maxId + 1;
}

function saveTask(taskData, isNew = true) {
    const tasks = getTasks();
    const user = getCurrentUser();
    if (!user) return false;

    if (isNew) {
        const newId = getNextTaskId();
        const newTask = {
            id: newId,
            userId: user.id,
            titulo: taskData.titulo,
            descricao: taskData.descricao || '',
            data: taskData.data,
            prioridade: taskData.prioridade,
            concluida: false
        };
        tasks.push(newTask);
        saveTasks(tasks);
        showNotification('Tarefa criada com sucesso!');
        return newId;
    } else {
        const index = tasks.findIndex(t => t.id === taskData.id && t.userId === user.id);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...taskData };
            saveTasks(tasks);
            showNotification('Tarefa alterada com sucesso!');
            return true;
        } else {
            showNotification('Tarefa não encontrada', true);
            return false;
        }
    }
}

function deleteTask(taskId) {
    const tasks = getTasks();
    const user = getCurrentUser();
    const newTasks = tasks.filter(t => !(t.id === taskId && t.userId === user.id));
    saveTasks(newTasks);
    showNotification('Tarefa excluída com sucesso!');
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'dashboard.html') {
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } else {
        renderDashboard();
    }
}

// ==================== DASHBOARD ====================

function renderDashboard() {
    const user = getCurrentUser();
    if (!user) return;

    const taskboard = document.querySelector('.taskboard');
    if (!taskboard) return;

    const tasks = getUserTasks();
    if (tasks.length === 0) {
        taskboard.innerHTML = `<div class="section" style="text-align:center; padding:2rem;">
            <p>Nenhuma tarefa encontrada. <a href="newtask.html">Crie sua primeira tarefa</a></p>
        </div>`;
        return;
    }

    const sorted = [...tasks].sort((a, b) => {
        if (a.prioridade === 'frog' && b.prioridade !== 'frog') return -1;
        if (a.prioridade !== 'frog' && b.prioridade === 'frog') return 1;
        return 0;
    });

    taskboard.innerHTML = '';
    sorted.forEach(task => {
        const paddedId = String(task.id).padStart(5, '0');
        const card = document.createElement('div');
        card.className = task.prioridade === 'frog' ? 'task-card-frog' : 'task-card';

        const link = document.createElement('a');
        link.href = `./${paddedId}.html`;
        link.className = 'task-link';
        link.style.textDecoration = 'none';
        link.style.color = 'inherit';
        link.innerHTML = `
            <h3>${task.prioridade === 'frog' ? '🐸 ' : ''}${escapeHtml(task.titulo)}</h3>
            <p>${escapeHtml(task.descricao.substring(0, 80))}${task.descricao.length > 80 ? '…' : ''}</p>
            <small>Data: ${task.data || 'Sem data'}</small>
        `;

        const btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn-edit';
        editBtn.type = 'button';
        editBtn.textContent = 'Editar';
        editBtn.onclick = (e) => {
            e.preventDefault();
            window.location.href = `./${paddedId}-edit.html`;
        };

        const completeBtn = document.createElement('button');
        completeBtn.className = 'btn-check';
        completeBtn.type = 'button';
        completeBtn.textContent = 'Concluir';
        completeBtn.onclick = (e) => {
            e.preventDefault();
            if (confirm('Deseja realmente excluir esta tarefa?')) {
                deleteTask(task.id);
            }
        };

        btnGroup.appendChild(editBtn);
        btnGroup.appendChild(completeBtn);
        card.appendChild(link);
        card.appendChild(btnGroup);
        taskboard.appendChild(card);
    });
}

// ==================== PÁGINA DE CRIAÇÃO ====================

function initNewTask() {
    const saveBtn = document.querySelector('.btn-save');
    if (!saveBtn) return;

    saveBtn.onclick = (e) => {
        e.preventDefault();
        const tituloInput = document.getElementById('task');
        const descricaoTextarea = document.querySelector('textarea[name="details"]');
        const dataInput = document.getElementById('date');
        const prioridadeSelect = document.getElementById('priority');

        const titulo = tituloInput ? tituloInput.value.trim() : '';
        const descricao = descricaoTextarea ? descricaoTextarea.value.trim() : '';
        const data = dataInput ? dataInput.value.trim() : '';
        const prioridade = prioridadeSelect ? prioridadeSelect.value : 'no-frog';

        if (titulo.length < 5) {
            showNotification('O título deve ter pelo menos 5 caracteres', true);
            return;
        }
        if (descricao.length > 0 && descricao.length < 3) {
            showNotification('A descrição, se preenchida, deve ter pelo menos 3 caracteres', true);
            return;
        }

        saveTask({ titulo, descricao, data, prioridade }, true);
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    };

    const resetBtn = document.querySelector('.btn-reset');
    if (resetBtn) {
        resetBtn.onclick = (e) => {
            e.preventDefault();
            const form = document.querySelector('.task-form');
            if (form) form.reset();
            showNotification('Campos limpos');
        };
    }
}

// ==================== VISUALIZAÇÃO (00001.html) ====================

function initViewTask() {
    const path = window.location.pathname.split('/').pop();
    const match = path.match(/^(\d+)\.html$/);
    if (!match) return;
    const taskId = parseInt(match[1], 10);

    const tasks = getTasks();
    const user = getCurrentUser();
    const task = tasks.find(t => t.id === taskId && t.userId === user.id);
    if (!task) {
        showNotification('Tarefa não encontrada', true);
        setTimeout(() => window.location.href = 'dashboard.html', 1500);
        return;
    }

    // Preenche o título (dentro de .title-task h2)
    const titleElem = document.querySelector('.title-task h2');
    if (titleElem) titleElem.textContent = task.prioridade === 'frog' ? `🐸 ${task.titulo}` : task.titulo;

    const dateInput = document.getElementById('date');
    if (dateInput) dateInput.value = task.data || '';

    const prioritySelect = document.getElementById('priority');
    if (prioritySelect) prioritySelect.value = task.prioridade;

    const textarea = document.querySelector('textarea[name="details"]');
    if (textarea) textarea.value = task.descricao;

    // Botão Voltar
    const backBtn = document.querySelector('.btn-cancel');
    if (backBtn) {
        backBtn.onclick = (e) => {
            e.preventDefault();
            window.location.href = 'dashboard.html';
        };
    }

    // Botão Editar
    const editBtn = document.querySelector('.btn-edit');
    if (editBtn) {
        editBtn.onclick = (e) => {
            e.preventDefault();
            const paddedId = String(task.id).padStart(5, '0');
            window.location.href = `./${paddedId}-edit.html`;
        };
    }

    // Botão Concluir (excluir)
    const completeBtn = document.querySelector('.btn-check');
    if (completeBtn) {
        completeBtn.onclick = (e) => {
            e.preventDefault();
            if (confirm('Excluir esta tarefa permanentemente?')) {
                deleteTask(task.id);
            }
        };
    }
}

// ==================== EDIÇÃO (00001-edit.html) ====================

function initEditTask() {
    const path = window.location.pathname.split('/').pop();
    const match = path.match(/^(\d+)-edit\.html$/);
    if (!match) return;
    const taskId = parseInt(match[1], 10);

    const tasks = getTasks();
    const user = getCurrentUser();
    const task = tasks.find(t => t.id === taskId && t.userId === user.id);
    if (!task) {
        showNotification('Tarefa não encontrada', true);
        setTimeout(() => window.location.href = 'dashboard.html', 1500);
        return;
    }

    const titleInput = document.getElementById('task');
    if (titleInput) titleInput.value = task.titulo;

    const dateInput = document.getElementById('date');
    if (dateInput) dateInput.value = task.data || '';

    const prioritySelect = document.getElementById('priority');
    if (prioritySelect) prioritySelect.value = task.prioridade;

    const textarea = document.querySelector('textarea[name="details"]');
    if (textarea) textarea.value = task.descricao;

    const saveBtn = document.querySelector('.btn-save');
    if (saveBtn) {
        saveBtn.onclick = (e) => {
            e.preventDefault();
            const novoTitulo = titleInput ? titleInput.value.trim() : '';
            const novaDescricao = textarea ? textarea.value.trim() : '';
            const novaData = dateInput ? dateInput.value.trim() : '';
            const novaPrioridade = prioritySelect ? prioritySelect.value : 'no-frog';

            if (novoTitulo.length < 5) {
                showNotification('Título deve ter pelo menos 5 caracteres', true);
                return;
            }
            if (novaDescricao.length > 0 && novaDescricao.length < 3) {
                showNotification('Descrição, se preenchida, deve ter pelo menos 3 caracteres', true);
                return;
            }

            const success = saveTask({
                id: task.id,
                titulo: novoTitulo,
                descricao: novaDescricao,
                data: novaData,
                prioridade: novaPrioridade
            }, false);
            if (success) {
                const paddedId = String(task.id).padStart(5, '0');
                setTimeout(() => {
                    window.location.href = `./${paddedId}.html`;
                }, 1000);
            }
        };
    }

    const resetBtn = document.querySelector('.btn-reset');
    if (resetBtn) {
        resetBtn.onclick = (e) => {
            e.preventDefault();
            if (titleInput) titleInput.value = task.titulo;
            if (dateInput) dateInput.value = task.data || '';
            if (prioritySelect) prioritySelect.value = task.prioridade;
            if (textarea) textarea.value = task.descricao;
            showNotification('Alterações desfeitas');
        };
    }

    const completeBtn = document.querySelector('.btn-check');
    if (completeBtn) {
        completeBtn.onclick = (e) => {
            e.preventDefault();
            if (confirm('Excluir esta tarefa?')) {
                deleteTask(task.id);
            }
        };
    }
}

// ==================== CONFIGURAÇÕES ====================

function initConfig() {
    const main = document.querySelector('.main');
    if (!main) return;
    if (main.querySelector('.config-container')) return;

    const user = getCurrentUser();
    if (!user) return;

    const container = document.createElement('div');
    container.className = 'section config-container';
    container.style.maxWidth = '500px';
    container.style.margin = '0 auto';
    container.innerHTML = `
        <h2>Configurações da conta</h2>
        <p><strong>Nome:</strong> ${escapeHtml(user.nome)}</p>
        <p><strong>E-mail:</strong> ${escapeHtml(user.email)}</p>
        <hr>
        <h3>Alterar senha</h3>
        <form id="change-password-form" class="form-signin">
            <p>
                <label for="current-password">Senha atual:</label>
                <input type="password" id="current-password" required>
            </p>
            <p>
                <label for="new-password">Nova senha (mínimo 8 caracteres):</label>
                <input type="password" id="new-password" required>
            </p>
            <button type="submit" class="btn-submit">Alterar senha</button>
        </form>
        <hr>
        <button id="delete-account-btn" class="btn-submit" style="background-color:#ef4444;">Excluir minha conta</button>
        <p style="margin-top:1rem;"><a href="dashboard.html">← Voltar ao dashboard</a></p>
    `;
    main.innerHTML = '';
    main.appendChild(container);

    const pwdForm = document.getElementById('change-password-form');
    pwdForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const current = document.getElementById('current-password').value;
        const newPwd = document.getElementById('new-password').value;

        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex === -1 || users[userIndex].senha !== current) {
            showNotification('Senha atual incorreta', true);
            return;
        }
        if (newPwd.length < 8) {
            showNotification('Nova senha deve ter pelo menos 8 caracteres', true);
            return;
        }
        users[userIndex].senha = newPwd;
        saveUsers(users);
        showNotification('Senha alterada com sucesso! Faça login novamente.');
        logout();
    });

    document.getElementById('delete-account-btn').addEventListener('click', () => {
        if (confirm('Tem certeza que deseja excluir sua conta permanentemente? Todas as tarefas serão perdidas.')) {
            let users = getUsers();
            users = users.filter(u => u.id !== user.id);
            saveUsers(users);
            let tasks = getTasks();
            tasks = tasks.filter(t => t.userId !== user.id);
            saveTasks(tasks);
            showNotification('Conta excluída com sucesso.');
            logout();
        }
    });
}

// ==================== INICIALIZAÇÃO ====================

document.addEventListener('DOMContentLoaded', () => {
    if (!requireAuth()) return;

    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'signin.html') {
        const form = document.querySelector('.form-signin');
        if (form) form.addEventListener('submit', handleSignup);
    }
    else if (currentPage === 'login.html') {
        const form = document.querySelector('.form-signin');
        if (form) form.addEventListener('submit', handleLogin);
    }
    else if (currentPage === 'dashboard.html') {
        renderDashboard();
        const sairLink = Array.from(document.querySelectorAll('.nav a')).find(a => a.textContent.trim() === 'Sair');
        if (sairLink) {
            sairLink.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
    }
    else if (currentPage === 'newtask.html') {
        initNewTask();
    }
    else if (currentPage === 'config.html') {
        initConfig();
    }
    else if (currentPage && currentPage.match(/^\d+\.html$/)) {
        initViewTask();
    }
    else if (currentPage && currentPage.match(/^\d+-edit\.html$/)) {
        initEditTask();
    }

    const logoutLink = Array.from(document.querySelectorAll('.nav a')).find(a => a.textContent.trim() === 'Sair');
    if (logoutLink && !['signin.html', 'login.html', 'index.html', 'about.html'].includes(currentPage)) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});