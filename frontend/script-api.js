// Reemplazo de script para Gene Task Manager - Versión con API real
const API_URL = 'https://y3jed7qb.us-west.insforge.app/api/tasks';
const API_KEY = 'ik_e9e6dfc89c2b2fdcff23a652ad0e6f7a';

let tasks = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('taskForm').addEventListener('submit', addTask);
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
}

async function loadTasks() {
    try {
        setSyncStatus('syncing');
        const response = await fetch(API_URL, {
            headers: { 'Authorization': 'Bearer ' + API_KEY }
        });
        const data = await response.json();
        tasks = data.data || [];
        renderTasks();
        setSyncStatus('synced');
    } catch (error) {
        console.error('Error cargando tareas:', error);
        setSyncStatus('error');
    }
}

async function addTask(e) {
    e.preventDefault();
    
    const taskData = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        priority: document.getElementById('taskPriority').value,
        deadline: document.getElementById('taskDeadline').value || null,
        status: 'pending',
        notes: ''
    };

    try {
        setSyncStatus('syncing');
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + API_KEY 
            },
            body: JSON.stringify(taskData)
        });
        
        if (response.ok) {
            document.getElementById('taskForm').reset();
            await loadTasks();
        }
    } catch (error) {
        console.error('Error agregando tarea:', error);
        setSyncStatus('error');
    }
}

async function updateStatus(id, newStatus) {
    try {
        setSyncStatus('syncing');
        await fetch(`${API_URL}/${id}/status`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + API_KEY 
            },
            body: JSON.stringify({ status: newStatus })
        });
        await loadTasks();
    } catch (error) {
        console.error('Error actualizando estado:', error);
        setSyncStatus('error');
    }
}

async function addNotes(id, notes) {
    try {
        setSyncStatus('syncing');
        await fetch(`${API_URL}/${id}/notes`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + API_KEY 
            },
            body: JSON.stringify({ notes })
        });
        await loadTasks();
    } catch (error) {
        console.error('Error agregando notas:', error);
        setSyncStatus('error');
    }
}

async function deleteTask(id) {
    if (confirm('¿Eliminar esta tarea permanentemente?')) {
        try {
            setSyncStatus('syncing');
            await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + API_KEY }
            });
            await loadTasks();
        } catch (error) {
            console.error('Error eliminando tarea:', error);
            setSyncStatus('error');
        }
    }
}

function promptNotes(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        const notes = prompt('Agregar notas:', task.notes || '');
        if (notes !== null) {
            addNotes(id, notes);
        }
    }
}

function renderTasks() {
    let filtered = tasks;
    if (currentFilter !== 'all') {
        filtered = tasks.filter(t => t.status === currentFilter);
    }

    const container = document.getElementById('taskList');
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>No hay tareas</h3>
                <p>Crea una nueva tarea para Genee</p>
            </div>
        `;
    } else {
        container.innerHTML = filtered.map(task => `
            <div class="task-card">
                <div class="task-header">
                    <h3 class="task-title">${escapeHtml(task.title)}</h3>
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                </div>
                <p class="task-description">${escapeHtml(task.description)}</p>
                <div class="task-meta">
                    <span><i class="fas fa-calendar"></i> ${formatDate(task.createdAt)}</span>
                    ${task.deadline ? `<span><i class="fas fa-clock"></i> Límite: ${formatDate(task.deadline)}</span>` : ''}
                    <span class="task-status status-${task.status}">
                        <i class="fas fa-${getStatusIcon(task.status)}"></i>
                        ${getStatusLabel(task.status)}
                    </span>
                </div>
                ${task.notes ? `
                    <div class="notes-section">
                        <div class="notes-title"><i class="fas fa-comment"></i> Notas de Genee:</div>
                        <div class="notes-text">${escapeHtml(task.notes)}</div>
                    </div>
                ` : ''}
                <div class="task-actions">
                    ${task.status === 'pending' ? `
                        <button class="btn btn-warning btn-small" onclick="updateStatus('${task.id}', 'progress')">
                            <i class="fas fa-play"></i> Iniciar
                        </button>
                    ` : ''}
                    ${task.status === 'progress' ? `
                        <button class="btn btn-success btn-small" onclick="updateStatus('${task.id}', 'completed')">
                            <i class="fas fa-check"></i> Completar
                        </button>
                    ` : ''}
                    ${task.status !== 'cancelled' ? `
                        <button class="btn btn-danger btn-small" onclick="updateStatus('${task.id}', 'cancelled')">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    ` : ''}
                    <button class="btn btn-small" onclick="promptNotes('${task.id}')" style="background: rgba(0,212,255,0.2); color: #00d4ff; border: 1px solid #00d4ff;">
                        <i class="fas fa-edit"></i> Notas
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteTask('${task.id}')">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateStats();
}

function updateStats() {
    document.getElementById('totalCount').textContent = tasks.length;
    document.getElementById('pendingCount').textContent = tasks.filter(t => t.status === 'pending').length;
    document.getElementById('progressCount').textContent = tasks.filter(t => t.status === 'progress').length;
    document.getElementById('completedCount').textContent = tasks.filter(t => t.status === 'completed').length;
}

function setSyncStatus(status) {
    const el = document.getElementById('syncStatus');
    el.className = 'sync-indicator ' + status;
    const texts = { synced: 'Sincronizado', syncing: 'Sincronizando...', error: 'Error' };
    el.innerHTML = `<i class="fas fa-${status === 'synced' ? 'check-circle' : status === 'syncing' ? 'spinner fa-spin' : 'exclamation-circle'}"></i><span>${texts[status]}</span>`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('es-MX', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}

function getStatusIcon(status) {
    const icons = { pending: 'clock', progress: 'spinner', completed: 'check-circle', cancelled: 'times-circle' };
    return icons[status] || 'circle';
}

function getStatusLabel(status) {
    const labels = { pending: 'Pendiente', progress: 'En Progreso', completed: 'Completada', cancelled: 'Cancelada' };
    return labels[status] || status;
}

// API para que Genee actualice tareas desde el backend
window.GeneTaskAPI = {
    async markInProgress(taskId, note = '') {
        await updateStatus(taskId, 'progress');
        if (note) await addNotes(taskId, note);
        return true;
    },
    
    async markCompleted(taskId, note = '') {
        await updateStatus(taskId, 'completed');
        if (note) await addNotes(taskId, note);
        return true;
    },
    
    async addProgressNote(taskId, note) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            const updatedNotes = (task.notes ? task.notes + '\n' : '') + new Date().toLocaleString() + ': ' + note;
            await addNotes(taskId, updatedNotes);
        }
        return true;
    },
    
    getPendingTasks() {
        return tasks.filter(t => t.status === 'pending');
    }
};
