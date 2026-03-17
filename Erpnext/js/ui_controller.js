/**
 * MARCH ERP UI CONTROLLER - v2.0 ROUTING REFACTOR
 * Optimized for Action-Driven Workflows
 */
const ui = {
    // ... init, toggleSidebar, switchTab remain the same ...

    // THE ROUTER: Decides which "Window" to show when a room is clicked
    openRoomDetail(roomId) {
        const room = HotelEngine.rooms.find(r => r.id === roomId);
        const content = document.getElementById('modal-content');
        const modal = document.getElementById('detail-modal');
        
        // Window 1: THE CHECK-IN WINDOW
        if (room.inv_status === 'Available' && room.hk_status === 'Clean') {
            content.innerHTML = `
                <div class="p-2">
                    <h3 class="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Front Desk</h3>
                    <h2 class="text-2xl font-black text-slate-800 mb-6">Room ${room.id} Check-In</h2>
                    
                    <div class="space-y-5">
                        <div>
                            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-2">Guest Full Name</label>
                            <input type="text" id="checkin-guest-name" 
                                class="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold" 
                                placeholder="Enter guest name...">
                        </div>
                        <div class="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                            <p class="text-[10px] font-bold text-blue-400 uppercase">Standard Rate</p>
                            <p class="font-black text-blue-800 text-lg">฿${room.rate.toLocaleString()} / Night</p>
                        </div>
                        <button onclick="ui.executeCheckIn('${room.id}')" 
                            class="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-blue-700 transition-all active:scale-95">
                            Confirm & Open Folio
                        </button>
                    </div>
                </div>`;
        } 
        // Window 2: HOUSEKEEPING GATE
        else if (room.hk_status === 'Dirty') {
            content.innerHTML = `
                <div class="text-center p-6">
                    <div class="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-broom text-2xl"></i>
                    </div>
                    <h2 class="text-xl font-black text-slate-800 mb-2">Room ${room.id} is Dirty</h2>
                    <p class="text-sm text-slate-500 mb-6">This room must be inspected and marked as CLEAN by Housekeeping before check-in is permitted.</p>
                    <button onclick="ui.closeModal()" class="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold uppercase text-xs">Return to Grid</button>
                </div>`;
        }
        // Window 3: OCCUPIED / FOLIO VIEW
        else {
            content.innerHTML = `
                <div class="p-2">
                    <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">In-House Guest</h3>
                    <h2 class="text-2xl font-black text-slate-800 mb-6">Room ${room.id}</h2>
                    <div class="bg-blue-600 p-6 rounded-3xl text-white mb-6 shadow-xl shadow-blue-200">
                        <p class="text-[10px] font-bold opacity-70 uppercase mb-1">Primary Guest</p>
                        <p class="text-xl font-black mb-4">${room.guest}</p>
                        <div class="flex justify-between items-end">
                            <div>
                                <p class="text-[10px] font-bold opacity-70 uppercase">Folio ID</p>
                                <p class="font-mono text-sm">${room.folio}</p>
                            </div>
                            <button onclick="ui.switchTab('folios'); ui.closeModal();" class="bg-white/20 hover:bg-white/30 p-2 px-4 rounded-xl text-xs font-bold transition">View Ledger</button>
                        </div>
                    </div>
                </div>`;
        }

        modal.classList.add('active');
    },

    // EXECUTION ENGINE
    executeCheckIn(roomId) {
        const nameInput = document.getElementById('checkin-guest-name');
        const name = nameInput.value.trim();
        
        if (!name) {
            nameInput.classList.add('border-rose-500');
            return this.notify("Guest name is required", "red");
        }
        
        try {
            HotelEngine.checkIn(roomId, name);
            this.closeModal();
            this.notify(`Check-In Successful: Room ${roomId}`, "green");
            this.render();
        } catch (e) {
            this.notify(e.message, "red");
        }
    }

    // ... (keep other functions like closeModal, render, etc.)
};
