/**
 * MARCH ERP VIRTUAL ENGINE
 * Handles: Check-in, Checkout, and State Validation
 */
const HotelEngine = {
    rooms: [],
    folios: [],
    pos: [],

    // Initialize: Load Data Layer
    async init() {
        const roomResp = await fetch('./data/db_rooms.json');
        this.rooms = await roomResp.json();
        console.log("Hotel Engine: Data Layer Loaded.");
    },

    // Logic Gate: Check-in Requirement (Section 3 of Design Doc)
    checkIn(roomId, guestName) {
        const room = this.rooms.find(r => r.id === roomId);
        
        // RULE: Room must be CLEAN to be occupied
        if (room.hk_status !== 'Clean') {
            throw new Error(`VALIDATION ERROR: Room ${roomId} is ${room.hk_status}. Clean it before Check-in.`);
        }

        const folioId = `SO-${1000 + this.folios.length + 1}`;
        room.inv_status = 'Occupied';
        room.guest = guestName;
        room.folio = folioId;

        this.folios.push({
            id: folioId,
            guest: guestName,
            room: roomId,
            balance: room.rate,
            status: 'Open'
        });

        return folioId;
    },

    // Logic: Nightly Audit (Auto-post daily rates)
    runNightlyAudit() {
        this.folios.filter(f => f.status === 'Open').forEach(f => {
            const room = this.rooms.find(r => r.id === f.room);
            f.balance += room.rate;
        });
    }
};
