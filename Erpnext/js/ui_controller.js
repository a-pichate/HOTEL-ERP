const ui = {
    async init() {
        await HotelEngine.init();
        this.render();
    },

    toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('collapsed');
    },

    switchTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        document.getElementById('tab-' + tabId).classList.add('active');
        document.getElementById('nav-' + tabId).classList.add('active');
        document.getElementById('view-title').innerText = tabId.replace('_', ' ');
    },

    // DRILL-DOWN: Click card to see details
    openRoomDetail(roomId) {
        const room = HotelEngine.rooms.find(r => r.id === roomId);
        const content = document.getElementById('modal-content');
        
        content.innerHTML = `
            <h3 class="text-xs font-black text-blue-500 uppercase tracking-widest mb-2">Room Management</h3>
            <h2 class="text-3xl font-black text-slate-800 mb-6">Room ${room.id}</h2>
            <div class="grid grid-cols-2 gap-4 mb-8">
                <div class="p-4 bg-slate-50 rounded-2xl border">
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Occupancy</p>
                    <p class="font-bold text-slate-700">${room.inv_status}</p>
                </div>
                <div class="p-4 bg-slate-50 rounded-2xl border">
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Housekeeping</p>
                    <p class="font-bold ${room.hk_status === 'Clean' ? 'text-green-600' : 'text-rose-600'}">${room.hk_status}</p>
                </div>
            </div>
            ${room.inv_status === 'Occupied' ? `
                <div class="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <p class="text-[10px] font-bold text-blue-400 uppercase">Active Folio</p>
                    <p class="font-bold text-blue-800 text-lg">${room.guest}</p>
                    <p class="text-xs text-blue-600">${room.folio}</p>
                </div>
            ` : `<button onclick="ui.handleCheckIn('${room.id}'); ui.closeModal();" class="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase text-xs">Perform Check-In</button>`}
        `;
        document.getElementById('detail-modal').classList.add('active');
    },

    closeModal() {
        document.getElementById('detail-modal').classList.remove('active');
    },

    render() {
        // RENDER ROOM GRID (Clickable Cards)
        const roomGrid = document.getElementById('room-container');
        roomGrid.innerHTML = HotelEngine.rooms.map(r => `
            <div onclick="ui.openRoomDetail('${r.id}')" class="clickable-card bg-white p-6 rounded-3xl border shadow-sm border-b-8 ${r.hk_status === 'Clean' ? 'border-green-500' : 'border-rose-500'} hover:shadow-md">
                <div class="flex justify-between items-start mb-4">
                    <span class="text-2xl font-black text-slate-800">${r.id}</span>
                    <span class="text-[9px] font-black uppercase px-2 py-1 rounded ${r.hk_status === 'Clean' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}">${r.hk_status}</span>
                </div>
                <div class="text-[10px] font-bold text-slate-400 uppercase mb-4">${r.type}</div>
                ${r.inv_status === 'Occupied' ? 
                    `<div class="text-xs font-bold text-blue-600 truncate"><i class="fas fa-user mr-1"></i> ${r.guest}</div>` : 
                    `<div class="text-xs font-bold text-slate-300 italic uppercase">Vacant</div>`
                }
            </div>
        `).join('');

        // RENDER FOLIO LIST (Clickable Rows)
        const folioList = document.getElementById('folio-list');
        folioList.innerHTML = HotelEngine.folios.map(f => `
            <tr onclick="ui.openFolioDetail('${f.id}')" class="border-b cursor-pointer hover:bg-slate-50 transition">
                <td class="p-4 font-black text-blue-600">${f.id}</td>
                <td class="p-4 font-bold text-slate-700">${f.guest}</td>
                <td class="p-4">Room ${f.room}</td>
                <td class="p-4 font-black">฿${f.balance.toLocaleString()}</td>
                <td class="p-4"><span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-black uppercase">${f.status}</span></td>
            </tr>
        `).join('');
    }
};

window.onload = () => ui.init();

