/**
 * UI CONTROLLER (Expanded for Detail Views)
 */
const ui = {
    // ... (keep previous init and switchTab)

    // New: Open Detail Modal
    showDetail(type, id) {
        const modal = document.getElementById('detail-modal');
        const content = document.getElementById('detail-content');
        let data = {};
        let html = '';

        if (type === 'room') {
            data = HotelEngine.rooms.find(r => r.id === id);
            html = `
                <div class="space-y-4">
                    <div class="flex justify-between border-b pb-2">
                        <span class="text-slate-400 font-bold uppercase text-[10px]">Room Number</span>
                        <span class="font-black text-xl">${data.id}</span>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div><label class="text-[10px] text-slate-400 font-bold uppercase">Type</label><p class="font-bold">${data.type}</p></div>
                        <div><label class="text-[10px] text-slate-400 font-bold uppercase">Rate</label><p class="font-bold text-blue-600">฿${data.rate.toLocaleString()}</p></div>
                    </div>
                    <div class="p-4 bg-slate-50 rounded-xl border">
                        <label class="text-[10px] text-slate-400 font-bold uppercase">Housekeeping Log</label>
                        <p class="text-xs mt-1 italic">Last cleaned: Today 09:00 AM by Staff-A</p>
                    </div>
                </div>`;
        } else if (type === 'folio') {
            data = HotelEngine.folios.find(f => f.id === id);
            html = `
                <div class="space-y-4">
                    <h4 class="text-blue-600 font-black text-2xl">${data.id}</h4>
                    <p class="text-sm font-bold">${data.guest} - Room ${data.room}</p>
                    <div class="bg-blue-50 p-4 rounded-2xl">
                        <div class="flex justify-between mb-2"><span>Room Charges</span><span>฿${data.balance}</span></div>
                        <div class="flex justify-between text-xs text-slate-500"><span>Tax (7%)</span><span>Included</span></div>
                        <hr class="my-2">
                        <div class="flex justify-between font-black text-lg"><span>Total Balance</span><span>฿${data.balance.toLocaleString()}</span></div>
                    </div>
                </div>`;
        }

        content.innerHTML = html;
        modal.classList.add('active');
    },

    closeModal() {
        document.getElementById('detail-modal').classList.remove('active');
    }
};
// Add these functions to your existing ui object
ui.showDetail = function(type, id) {
    const content = document.getElementById('modal-body-content');
    const modal = document.getElementById('detail-modal');
    let html = '';

    if (type === 'room') {
        const room = HotelEngine.rooms.find(r => r.id === id);
        html = `
            <h3 class="text-xs font-black text-blue-500 uppercase mb-2">Room Detail</h3>
            <h2 class="text-3xl font-black text-slate-800 mb-6">${room.id} <span class="text-sm font-normal text-slate-400">/ ${room.type}</span></h2>
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-slate-50 p-4 rounded-2xl">
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                    <p class="font-bold text-slate-700">${room.inv_status}</p>
                </div>
                <div class="bg-slate-50 p-4 rounded-2xl">
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Cleaning</p>
                    <p class="font-bold ${room.hk_status === 'Clean' ? 'text-green-600' : 'text-rose-600'}">${room.hk_status}</p>
                </div>
            </div>
            <p class="text-xs text-slate-500 italic">Analytic Account: ${room.id}-BKK-01</p>
        `;
    } 
    
    if (type === 'folio') {
        const folio = HotelEngine.folios.find(f => f.id === id);
        html = `
            <h3 class="text-xs font-black text-blue-500 uppercase mb-2">Guest Folio</h3>
            <h2 class="text-2xl font-black text-slate-800 mb-2">${folio.id}</h2>
            <p class="font-bold text-slate-500 mb-6 italic">Guest: ${folio.guest}</p>
            <div class="space-y-3">
                <div class="flex justify-between text-sm"><span>Room Base Rate</span><span class="font-bold">฿${folio.balance.toLocaleString()}</span></div>
                <div class="flex justify-between text-sm text-slate-400"><span>Service Charge (10%)</span><span>Included</span></div>
                <div class="border-t pt-3 flex justify-between text-xl font-black text-blue-600">
                    <span>Total Owed</span><span>฿${folio.balance.toLocaleString()}</span>
                </div>
            </div>
        `;
    }

    content.innerHTML = html;
    modal.classList.add('active');
};

ui.closeModal = function() {
    document.getElementById('detail-modal').classList.remove('active');
};

// CRITICAL: Update your render() function to make cards/rows clickable
// In your room mapping:
// <div onclick="ui.showDetail('room', '${r.id}')" class="room-card ...">

// In your folio mapping:
// <tr onclick="ui.showDetail('folio', '${f.id}')" class="cursor-pointer hover:bg-slate-50 border-b">
