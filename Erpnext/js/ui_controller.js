/**
 * MARCH ERP UI CONTROLLER (Senior Dev Refactor)
 * Focus: Action-oriented modals and data-binding
 */
const ui = {
    async init() {
        // Mock Officer Data
        const officers = [
            { id: "OFF-01", name: "Somsak", grade: "A", cost_rate: 1200 },
            { id: "OFF-02", name: "Wipa", grade: "B", cost_rate: 800 }
        ];
        localStorage.setItem('officers', JSON.stringify(officers));

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
        document.getElementById('view-title').innerText = tabId.toUpperCase().replace('_', ' ');
        this.render(); // Re-render to ensure selects are populated
    },

    // --- ACTION: ROOM DETAIL & CHECK-IN ---
    openRoomDetail(roomId) {
        const room = HotelEngine.rooms.find(r => r.id === roomId);
        const content = document.getElementById('modal-content');
        
        let actionHtml = '';
        if (room.inv_status === 'Available' && room.hk_status === 'Clean') {
            actionHtml = `
                <div class="mt-6 space-y-4">
                    <label class="text-[10px] font-black text-slate-400 uppercase">Guest Name</label>
                    <input type="text" id="checkin-guest-name" class="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-500" placeholder="Enter name...">
                    <button onclick="ui.executeCheckIn('${room.id}')" class="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-blue-700">Confirm Check-In</button>
                </div>`;
        } else if (room.hk_status === 'Dirty') {
            actionHtml = `
                <div class="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm font-bold text-center">
                    ⚠️ Room requires cleaning before check-in.
                </div>`;
        } else {
            actionHtml = `
                <div class="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                    <p class="text-[10px] font-black text-blue-400 uppercase">Current Occupant</p>
                    <p class="font-bold text-blue-800 text-lg">${room.guest}</p>
                    <p class="text-xs text-blue-600">Folio: ${room.folio}</p>
                </div>`;
        }

        content.innerHTML = `
            <h3 class="text-[10px] font-black text-slate-400 uppercase mb-2">Operation Mode</h3>
            <h2 class="text-3xl font-black text-slate-800 mb-6">Room ${room.id}</h2>
            ${actionHtml}
        `;
        document.getElementById('detail-modal').classList.add('active');
    },

    executeCheckIn(roomId) {
        const name = document.getElementById('checkin-guest-name').value;
        if (!name) return this.notify("Please enter guest name", "red");
        
        try {
            HotelEngine.checkIn(roomId, name);
            this.closeModal();
            this.notify(`Room ${roomId} Checked In`, "green");
            this.render();
        } catch (e) {
            this.notify(e.message, "red");
        }
    },

    // --- ACTION: SPA MTO ASSIGNMENT ---
    executeSpaBooking() {
        const folioId = document.getElementById('spa-folio-select').value;
        const officerId = document.getElementById('spa-officer-select').value;
        
        if (!folioId || !officerId) return this.notify("Select Guest and Officer", "red");

        try {
            SpaMTO.createSession(folioId, officerId);
            this.notify("Spa Service Posted & PO Generated", "blue");
            this.render();
        } catch (e) {
            this.notify("Error posting Spa service", "red");
        }
    },

    closeModal() {
        document.getElementById('detail-modal').classList.remove('active');
    },

    notify(msg, color) {
        const t = document.getElementById('toast');
        t.innerText = msg;
        t.className = `fixed top-4 right-4 px-6 py-3 rounded-xl shadow-2xl text-white font-bold transition-all duration-300 opacity-100 bg-${color}-600 z-50`;
        setTimeout(() => t.classList.replace('opacity-100', 'opacity-0'), 3000);
    },

    render() {
        // Room Grid
        const roomGrid = document.getElementById('room-container');
        if (roomGrid) {
            roomGrid.innerHTML = HotelEngine.rooms.map(r => `
                <div onclick="ui.openRoomDetail('${r.id}')" class="clickable-card bg-white p-6 rounded-3xl border shadow-sm border-b-8 ${r.hk_status === 'Clean' ? 'border-green-500' : 'border-rose-500'} hover:shadow-md">
                    <div class="flex justify-between items-start mb-4">
                        <span class="text-2xl font-black text-slate-800">${r.id}</span>
                        <span class="text-[9px] font-black uppercase px-2 py-1 rounded ${r.hk_status === 'Clean' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}">${r.hk_status}</span>
                    </div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase mb-4">${r.type}</div>
                    ${r.inv_status === 'Occupied' ? `<div class="text-xs font-bold text-blue-600"><i class="fas fa-user mr-1"></i> ${r.guest}</div>` : `<div class="text-xs font-bold text-slate-300 italic uppercase">Vacant</div>`}
                </div>`).join('');
        }

        // Folio Table
        const folioList = document.getElementById('folio-list');
        if (folioList) {
            folioList.innerHTML = HotelEngine.folios.map(f => `
                <tr onclick="ui.openFolioDetail('${f.id}')" class="border-b cursor-pointer hover:bg-slate-50 transition">
                    <td class="p-4 font-black text-blue-600">${f.id}</td>
                    <td class="p-4 font-bold text-slate-700">${f.guest}</td>
                    <td class="p-4">Room ${f.room}</td>
                    <td class="p-4 font-black">฿${f.balance.toLocaleString()}</td>
                    <td class="p-4"><span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-black uppercase">${f.status}</span></td>
                </tr>`).join('');
        }

        // Spa Inputs (Dynamic Update)
        const activeFolios = HotelEngine.folios.filter(f => f.status === 'Open');
        const officers = JSON.parse(localStorage.getItem('officers') || '[]');
        
        const spaFolioSelect = document.getElementById('spa-folio-select');
        const spaOfficerSelect = document.getElementById('spa-officer-select');
        
        if (spaFolioSelect && spaOfficerSelect) {
            spaFolioSelect.innerHTML = activeFolios.map(f => `<option value="${f.id}">${f.guest} (Rm ${f.room})</option>`).join('');
            spaOfficerSelect.innerHTML = officers.map(o => `<option value="${o.id}">${o.name} - Grade ${o.grade}</option>`).join('');
        }
    }
};
