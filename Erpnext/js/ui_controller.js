/**
 * MARCH ERP UI CONTROLLER - v3.0 (Full Functional Version)
 * Layer: Frontend Logic & Action Router
 */

const ui = {
    // 1. INITIALIZATION
    async init() {
        // Setup initial metadata
        const officers = [
            { id: "OFF-01", name: "Somsak", grade: "A", cost_rate: 1200 },
            { id: "OFF-02", name: "Wipa", grade: "B", cost_rate: 800 }
        ];
        localStorage.setItem('officers', JSON.stringify(officers));

        // Initialize Backend Data Layer
        await HotelEngine.init();
        this.render();
        console.log("ERP UI Layer: Ready.");
    },

    // 2. NAVIGATION & RESPONSIVENESS
    toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('collapsed');
    },

    switchTab(tabId) {
        // Update Sidebar Active State
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        const activeNav = document.getElementById('nav-' + tabId);
        if (activeNav) activeNav.classList.add('active');

        // Update Content Active State
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        const activeTab = document.getElementById('tab-' + tabId);
        if (activeTab) activeTab.classList.add('active');

        // Update Header
        document.getElementById('view-title').innerText = tabId.toUpperCase().replace('_', ' ');
        
        this.render();
    },

    // 3. ACTION ROUTER: ROOM DETAILS
    openRoomDetail(roomId) {
        const room = HotelEngine.rooms.find(r => r.id === roomId);
        const content = document.getElementById('modal-content');
        const modal = document.getElementById('detail-modal');
        
        // Scenario A: CHECK-IN WINDOW (Available & Clean)
        if (room.inv_status === 'Available' && room.hk_status === 'Clean') {
            content.innerHTML = `
                <div class="p-2">
                    <h3 class="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Reception</h3>
                    <h2 class="text-2xl font-black text-slate-800 mb-6">Room ${room.id} Check-In</h2>
                    <div class="space-y-5">
                        <div>
                            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-2">Guest Full Name</label>
                            <input type="text" id="checkin-guest-name" class="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold" placeholder="Required">
                        </div>
                        <div class="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                            <p class="text-[10px] font-bold text-blue-400 uppercase">Daily Rate</p>
                            <p class="font-black text-blue-800 text-lg">฿${room.rate.toLocaleString()}</p>
                        </div>
                        <button onclick="ui.executeCheckIn('${room.id}')" class="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-blue-700 transition active:scale-95">Confirm Check-In</button>
                    </div>
                </div>`;
        } 
        // Scenario B: HOUSEKEEPING GATE (Available & Dirty)
        else if (room.inv_status === 'Available' && room.hk_status === 'Dirty') {
            content.innerHTML = `
                <div class="text-center p-6">
                    <div class="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-broom text-2xl"></i>
                    </div>
                    <h2 class="text-xl font-black text-slate-800 mb-2">Cleaning Required</h2>
                    <p class="text-sm text-slate-500 mb-6 font-medium">Room ${room.id} is blocked from check-in until marked as clean by Housekeeping.</p>
                    <button onclick="ui.markAsClean('${room.id}')" class="w-full py-4 bg-teal-600 text-white rounded-2xl font-black uppercase text-xs mb-3">Mark as Cleaned</button>
                    <button onclick="ui.closeModal()" class="w-full py-3 text-slate-400 font-bold text-xs uppercase">Cancel</button>
                </div>`;
        }
        // Scenario C: OCCUPIED STATUS
        else {
            content.innerHTML = `
                <div class="p-2">
                    <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">In-House</h3>
                    <h2 class="text-2xl font-black text-slate-800 mb-6">Room ${room.id}</h2>
                    <div class="bg-blue-600 p-6 rounded-3xl text-white mb-6 shadow-xl shadow-blue-200">
                        <p class="text-[10px] font-bold opacity-70 uppercase mb-1">Current Guest</p>
                        <p class="text-xl font-black mb-4">${room.guest}</p>
                        <div class="flex justify-between items-center">
                            <span class="font-mono text-xs opacity-80">${room.folio}</span>
                            <button onclick="ui.openFolioDetail('${room.folio}')" class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-xs font-bold transition">Manage Folio</button>
                        </div>
                    </div>
                    <button onclick="ui.closeModal()" class="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold uppercase text-xs">Back</button>
                </div>`;
        }

        modal.classList.add('active');
    },

    // 4. ACTION ROUTER: FOLIO & CHECKOUT WIZARD
    openFolioDetail(folioId) {
        const folio = HotelEngine.folios.find(f => f.id === folioId);
        const content = document.getElementById('modal-content');
        
        content.innerHTML = `
            <div class="p-2">
                <h3 class="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Checkout Wizard</h3>
                <h2 class="text-2xl font-black text-slate-800 mb-2">${folio.id}</h2>
                <p class="text-sm text-slate-400 italic mb-6">Guest: ${folio.guest}</p>
                
                <div class="bg-slate-50 p-6 rounded-3xl mb-8 border border-slate-200">
                    <div class="flex justify-between items-center">
                        <span class="font-bold text-slate-500">Net Amount Due</span>
                        <span class="text-3xl font-black text-slate-800">฿${folio.balance.toLocaleString()}</span>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <button onclick="ui.finalizeCheckout('${folio.id}', 'Cash')" class="py-5 border-2 border-slate-200 rounded-2xl font-black text-xs hover:border-blue-600 hover:bg-blue-50 transition-all uppercase">Cash / Transfer</button>
                    <button onclick="ui.finalizeCheckout('${folio.id}', 'Credit Card')" class="py-5 border-2 border-slate-200 rounded-2xl font-black text-xs hover:border-blue-600 hover:bg-blue-50 transition-all uppercase">Credit Card</button>
                </div>
            </div>`;
        
        document.getElementById('detail-modal').classList.add('active');
    },

    // 5. EXECUTION LAYER: ENGINES
    executeCheckIn(roomId) {
        const input = document.getElementById('checkin-guest-name');
        const name = input.value.trim();
        if (!name) return this.notify("Guest Name Required", "rose");
        
        HotelEngine.checkIn(roomId, name);
        this.closeModal();
        this.notify(`Check-in Successful for ${roomId}`, "green");
        this.render();
    },

    finalizeCheckout(folioId, method) {
        const folio = HotelEngine.folios.find(f => f.id === folioId);
        const room = HotelEngine.rooms.find(r => r.id === folio.room);

        folio.status = 'Settled';
        room.inv_status = 'Available';
        room.hk_status = 'Dirty';
        room.guest = null;
        room.folio = null;

        this.closeModal();
        this.notify(`Checkout Complete (${method}). Room ${room.id} is now DIRTY.`, "slate");
        this.render();
    },

    markAsClean(roomId) {
        const room = HotelEngine.rooms.find(r => r.id === roomId);
        room.hk_status = 'Clean';
        this.closeModal();
        this.notify(`Room ${roomId} Inspected & Cleaned`, "teal");
        this.render();
    },

    executeSpaBooking() {
        const folioId = document.getElementById('spa-folio-select').value;
        const officerId = document.getElementById('spa-officer-select').value;
        
        if (!folioId || !officerId) return this.notify("Data incomplete", "rose");

        SpaMTO.createSession(folioId, officerId);
        this.notify("Spa Charge Added & MTO PO Generated", "blue");
        this.render();
    },

    // 6. UTILITIES
    closeModal() {
        document.getElementById('detail-modal').classList.remove('active');
    },

    notify(msg, color) {
        const t = document.getElementById('toast');
        t.innerText = msg;
        // Map common colors to Tailwind classes
        const colors = { green: 'bg-green-600', rose: 'bg-rose-600', blue: 'bg-blue-600', slate: 'bg-slate-900', teal: 'bg-teal-600' };
        t.className = `fixed top-4 right-4 px-6 py-3 rounded-xl shadow-2xl text-white font-bold transition-all duration-300 opacity-100 ${colors[color] || 'bg-slate-700'} z-50`;
        setTimeout(() => t.classList.replace('opacity-100', 'opacity-0'), 3000);
    },

    // 7. RENDERER (The Heart of the UI)
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
                    ${r.inv_status === 'Occupied' ? `<div class="text-xs font-bold text-blue-600"><i class="fas fa-user-check mr-1"></i> ${r.guest}</div>` : `<div class="text-xs font-bold text-slate-300 italic">VACANT</div>`}
                </div>`).join('');
        }

        // Folio Table
        const folioList = document.getElementById('folio-list');
        if (folioList) {
            folioList.innerHTML = HotelEngine.folios.map(f => `
                <tr onclick="ui.openFolioDetail('${f.id}')" class="border-b cursor-pointer hover:bg-slate-50 transition">
                    <td class="p-4 font-black text-blue-600">${f.id}</td>
                    <td class="p-4 font-bold text-slate-700">${f.guest}</td>
                    <td class="p-4 text-xs font-bold">Room ${f.room}</td>
                    <td class="p-4 font-black">฿${f.balance.toLocaleString()}</td>
                    <td class="p-4"><span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[9px] font-black uppercase">${f.status}</span></td>
                </tr>`).join('');
        }

        // Spa Selects
        const spaFolio = document.getElementById('spa-folio-select');
        const spaOfficer = document.getElementById('spa-officer-select');
        if (spaFolio && spaOfficer) {
            const activeFolios = HotelEngine.folios.filter(f => f.status === 'Open');
            const officers = JSON.parse(localStorage.getItem('officers') || '[]');
            spaFolio.innerHTML = activeFolios.map(f => `<option value="${f.id}">${f.guest} (Rm ${f.room})</option>`).join('');
            spaOfficer.innerHTML = officers.map(o => `<option value="${o.id}">${o.name} - Grade ${o.grade}</option>`).join('');
        }
    }
};

window.onload = () => ui.init();
