/**
 * SPA MTO ENGINE
 * Logic: Completing a session triggers a Purchase Order (Liability)
 */
const SpaMTO = {
    createSession(folioId, officerId) {
        const folio = HotelEngine.folios.find(f => f.id === folioId);
        const officer = JSON.parse(localStorage.getItem('officers')).find(o => o.id === officerId);

        // 1. Revenue Side: Charge Guest
        folio.balance += 1500; 

        // 2. MTO Side: Generate PO for Officer (The "Buy" Rule)
        const poId = `PO-${5000 + HotelEngine.pos.length + 1}`;
        HotelEngine.pos.push({
            id: poId,
            vendor: officer.name,
            amount: officer.cost_rate,
            ref: folioId,
            date: new Date().toISOString()
        });

        return { folioId, poId };
    }
};
