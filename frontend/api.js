// Simple Backend usando un JSON alojado
// Este backend usa una API pública para persistencia temporal

const API_BASE = 'https://api.jsonbin.io/v3/b';
const BIN_ID = '65cd1234567890abcdef1234'; // Se creará dinámicamente
const MASTER_KEY = '$2a$10$YourMasterKeyHere'; // Deberás obtener tu propia key

// Para producción real, usa Firebase o tu propio backend
// Esta es una solución temporal para demostración

const DB = {
    tasks: [],
    
    async init() {
        // Intentar cargar desde localStorage primero
        const saved = localStorage.getItem('geneTasksDB');
        if (saved) {
            this.tasks = JSON.parse(saved);
        }
        return this;
    },
    
    async save() {
        localStorage.setItem('geneTasksDB', JSON.stringify(this.tasks));
        return true;
    },
    
    async getAll() {
        return this.tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    
    async create(task) {
        const newTask = {
            id: Date.now().toString(),
            ...task,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.tasks.unshift(newTask);
        await this.save();
        return newTask;
    },
    
    async update(id, updates) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            Object.assign(task, updates, { updatedAt: new Date().toISOString() });
            await this.save();
            return task;
        }
        return null;
    },
    
    async delete(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        await this.save();
        return true;
    }
};

// API REST simulada
const GeneTasksAPI = {
    async getTasks() {
        await DB.init();
        return await DB.getAll();
    },
    
    async createTask(taskData) {
        await DB.init();
        return await DB.create(taskData);
    },
    
    async updateStatus(id, status) {
        await DB.init();
        return await DB.update(id, { status });
    },
    
    async addNotes(id, notes) {
        await DB.init();
        return await DB.update(id, { notes });
    },
    
    async deleteTask(id) {
        await DB.init();
        return await DB.delete(id);
    },
    
    getStats() {
        const tasks = DB.tasks;
        return {
            total: tasks.length,
            pending: tasks.filter(t => t.status === 'pending').length,
            progress: tasks.filter(t => t.status === 'progress').length,
            completed: tasks.filter(t => t.status === 'completed').length,
            cancelled: tasks.filter(t => t.status === 'cancelled').length
        };
    }
};
