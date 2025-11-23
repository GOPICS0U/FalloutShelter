import React, { useState, useEffect } from 'react';
import { Users, Home, Wrench, Heart, Zap, Shield, Brain, Target, Baby, Trash2, Edit2, Plus, Search, Filter, AlertTriangle } from 'lucide-react';

const FalloutShelterManager = () => {
  const [residents, setResidents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [activeTab, setActiveTab] = useState('residents');
  const [showAddResident, setShowAddResident] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJob, setFilterJob] = useState('all');

  const [newResident, setNewResident] = useState({
    name: '',
    level: 1,
    health: 100,
    happiness: 50,
    job: 'unemployed',
    assignedRoom: '',
    stats: {
      strength: 1,
      perception: 1,
      endurance: 1,
      charisma: 1,
      intelligence: 1,
      agility: 1,
      luck: 1
    },
    outfit: 'Vault Suit',
    weapon: 'None',
    pregnant: false,
    notes: ''
  });

  const [newRoom, setNewRoom] = useState({
    name: '',
    type: 'power',
    level: 1,
    workers: 0,
    maxWorkers: 2,
    production: 0,
    upgrading: false
  });

  const roomTypes = [
    { id: 'power', name: 'Centrale électrique', icon: Zap, stat: 'strength', color: 'yellow' },
    { id: 'water', name: 'Traitement eau', icon: Home, stat: 'perception', color: 'blue' },
    { id: 'food', name: 'Restaurant', icon: Target, stat: 'agility', color: 'green' },
    { id: 'medbay', name: 'Infirmerie', icon: Heart, stat: 'intelligence', color: 'red' },
    { id: 'science', name: 'Labo', icon: Brain, stat: 'intelligence', color: 'purple' },
    { id: 'training', name: 'Entraînement', icon: Shield, stat: 'endurance', color: 'orange' },
    { id: 'living', name: 'Quartiers', icon: Users, stat: 'charisma', color: 'pink' },
    { id: 'storage', name: 'Stockage', icon: Wrench, stat: 'endurance', color: 'gray' }
  ];

  const jobs = ['unemployed', 'power', 'water', 'food', 'medbay', 'science', 'training', 'exploring', 'guard'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const residentsData = await window.storage.get('fallout-residents');
      const roomsData = await window.storage.get('fallout-rooms');
      
      if (residentsData) setResidents(JSON.parse(residentsData.value));
      if (roomsData) setRooms(JSON.parse(roomsData.value));
    } catch (error) {
      console.log('Nouvelles données');
    }
  };

  const saveData = async (newResidents, newRooms) => {
    try {
      await window.storage.set('fallout-residents', JSON.stringify(newResidents || residents));
      await window.storage.set('fallout-rooms', JSON.stringify(newRooms || rooms));
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };

  const addResident = () => {
    if (!newResident.name) return;
    
    const resident = {
      ...newResident,
      id: Date.now().toString(),
      addedDate: new Date().toLocaleDateString()
    };
    
    const updated = [...residents, resident];
    setResidents(updated);
    saveData(updated, rooms);
    setNewResident({
      name: '',
      level: 1,
      health: 100,
      happiness: 50,
      job: 'unemployed',
      assignedRoom: '',
      stats: { strength: 1, perception: 1, endurance: 1, charisma: 1, intelligence: 1, agility: 1, luck: 1 },
      outfit: 'Vault Suit',
      weapon: 'None',
      pregnant: false,
      notes: ''
    });
    setShowAddResident(false);
  };

  const deleteResident = (id) => {
    const updated = residents.filter(r => r.id !== id);
    setResidents(updated);
    saveData(updated, rooms);
  };

  const updateResident = (id, updates) => {
    const updated = residents.map(r => r.id === id ? { ...r, ...updates } : r);
    setResidents(updated);
    saveData(updated, rooms);
  };

  const addRoom = () => {
    if (!newRoom.name) return;
    
    const room = {
      ...newRoom,
      id: Date.now().toString()
    };
    
    const updated = [...rooms, room];
    setRooms(updated);
    saveData(residents, updated);
    setNewRoom({
      name: '',
      type: 'power',
      level: 1,
      workers: 0,
      maxWorkers: 2,
      production: 0,
      upgrading: false
    });
    setShowAddRoom(false);
  };

  const deleteRoom = (id) => {
    const updated = rooms.filter(r => r.id !== id);
    setRooms(updated);
    saveData(residents, updated);
  };

  const getStats = () => {
    const totalResidents = residents.length;
    const avgLevel = residents.length ? (residents.reduce((sum, r) => sum + r.level, 0) / residents.length).toFixed(1) : 0;
    const avgHappiness = residents.length ? (residents.reduce((sum, r) => sum + r.happiness, 0) / residents.length).toFixed(1) : 0;
    const pregnant = residents.filter(r => r.pregnant).length;
    const unemployed = residents.filter(r => r.job === 'unemployed').length;
    
    return { totalResidents, avgLevel, avgHappiness, pregnant, unemployed };
  };

  const stats = getStats();

  const filteredResidents = residents.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJob = filterJob === 'all' || r.job === filterJob;
    return matchesSearch && matchesJob;
  });

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className={`bg-gray-800 border-2 border-${color}-500 rounded-lg p-4 flex items-center space-x-3`}>
      <Icon className={`text-${color}-400`} size={32} />
      <div>
        <div className="text-gray-400 text-sm">{label}</div>
        <div className="text-2xl font-bold text-white">{value}</div>
      </div>
    </div>
  );

  const StatBar = ({ label, value, max = 10, color = 'blue' }) => (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-bold">{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className={`bg-${color}-500 h-2 rounded-full transition-all`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 text-yellow-400" style={{ fontFamily: 'monospace' }}>
            VAULT-TEC
          </h1>
          <p className="text-xl text-blue-300">Gestionnaire d'Abri Fallout Shelter</p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard icon={Users} label="Résidents" value={stats.totalResidents} color="blue" />
          <StatCard icon={Target} label="Niveau Moy." value={stats.avgLevel} color="green" />
          <StatCard icon={Heart} label="Bonheur Moy." value={`${stats.avgHappiness}%`} color="red" />
          <StatCard icon={Baby} label="Enceintes" value={stats.pregnant} color="pink" />
          <StatCard icon={AlertTriangle} label="Sans emploi" value={stats.unemployed} color="yellow" />
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6 border-b-2 border-gray-700">
          <button
            onClick={() => setActiveTab('residents')}
            className={`px-6 py-3 font-bold transition-all ${
              activeTab === 'residents' 
                ? 'bg-blue-600 text-white border-b-4 border-yellow-400' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Users className="inline mr-2" size={20} />
            Résidents
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-6 py-3 font-bold transition-all ${
              activeTab === 'rooms' 
                ? 'bg-blue-600 text-white border-b-4 border-yellow-400' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Home className="inline mr-2" size={20} />
            Salles
          </button>
        </div>

        {/* Residents Tab */}
        {activeTab === 'residents' && (
          <div>
            {/* Filters & Add Button */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4 flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Rechercher un résident..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white"
                />
              </div>
              <select
                value={filterJob}
                onChange={(e) => setFilterJob(e.target.value)}
                className="px-4 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white"
              >
                <option value="all">Tous les emplois</option>
                {jobs.map(job => (
                  <option key={job} value={job}>{job}</option>
                ))}
              </select>
              <button
                onClick={() => setShowAddResident(true)}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded font-bold flex items-center"
              >
                <Plus className="mr-2" size={20} />
                Ajouter Résident
              </button>
            </div>

            {/* Add Resident Modal */}
            {showAddResident && (
              <div className="bg-gray-800 border-4 border-yellow-400 rounded-lg p-6 mb-4">
                <h3 className="text-2xl font-bold mb-4 text-yellow-400">Nouveau Résident</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nom"
                    value={newResident.name}
                    onChange={(e) => setNewResident({...newResident, name: e.target.value})}
                    className="px-4 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white"
                  />
                  <input
                    type="number"
                    placeholder="Niveau"
                    value={newResident.level}
                    onChange={(e) => setNewResident({...newResident, level: parseInt(e.target.value) || 1})}
                    className="px-4 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white"
                  />
                  <select
                    value={newResident.job}
                    onChange={(e) => setNewResident({...newResident, job: e.target.value})}
                    className="px-4 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white"
                  >
                    {jobs.map(job => (
                      <option key={job} value={job}>{job}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Tenue"
                    value={newResident.outfit}
                    onChange={(e) => setNewResident({...newResident, outfit: e.target.value})}
                    className="px-4 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white"
                  />
                  <input
                    type="text"
                    placeholder="Arme"
                    value={newResident.weapon}
                    onChange={(e) => setNewResident({...newResident, weapon: e.target.value})}
                    className="px-4 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newResident.pregnant}
                      onChange={(e) => setNewResident({...newResident, pregnant: e.target.checked})}
                      className="w-5 h-5"
                    />
                    <label className="text-white">Enceinte</label>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-lg font-bold mb-2 text-blue-400">S.P.E.C.I.A.L.</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.keys(newResident.stats).map(stat => (
                      <div key={stat}>
                        <label className="text-sm text-gray-400 capitalize">{stat}</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={newResident.stats[stat]}
                          onChange={(e) => setNewResident({
                            ...newResident,
                            stats: {...newResident.stats, [stat]: parseInt(e.target.value) || 1}
                          })}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <textarea
                  placeholder="Notes..."
                  value={newResident.notes}
                  onChange={(e) => setNewResident({...newResident, notes: e.target.value})}
                  className="w-full mt-4 px-4 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white"
                  rows="3"
                />

                <div className="flex space-x-4 mt-4">
                  <button
                    onClick={addResident}
                    className="flex-1 px-6 py-2 bg-green-600 hover:bg-green-700 rounded font-bold"
                  >
                    Ajouter
                  </button>
                  <button
                    onClick={() => setShowAddResident(false)}
                    className="flex-1 px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded font-bold"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Residents List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResidents.map(resident => (
                <div key={resident.id} className="bg-gray-800 border-2 border-blue-500 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-yellow-400">{resident.name}</h3>
                      <p className="text-sm text-gray-400">Niveau {resident.level} • {resident.job}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingResident(resident)}
                        className="p-1 bg-blue-600 hover:bg-blue-700 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteResident(resident.id)}
                        className="p-1 bg-red-600 hover:bg-red-700 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Santé:</span>
                      <span className="text-red-400 font-bold">{resident.health}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Bonheur:</span>
                      <span className="text-yellow-400 font-bold">{resident.happiness}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Tenue:</span>
                      <span className="text-white">{resident.outfit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Arme:</span>
                      <span className="text-white">{resident.weapon}</span>
                    </div>
                    {resident.pregnant && (
                      <div className="text-sm text-pink-400 font-bold">
                        <Baby className="inline mr-1" size={14} />
                        Enceinte
                      </div>
                    )}
                  </div>

                  <div className="text-xs">
                    <div className="grid grid-cols-4 gap-1">
                      {Object.entries(resident.stats).map(([stat, value]) => (
                        <div key={stat} className="text-center bg-gray-700 rounded p-1">
                          <div className="text-gray-400 uppercase text-[10px]">{stat[0]}</div>
                          <div className="text-white font-bold">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {resident.notes && (
                    <div className="mt-3 text-xs text-gray-400 italic">
                      {resident.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div>
            <div className="mb-4">
              <button
                onClick={() => setShowAddRoom(true)}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded font-bold flex items-center"
              >
                <Plus className="mr-2" size={20} />
                Ajouter Salle
              </button>
            </div>

            {/* Add Room Modal */}
            {showAddRoom && (
              <div className="bg-gray-800 border-4 border-yellow-400 rounded-lg p-6 mb-4">
                <h3 className="text-2xl font-bold mb-4 text-yellow-400">Nouvelle Salle</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nom de la salle"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                    className="px-4 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white"
                  />
                  <select
                    value={newRoom.type}
                    onChange={(e) => setNewRoom({...newRoom, type: e.target.value})}
                    className="px-4 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white"
                  >
                    {roomTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Niveau"
                    value={newRoom.level}
                    onChange={(e) => setNewRoom({...newRoom, level: parseInt(e.target.value) || 1})}
                    className="px-4 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white"
                  />
                  <input
                    type="number"
                    placeholder="Travailleurs max"
                    value={newRoom.maxWorkers}
                    onChange={(e) => setNewRoom({...newRoom, maxWorkers: parseInt(e.target.value) || 2})}
                    className="px-4 py-2 bg-gray-700 border-2 border-gray-600 rounded text-white"
                  />
                </div>
                <div className="flex space-x-4 mt-4">
                  <button
                    onClick={addRoom}
                    className="flex-1 px-6 py-2 bg-green-600 hover:bg-green-700 rounded font-bold"
                  >
                    Ajouter
                  </button>
                  <button
                    onClick={() => setShowAddRoom(false)}
                    className="flex-1 px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded font-bold"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Rooms List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map(room => {
                const roomType = roomTypes.find(t => t.id === room.type);
                const Icon = roomType?.icon || Home;
                return (
                  <div key={room.id} className={`bg-gray-800 border-2 border-${roomType?.color}-500 rounded-lg p-4`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <Icon className={`text-${roomType?.color}-400`} size={24} />
                        <div>
                          <h3 className="text-xl font-bold text-white">{room.name}</h3>
                          <p className="text-sm text-gray-400">{roomType?.name} Niv.{room.level}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteRoom(room.id)}
                        className="p-1 bg-red-600 hover:bg-red-700 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Travailleurs:</span>
                        <span className="text-white font-bold">{room.workers}/{room.maxWorkers}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Production:</span>
                        <span className="text-green-400 font-bold">{room.production}</span>
                      </div>
                      {room.upgrading && (
                        <div className="text-sm text-yellow-400 font-bold">
                          ⚙️ En amélioration
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FalloutShelterManager;