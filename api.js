/**
 * March Hotel ERPNext Prototype — Backend API Layer
 * All data persisted to localStorage. ERPNext-style doctype naming.
 * Version: 6.0 | March 2026
 */

const DB_VERSION = "march_hotel_v1";

// ─── ERPNext Doctype Keys ────────────────────────────────────────────────────
const DOCTYPE = {
  HOTEL_SETTINGS:   "hotel_settings",
  ROOM:             "hotel_room",
  MEMBER:           "hotel_member",
  SPA_OFFICER:      "spa_officer",
  BOOKING:          "hotel_booking",
  FOLIO:            "hotel_folio",
  FOLIO_LINE:       "hotel_folio_line",
  SPA_SESSION:      "spa_session",
  PURCHASE_ORDER:   "purchase_order",      // spa procurement → officer payout
  INVOICE:          "sales_invoice",
  INVOICE_LINE:     "sales_invoice_item",
  PAYMENT_ENTRY:    "payment_entry",
  PRODUCT:          "item",
  MEMBER_LEDGER:    "member_ledger_entry",
};

// ─── Seed Data ───────────────────────────────────────────────────────────────
const SEED = {
  hotel_settings: {
    hotel_name: "March Hotel",
    currency: "THB",
    vat_rate: 0.07,
    checkout_time: "12:00",
    default_room_rate: 2500,
  },

  hotel_room: [
    { name:"RM-101", room_number:"101", room_type:"Standard",   floor:1, rate:2500,  status:"Occupied",  amenities:"AC, WiFi, TV" },
    { name:"RM-102", room_number:"102", room_type:"Standard",   floor:1, rate:2500,  status:"Vacant",    amenities:"AC, WiFi, TV" },
    { name:"RM-103", room_number:"103", room_type:"Deluxe",     floor:1, rate:3500,  status:"Occupied",  amenities:"AC, WiFi, TV, Bathtub" },
    { name:"RM-201", room_number:"201", room_type:"Deluxe",     floor:2, rate:3500,  status:"Occupied",  amenities:"AC, WiFi, TV, Bathtub" },
    { name:"RM-202", room_number:"202", room_type:"Suite",      floor:2, rate:5500,  status:"Vacant",    amenities:"AC, WiFi, TV, Bathtub, Kitchenette" },
    { name:"RM-203", room_number:"203", room_type:"Suite",      floor:2, rate:5500,  status:"Occupied",  amenities:"AC, WiFi, TV, Bathtub, Kitchenette" },
    { name:"RM-301", room_number:"301", room_type:"Standard",   floor:3, rate:2500,  status:"Vacant",    amenities:"AC, WiFi, TV" },
    { name:"RM-302", room_number:"302", room_type:"Deluxe",     floor:3, rate:3500,  status:"Occupied",  amenities:"AC, WiFi, TV, Bathtub" },
    { name:"RM-303", room_number:"303", room_type:"Penthouse",  floor:3, rate:8500,  status:"Vacant",    amenities:"AC, WiFi, TV, Private Pool, Butler" },
    { name:"RM-304", room_number:"304", room_type:"Standard",   floor:3, rate:2500,  status:"Occupied",  amenities:"AC, WiFi, TV" },
  ],

  hotel_member: [
    { name:"MEM-001", member_name:"Khun Ariya Sombat",    email:"ariya@email.com",   phone:"081-111-0001", member_since:"2024-01-15", points_balance:4500, status:"Gold" },
    { name:"MEM-002", member_name:"Khun Natcha Wongsiri", email:"natcha@email.com",  phone:"082-222-0002", member_since:"2024-06-01", points_balance:1200, status:"Silver" },
    { name:"MEM-003", member_name:"Mr. James Whitfield",  email:"james@email.com",   phone:"083-333-0003", member_since:"2023-11-20", points_balance:8800, status:"Platinum" },
  ],

  spa_officer: [
    { name:"SPO-001", officer_name:"Khun Linda Panya",   gender:"Female", specialty:"Thai Massage, Aromatherapy", experience_years:5, commission_rate:0.30, status:"Active", vendor_id:"VEND-SPO-001" },
    { name:"SPO-002", officer_name:"Khun May Charoenwong",gender:"Female",specialty:"Hot Stone, Herbal Compress",experience_years:7, commission_rate:0.30, status:"Active", vendor_id:"VEND-SPO-002" },
    { name:"SPO-003", officer_name:"Khun Som Ratanaporn", gender:"Female", specialty:"Aromatherapy, Facial",      experience_years:3, commission_rate:0.25, status:"Active", vendor_id:"VEND-SPO-003" },
    { name:"SPO-004", officer_name:"Khun Lek Jaidee",    gender:"Male",   specialty:"Deep Tissue, Sports",       experience_years:6, commission_rate:0.30, status:"Active", vendor_id:"VEND-SPO-004" },
    { name:"SPO-005", officer_name:"Khun Pim Suksawat",  gender:"Female", specialty:"Reflexology, Thai Massage", experience_years:4, commission_rate:0.25, status:"Active", vendor_id:"VEND-SPO-005" },
  ],

  item: [
    // Spa Services
    { name:"SPA-THAI",    item_name:"Thai Traditional Massage (60 min)", item_group:"Spa Service",  rate:1200, uom:"Session", income_account:"4100" },
    { name:"SPA-AROMA",   item_name:"Aromatherapy Oil Massage (90 min)", item_group:"Spa Service",  rate:1800, uom:"Session", income_account:"4100" },
    { name:"SPA-STONE",   item_name:"Hot Stone Therapy (90 min)",        item_group:"Spa Service",  rate:2200, uom:"Session", income_account:"4100" },
    { name:"SPA-HERBAL",  item_name:"Herbal Compress (60 min)",          item_group:"Spa Service",  rate:1500, uom:"Session", income_account:"4100" },
    { name:"SPA-FACIAL",  item_name:"Signature Facial (60 min)",         item_group:"Spa Service",  rate:1600, uom:"Session", income_account:"4100" },
    { name:"SPA-TIP",     item_name:"Spa Gratuity / Tip",                item_group:"Spa Service",  rate:0,    uom:"Session", income_account:"4150" },
    // F&B
    { name:"FB-PADTHAI",  item_name:"Pad Thai",                          item_group:"F&B",          rate:220,  uom:"Nos", income_account:"4300" },
    { name:"FB-TOMYUM",   item_name:"Tom Yum Soup",                      item_group:"F&B",          rate:280,  uom:"Nos", income_account:"4300" },
    { name:"FB-FRIEDRICE",item_name:"Thai Fried Rice",                   item_group:"F&B",          rate:200,  uom:"Nos", income_account:"4300" },
    { name:"FB-BEER",     item_name:"Singha Beer",                       item_group:"F&B",          rate:140,  uom:"Nos", income_account:"4300" },
    { name:"FB-WATER",    item_name:"Mineral Water",                     item_group:"F&B",          rate:60,   uom:"Nos", income_account:"4300" },
    { name:"FB-COFFEE",   item_name:"Thai Iced Coffee",                  item_group:"F&B",          rate:120,  uom:"Nos", income_account:"4300" },
    // Accommodation
    { name:"ROOM-NIGHT",  item_name:"Room Night",                        item_group:"Accommodation",rate:0,    uom:"Night", income_account:"4200" },
    { name:"ROOM-LATE",   item_name:"Late Checkout Fee",                 item_group:"Accommodation",rate:500,  uom:"Nos", income_account:"4200" },
    // Other Services
    { name:"SVC-LAUNDRY", item_name:"Laundry Service",                   item_group:"Housekeeping", rate:350,  uom:"Set", income_account:"4500" },
    { name:"SVC-MINIBAR", item_name:"Minibar Consumption",               item_group:"Housekeeping", rate:0,    uom:"Nos", income_account:"4500" },
    { name:"SVC-TRANSFER",item_name:"Airport Transfer",                  item_group:"Transport",    rate:1200, uom:"Trip", income_account:"4500" },
  ],

  // 3 active bookings on 2026-03-16
  hotel_booking: [
    {
      name:"BKG-2026-001", booking_date:"2026-03-14", member:"MEM-001",
      guest_name:"Khun Ariya Sombat", room:"RM-101", room_type:"Standard",
      checkin_date:"2026-03-15", checkout_date:"2026-03-18", nights:3,
      room_rate:2500, booking_total:7500, status:"Checked In",
      folio:"FOL-2026-001", payment_status:"Unpaid",
    },
    {
      name:"BKG-2026-002", booking_date:"2026-03-15", member:"MEM-002",
      guest_name:"Khun Natcha Wongsiri", room:"RM-103", room_type:"Deluxe",
      checkin_date:"2026-03-16", checkout_date:"2026-03-17", nights:1,
      room_rate:3500, booking_total:3500, status:"Checked In",
      folio:"FOL-2026-002", payment_status:"Unpaid",
    },
    {
      name:"BKG-2026-003", booking_date:"2026-03-13", member:"MEM-003",
      guest_name:"Mr. James Whitfield", room:"RM-201", room_type:"Deluxe",
      checkin_date:"2026-03-14", checkout_date:"2026-03-16", nights:2,
      room_rate:3500, booking_total:7000, status:"Checked In",
      folio:"FOL-2026-003", payment_status:"Unpaid",
    },
    {
      name:"BKG-2026-004", booking_date:"2026-03-15", member:null,
      guest_name:"Ms. Elena Petrova", room:"RM-203", room_type:"Suite",
      checkin_date:"2026-03-15", checkout_date:"2026-03-19", nights:4,
      room_rate:5500, booking_total:22000, status:"Checked In",
      folio:"FOL-2026-004", payment_status:"Unpaid",
    },
    {
      name:"BKG-2026-005", booking_date:"2026-03-16", member:null,
      guest_name:"Mr. Thanawat Poonpipat", room:"RM-302", room_type:"Deluxe",
      checkin_date:"2026-03-16", checkout_date:"2026-03-18", nights:2,
      room_rate:3500, booking_total:7000, status:"Checked In",
      folio:"FOL-2026-005", payment_status:"Unpaid",
    },
  ],

  hotel_folio: [
    { name:"FOL-2026-001", booking:"BKG-2026-001", member:"MEM-001", guest_name:"Khun Ariya Sombat",      room:"RM-101", checkin_date:"2026-03-15", checkout_date:"2026-03-18", folio_total:0, invoice_status:"Not Invoiced", status:"In House", checkout_in_progress:false },
    { name:"FOL-2026-002", booking:"BKG-2026-002", member:"MEM-002", guest_name:"Khun Natcha Wongsiri",   room:"RM-103", checkin_date:"2026-03-16", checkout_date:"2026-03-17", folio_total:0, invoice_status:"Not Invoiced", status:"In House", checkout_in_progress:false },
    { name:"FOL-2026-003", booking:"BKG-2026-003", member:"MEM-003", guest_name:"Mr. James Whitfield",    room:"RM-201", checkin_date:"2026-03-14", checkout_date:"2026-03-16", folio_total:0, invoice_status:"Not Invoiced", status:"In House", checkout_in_progress:false },
    { name:"FOL-2026-004", booking:"BKG-2026-004", member:null,      guest_name:"Ms. Elena Petrova",      room:"RM-203", checkin_date:"2026-03-15", checkout_date:"2026-03-19", folio_total:0, invoice_status:"Not Invoiced", status:"In House", checkout_in_progress:false },
    { name:"FOL-2026-005", booking:"BKG-2026-005", member:null,      guest_name:"Mr. Thanawat Poonpipat", room:"RM-302", checkin_date:"2026-03-16", checkout_date:"2026-03-18", folio_total:0, invoice_status:"Not Invoiced", status:"In House", checkout_in_progress:false },
  ],

  hotel_folio_line: [
    // FOL-001: Ariya — 3 nights + spa + F&B
    { name:"FL-001-01", folio:"FOL-2026-001", item:"ROOM-NIGHT",  item_name:"Room Night (101)",           qty:3, rate:2500, amount:7500,  date:"2026-03-15", line_type:"Accommodation", invoiced:false },
    { name:"FL-001-02", folio:"FOL-2026-001", item:"SPA-THAI",    item_name:"Thai Traditional Massage",   qty:1, rate:1200, amount:1200,  date:"2026-03-16", line_type:"Spa",           invoiced:false },
    { name:"FL-001-03", folio:"FOL-2026-001", item:"SPA-TIP",     item_name:"Spa Gratuity / Tip",         qty:1, rate:200,  amount:200,   date:"2026-03-16", line_type:"Spa",           invoiced:false, spa_session:"SPA-2026-001" },
    { name:"FL-001-04", folio:"FOL-2026-001", item:"FB-PADTHAI",  item_name:"Pad Thai",                   qty:2, rate:220,  amount:440,   date:"2026-03-16", line_type:"F&B",           invoiced:false },
    { name:"FL-001-05", folio:"FOL-2026-001", item:"FB-BEER",     item_name:"Singha Beer",                qty:3, rate:140,  amount:420,   date:"2026-03-16", line_type:"F&B",           invoiced:false },
    // FOL-002: Natcha — 1 night + spa
    { name:"FL-002-01", folio:"FOL-2026-002", item:"ROOM-NIGHT",  item_name:"Room Night (103)",           qty:1, rate:3500, amount:3500,  date:"2026-03-16", line_type:"Accommodation", invoiced:false },
    { name:"FL-002-02", folio:"FOL-2026-002", item:"SPA-AROMA",   item_name:"Aromatherapy Oil Massage",   qty:1, rate:1800, amount:1800,  date:"2026-03-16", line_type:"Spa",           invoiced:false },
    { name:"FL-002-03", folio:"FOL-2026-002", item:"SPA-TIP",     item_name:"Spa Gratuity / Tip",         qty:1, rate:0,    amount:0,     date:"2026-03-16", line_type:"Spa",           invoiced:false, spa_session:"SPA-2026-002" },
    { name:"FL-002-04", folio:"FOL-2026-002", item:"FB-TOMYUM",   item_name:"Tom Yum Soup",               qty:1, rate:280,  amount:280,   date:"2026-03-16", line_type:"F&B",           invoiced:false },
    // FOL-003: James — 2 nights + 2 spa sessions + F&B + laundry
    { name:"FL-003-01", folio:"FOL-2026-003", item:"ROOM-NIGHT",  item_name:"Room Night (201)",           qty:2, rate:3500, amount:7000,  date:"2026-03-14", line_type:"Accommodation", invoiced:false },
    { name:"FL-003-02", folio:"FOL-2026-003", item:"SPA-STONE",   item_name:"Hot Stone Therapy",          qty:1, rate:2200, amount:2200,  date:"2026-03-15", line_type:"Spa",           invoiced:false },
    { name:"FL-003-03", folio:"FOL-2026-003", item:"SPA-TIP",     item_name:"Spa Gratuity / Tip",         qty:1, rate:300,  amount:300,   date:"2026-03-15", line_type:"Spa",           invoiced:false, spa_session:"SPA-2026-003" },
    { name:"FL-003-04", folio:"FOL-2026-003", item:"SPA-FACIAL",  item_name:"Signature Facial",           qty:1, rate:1600, amount:1600,  date:"2026-03-16", line_type:"Spa",           invoiced:false },
    { name:"FL-003-05", folio:"FOL-2026-003", item:"SPA-TIP",     item_name:"Spa Gratuity / Tip",         qty:1, rate:500,  amount:500,   date:"2026-03-16", line_type:"Spa",           invoiced:false, spa_session:"SPA-2026-004" },
    { name:"FL-003-06", folio:"FOL-2026-003", item:"SVC-LAUNDRY", item_name:"Laundry Service",            qty:1, rate:350,  amount:350,   date:"2026-03-15", line_type:"Housekeeping",  invoiced:false },
    { name:"FL-003-07", folio:"FOL-2026-003", item:"FB-COFFEE",   item_name:"Thai Iced Coffee",           qty:2, rate:120,  amount:240,   date:"2026-03-16", line_type:"F&B",           invoiced:false },
    // FOL-004: Elena — 4 nights
    { name:"FL-004-01", folio:"FOL-2026-004", item:"ROOM-NIGHT",  item_name:"Room Night (203)",           qty:4, rate:5500, amount:22000, date:"2026-03-15", line_type:"Accommodation", invoiced:false },
    { name:"FL-004-02", folio:"FOL-2026-004", item:"SPA-HERBAL",  item_name:"Herbal Compress",            qty:1, rate:1500, amount:1500,  date:"2026-03-16", line_type:"Spa",           invoiced:false },
    { name:"FL-004-03", folio:"FOL-2026-004", item:"SPA-TIP",     item_name:"Spa Gratuity / Tip",         qty:1, rate:0,    amount:0,     date:"2026-03-16", line_type:"Spa",           invoiced:false, spa_session:"SPA-2026-005" },
    { name:"FL-004-04", folio:"FOL-2026-004", item:"SVC-TRANSFER",item_name:"Airport Transfer",           qty:1, rate:1200, amount:1200,  date:"2026-03-15", line_type:"Transport",     invoiced:false },
    // FOL-005: Thanawat — 2 nights
    { name:"FL-005-01", folio:"FOL-2026-005", item:"ROOM-NIGHT",  item_name:"Room Night (302)",           qty:2, rate:3500, amount:7000,  date:"2026-03-16", line_type:"Accommodation", invoiced:false },
    { name:"FL-005-02", folio:"FOL-2026-005", item:"FB-FRIEDRICE",item_name:"Thai Fried Rice",            qty:1, rate:200,  amount:200,   date:"2026-03-16", line_type:"F&B",           invoiced:false },
  ],

  spa_session: [
    { name:"SPA-2026-001", session_date:"2026-03-16", folio:"FOL-2026-001", booking:"BKG-2026-001", member:"MEM-001", guest_name:"Khun Ariya Sombat",    officer:"SPO-001", officer_name:"Khun Linda Panya",   item:"SPA-THAI",  service_name:"Thai Traditional Massage", duration_min:60,  rate:1200, tip:200,  total:1400, status:"Completed", purchase_order:"PO-2026-001" },
    { name:"SPA-2026-002", session_date:"2026-03-16", folio:"FOL-2026-002", booking:"BKG-2026-002", member:"MEM-002", guest_name:"Khun Natcha Wongsiri", officer:"SPO-002", officer_name:"Khun May Charoenwong",item:"SPA-AROMA", service_name:"Aromatherapy Oil Massage",duration_min:90,  rate:1800, tip:0,    total:1800, status:"Completed", purchase_order:"PO-2026-002" },
    { name:"SPA-2026-003", session_date:"2026-03-15", folio:"FOL-2026-003", booking:"BKG-2026-003", member:"MEM-003", guest_name:"Mr. James Whitfield",  officer:"SPO-003", officer_name:"Khun Som Ratanaporn",item:"SPA-STONE", service_name:"Hot Stone Therapy",       duration_min:90,  rate:2200, tip:300,  total:2500, status:"Completed", purchase_order:"PO-2026-003" },
    { name:"SPA-2026-004", session_date:"2026-03-16", folio:"FOL-2026-003", booking:"BKG-2026-003", member:"MEM-003", guest_name:"Mr. James Whitfield",  officer:"SPO-001", officer_name:"Khun Linda Panya",   item:"SPA-FACIAL",service_name:"Signature Facial",         duration_min:60,  rate:1600, tip:500,  total:2100, status:"Completed", purchase_order:"PO-2026-004" },
    { name:"SPA-2026-005", session_date:"2026-03-16", folio:"FOL-2026-004", booking:"BKG-2026-004", member:null,      guest_name:"Ms. Elena Petrova",    officer:"SPO-004", officer_name:"Khun Lek Jaidee",    item:"SPA-HERBAL",service_name:"Herbal Compress",          duration_min:60,  rate:1500, tip:0,    total:1500, status:"Completed", purchase_order:"PO-2026-005" },
  ],

  // Spa POs (procurement-based: each session = PO to officer as vendor)
  purchase_order: [
    { name:"PO-2026-001", po_date:"2026-03-16", vendor:"VEND-SPO-001", vendor_name:"Khun Linda Panya",    spa_session:"SPA-2026-001", folio:"FOL-2026-001", item:"SPA-THAI",  service_name:"Thai Traditional Massage", service_amount:1200, commission_rate:0.30, commission_amount:360, tip_amount:200, total_payable:560,  status:"Received", paid:false },
    { name:"PO-2026-002", po_date:"2026-03-16", vendor:"VEND-SPO-002", vendor_name:"Khun May Charoenwong",spa_session:"SPA-2026-002", folio:"FOL-2026-002", item:"SPA-AROMA", service_name:"Aromatherapy Oil Massage", service_amount:1800, commission_rate:0.30, commission_amount:540, tip_amount:0,   total_payable:540,  status:"Received", paid:false },
    { name:"PO-2026-003", po_date:"2026-03-15", vendor:"VEND-SPO-003", vendor_name:"Khun Som Ratanaporn", spa_session:"SPA-2026-003", folio:"FOL-2026-003", item:"SPA-STONE", service_name:"Hot Stone Therapy",        service_amount:2200, commission_rate:0.25, commission_amount:550, tip_amount:300, total_payable:850,  status:"Received", paid:false },
    { name:"PO-2026-004", po_date:"2026-03-16", vendor:"VEND-SPO-001", vendor_name:"Khun Linda Panya",    spa_session:"SPA-2026-004", folio:"FOL-2026-003", item:"SPA-FACIAL",service_name:"Signature Facial",          service_amount:1600, commission_rate:0.30, commission_amount:480, tip_amount:500, total_payable:980,  status:"Received", paid:false },
    { name:"PO-2026-005", po_date:"2026-03-16", vendor:"VEND-SPO-004", vendor_name:"Khun Lek Jaidee",     spa_session:"SPA-2026-005", folio:"FOL-2026-004", item:"SPA-HERBAL",service_name:"Herbal Compress",           service_amount:1500, commission_rate:0.30, commission_amount:450, tip_amount:0,   total_payable:450,  status:"Received", paid:false },
  ],

  sales_invoice: [],
  sales_invoice_item: [],
  payment_entry: [],
  member_ledger_entry: [],
};

// ─── ID Sequence Counters ────────────────────────────────────────────────────
const SEQ_KEYS = {
  hotel_booking:      "seq_booking",
  hotel_folio:        "seq_folio",
  hotel_folio_line:   "seq_folio_line",
  spa_session:        "seq_spa_session",
  purchase_order:     "seq_po",
  sales_invoice:      "seq_invoice",
  sales_invoice_item: "seq_inv_item",
  payment_entry:      "seq_payment",
  member_ledger_entry:"seq_member_ledger",
};

// ─── Storage Helpers ─────────────────────────────────────────────────────────
function _storageKey(doctype) {
  return `${DB_VERSION}__${doctype}`;
}

function _seqKey(doctype) {
  return `${DB_VERSION}__${SEQ_KEYS[doctype]}`;
}

function _getAll(doctype) {
  try {
    const raw = localStorage.getItem(_storageKey(doctype));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function _setAll(doctype, data) {
  localStorage.setItem(_storageKey(doctype), JSON.stringify(data));
}

function _getSingle(doctype) {
  try {
    const raw = localStorage.getItem(_storageKey(doctype));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function _setSingle(doctype, data) {
  localStorage.setItem(_storageKey(doctype), JSON.stringify(data));
}

function _nextSeq(doctype) {
  const key = _seqKey(doctype);
  const n = parseInt(localStorage.getItem(key) || "0") + 1;
  localStorage.setItem(key, String(n));
  return n;
}

function _padded(n, digits=3) {
  return String(n).padStart(digits, "0");
}

// ─── Init / Seed ─────────────────────────────────────────────────────────────
function DB_init() {
  const marker = localStorage.getItem(`${DB_VERSION}__initialized`);
  if (!marker) {
    DB_reset();
  } else {
    // Recompute folio totals on load (in case data drifted)
    _recomputeAllFolioTotals();
  }
}

function DB_reset() {
  // Clear all keys for this DB version
  Object.keys(localStorage)
    .filter(k => k.startsWith(DB_VERSION))
    .forEach(k => localStorage.removeItem(k));

  // Write settings (single doc)
  _setSingle(DOCTYPE.HOTEL_SETTINGS, SEED.hotel_settings);

  // Write list doctypes
  const listTypes = [
    "hotel_room","hotel_member","spa_officer","item",
    "hotel_booking","hotel_folio","hotel_folio_line",
    "spa_session","purchase_order",
    "sales_invoice","sales_invoice_item","payment_entry","member_ledger_entry",
  ];
  listTypes.forEach(dt => _setAll(dt, SEED[dt] || []));

  // Recompute folio totals from seed folio lines
  _recomputeAllFolioTotals();

  // Set sequences to current max
  _setAll("hotel_booking", _getAll("hotel_booking")); // already set above
  localStorage.setItem(_seqKey("hotel_booking"),     "5");
  localStorage.setItem(_seqKey("hotel_folio"),       "5");
  localStorage.setItem(_seqKey("hotel_folio_line"),  "22");
  localStorage.setItem(_seqKey("spa_session"),       "5");
  localStorage.setItem(_seqKey("purchase_order"),    "5");
  localStorage.setItem(_seqKey("sales_invoice"),     "0");
  localStorage.setItem(_seqKey("sales_invoice_item"),"0");
  localStorage.setItem(_seqKey("payment_entry"),     "0");
  localStorage.setItem(_seqKey("member_ledger_entry"),"0");

  localStorage.setItem(`${DB_VERSION}__initialized`, "1");
}

function _recomputeAllFolioTotals() {
  const folios = _getAll(DOCTYPE.FOLIO);
  const lines  = _getAll(DOCTYPE.FOLIO_LINE);
  folios.forEach(f => {
    const fLines = lines.filter(l => l.folio === f.name);
    f.folio_total = fLines.reduce((s, l) => s + (l.amount || 0), 0);
  });
  _setAll(DOCTYPE.FOLIO, folios);
}

function _recomputeFolioTotal(folioName) {
  const lines  = _getAll(DOCTYPE.FOLIO_LINE).filter(l => l.folio === folioName);
  const folios = _getAll(DOCTYPE.FOLIO);
  const idx    = folios.findIndex(f => f.name === folioName);
  if (idx === -1) return;
  folios[idx].folio_total = lines.reduce((s, l) => s + (l.amount || 0), 0);
  _setAll(DOCTYPE.FOLIO, folios);
  return folios[idx];
}

// ─── Hotel Settings ───────────────────────────────────────────────────────────
const HotelSettings = {
  get() { return _getSingle(DOCTYPE.HOTEL_SETTINGS); },
};

// ─── Rooms ───────────────────────────────────────────────────────────────────
const Room = {
  list(filters={}) {
    let rows = _getAll(DOCTYPE.ROOM);
    if (filters.status) rows = rows.filter(r => r.status === filters.status);
    return rows;
  },
  get(name) { return _getAll(DOCTYPE.ROOM).find(r => r.name === name) || null; },
  update(name, patch) {
    const rows = _getAll(DOCTYPE.ROOM);
    const idx  = rows.findIndex(r => r.name === name);
    if (idx === -1) return null;
    rows[idx] = { ...rows[idx], ...patch };
    _setAll(DOCTYPE.ROOM, rows);
    return rows[idx];
  },
};

// ─── Members ─────────────────────────────────────────────────────────────────
const Member = {
  list()     { return _getAll(DOCTYPE.MEMBER); },
  get(name)  { return _getAll(DOCTYPE.MEMBER).find(m => m.name === name) || null; },
  adjustPoints(memberName, delta, reason) {
    const members = _getAll(DOCTYPE.MEMBER);
    const idx = members.findIndex(m => m.name === memberName);
    if (idx === -1) return null;
    members[idx].points_balance = (members[idx].points_balance || 0) + delta;
    _setAll(DOCTYPE.MEMBER, members);
    // Subledger entry
    const ledger = _getAll(DOCTYPE.MEMBER_LEDGER);
    const seq = _nextSeq("member_ledger_entry");
    ledger.push({
      name: `MEL-${_padded(seq)}`,
      member: memberName,
      date: "2026-03-16",
      points: delta,
      balance_after: members[idx].points_balance,
      reason: reason || "",
    });
    _setAll(DOCTYPE.MEMBER_LEDGER, ledger);
    return members[idx];
  },
};

// ─── Spa Officers ─────────────────────────────────────────────────────────────
const SpaOfficer = {
  list(filters={}) {
    let rows = _getAll(DOCTYPE.SPA_OFFICER);
    if (filters.status) rows = rows.filter(o => o.status === filters.status);
    return rows;
  },
  get(name) { return _getAll(DOCTYPE.SPA_OFFICER).find(o => o.name === name) || null; },
};

// ─── Items (Products) ────────────────────────────────────────────────────────
const Item = {
  list(filters={}) {
    let rows = _getAll(DOCTYPE.PRODUCT);
    if (filters.item_group) rows = rows.filter(i => i.item_group === filters.item_group);
    return rows;
  },
  get(name) { return _getAll(DOCTYPE.PRODUCT).find(i => i.name === name) || null; },
};

// ─── Bookings ────────────────────────────────────────────────────────────────
const Booking = {
  list(filters={}) {
    let rows = _getAll(DOCTYPE.BOOKING);
    if (filters.status) rows = rows.filter(b => b.status === filters.status);
    if (filters.member) rows = rows.filter(b => b.member === filters.member);
    return rows;
  },
  get(name) { return _getAll(DOCTYPE.BOOKING).find(b => b.name === name) || null; },
  create(data) {
    const seq  = _nextSeq("hotel_booking");
    const name = `BKG-2026-${_padded(seq,3)}`;
    const booking = { name, booking_date:"2026-03-16", status:"Confirmed", payment_status:"Unpaid", folio:null, ...data };
    const rows = _getAll(DOCTYPE.BOOKING);
    rows.push(booking);
    _setAll(DOCTYPE.BOOKING, rows);
    // Create folio automatically
    const folio = Folio.createForBooking(booking);
    booking.folio = folio.name;
    rows[rows.length-1].folio = folio.name;
    _setAll(DOCTYPE.BOOKING, rows);
    // Set room to Occupied
    Room.update(data.room, { status:"Occupied" });
    return booking;
  },
  update(name, patch) {
    const rows = _getAll(DOCTYPE.BOOKING);
    const idx  = rows.findIndex(b => b.name === name);
    if (idx === -1) return null;
    rows[idx] = { ...rows[idx], ...patch };
    _setAll(DOCTYPE.BOOKING, rows);
    return rows[idx];
  },
};

// ─── Folios ───────────────────────────────────────────────────────────────────
const Folio = {
  list(filters={}) {
    let rows = _getAll(DOCTYPE.FOLIO);
    if (filters.status)         rows = rows.filter(f => f.status === filters.status);
    if (filters.invoice_status) rows = rows.filter(f => f.invoice_status === filters.invoice_status);
    if (filters.checkout_date)  rows = rows.filter(f => f.checkout_date === filters.checkout_date);
    return rows;
  },
  get(name) { return _getAll(DOCTYPE.FOLIO).find(f => f.name === name) || null; },
  createForBooking(booking) {
    const seq  = _nextSeq("hotel_folio");
    const name = `FOL-2026-${_padded(seq,3)}`;
    const folio = {
      name,
      booking:          booking.name,
      member:           booking.member || null,
      guest_name:       booking.guest_name,
      room:             booking.room,
      checkin_date:     booking.checkin_date,
      checkout_date:    booking.checkout_date,
      folio_total:      0,
      invoice_status:   "Not Invoiced",
      status:           "In House",
      checkout_in_progress: false,
    };
    const rows = _getAll(DOCTYPE.FOLIO);
    rows.push(folio);
    _setAll(DOCTYPE.FOLIO, rows);
    // Add room night line
    FolioLine.add({
      folio: name,
      item: "ROOM-NIGHT",
      item_name: `Room Night (${booking.room.replace("RM-","")})`,
      qty: booking.nights,
      rate: booking.room_rate,
      date: booking.checkin_date,
      line_type: "Accommodation",
    });
    return folio;
  },
  update(name, patch) {
    const rows = _getAll(DOCTYPE.FOLIO);
    const idx  = rows.findIndex(f => f.name === name);
    if (idx === -1) return null;
    rows[idx] = { ...rows[idx], ...patch };
    _setAll(DOCTYPE.FOLIO, rows);
    return rows[idx];
  },
  recomputeTotal(name) { return _recomputeFolioTotal(name); },
};

// ─── Folio Lines ─────────────────────────────────────────────────────────────
const FolioLine = {
  list(folioName) {
    return _getAll(DOCTYPE.FOLIO_LINE).filter(l => l.folio === folioName);
  },
  add(data) {
    const seq  = _nextSeq("hotel_folio_line");
    const name = `FL-${_padded(seq,4)}`;
    const line = {
      name,
      invoiced: false,
      spa_session: null,
      ...data,
      amount: (data.qty || 1) * (data.rate || 0),
    };
    const rows = _getAll(DOCTYPE.FOLIO_LINE);
    rows.push(line);
    _setAll(DOCTYPE.FOLIO_LINE, rows);
    _recomputeFolioTotal(data.folio);
    return line;
  },
  update(name, patch) {
    const rows = _getAll(DOCTYPE.FOLIO_LINE);
    const idx  = rows.findIndex(l => l.name === name);
    if (idx === -1) return null;
    rows[idx] = { ...rows[idx], ...patch };
    if (patch.qty !== undefined || patch.rate !== undefined) {
      rows[idx].amount = rows[idx].qty * rows[idx].rate;
    }
    _setAll(DOCTYPE.FOLIO_LINE, rows);
    _recomputeFolioTotal(rows[idx].folio);
    return rows[idx];
  },
  remove(name) {
    const rows  = _getAll(DOCTYPE.FOLIO_LINE);
    const line  = rows.find(l => l.name === name);
    if (!line || line.invoiced) return { ok:false, message:"Cannot remove invoiced line." };
    const newRows = rows.filter(l => l.name !== name);
    _setAll(DOCTYPE.FOLIO_LINE, newRows);
    _recomputeFolioTotal(line.folio);
    return { ok:true };
  },
};

// ─── Spa Sessions ────────────────────────────────────────────────────────────
const SpaSession = {
  list(filters={}) {
    let rows = _getAll(DOCTYPE.SPA_SESSION);
    if (filters.folio)   rows = rows.filter(s => s.folio === filters.folio);
    if (filters.officer) rows = rows.filter(s => s.officer === filters.officer);
    if (filters.status)  rows = rows.filter(s => s.status === filters.status);
    return rows;
  },
  get(name) { return _getAll(DOCTYPE.SPA_SESSION).find(s => s.name === name) || null; },
  create(data) {
    // data: { folio, booking, member, guest_name, officer, item, session_date, rate, tip? }
    const officer = SpaOfficer.get(data.officer);
    const item    = Item.get(data.item);
    if (!officer || !item) return null;

    const seq     = _nextSeq("spa_session");
    const spaName = `SPA-2026-${_padded(seq,3)}`;
    const tip     = data.tip || 0;
    const session = {
      name:          spaName,
      session_date:  data.session_date || "2026-03-16",
      folio:         data.folio,
      booking:       data.booking || null,
      member:        data.member  || null,
      guest_name:    data.guest_name,
      officer:       data.officer,
      officer_name:  officer.officer_name,
      item:          data.item,
      service_name:  item.item_name,
      duration_min:  item.duration_min || 60,
      rate:          item.rate,
      tip:           tip,
      total:         item.rate + tip,
      status:        "Completed",
      purchase_order:null,
    };

    const rows = _getAll(DOCTYPE.SPA_SESSION);
    rows.push(session);
    _setAll(DOCTYPE.SPA_SESSION, rows);

    // Create PO for officer
    const po = PurchaseOrder.createForSpaSession(session, officer);
    session.purchase_order = po.name;
    rows[rows.length-1].purchase_order = po.name;
    _setAll(DOCTYPE.SPA_SESSION, rows);

    // Post to folio: service line + tip line
    if (data.folio) {
      FolioLine.add({
        folio: data.folio, item: data.item,
        item_name: item.item_name, qty:1, rate:item.rate,
        date: session.session_date, line_type:"Spa",
      });
      FolioLine.add({
        folio: data.folio, item:"SPA-TIP",
        item_name:"Spa Gratuity / Tip", qty:1, rate:tip,
        date: session.session_date, line_type:"Spa",
        spa_session: spaName,
      });
    }
    return session;
  },
  updateTip(sessionName, newTip) {
    const sessions = _getAll(DOCTYPE.SPA_SESSION);
    const idx = sessions.findIndex(s => s.name === sessionName);
    if (idx === -1) return null;
    const s = sessions[idx];
    s.tip   = newTip;
    s.total = s.rate + newTip;
    sessions[idx] = s;
    _setAll(DOCTYPE.SPA_SESSION, sessions);
    // Update PO tip
    PurchaseOrder.updateTip(s.purchase_order, newTip);
    // Update SPA-TIP folio line
    const lines = _getAll(DOCTYPE.FOLIO_LINE);
    const tipLine = lines.find(l => l.spa_session === sessionName && l.item === "SPA-TIP");
    if (tipLine) FolioLine.update(tipLine.name, { rate:newTip, qty:1 });
    return s;
  },
};

// ─── Purchase Orders ──────────────────────────────────────────────────────────
const PurchaseOrder = {
  list(filters={}) {
    let rows = _getAll(DOCTYPE.PURCHASE_ORDER);
    if (filters.vendor)  rows = rows.filter(p => p.vendor  === filters.vendor);
    if (filters.folio)   rows = rows.filter(p => p.folio   === filters.folio);
    if (filters.paid !== undefined) rows = rows.filter(p => p.paid === filters.paid);
    return rows;
  },
  get(name) { return _getAll(DOCTYPE.PURCHASE_ORDER).find(p => p.name === name) || null; },
  createForSpaSession(session, officer) {
    const seq    = _nextSeq("purchase_order");
    const name   = `PO-2026-${_padded(seq,3)}`;
    const commAmt = Math.round(session.rate * officer.commission_rate);
    const po = {
      name,
      po_date:          session.session_date,
      vendor:           officer.vendor_id,
      vendor_name:      officer.officer_name,
      spa_session:      session.name,
      folio:            session.folio,
      item:             session.item,
      service_name:     session.service_name,
      service_amount:   session.rate,
      commission_rate:  officer.commission_rate,
      commission_amount:commAmt,
      tip_amount:       session.tip || 0,
      total_payable:    commAmt + (session.tip || 0),
      status:           "Received",
      paid:             false,
    };
    const rows = _getAll(DOCTYPE.PURCHASE_ORDER);
    rows.push(po);
    _setAll(DOCTYPE.PURCHASE_ORDER, rows);
    return po;
  },
  updateTip(poName, newTip) {
    const rows = _getAll(DOCTYPE.PURCHASE_ORDER);
    const idx  = rows.findIndex(p => p.name === poName);
    if (idx === -1) return null;
    rows[idx].tip_amount    = newTip;
    rows[idx].total_payable = rows[idx].commission_amount + newTip;
    _setAll(DOCTYPE.PURCHASE_ORDER, rows);
    return rows[idx];
  },
  markPaid(poName) {
    const rows = _getAll(DOCTYPE.PURCHASE_ORDER);
    const idx  = rows.findIndex(p => p.name === poName);
    if (idx === -1) return null;
    rows[idx].paid = true;
    _setAll(DOCTYPE.PURCHASE_ORDER, rows);
    return rows[idx];
  },
};

// ─── Sales Invoices ───────────────────────────────────────────────────────────
const SalesInvoice = {
  list(filters={}) {
    let rows = _getAll(DOCTYPE.INVOICE);
    if (filters.folio)          rows = rows.filter(i => i.folio === filters.folio);
    if (filters.payment_status) rows = rows.filter(i => i.payment_status === filters.payment_status);
    return rows;
  },
  get(name) { return _getAll(DOCTYPE.INVOICE).find(i => i.name === name) || null; },
  create(folioName, lineNames, paymentMethod) {
    // lineNames: array of folio_line names to include in this invoice bucket
    const folio   = Folio.get(folioName);
    if (!folio) return null;
    const allLines = _getAll(DOCTYPE.FOLIO_LINE);
    const selected = allLines.filter(l => lineNames.includes(l.name) && !l.invoiced);
    if (!selected.length) return null;

    const settings = HotelSettings.get();
    const net      = selected.reduce((s, l) => s + l.amount, 0);
    const vat      = Math.round(net * settings.vat_rate);
    const total    = net + vat;

    const seq  = _nextSeq("sales_invoice");
    const name = `SINV-2026-${_padded(seq,4)}`;
    const inv  = {
      name,
      posting_date:   "2026-03-16",
      folio:          folioName,
      booking:        folio.booking,
      member:         folio.member,
      guest_name:     folio.guest_name,
      room:           folio.room,
      payment_method: paymentMethod || "Cash",
      net_total:      net,
      vat_amount:     vat,
      grand_total:    total,
      outstanding_amount: total,
      payment_status: "Unpaid",
      status:         "Submitted",
      is_hotel_invoice: true,
    };

    // Invoice items
    const invLines = [];
    selected.forEach(l => {
      const iseq = _nextSeq("sales_invoice_item");
      invLines.push({
        name:    `SINV-ITEM-${_padded(iseq,4)}`,
        parent:  name,
        folio_line: l.name,
        item:    l.item,
        item_name: l.item_name,
        qty:     l.qty,
        rate:    l.rate,
        amount:  l.amount,
        line_type: l.line_type,
      });
    });

    const invRows = _getAll(DOCTYPE.INVOICE);
    invRows.push(inv);
    _setAll(DOCTYPE.INVOICE, invRows);

    const invItemRows = _getAll(DOCTYPE.INVOICE_LINE);
    _setAll(DOCTYPE.INVOICE_LINE, [...invItemRows, ...invLines]);

    // Mark folio lines as invoiced
    const updatedLines = allLines.map(l =>
      lineNames.includes(l.name) ? { ...l, invoiced:true } : l
    );
    _setAll(DOCTYPE.FOLIO_LINE, updatedLines);

    // Update folio invoice status
    const remainingUninvoiced = updatedLines.filter(l => l.folio === folioName && !l.invoiced);
    Folio.update(folioName, {
      invoice_status: remainingUninvoiced.length === 0 ? "Fully Invoiced" : "Partially Invoiced",
    });

    return inv;
  },
  getItems(invoiceName) {
    return _getAll(DOCTYPE.INVOICE_LINE).filter(l => l.parent === invoiceName);
  },
  resetToDraft(invoiceName) {
    const invs = _getAll(DOCTYPE.INVOICE);
    const idx  = invs.findIndex(i => i.name === invoiceName);
    if (idx === -1) return null;
    invs[idx].status = "Draft";
    invs[idx].payment_status = "Unpaid";
    invs[idx].outstanding_amount = invs[idx].grand_total;
    _setAll(DOCTYPE.INVOICE, invs);
    // Un-mark folio lines
    const invLines = _getAll(DOCTYPE.INVOICE_LINE).filter(l => l.parent === invoiceName);
    const flNames  = invLines.map(l => l.folio_line);
    const fLines   = _getAll(DOCTYPE.FOLIO_LINE).map(l =>
      flNames.includes(l.name) ? { ...l, invoiced:false } : l
    );
    _setAll(DOCTYPE.FOLIO_LINE, fLines);
    Folio.update(invs[idx].folio, { invoice_status:"Not Invoiced" });
    return invs[idx];
  },
};

// ─── Payment Entries ──────────────────────────────────────────────────────────
const PaymentEntry = {
  list(filters={}) {
    let rows = _getAll(DOCTYPE.PAYMENT_ENTRY);
    if (filters.invoice) rows = rows.filter(p => p.invoice === filters.invoice);
    if (filters.folio)   rows = rows.filter(p => p.folio   === filters.folio);
    return rows;
  },
  create(invoiceName, amount, method) {
    const invs = _getAll(DOCTYPE.INVOICE);
    const idx  = invs.findIndex(i => i.name === invoiceName);
    if (idx === -1) return null;

    const inv  = invs[idx];
    const paid = Math.min(amount, inv.outstanding_amount);

    const seq  = _nextSeq("payment_entry");
    const name = `PE-2026-${_padded(seq,4)}`;
    const pe   = {
      name,
      payment_date:  "2026-03-16",
      invoice:       invoiceName,
      folio:         inv.folio,
      guest_name:    inv.guest_name,
      amount:        paid,
      payment_method:method,
      journal_account: method === "Cash" ? "1002-Petty Cash" : method === "Card" ? "1003-Card Receivable" : method === "Member Points" ? "2100-Member Liability" : "1004-Bank",
      status:        "Submitted",
    };

    const rows = _getAll(DOCTYPE.PAYMENT_ENTRY);
    rows.push(pe);
    _setAll(DOCTYPE.PAYMENT_ENTRY, rows);

    // Update invoice outstanding
    invs[idx].outstanding_amount = Math.max(0, inv.outstanding_amount - paid);
    invs[idx].payment_status = invs[idx].outstanding_amount === 0 ? "Paid" : "Partial";
    _setAll(DOCTYPE.INVOICE, invs);

    // Deduct member points if applicable
    if (method === "Member Points" && inv.member) {
      Member.adjustPoints(inv.member, -paid, `Payment for ${invoiceName}`);
    }

    // Check if folio fully paid
    _checkFolioFullyPaid(inv.folio);

    return pe;
  },
};

function _checkFolioFullyPaid(folioName) {
  const invs = SalesInvoice.list({ folio:folioName });
  const allPaid = invs.length > 0 && invs.every(i => i.payment_status === "Paid");
  if (allPaid) {
    Folio.update(folioName, { status:"Checked Out", invoice_status:"Fully Invoiced" });
    const folio = Folio.get(folioName);
    if (folio) {
      Room.update(folio.room, { status:"Vacant" });
      Booking.update(folio.booking, { status:"Checked Out", payment_status:"Paid" });
    }
  }
}

// ─── Checkout Flow (E09) ──────────────────────────────────────────────────────
const Checkout = {
  openWizard(folioName) {
    const folio = Folio.get(folioName);
    if (!folio) return { ok:false, message:"Folio not found." };
    if (folio.checkout_in_progress) return { ok:false, message:"Checkout already in progress." };
    if (folio.status === "Checked Out") return { ok:false, message:"Folio already checked out." };
    Folio.update(folioName, { checkout_in_progress:true });
    const lines = FolioLine.list(folioName).filter(l => !l.invoiced);
    return { ok:true, folio: Folio.get(folioName), lines };
  },
  cancelWizard(folioName) {
    Folio.update(folioName, { checkout_in_progress:false });
  },
  postInvoiceBucket(folioName, lineNames, paymentMethod) {
    if (!lineNames.length) return { ok:false, message:"No lines selected." };
    const inv = SalesInvoice.create(folioName, lineNames, paymentMethod);
    if (!inv) return { ok:false, message:"Invoice creation failed." };
    return { ok:true, invoice:inv };
  },
  completeCheckout(folioName) {
    Folio.update(folioName, { checkout_in_progress:false });
    _checkFolioFullyPaid(folioName);
    return Folio.get(folioName);
  },
};

// ─── Public API ───────────────────────────────────────────────────────────────
window.MarchHotelAPI = {
  DB: { init: DB_init, reset: DB_reset },
  HotelSettings,
  Room,
  Member,
  SpaOfficer,
  Item,
  Booking,
  Folio,
  FolioLine,
  SpaSession,
  PurchaseOrder,
  SalesInvoice,
  PaymentEntry,
  Checkout,
};
