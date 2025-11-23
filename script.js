// Global variables
let residents = [];
let rooms = [];
let resources = {};
let events = [];
let vaultName = "Mon Abri";
let editingResidentId = null;
let editingRoomId = null;
let selectedFatherId = null;
let selectedMotherId = null;

// Initialize on load
window.onload = function() {
    loadData();
    updateStats();
    renderResidents();
    renderRooms();
    renderGenealogy();
    renderEvents();
    loadResources();
    document.getElementById('vault-name').value = vaultName;
};

// Data management
function loadData() {
    const savedResidents = localStorage.getItem('fallout-residents');
    const savedRooms = localStorage.getItem('fallout-rooms');
    const savedResources = localStorage.getItem('fallout-resources');
    const savedEvents = localStorage.getItem('fallout-events');
    const savedVaultName = localStorage.getItem('fallout-vault-name');
    
    if (savedResidents) residents = JSON.parse(savedResidents);
    if (savedRooms) rooms = JSON.parse(savedRooms);
    if (savedResources) resources = JSON.parse(savedResources);
    if (savedEvents) events = JSON.parse(savedEvents);
    if (savedVaultName) vaultName = savedVaultName;
    
    // Initialize resources if empty
    if (!resources.power) {
        resources = {
            power: 100,
            water: 100,
            food: 100,
            caps: 500,
            radx: 10,
            stim: 20
        };
    }
}

function saveData() {
    localStorage.setItem('fallout-residents', JSON.stringify(residents));
    localStorage.setItem('fallout-rooms', JSON.stringify(rooms));
    localStorage.setItem('fallout-resources', JSON.stringify(resources));
    localStorage.setItem('fallout-events', JSON.stringify(events));
    localStorage.setItem('fallout-vault-name', vaultName);
}

function saveVaultName() {
    vaultName = document.getElementById('vault-name').value;
    saveData();
    alert('Nom de l\'abri sauvegardé !');
}

// Tab management
function switchTab(tab) {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    
    const tabButtons = Array.from(tabs);
    const tabContents = ['residents', 'rooms', 'genealogy', 'resources', 'events'];
    const index = tabContents.indexOf(tab);
    
    if (index !== -1) {
        tabButtons[index].classList.add('active');
        document.getElementById(tab + '-tab').classList.add('active');
        
        if (tab === 'genealogy') renderGenealogy();
        if (tab === 'events') renderEvents();
    }
}

// Statistics
function updateStats() {
    const total = residents.length;
    const avgLevel = total ? (residents.reduce((sum, r) => sum + r.level, 0) / total).toFixed(1) : 0;
    const avgHappiness = total ? (residents.reduce((sum, r) => sum + r.happiness, 0) / total).toFixed(1) : 0;
    const children = residents.filter(r => r.age && r.age < 18).length;
    const unemployed = residents.filter(r => r.job === 'unemployed').length;
    
    document.getElementById('stat-residents').textContent = total;
    document.getElementById('stat-level').textContent = avgLevel;
    document.getElementById('stat-happiness').textContent = avgHappiness + '%';
    document.getElementById('stat-children').textContent = children;
    document.getElementById('stat-unemployed').textContent = unemployed;
    document.getElementById('stat-rooms').textContent = rooms.length;
}

// RESIDENTS FUNCTIONS
function showAddResidentModal() {
    editingResidentId = null;
    document.getElementById('resident-modal-title').textContent = 'Nouveau Résident';
    resetResidentForm();
    populateRoomSelect();
    document.getElementById('resident-modal').classList.add('show');
}

function showEditResidentModal(id) {
    editingResidentId = id;
    const resident = residents.find(r => r.id === id);
    if (!resident) return;
    
    document.getElementById('resident-modal-title').textContent = 'Modifier Résident';
    document.getElementById('resident-name').value = resident.name;
    document.getElementById('resident-gender').value = resident.gender;
    document.getElementById('resident-age').value = resident.age || 25;
    document.getElementById('resident-level').value = resident.level;
    document.getElementById('resident-health').value = resident.health;
    document.getElementById('resident-happiness').value = resident.happiness;
    document.getElementById('resident-job').value = resident.job;
    document.getElementById('resident-outfit').value = resident.outfit;
    document.getElementById('resident-weapon').value = resident.weapon;
    document.getElementById('resident-weapon-damage').value = resident.weaponDamage || 0;
    document.getElementById('resident-pregnant').checked = resident.pregnant || false;
    document.getElementById('resident-notes').value = resident.notes || '';
    
    document.getElementById('stat-strength').value = resident.stats.strength;
    document.getElementById('stat-perception').value = resident.stats.perception;
    document.getElementById('stat-endurance').value = resident.stats.endurance;
    document.getElementById('stat-charisma').value = resident.stats.charisma;
    document.getElementById('stat-intelligence').value = resident.stats.intelligence;
    document.getElementById('stat-agility').value = resident.stats.agility;
    document.getElementById('stat-luck').value = resident.stats.luck;
    
    populateRoomSelect();
    if (resident.assignedRoom) {
        document.getElementById('resident-room').value = resident.assignedRoom;
    }
    
    document.getElementById('resident-modal').classList.add('show');
}

function populateRoomSelect() {
    const select = document.getElementById('resident-room');
    select.innerHTML = '<option value="">Aucune salle</option>';
    rooms.forEach(room => {
        select.innerHTML += `<option value="${room.id}">${room.name}</option>`;
    });
}

function closeResidentModal() {
    document.getElementById('resident-modal').classList.remove('show');
    editingResidentId = null;
}

function resetResidentForm() {
    document.getElementById('resident-name').value = '';
    document.getElementById('resident-gender').value = 'male';
    document.getElementById('resident-age').value = '25';
    document.getElementById('resident-level').value = '1';
    document.getElementById('resident-health').value = '100';
    document.getElementById('resident-happiness').value = '50';
    document.getElementById('resident-job').value = 'unemployed';
    document.getElementById('resident-outfit').value = 'Vault Suit';
    document.getElementById('resident-weapon').value = 'Aucune';
    document.getElementById('resident-weapon-damage').value = '0';
    document.getElementById('resident-pregnant').checked = false;
    document.getElementById('stat-strength').value = '1';
    document.getElementById('stat-perception').value = '1';
    document.getElementById('stat-endurance').value = '1';
    document.getElementById('stat-charisma').value = '1';
    document.getElementById('stat-intelligence').value = '1';
    document.getElementById('stat-agility').value = '1';
    document.getElementById('stat-luck').value = '1';
    document.getElementById('resident-notes').value = '';
}

function saveResident() {
    const name = document.getElementById('resident-name').value.trim();
    if (!name) {
        alert('Le nom est obligatoire !');
        return;
    }
    
    const residentData = {
        name: name,
        gender: document.getElementById('resident-gender').value,
        age: parseInt(document.getElementById('resident-age').value) || 25,
        level: parseInt(document.getElementById('resident-level').value),
        health: parseInt(document.getElementById('resident-health').value),
        happiness: parseInt(document.getElementById('resident-happiness').value),
        job: document.getElementById('resident-job').value,
        assignedRoom: document.getElementById('resident-room').value,
        outfit: document.getElementById('resident-outfit').value,
        weapon: document.getElementById('resident-weapon').value,
        weaponDamage: parseInt(document.getElementById('resident-weapon-damage').value) || 0,
        pregnant: document.getElementById('resident-pregnant').checked,
        stats: {
            strength: parseInt(document.getElementById('stat-strength').value),
            perception: parseInt(document.getElementById('stat-perception').value),
            endurance: parseInt(document.getElementById('stat-endurance').value),
            charisma: parseInt(document.getElementById('stat-charisma').value),
            intelligence: parseInt(document.getElementById('stat-intelligence').value),
            agility: parseInt(document.getElementById('stat-agility').value),
            luck: parseInt(document.getElementById('stat-luck').value)
        },
        notes: document.getElementById('resident-notes').value
    };
    
    if (editingResidentId) {
        const index = residents.findIndex(r => r.id === editingResidentId);
        if (index !== -1) {
            residents[index] = { ...residents[index], ...residentData };
            addEvent('custom', `${name} a été modifié(e)`, editingResidentId);
        }
    } else {
        const resident = {
            ...residentData,
            id: Date.now().toString(),
            addedDate: new Date().toLocaleDateString(),
            parentIds: null,
            childrenIds: []
        };
        residents.push(resident);
        addEvent('custom', `${name} a rejoint l'abri !`, resident.id);
    }
    
    saveData();
    updateStats();
    renderResidents();
    closeResidentModal();
}

function deleteResident(id) {
    const resident = residents.find(r => r.id === id);
    if (!resident) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${resident.name} ?`)) {
        residents = residents.filter(r => r.id !== id);
        addEvent('death', `${resident.name} a quitté l'abri`, null);
        saveData();
        updateStats();
        renderResidents();
        renderGenealogy();
    }
}

function filterResidents() {
    renderResidents();
}

function renderResidents() {
    const search = document.getElementById('search-resident').value.toLowerCase();
    const jobFilter = document.getElementById('filter-job').value;
    const sort = document.getElementById('sort-residents').value;
    
    let filtered = residents.filter(r => {
        const matchSearch = r.name.toLowerCase().includes(search);
        const matchJob = jobFilter === 'all' || r.job === jobFilter;
        return matchSearch && matchJob;
    });
    
    filtered.sort((a, b) => {
        if (sort === 'name') return a.name.localeCompare(b.name);
        if (sort === 'level') return b.level - a.level;
        if (sort === 'happiness') return b.happiness - a.happiness;
        if (sort === 'recent') return new Date(b.addedDate) - new Date(a.addedDate);
        return 0;
    });
    
    const list = document.getElementById('residents-list');
    list.innerHTML = '';
    
    filtered.forEach(resident => {
        const assignedRoom = rooms.find(r => r.id === resident.assignedRoom);
        const totalStats = Object.values(resident.stats).reduce((sum, val) => sum + val, 0);
        
        const card = document.createElement('div');
        card.className = 'card resident';
        card.innerHTML = `
            <div class="card-header">
                <div>
                    <div class="card-title">${resident.gender === 'male' ? '👨' : '👩'} ${resident.name}</div>
                    <div class="card-subtitle">Niveau ${resident.level} • ${resident.age} ans • ${resident.job}</div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-edit" onclick="showEditResidentModal('${resident.id}')">✏️</button>
                    <button class="btn btn-danger" onclick="deleteResident('${resident.id}')">🗑️</button>
                </div>
            </div>
            <div class="card-info">
                <div class="info-row">
                    <span class="info-label">Santé:</span>
                    <span class="info-value" style="color: #f44336">${resident.health}/100 HP</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Bonheur:</span>
                    <span class="info-value" style="color: #ffc107">${resident.happiness}%</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Tenue:</span>
                    <span class="info-value">${resident.outfit}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Arme:</span>
                    <span class="info-value">${resident.weapon} ${resident.weaponDamage > 0 ? `(${resident.weaponDamage} dmg)` : ''}</span>
                </div>
                ${assignedRoom ? `<div class="info-row">
                    <span class="info-label">Salle:</span>
                    <span class="info-value">${assignedRoom.name}</span>
                </div>` : ''}
                <div class="info-row">
                    <span class="info-label">Total SPECIAL:</span>
                    <span class="info-value" style="color: #4caf50">${totalStats}</span>
                </div>
                ${resident.pregnant ? '<div class="badge">👶 Enceinte</div>' : ''}
                ${resident.parentIds ? '<div class="badge" style="background: #9c27b0;">👨‍👩‍👧 A des parents</div>' : ''}
                ${resident.childrenIds && resident.childrenIds.length > 0 ? `<div class="badge" style="background: #ff9800;">👶 ${resident.childrenIds.length} enfant(s)</div>` : ''}
            </div>
            <div class="stats-mini-grid">
                <div class="stat-mini">
                    <div class="stat-mini-label">S</div>
                    <div class="stat-mini-value">${resident.stats.strength}</div>
                </div>
                <div class="stat-mini">
                    <div class="stat-mini-label">P</div>
                    <div class="stat-mini-value">${resident.stats.perception}</div>
                </div>
                <div class="stat-mini">
                    <div class="stat-mini-label">E</div>
                    <div class="stat-mini-value">${resident.stats.endurance}</div>
                </div>
                <div class="stat-mini">
                    <div class="stat-mini-label">C</div>
                    <div class="stat-mini-value">${resident.stats.charisma}</div>
                </div>
                <div class="stat-mini">
                    <div class="stat-mini-label">I</div>
                    <div class="stat-mini-value">${resident.stats.intelligence}</div>
                </div>
                <div class="stat-mini">
                    <div class="stat-mini-label">A</div>
                    <div class="stat-mini-value">${resident.stats.agility}</div>
                </div>
                <div class="stat-mini">
                    <div class="stat-mini-label">L</div>
                    <div class="stat-mini-value">${resident.stats.luck}</div>
                </div>
            </div>
            ${resident.notes ? `<div class="notes">📝 ${resident.notes}</div>` : ''}
        `;
        list.appendChild(card);
    });
}

// ROOMS FUNCTIONS
function showAddRoomModal() {
    editingRoomId = null;
    document.getElementById('room-modal-title').textContent = 'Nouvelle Salle';
    resetRoomForm();
    document.getElementById('room-modal').classList.add('show');
}

function showEditRoomModal(id) {
    editingRoomId = id;
    const room = rooms.find(r => r.id === id);
    if (!room) return;
    
    document.getElementById('room-modal-title').textContent = 'Modifier Salle';
    document.getElementById('room-name').value = room.name;
    document.getElementById('room-type').value = room.type;
    document.getElementById('room-level').value = room.level;
    document.getElementById('room-max-workers').value = room.maxWorkers;
    
    document.getElementById('room-modal').classList.add('show');
}

function closeRoomModal() {
    document.getElementById('room-modal').classList.remove('show');
    editingRoomId = null;
}

function resetRoomForm() {
    document.getElementById('room-name').value = '';
    document.getElementById('room-type').value = 'power';
    document.getElementById('room-level').value = '1';
    document.getElementById('room-max-workers').value = '2';
}

function saveRoom() {
    const name = document.getElementById('room-name').value.trim();
    if (!name) {
        alert('Le nom de la salle est obligatoire !');
        return;
    }
    
    const roomData = {
        name: name,
        type: document.getElementById('room-type').value,
        level: parseInt(document.getElementById('room-level').value),
        maxWorkers: parseInt(document.getElementById('room-max-workers').value)
    };
    
    if (editingRoomId) {
        const index = rooms.findIndex(r => r.id === editingRoomId);
        if (index !== -1) {
            rooms[index] = { ...rooms[index], ...roomData };
        }
    } else {
        const room = {
            ...roomData,
            id: Date.now().toString(),
            workers: 0,
            production: 0
        };
        rooms.push(room);
        addEvent('custom', `Nouvelle salle construite: ${name}`, null);
    }
    
    saveData();
    updateStats();
    renderRooms();
    closeRoomModal();
}

function deleteRoom(id) {
    const room = rooms.find(r => r.id === id);
    if (!room) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${room.name} ?`)) {
        rooms = rooms.filter(r => r.id !== id);
        residents.forEach(r => {
            if (r.assignedRoom === id) r.assignedRoom = '';
        });
        saveData();
        updateStats();
        renderRooms();
        renderResidents();
    }
}

function filterRooms() {
    renderRooms();
}

function renderRooms() {
    const typeFilter = document.getElementById('filter-room-type').value;
    
    let filtered = rooms.filter(r => {
        return typeFilter === 'all' || r.type === typeFilter;
    });
    
    const list = document.getElementById('rooms-list');
    list.innerHTML = '';
    
    const roomTypeEmojis = {
        power: '⚡',
        water: '💧',
        food: '🍽️',
        medbay: '❤️',
        science: '🧪',
        training: '💪',
        living: '🛏️',
        storage: '📦'
    };
    
    const roomTypeNames = {
        power: 'Centrale électrique',
        water: 'Traitement eau',
        food: 'Restaurant',
        medbay: 'Infirmerie',
        science: 'Laboratoire',
        training: 'Entraînement',
        living: 'Quartiers',
        storage: 'Stockage'
    };
    
    filtered.forEach(room => {
        const assignedResidents = residents.filter(r => r.assignedRoom === room.id);
        
        const card = document.createElement('div');
        card.className = 'card room';
        card.innerHTML = `
            <div class="card-header">
                <div>
                    <div class="card-title">${roomTypeEmojis[room.type]} ${room.name}</div>
                    <div class="card-subtitle">${roomTypeNames[room.type]} • Niveau ${room.level}</div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-edit" onclick="showEditRoomModal('${room.id}')">✏️</button>
                    <button class="btn btn-danger" onclick="deleteRoom('${room.id}')">🗑️</button>
                </div>
            </div>
            <div class="card-info">
                <div class="info-row">
                    <span class="info-label">Travailleurs:</span>
                    <span class="info-value">${assignedResidents.length}/${room.maxWorkers}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Capacité:</span>
                    <span class="info-value" style="color: ${assignedResidents.length >= room.maxWorkers ? '#f44336' : '#4caf50'}">${assignedResidents.length >= room.maxWorkers ? 'Pleine' : 'Disponible'}</span>
                </div>
                ${assignedResidents.length > 0 ? `
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #616161;">
                        <div style="color: #64b5f6; margin-bottom: 8px; font-size: 0.9em;">👥 Résidents assignés:</div>
                        ${assignedResidents.map(r => `<div style="color: #9e9e9e; font-size: 0.85em;">• ${r.name} (Niv.${r.level})</div>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        list.appendChild(card);
    });
}

// GENEALOGY FUNCTIONS
function updateParentSelection() {
    selectedFatherId = document.getElementById('select-father').value;
    selectedMotherId = document.getElementById('select-mother').value;
    
    const preview = document.getElementById('parents-preview');
    const fatherInfo = document.getElementById('father-info');
    const motherInfo = document.getElementById('mother-info');
    
    if (selectedFatherId && selectedMotherId) {
        const father = residents.find(r => r.id === selectedFatherId);
        const mother = residents.find(r => r.id === selectedMotherId);
        
        fatherInfo.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 2em;">👨</div>
                <div style="font-weight: bold; color: #2196f3;">${father.name}</div>
                <div style="color: #9e9e9e; font-size: 0.9em;">Niveau ${father.level}</div>
            </div>
        `;
        
        motherInfo.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 2em;">👩</div>
                <div style="font-weight: bold; color: #e91e63;">${mother.name}</div>
                <div style="color: #9e9e9e; font-size: 0.9em;">Niveau ${mother.level}</div>
            </div>
        `;
        
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }
    
    populateParentSelects();
}

function populateParentSelects() {
    const fatherSelect = document.getElementById('select-father');
    const motherSelect = document.getElementById('select-mother');
    
    const males = residents.filter(r => r.gender === 'male');
    const females = residents.filter(r => r.gender === 'female');
    
    const currentFather = fatherSelect.value;
    const currentMother = motherSelect.value;
    
    fatherSelect.innerHTML = '<option value="">Sélectionner...</option>';
    males.forEach(m => {
        fatherSelect.innerHTML += `<option value="${m.id}" ${m.id === currentFather ? 'selected' : ''}>${m.name} (Niv.${m.level})</option>`;
    });
    
    motherSelect.innerHTML = '<option value="">Sélectionner...</option>';
    females.forEach(f => {
        motherSelect.innerHTML += `<option value="${f.id}" ${f.id === currentMother ? 'selected' : ''}>${f.name} (Niv.${f.level})</option>`;
    });
}

function showAddChildModal() {
    if (!selectedFatherId || !selectedMotherId) {
        alert('Veuillez d\'abord sélectionner un père et une mère !');
        return;
    }
    
    const father = residents.find(r => r.id === selectedFatherId);
    const mother = residents.find(r => r.id === selectedMotherId);
    
    document.getElementById('child-parents-display').textContent = `${father.name} et ${mother.name}`;
    document.getElementById('add-child-modal').classList.add('show');
}

function hideAddChildModal() {
    document.getElementById('add-child-modal').classList.remove('show');
    document.getElementById('child-name').value = '';
    document.getElementById('child-gender').value = 'male';
}

function createChild() {
    const childName = document.getElementById('child-name').value.trim();
    const childGender = document.getElementById('child-gender').value;
    
    if (!childName) {
        alert('Le nom de l\'enfant est obligatoire !');
        return;
    }
    
    if (!selectedFatherId || !selectedMotherId) {
        alert('Les parents ne sont pas sélectionnés !');
        return;
    }
    
    const father = residents.find(r => r.id === selectedFatherId);
    const mother = residents.find(r => r.id === selectedMotherId);
    
    const child = {
        id: Date.now().toString(),
        name: childName,
        gender: childGender,
        age: 1,
        level: 1,
        health: 100,
        happiness: 100,
        job: 'unemployed',
        assignedRoom: '',
        outfit: 'Baby Clothes',
        weapon: 'Aucune',
        weaponDamage: 0,
        pregnant: false,
        stats: {
            strength: 1,
            perception: 1,
            endurance: 1,
            charisma: 1,
            intelligence: 1,
            agility: 1,
            luck: 1
        },
        notes: `Enfant de ${father.name} et ${mother.name}`,
        addedDate: new Date().toLocaleDateString(),
        parentIds: [selectedFatherId, selectedMotherId],
        childrenIds: []
    };
    
    residents.push(child);
    
    if (!father.childrenIds) father.childrenIds = [];
    if (!mother.childrenIds) mother.childrenIds = [];
    
    father.childrenIds.push(child.id);
    mother.childrenIds.push(child.id);
    
    addEvent('birth', `${childName} est né(e) ! Parents: ${father.name} et ${mother.name}`, child.id);
    
    saveData();
    updateStats();
    renderResidents();
    renderGenealogy();
    hideAddChildModal();
    
    alert(`${childName} est né(e) ! 🎉`);
}

function renderGenealogy() {
    populateParentSelects();
    
    const display = document.getElementById('genealogy-display');
    display.innerHTML = '';
    
    // Séparer les fondateurs (sans parents) et les descendants
    const founders = residents.filter(r => !r.parentIds || r.parentIds.length === 0);
    const descendants = residents.filter(r => r.parentIds && r.parentIds.length > 0);
    
    // Afficher la génération fondatrice
    if (founders.length > 0) {
        const foundersSection = document.createElement('div');
        foundersSection.style.marginBottom = '30px';
        foundersSection.innerHTML = `
            <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #ffd700; font-size: 1.3em; text-align: center;">
                    🏛️ Génération Fondatrice (${founders.length})
                </h3>
                <p style="text-align: center; color: #b0b0b0; margin: 5px 0 0 0; font-size: 0.9em;">
                    Premiers arrivants dans l'abri
                </p>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px;">
                ${founders.map(founder => `
                    <div class="founder-card" style="background: #2a2a2a; border: 2px solid #4a4a4a; border-radius: 8px; padding: 15px; text-align: center;">
                        <div style="font-size: 2.5em; margin-bottom: 8px;">${founder.gender === 'male' ? '👨' : '👩'}</div>
                        <div style="font-weight: bold; color: #fff; margin-bottom: 5px;">${founder.name}</div>
                        <div style="color: #9e9e9e; font-size: 0.85em;">Niveau ${founder.level}</div>
                        <div style="color: #9e9e9e; font-size: 0.85em;">${founder.age} ans</div>
                        ${founder.childrenIds && founder.childrenIds.length > 0 ? 
                            `<div style="margin-top: 8px; padding: 5px; background: #4caf50; border-radius: 5px; font-size: 0.8em;">
                                👶 ${founder.childrenIds.length} enfant(s)
                            </div>` : 
                            `<div style="margin-top: 8px; padding: 5px; background: #616161; border-radius: 5px; font-size: 0.8em;">
                                Pas d'enfants
                            </div>`
                        }
                    </div>
                `).join('')}
            </div>
        `;
        display.appendChild(foundersSection);
    }
    
    // Si aucun descendant, afficher un message
    if (descendants.length === 0) {
        const noDescendants = document.createElement('div');
        noDescendants.innerHTML = `
            <div class="no-families">
                <div class="no-families-icon">🌳</div>
                <p>Aucun descendant pour le moment</p>
                <p style="font-size: 0.9em; margin-top: 10px;">Sélectionnez un père et une mère ci-dessus, puis créez un enfant !</p>
            </div>
        `;
        display.appendChild(noDescendants);
        return;
    }
    
    // Organiser les descendants par génération
    const generationsMap = new Map();
    
    function getGeneration(resident, level = 1) {
        if (!generationsMap.has(level)) {
            generationsMap.set(level, []);
        }
        generationsMap.get(level).push(resident);
        
        // Récursif pour les enfants
        if (resident.childrenIds && resident.childrenIds.length > 0) {
            resident.childrenIds.forEach(childId => {
                const child = residents.find(r => r.id === childId);
                if (child) {
                    getGeneration(child, level + 1);
                }
            });
        }
    }
    
    // Construire la map des générations en partant de la première génération née
    const firstGeneration = descendants.filter(d => {
        const parents = d.parentIds ? d.parentIds.map(pid => residents.find(r => r.id === pid)) : [];
        return parents.every(p => p && (!p.parentIds || p.parentIds.length === 0));
    });
    
    firstGeneration.forEach(resident => getGeneration(resident, 1));
    
    // Afficher chaque génération
    const descendantsSection = document.createElement('div');
    descendantsSection.innerHTML = `
        <div style="background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #fff; font-size: 1.3em; text-align: center;">
                👨‍👩‍👧‍👦 Descendants (${descendants.length})
            </h3>
            <p style="text-align: center; color: #e0e0e0; margin: 5px 0 0 0; font-size: 0.9em;">
                Nés dans l'abri
            </p>
        </div>
    `;
    display.appendChild(descendantsSection);
    
    // Afficher les générations
    const sortedGenerations = Array.from(generationsMap.entries()).sort((a, b) => a[0] - b[0]);
    
    sortedGenerations.forEach(([genNum, genResidents]) => {
        // Éviter les doublons
        const uniqueResidents = genResidents.filter((r, index, self) => 
            index === self.findIndex(t => t.id === r.id)
        );
        
        const genDiv = document.createElement('div');
        genDiv.className = 'family-tree';
        genDiv.innerHTML = `
            <div class="family-header">
                <div class="family-name">
                    ${genNum === 1 ? '👶 1ère Génération' : 
                      genNum === 2 ? '👧 2ème Génération (Petits-enfants)' : 
                      genNum === 3 ? '🧒 3ème Génération (Arrière-petits-enfants)' : 
                      `👦 ${genNum}ème Génération`}
                </div>
                <div class="family-stats">${uniqueResidents.length} personne(s)</div>
            </div>
            
            <div class="generation">
                <div class="children-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 15px;">
                    ${uniqueResidents.map(resident => {
                        const parents = resident.parentIds ? 
                            resident.parentIds.map(pid => residents.find(r => r.id === pid)).filter(p => p) : [];
                        const parentNames = parents.map(p => p.name).join(' & ');
                        
                        return `
                            <div class="child-card" style="background: #2a2a2a; border: 2px solid #4caf50; border-radius: 8px; padding: 15px;">
                                <div style="font-size: 2em; margin-bottom: 8px;">
                                    ${resident.gender === 'male' ? '👦' : '👧'}
                                </div>
                                <div style="font-weight: bold; color: #fff; margin-bottom: 5px; font-size: 1.1em;">
                                    ${resident.name}
                                </div>
                                <div style="color: #9e9e9e; font-size: 0.85em; margin-bottom: 3px;">
                                    Niveau ${resident.level} • ${resident.age} ans
                                </div>
                                ${parentNames ? `
                                    <div style="margin-top: 8px; padding: 6px; background: rgba(156, 39, 176, 0.3); border-radius: 5px; font-size: 0.75em; color: #ce93d8;">
                                        👨‍👩‍👧 Parents: ${parentNames}
                                    </div>
                                ` : ''}
                                ${resident.childrenIds && resident.childrenIds.length > 0 ? `
                                    <div style="margin-top: 6px; padding: 6px; background: rgba(76, 175, 80, 0.3); border-radius: 5px; font-size: 0.75em; color: #4caf50;">
                                        👶 ${resident.childrenIds.length} enfant(s)
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        display.appendChild(genDiv);
    });
}

// RESOURCES FUNCTIONS
function loadResources() {
    document.getElementById('resource-power').value = resources.power || 100;
    document.getElementById('resource-water').value = resources.water || 100;
    document.getElementById('resource-food').value = resources.food || 100;
    document.getElementById('resource-caps').value = resources.caps || 500;
    document.getElementById('resource-radx').value = resources.radx || 10;
    document.getElementById('resource-stim').value = resources.stim || 20;
    
    updateResourceBars();
}

function saveResources() {
    resources.power = parseInt(document.getElementById('resource-power').value) || 0;
    resources.water = parseInt(document.getElementById('resource-water').value) || 0;
    resources.food = parseInt(document.getElementById('resource-food').value) || 0;
    resources.caps = parseInt(document.getElementById('resource-caps').value) || 0;
    resources.radx = parseInt(document.getElementById('resource-radx').value) || 0;
    resources.stim = parseInt(document.getElementById('resource-stim').value) || 0;
    
    saveData();
    updateResourceBars();
    alert('Ressources sauvegardées !');
}

function updateResourceBars() {
    const powerBar = document.querySelector('.resource-fill.power');
    const waterBar = document.querySelector('.resource-fill.water');
    const foodBar = document.querySelector('.resource-fill.food');
    
    if (powerBar) powerBar.style.width = Math.min(resources.power || 0, 100) + '%';
    if (waterBar) waterBar.style.width = Math.min(resources.water || 0, 100) + '%';
    if (foodBar) foodBar.style.width = Math.min(resources.food || 0, 100) + '%';
}

// EVENTS FUNCTIONS
function showAddEventModal() {
    document.getElementById('event-modal').classList.add('show');
    populateEventResidents();
}

function closeEventModal() {
    document.getElementById('event-modal').classList.remove('show');
    document.getElementById('event-type').value = 'incident';
    document.getElementById('event-description').value = '';
    document.getElementById('event-resident').value = '';
}

function populateEventResidents() {
    const select = document.getElementById('event-resident');
    select.innerHTML = '<option value="">Aucun</option>';
    residents.forEach(r => {
        select.innerHTML += `<option value="${r.id}">${r.name}</option>`;
    });
}

function saveEvent() {
    const type = document.getElementById('event-type').value;
    const description = document.getElementById('event-description').value.trim();
    const residentId = document.getElementById('event-resident').value;
    
    if (!description) {
        alert('La description est obligatoire !');
        return;
    }
    
    addEvent(type, description, residentId || null);
    closeEventModal();
    renderEvents();
}

function addEvent(type, description, residentId = null) {
    const event = {
        id: Date.now().toString(),
        type: type,
        description: description,
        residentId: residentId,
        timestamp: new Date().toLocaleString('fr-FR')
    };
    
    events.unshift(event);
    
    if (events.length > 100) {
        events = events.slice(0, 100);
    }
    
    saveData();
}

function deleteEvent(id) {
    if (confirm('Supprimer cet événement ?')) {
        events = events.filter(e => e.id !== id);
        saveData();
        renderEvents();
    }
}

function renderEvents() {
    const timeline = document.getElementById('events-timeline');
    
    if (events.length === 0) {
        timeline.innerHTML = `
            <div class="no-families">
                <div class="no-families-icon">⚡</div>
                <p>Aucun événement enregistré</p>
            </div>
        `;
        return;
    }
    
    const eventIcons = {
        incident: '🔥',
        attack: '⚔️',
        birth: '👶',
        death: '💀',
        'level-up': '⬆️',
        exploration: '🗺️',
        custom: '📝'
    };
    
    const eventColors = {
        incident: '#ff9800',
        attack: '#f44336',
        birth: '#4caf50',
        death: '#757575',
        'level-up': '#2196f3',
        exploration: '#9c27b0',
        custom: '#607d8b'
    };
    
    timeline.innerHTML = events.map(event => {
        const resident = event.residentId ? residents.find(r => r.id === event.residentId) : null;
        
        return `
            <div class="event-card" style="border-left: 4px solid ${eventColors[event.type] || '#607d8b'}">
                <div class="event-header">
                    <div>
                        <span class="event-icon">${eventIcons[event.type] || '📝'}</span>
                        <span class="event-time">${event.timestamp}</span>
                    </div>
                    <button class="btn btn-danger" onclick="deleteEvent('${event.id}')" style="padding: 5px 10px; font-size: 0.8em;">🗑️</button>
                </div>
                <div class="event-description">${event.description}</div>
                ${resident ? `<div class="event-resident">👤 ${resident.name}</div>` : ''}
            </div>
        `;
    }).join('');
}

// IMPORT/EXPORT FUNCTIONS
function exportJSON() {
    const data = {
        vaultName: vaultName,
        residents: residents,
        rooms: rooms,
        resources: resources,
        events: events,
        exportDate: new Date().toISOString()
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `fallout-shelter-${vaultName.replace(/\s+/g, '-')}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Données exportées avec succès !');
}

function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (confirm('Attention : L\'importation écrasera toutes vos données actuelles. Continuer ?')) {
                vaultName = data.vaultName || 'Mon Abri';
                residents = data.residents || [];
                rooms = data.rooms || [];
                resources = data.resources || {};
                events = data.events || [];
                
                saveData();
                updateStats();
                renderResidents();
                renderRooms();
                renderGenealogy();
                renderEvents();
                loadResources();
                
                document.getElementById('vault-name').value = vaultName;
                
                alert('Données importées avec succès !');
            }
        } catch (error) {
            alert('Erreur lors de l\'importation : fichier invalide');
            console.error(error);
        }
    };
    
    reader.readAsText(file);
    event.target.value = '';
}