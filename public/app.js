// Dati simulati per GitHub Pages
const mockData = {
    totalUsers: 1247,
    activeUsers: 956,
    newUsers: 128,
    avgAge: 34,
    users: [
        { id: 1, name: "Mario Rossi", email: "mario@example.com", age: 32, city: "Milano", status: "active" },
        { id: 2, name: "Laura Bianchi", email: "laura@example.com", age: 28, city: "Roma", status: "active" },
        { id: 3, name: "Giuseppe Verdi", email: "giuseppe@example.com", age: 45, city: "Napoli", status: "inactive" }
    ]
};

document.addEventListener('DOMContentLoaded', function() {
    // Popola statistiche
    document.getElementById('stats').innerHTML = `
        <div class="col-md-3">
            <div class="stat-card">
                <h3>${mockData.totalUsers}</h3>
                <p>Utenti Totali</p>
            </div>
        </div>
        <div class="col-md-3">
            <div class="stat-card">
                <h3>${mockData.activeUsers}</h3>
                <p>Utenti Attivi</p>
            </div>
        </div>
        <div class="col-md-3">
            <div class="stat-card">
                <h3>${mockData.newUsers}</h3>
                <p>Nuovi Utenti</p>
            </div>
        </div>
        <div class="col-md-3">
            <div class="stat-card">
                <h3>${mockData.avgAge}</h3>
                <p>Età Media</p>
            </div>
        </div>
    `;
});