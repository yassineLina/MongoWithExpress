// src/public/app.js
class UserDashboard {
    constructor() {
        this.baseUrl = '/api/users';
        this.statsUrl = '/api/users/stats';
        this.users = [];
        this.filteredUsers = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.searchTerm = '';
        
        this.init();
    }
    
    async init() {
        this.checkServerStatus();
        await this.loadData();
        this.setupEventListeners();
        this.setupCharts();
    }
    
    async checkServerStatus() {
        try {
            const response = await fetch('/');
            if (response.ok) {
                this.updateStatusIndicator(true);
            }
        } catch (error) {
            this.updateStatusIndicator(false);
        }
    }
    
    updateStatusIndicator(connected) {
        const indicator = document.getElementById('statusIndicator');
        const dot = indicator.querySelector('.status-dot');
        
        if (connected) {
            dot.className = 'status-dot connected';
            indicator.innerHTML = '<span class="status-dot connected"></span> Connesso';
        } else {
            dot.className = 'status-dot';
            indicator.innerHTML = '<span class="status-dot"></span> Disconnesso';
        }
    }
    
    async loadData() {
        try {
            this.showLoading();
            
            // Carica utenti
            const usersResponse = await fetch(this.baseUrl);
            const usersData = await usersResponse.json();
            
            if (usersData.success) {
                this.users = usersData.users;
                this.filteredUsers = [...this.users];
                this.updateTable();
            }
            
            // Carica statistiche
            const statsResponse = await fetch(this.statsUrl);
            const statsData = await statsResponse.json();
            
            if (statsData.success) {
                this.updateStats(statsData.stats);
                this.updateCharts();
            }
            
            this.updateLastUpdate();
            this.hideLoading();
            
        } catch (error) {
            console.error('Errore caricamento dati:', error);
            this.showError('Errore nel caricamento dei dati');
        }
    }
    
    updateStats(stats) {
        // Aggiorna le card statistiche
        document.querySelectorAll('.stat-card')[0].querySelector('.stat-value').textContent = stats.total || 0;
        document.querySelectorAll('.stat-card')[1].querySelector('.stat-value').textContent = 
            stats.avgAge ? stats.avgAge.toFixed(1) + ' anni' : '--';
        document.querySelectorAll('.stat-card')[2].querySelector('.stat-value').textContent = 
            stats.activeCount || 0;
        document.querySelectorAll('.stat-card')[3].querySelector('.stat-value').textContent = 
            stats.cities ? stats.cities.length : 0;
        
        // Rimuovi stato loading
        document.querySelectorAll('.stat-card').forEach(card => {
            card.classList.remove('loading');
        });
    }
    
    updateTable() {
        const tbody = document.getElementById('usersTableBody');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageUsers = this.filteredUsers.slice(startIndex, endIndex);
        
        tbody.innerHTML = '';
        
        if (pageUsers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #666;">
                        <i class="fas fa-database" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                        ${this.searchTerm ? 'Nessun utente trovato per la ricerca' : 'Nessun utente nel database'}
                    </td>
                </tr>
            `;
        } else {
            pageUsers.forEach(user => {
                const row = document.createElement('tr');
                const date = new Date(user.createdAt).toLocaleDateString('it-IT');
                
                row.innerHTML = `
                    <td>${user.id.substring(18, 24)}...</td>
                    <td><strong>${user.name}</strong></td>
                    <td>${user.email}</td>
                    <td>${user.age} anni</td>
                    <td>
                        <span class="city-badge">${user.city}</span>
                    </td>
                    <td>
                        <span class="${user.isActive ? 'status-active' : 'status-inactive'}">
                            <i class="fas fa-${user.isActive ? 'check-circle' : 'times-circle'}"></i>
                            ${user.isActive ? 'Attivo' : 'Inattivo'}
                        </span>
                    </td>
                    <td>${date}</td>
                `;
                
                tbody.appendChild(row);
            });
        }
        
        this.updatePagination();
    }
    
    updatePagination() {
        const totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
        const pageInfo = document.getElementById('pageInfo');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const tableInfo = document.getElementById('tableInfo');
        
        pageInfo.textContent = `Pagina ${this.currentPage} di ${totalPages}`;
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endIndex = Math.min(this.currentPage * this.itemsPerPage, this.filteredUsers.length);
        
        tableInfo.textContent = `Mostrando ${startIndex}-${endIndex} di ${this.filteredUsers.length} utenti`;
    }
    
    setupCharts() {
        this.cityChart = new Chart(document.getElementById('cityChart'), {
            type: 'pie',
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
        
        this.ageChart = new Chart(document.getElementById('ageChart'), {
            type: 'bar',
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    updateCharts() {
        // Chart per città
        const cityCounts = {};
        this.users.forEach(user => {
            cityCounts[user.city] = (cityCounts[user.city] || 0) + 1;
        });
        
        this.cityChart.data = {
            labels: Object.keys(cityCounts),
            datasets: [{
                data: Object.values(cityCounts),
                backgroundColor: [
                    '#667eea', '#764ba2', '#6B46C1', '#553C9A', 
                    '#44337A', '#9F7AEA', '#B794F4', '#D6BCFA'
                ],
                borderWidth: 1
            }]
        };
        this.cityChart.update();
        
        // Chart per distribuzione età
        const ageRanges = {
            '18-25': 0,
            '26-35': 0,
            '36-45': 0,
            '46+': 0
        };
        
        this.users.forEach(user => {
            if (user.age >= 18 && user.age <= 25) ageRanges['18-25']++;
            else if (user.age <= 35) ageRanges['26-35']++;
            else if (user.age <= 45) ageRanges['36-45']++;
            else ageRanges['46+']++;
        });
        
        this.ageChart.data = {
            labels: Object.keys(ageRanges),
            datasets: [{
                label: 'Numero di utenti',
                data: Object.values(ageRanges),
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 1
            }]
        };
        this.ageChart.update();
    }
    
    setupEventListeners() {
        // Pulsante refresh
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadData();
            this.showNotification('Dati aggiornati!');
        });
        
        // Ricerca
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.filterUsers();
        });
        
        // Paginazione
        document.getElementById('prevBtn').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.updateTable();
            }
        });
        
        document.getElementById('nextBtn').addEventListener('click', () => {
            const totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.updateTable();
            }
        });
    }
    
    filterUsers() {
        if (!this.searchTerm) {
            this.filteredUsers = [...this.users];
        } else {
            this.filteredUsers = this.users.filter(user =>
                user.name.toLowerCase().includes(this.searchTerm) ||
                user.email.toLowerCase().includes(this.searchTerm) ||
                user.city.toLowerCase().includes(this.searchTerm)
            );
        }
        
        this.currentPage = 1;
        this.updateTable();
    }
    
    showLoading() {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = `
            <tr class="loading-row">
                <td colspan="7">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i> Caricamento dati...
                    </div>
                </td>
            </tr>
        `;
        
        // Mostra loading sulle card
        document.querySelectorAll('.stat-card').forEach(card => {
            card.classList.add('loading');
        });
    }
    
    hideLoading() {
        // Niente da fare qui, il loading viene rimosso automaticamente
    }
    
    updateLastUpdate() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('it-IT', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('lastUpdate').textContent = 
            `Ultimo aggiornamento: ${timeString}`;
    }
    
    showError(message) {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #ef4444;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    ${message}
                </td>
            </tr>
        `;
    }
    
    showNotification(message) {
        // Crea una notifica temporanea
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <i class="fas fa-check-circle" style="margin-right: 10px;"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        // Rimuovi dopo 3 secondi
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Aggiungi stili CSS per le animazioni
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .city-badge {
        display: inline-block;
        padding: 4px 12px;
        background: rgba(102, 126, 234, 0.1);
        color: #667eea;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
    }
`;
document.head.appendChild(style);

// Avvia l'app quando la pagina è caricata
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new UserDashboard();
});