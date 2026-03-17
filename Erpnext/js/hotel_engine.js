/** * MARCH ERP ENGINE - v3.1.0 
 * Tracking ID: 20260318-BE-01
 * Layer: Backend Logic / State Machine
 */
const HotelEngine = {
    version: "3.1.0",
    rooms: [],
    folios: [],
    pos: [],

    // Initialize: Load Data Layer
    async init() {
        try {
            const resp = await fetch('data/db_rooms.json');
            this.rooms = await resp.json();
            console.log("Hotel Engine v3.1.0: Data Layer Loaded.");
        } catch (e) {
            console.error("Data Load Failed. Using fallback empty state.");
            this.rooms = [];
        }
    },

    // Logic Gate: Check-in (Section 3 of Design Doc)
    checkIn(roomId, guestName) {
        const room = this.rooms.find(r => r.id === roomId);
        
        // GATE 1: Housekeeping Block
        if (room.hk_status !== 'Clean') {
            throw new Error(`GATE BLOCK: Room ${roomId} is DIRTY.`);
        }

        // GATE 2: Maintenance Block (New in v3.1.0)
        if (room.maint_status === 'Repair') {
            throw new Error(`GATE BLOCK: Room ${roomId} is UNDER REPAIR.`);
        }

        const folioId = `SO-${Date.now().toString().slice(-4)}`;
        room.inv_status = 'Occupied';
        room.guest = guestName;
        room.folio = folioId;

        this.folios.push({
            id: folioId,
            guest: guestName,
            room: roomId,
            balance: room.rate,
            status: 'Open',
            created_at: new Date().toISOString()
        });
        
        return folioId;
    },

    // Toggle Maintenance State (The "Out of Order" Switch)
    toggleMaintenance(roomId) {
        const room = this.rooms.find(r => r.id === roomId);
        if (room.inv_status === 'Occupied') {
            throw new Error("Cannot send an occupied room to maintenance.");
        }
        room.maint_status = (room.maint_status === 'Operational') ? 'Repair' : 'Operational';
        return room.maint_status;
    },

    // Nightly Audit: Automated Billing
    runNightlyAudit() {
        this.folios.filter(f => f.status === 'Open').forEach(f => {
            const room = this.rooms.find(r => r.id === f.room);
            f.balance += room.rate;
        });
    }
};
