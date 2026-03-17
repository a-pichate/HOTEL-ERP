/** * MARCH ERP UI CONTROLLER - v3.2.0 
 * Tracking ID: 20260318-UI-02
 */
const ui = {
    version: "3.2.0",

    async init() {
        if(!localStorage.getItem('officers')) {
            const officers = [
                { id: "OFF-01", name: "Somsak", grade: "A", cost_rate: 1200 },
                { id: "OFF-02", name: "Wipa", grade: "B", cost_rate: 800 }
            ];
            localStorage.setItem('officers', JSON.stringify(officers));
        }
        await HotelEngine.init();
        this.render();
    },

    toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('collapsed');
    },

    switchTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        
        const activeTab = document.getElementById('tab-' + tabId);
        const activeNav = document.getElementById('nav-' + tabId);
        
        if(activeTab) activeTab.classList.add('active');
        if(activeNav) activeNav.classList.add('active');
        
        document.getElementById('view-title').innerText = tabId.toUpperCase().replace('_', ' ');
        this.render();
    },

    // --- ROOM & FOLIO LOGIC ---
    openRoomDetail(roomId) {
        const room = HotelEngine.rooms.find(r => r.id === roomId);
        const content = document.getElementById('modal-content');
        const modal = document.getElementById('detail-modal');
        
        let headerStatus = room.maint_status === 'Repair' 
            ? '<span class="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black italic">OUT OF ORDER</span>' 
            : `<span class="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">${room.hk_status}</span>`;

        let uiBody = '';

        if (room.maint_status === 'Repair') {
            uiBody = `<div class="bg-orange-50 border border-orange-200 p-8 rounded-3xl text-center">
                        <i class="fas fa-tools text-4xl text-orange-400 mb-4"></i>
                        <h3 class="text-lg font-black text-orange-800">Room Blocked</h3>
                        <button onclick="ui.handleMaintToggle('${room.id}')" class="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs mt-6 shadow-lg">Finish Repair</button>
                      </div>`;
        } else if (room.inv_status === 'Available' && room.hk_status === 'Clean') {
            uiBody = `<div class="space-y-6">
                        <input type="text" id="checkin-guest-name" class="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold" placeholder="Guest Name">
                        <button onclick="ui.executeCheckIn('${room.id}')" class="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg">Confirm Check-In</button>
                        <button onclick="ui.handleMaintToggle('${room.id}')" class="w-full py-2 text-slate-400 font-bold text-[10px] uppercase">Report Fault</button>
                      </div>`;
        } else if (room.hk_status === 'Dirty') {
            uiBody = `<div class="bg-rose-50 p-8 rounded-3xl text-center">
                        <button onclick="ui.markAsClean('${room.id}')" class="w-full py-4 bg-teal-600 text-white rounded-2xl font-black uppercase text-xs shadow-md">Mark as Clean</button>
                      </div>`;
        } else {
            uiBody = `<div class="bg-blue-600 p-6 rounded-3xl text-white shadow-xl">
                        <p class="text-[10px] font-bold opacity-70 uppercase mb-1">In-House Guest</p>
                        <p class="text-xl font-black mb-4">${room.guest}</p>
                        <button onclick="ui.openFolioDetail('${room.folio}')" class="bg-white/20 px-4 py-2 rounded-xl text-xs font-bold">Open Folio</button>
                      </div>`;
        }

        content.innerHTML = `<div class="flex justify-between items-start mb-6"><div><h2 class="text-3xl font-black text-slate-800">Room ${room.id}</h2></div>${headerStatus}</div>${uiBody}`;
        modal.classList.add('active');
    },

    openFolioDetail(folioId) {
        const folio = HotelEngine.folios.find(f => f.id === folioId);
        const content = document.getElementById('modal-content');
        content.innerHTML = `<h3 class="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Checkout Wizard</h3>
                             <h2 class="text-2xl font-black text-slate-800 mb-6">${folio.id}</h2>
                             <div class="bg-slate-100 p-6 rounded-3xl border border-slate-200 mb-8"><div class="flex justify-between items-center"><span class="font-bold text-slate-500">Balance Due</span><span class="text-3xl font-black text-slate-800">฿${folio.balance.toLocaleString()}</span></div></div>
                             <div class="grid grid-cols-2 gap-4"><button onclick="ui.finalizeCheckout('${folio.id}', 'Cash')" class="py-5 border-2 rounded-2xl font-black text-xs uppercase hover:bg-blue-50 transition">Cash</button><button onclick="ui.finalizeCheckout('${folio.id}', 'Card')" class="py-5 border-2 rounded-2xl font-black text-xs uppercase hover:bg-blue-50 transition">Card</button></div>`;
        document.getElementById('detail-modal').classList.add('active');
    },

    // --- EXECUTION HANDLERS ---
    executeCheckIn(roomId) {
        const name = document.getElementById('checkin-guest-name').value.trim();
        if (!name) return this.notify("Name required", "rose");
        HotelEngine.checkIn(roomId, name);
        this.closeModal();
        this.notify(`Check-in: ${roomId}`, "green");
        this.render();
    },

    handleMaintToggle(roomId) {
        const s = HotelEngine.toggleMaintenance(roomId);
        this.notify(`${roomId} is ${s}`, s === 'Repair' ? 'orange' : 'green');
        this.closeModal();
        this.render();
    },

    markAsClean(roomId) {
        HotelEngine.rooms.find(r => r.id === roomId).hk_status = 'Clean';
        this.closeModal();
        this.notify(`Room ${roomId} Cleaned`, "teal");
        this.render();
    },

    finalizeCheckout(folioId, method) {
        const f = HotelEngine.folios.find(fol => fol.id === folioId);
        const r = HotelEngine.rooms.find(rm => rm.id === f.room);
        f.status = 'Paid';
        r.inv_status = 'Available'; r.hk_status = 'Dirty'; r.guest = null; r.folio = null;
        this.closeModal();
        this.notify(`Checkout Done`, "slate");
        this.render();
    },

    executeSpaBooking() {
        const fId = document.getElementById('spa-folio-select').value;
        const oId = document.getElementById('spa-officer-select').value;
        if(!fId || !oId) return this.notify("Select Guest & Officer", "rose");
        SpaMTO.createSession(fId, oId);
        this.notify("Spa Posting & MTO Success", "blue");
        this.render();
    },

    closeModal() { document.getElementById('detail-modal').classList.remove('active'); },

    notify(msg, color) {
        const t = document.getElementById('toast');
        const c = { green: 'bg-green-600', rose: 'bg-rose-600', blue: 'bg-blue-600', slate: 'bg-slate-900', teal: 'bg-teal-600', orange: 'bg-orange-600' };
        t.innerText = msg;
        t.className = `fixed top-4 right-4 px-6 py-3 rounded-xl shadow-2xl text-white font-bold transition-all duration-300 opacity-100 ${c[color] || 'bg-slate-700'} z-50`;
        setTimeout(() => t.classList.replace('opacity-100', 'opacity-0'), 3000);
    },

    render() {
        // Room Grid
        const grid = document.getElementById('room-container');
        if (grid) {
            grid.innerHTML = HotelEngine.rooms.map(r => `
                <div onclick="ui.openRoomDetail('${r.id}')" class="clickable-card bg-white p-6 rounded-3xl border shadow-sm border-b-8 ${r.maint_status === 'Repair' ? 'border-orange-500' : (r.hk_status === 'Clean' ? 'border-green-500' : 'border-rose-500')}">
                    <div class="flex justify-between items-start mb-4"><span class="text-2xl font-black text-slate-800">${r.id}</span>${r.maint_status === 'Repair' ? '<i class="fas fa-tools text-orange-500"></i>' : ''}</div>
                    <p class="text-[10px] font-black uppercase mb-4 ${r.maint_status === 'Repair' ? 'text-orange-500' : 'text-slate-400'}">${r.maint_status === 'Repair' ? 'Out of Order' : r.type}</p>
                    ${r.inv_status === 'Occupied' ? `<div class="text-xs font-bold text-blue-600 truncate">👤 ${r.guest}</div>` : `<div class="text-xs font-bold text-slate-300 italic">VACANT</div>`}
                </div>`).join('');
        }

        // Folio Table
        const list = document.getElementById('folio-list');
        if (list) {
            list.innerHTML = HotelEngine.folios.map(f => `
                <tr onclick="ui.openFolioDetail('${f.id}')" class="border-b cursor-pointer hover:bg-slate-50 transition text-sm">
                    <td class="p-4 font-black text-blue-600">${f.id}</td>
                    <td class="p-4 font-bold text-slate-700">${f.guest}</td>
                    <td class="p-4 font-black">฿${f.balance.toLocaleString()}</td>
                    <td class="p-4"><span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[9px] font-black uppercase">${f.status}</span></td>
                </tr>`).join('');
        }

        // PROCUREMENT TAB RENDERER (New in v3.2.0)
        const poList = document.getElementById('po-list');
        if (poList) {
            poList.innerHTML = HotelEngine.pos.map(po => `
                <tr class="border-b text-xs">
                    <td class="p-4 font-bold text-slate-900">${po.id}</td>
                    <td class="p-4">${po.vendor}</td>
                    <td class="p-4 font-mono text-blue-600">${po.analytic_tag}</td>
                    <td class="p-4 font-black text-rose-600">฿${po.amount.toLocaleString()}</td>
                    <td class="p-4"><span class="px-2 py-1 bg-green-100 text-green-700 rounded text-[8px] font-black uppercase">${po.status}</span></td>
                </tr>`).join('');
        }

        // Spa Selects
        const sF = document.getElementById('spa-folio-select');
        const sO = document.getElementById('spa-officer-select');
        if (sF && sO) {
            const activeFolios = HotelEngine.folios.filter(f => f.status === 'Open');
            const officers = JSON.parse(localStorage.getItem('officers') || '[]');
            sF.innerHTML = activeFolios.map(f => `<option value="${f.id}">${f.guest} (Rm ${f.room})</option>`).join('');
            sO.innerHTML = officers.map(o => `<option value="${o.id}">${o.name} - ${o.grade}</option>`).join('');
        }
    }
};

window.onload = () => ui.init();
