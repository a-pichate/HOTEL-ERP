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
