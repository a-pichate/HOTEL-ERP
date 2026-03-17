/** * SPA MTO ENGINE - v3.1.0 
 * Tracking ID: 20260318-MTO-01
 * Layer: Procurement Automation
 */
const SpaMTO = {
    createSession(folioId, officerId) {
        const folio = HotelEngine.folios.find(f => f.id === folioId);
        const officers = JSON.parse(localStorage.getItem('officers') || '[]');
        const officer = officers.find(o => o.id === officerId);

        if (!folio || !officer) throw new Error("Invalid Selection");

        // 1. Revenue Side: Charge Guest Folio
        const spaServiceRate = 1500; 
        folio.balance += spaServiceRate; 

        // 2. MTO Side: Generate Purchase Order for Officer
        const poId = `PO-${Date.now().toString().slice(-4)}`;
        HotelEngine.pos.push({
            id: poId,
            vendor: officer.name,
            officer_id: officer.id,
            amount: officer.cost_rate,
            ref: folioId,
            status: 'Draft',
            date: new Date().toISOString()
        });

        return { folioId, poId };
    }
};
