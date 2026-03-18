/** * MARCH ERP UI CONTROLLER - v3.2.4
 * Tracking ID: 20260318-STABLE-04
 * Status: High Compatibility / Failsafe Render
 */
const ui = {
    version: "3.2.4",

    async init() {
        console.log("System Booting: v" + this.version);
        try {
            // Ensure Officers exist in memory
            if(!localStorage.getItem('officers')) {
                localStorage.setItem('officers', JSON.stringify([
                    { id: "OFF-01", name: "Somsak", grade: "A", cost_rate: 1200 },
                    { id: "OFF-02", name: "Wipa", grade: "B", cost_rate: 800 }
                ]));
            }
            
            // Wait for Engine
            await HotelEngine.init();
            
            // Ensure the PO array exists in the engine to prevent crashes
            if (!HotelEngine.pos) HotelEngine.pos = [];
            
            this.render();
            console.log("System Online.");
        } catch (e) {
            console.error("Boot Error:", e);
        }
    },

    toggleSidebar() {
        const sb = document.getElementById('sidebar');
        if (sb) sb.classList.toggle('collapsed');
    },

    switchTab(tabId) {
        console.log("Navigating to:", tabId);
        
        // 1. Clear Active States
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));

        // 2. Set New Active States
        const targetTab = document.getElementById('tab-' + tabId);
        const targetNav = document.getElementById('nav-' + tabId);

        if (targetTab) {
            targetTab.classList.add('active');
            if (targetNav) targetNav.classList.add('active');
            
            const title = document.getElementById('view-title');
            if (title) title.innerText = tabId.toUpperCase().replace('_', ' ');
            
            this.render();
        } else {
            console.error("Tab ID not found in HTML: tab-" + tabId);
        }
    },

    // --- MODAL ENGINE ---
    openRoomDetail(roomId) {
        const room = HotelEngine.rooms.find(r => r.id === roomId);
        const content = document.getElementById('modal-content');
        if (!room || !content) return;

        let uiBody = '';
        if (room.maint_status === 'Repair') {
            uiBody = `<div class="p-6 text-center"><i class="fas fa-tools text-4xl text-orange-400 mb-4"></i><button onclick="ui.handleMaintToggle('${room.id}')" class="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold uppercase text-xs">Finish Repair</button></div>`;
        } else if (room.inv_status === 'Available' && room.hk_status === 'Clean') {
            uiBody = `<div class="space-y-4"><input type="text" id="checkin-guest-name" class="w-full p-4 border-2 rounded-2xl font-bold" placeholder="Guest Name"><button onclick="ui.executeCheckIn('${room.id}')" class="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg">Check-In</button></div>`;
        } else if (room.hk_status === 'Dirty') {
            uiBody = `<div class="p-6 text-center"><button onclick="ui.markAsClean('${room.id}')" class="w-full py-4 bg-teal-600 text-white rounded-2xl font-bold uppercase text-xs">Mark Clean</button></div>`;
        } else {
            uiBody = `<div class="bg-blue-600 p-6 rounded-3xl text-white"><p class="text-xl font-black">${room.guest}</p><button onclick="ui.openFolioDetail('${room.folio}')" class="mt-4 bg-white/20 px-4 py-2 rounded-xl text-xs font-bold">Manage Folio</button></div>`;
        }

        content.innerHTML = `<h2 class="text-3xl font-black mb-6">Room ${room.id}</h2>${uiBody}`;
        document.getElementById('detail-modal').classList.add('active');
    },

    openFolioDetail(fId) {
        const f = HotelEngine.folios.find(fol => fol.id === fId);
        if(!f) return;
        document.getElementById('modal-content').innerHTML = `
            <h2 class="text-2xl font-black mb-6">${f.id}</h2>
            <div class="p-6 bg-slate-100 rounded-2xl mb-6 text-center"><span class="text-3xl font-black">฿${f.balance.toLocaleString()}</span></div>
            <button onclick="ui.finalizeCheckout('${f.id}')" class="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase text-xs">Settle & Checkout</button>`;
        document.getElementById('detail-modal').classList.add('active');
    },

    openPayoutDetail(poId) {
        const po = HotelEngine.pos.find(p => p.id === poId);
        if(!po) return;
        document.getElementById('modal-content').innerHTML = `
            <h2 class="text-2xl font-black mb-6">${po.id}</h2>
            <div class="space-y-4">
                <div class="p-4 bg-slate-50 border rounded-xl flex justify-between"><span>Officer</span><span class="font-bold">${po.vendor}</span></div>
                <div class="p-4 bg-slate-50 border rounded-xl flex justify-between"><span>Amount</span><span class="font-bold">฿${po.amount.toLocaleString()}</span></div>
            </div>`;
        document.getElementById('detail-modal').classList.add('active');
    },

    // --- CORE ACTIONS ---
    executeCheckIn(roomId) {
        const name = document.getElementById('checkin-guest-name').value.trim();
        if(!name) return;
        HotelEngine.checkIn(roomId, name);
        this.closeModal(); this.render();
    },

    handleMaintToggle(rId) {
        HotelEngine.toggleMaintenance(rId);
        this.closeModal(); this.render();
    },

    markAsClean(rId) {
        HotelEngine.rooms.find(r => r.id === rId).hk_status = 'Clean';
        this.closeModal(); this.render();
    },

    finalizeCheckout(fId) {
        const f = HotelEngine.folios.find(fol => fol.id === fId);
        const r = HotelEngine.rooms.find(rm => rm.id === f.room);
        f.status = 'Paid';
        r.inv_status = 'Available'; r.hk_status = 'Dirty'; r.guest = null; r.folio = null;
        this.closeModal(); this.render();
    },

    executeSpaBooking() {
        const fId = document.getElementById('spa-folio-select').value;
        const oId = document.getElementById('spa-officer-select').value;
        if(fId && oId) { SpaMTO.createSession(fId, oId); this.render(); }
    },

    closeModal() { document.getElementById('detail-modal').classList.remove('active'); },

    // --- RENDERER (Failsafe Mode) ---
    render() {
        // 1. Render Rooms
        const rc = document.getElementById('room-container');
        if (rc) {
            rc.innerHTML = HotelEngine.rooms.map(r => `
                <div onclick="ui.openRoomDetail('${r.id}')" class="p-6 bg-white rounded-3xl border-b-8 shadow-sm cursor-pointer ${r.maint_status === 'Repair' ? 'border-orange-500' : (r.hk_status === 'Clean' ? 'border-green-500' : 'border-rose-500')}">
                    <div class="flex justify-between font-black"><span>${r.id}</span></div>
                    <div class="text-[10px] uppercase font-bold text-slate-400 mt-2">${r.type}</div>
                    <div class="mt-4 text-xs font-bold ${r.guest ? 'text-blue-600' : 'text-slate-200'}">${r.guest || 'VACANT'}</div>
                </div>`).join('');
        }

        // 2. Render Folios
        const fl = document.getElementById('folio-list');
        if (fl) {
            fl.innerHTML = HotelEngine.folios.map(f => `
                <tr onclick="ui.openFolioDetail('${f.id}')" class="border-b cursor-pointer hover:bg-slate-50 text-sm">
                    <td class="p-4 font-black text-blue-600">${f.id}</td>
                    <td class="p-4 font-black">฿${f.balance.toLocaleString()}</td>
                    <td class="p-4"><span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[9px] font-black">${f.status}</span></td>
                </tr>`).join('');
        }

        // 3. Render Payouts
        const pl = document.getElementById('po-list');
        if (pl && HotelEngine.pos) {
            pl.innerHTML = HotelEngine.pos.map(po => `
                <tr onclick="ui.openPayoutDetail('${po.id}')" class="border-b text-xs cursor-pointer hover:bg-rose-50">
                    <td class="p-4 font-bold text-slate-900">${po.id}</td>
                    <td class="p-4">${po.vendor}</td>
                    <td class="p-4 font-black text-rose-600">฿${po.amount.toLocaleString()}</td>
                </tr>`).join('');
        }

        // 4. Update Selects
        const sF = document.getElementById('spa-folio-select');
        const sO = document.getElementById('spa-officer-select');
        if (sF && sO) {
            const activeFolios = HotelEngine.folios.filter(f => f.status === 'Open');
            const officers = JSON.parse(localStorage.getItem('officers') || '[]');
            sF.innerHTML = activeFolios.map(f => `<option value="${f.id}">${f.guest} (Rm ${f.room})</option>`).join('');
            sO.innerHTML = officers.map(o => `<option value="${o.id}">${o.name}</option>`).join('');
        }
    }
};

window.onload = () => ui.init();
