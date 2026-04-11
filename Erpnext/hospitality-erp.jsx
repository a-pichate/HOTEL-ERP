import { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  bg:       "#0A0C10",
  surface:  "#111318",
  card:     "#161B24",
  border:   "#1E2530",
  borderHi: "#2A3545",
  accent:   "#00C6A2",
  accentDim:"#00C6A220",
  accentMid:"#00C6A240",
  gold:     "#F0B429",
  goldDim:  "#F0B42920",
  blue:     "#4DA6FF",
  blueDim:  "#4DA6FF20",
  rose:     "#FF5C7A",
  roseDim:  "#FF5C7A20",
  purple:   "#A78BFA",
  purpleDim:"#A78BFA20",
  text:     "#E8EDF5",
  textSub:  "#8A95A8",
  textMut:  "#4A5568",
};

// ─── MODULE DEFINITIONS ───────────────────────────────────────────────────────
const MODULES = [
  { id:"dashboard",  label:"Command Center", icon:"⬡",  color: T.accent  },
  { id:"pms",        label:"Property Mgmt",  icon:"🏛",  color: T.blue    },
  { id:"rates",      label:"Rate Engine",    icon:"⚡",  color: T.gold    },
  { id:"inventory",  label:"Inventory & MM", icon:"📦",  color: T.purple  },
  { id:"sales",      label:"Sales & SD",     icon:"◈",   color: T.accent  },
  { id:"finance",    label:"Finance & CO",   icon:"⊛",   color: T.rose    },
  { id:"guests",     label:"Guest CRM",      icon:"◉",   color: T.blue    },
  { id:"reports",    label:"Analytics",      icon:"▦",   color: T.gold    },
];

const PROPERTY_TYPES = [
  { id:"hotel",     label:"Hotel",       icon:"🏨", rooms: 142 },
  { id:"hostel",    label:"Hostel",      icon:"🛏",  rooms: 64  },
  { id:"apartment", label:"Serviced Apt",icon:"🏢",  rooms: 28  },
  { id:"tenant",    label:"Tenant/Lease",icon:"🔑",  rooms: 15  },
];

// ─── SPARKLINE ────────────────────────────────────────────────────────────────
function Spark({ data, color, h = 36 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 120;
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width="120" height={h} style={{ display:"block" }}>
      <defs>
        <linearGradient id={`sg${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth="1.5"
        points={pts} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── KPI CARD ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, trend, spark, color }) {
  const up = trend >= 0;
  return (
    <div style={{
      background: T.card, border:`1px solid ${T.border}`,
      borderRadius: 12, padding:"18px 20px",
      display:"flex", flexDirection:"column", gap: 8, position:"relative", overflow:"hidden"
    }}>
      <div style={{ position:"absolute", top:0, right:0, width:80, height:80,
        background:`radial-gradient(circle at 100% 0%, ${color}18 0%, transparent 70%)` }}/>
      <span style={{ color: T.textSub, fontSize: 11, fontFamily:"'Space Mono',monospace",
        letterSpacing:"0.08em", textTransform:"uppercase" }}>{label}</span>
      <span style={{ color: T.text, fontSize: 26, fontWeight: 700,
        fontFamily:"'DM Serif Display',serif", lineHeight:1 }}>{value}</span>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize: 11, color: up ? T.accent : T.rose }}>
          {up ? "▲" : "▼"} {Math.abs(trend)}% {sub}
        </span>
        {spark && <Spark data={spark} color={color}/>}
      </div>
    </div>
  );
}

// ─── BADGE ────────────────────────────────────────────────────────────────────
function Badge({ label, color }) {
  return (
    <span style={{
      background:`${color}22`, color, border:`1px solid ${color}44`,
      borderRadius:4, padding:"2px 8px", fontSize:10,
      fontFamily:"'Space Mono',monospace", letterSpacing:"0.06em"
    }}>{label}</span>
  );
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
function Bar({ pct, color, label, sub }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      <div style={{ display:"flex", justifyContent:"space-between" }}>
        <span style={{ fontSize:12, color: T.text }}>{label}</span>
        <span style={{ fontSize:12, color }}>{sub}</span>
      </div>
      <div style={{ height:5, borderRadius:3, background: T.border }}>
        <div style={{ width:`${pct}%`, height:"100%", borderRadius:3,
          background:`linear-gradient(90deg, ${color}, ${color}AA)`,
          transition:"width 0.8s cubic-bezier(0.4,0,0.2,1)" }}/>
      </div>
    </div>
  );
}

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
function SectionHead({ title, sub, action }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end",
      marginBottom:20, paddingBottom:16, borderBottom:`1px solid ${T.border}` }}>
      <div>
        <h2 style={{ margin:0, color: T.text, fontSize:18,
          fontFamily:"'DM Serif Display',serif", fontWeight:400 }}>{title}</h2>
        {sub && <p style={{ margin:"4px 0 0", color: T.textSub, fontSize:12 }}>{sub}</p>}
      </div>
      {action && <button style={{
        background: T.accentDim, color: T.accent, border:`1px solid ${T.accent}44`,
        borderRadius:6, padding:"6px 14px", fontSize:11, cursor:"pointer",
        fontFamily:"'Space Mono',monospace"
      }}>{action}</button>}
    </div>
  );
}

// ─── TABLE ────────────────────────────────────────────────────────────────────
function DataTable({ cols, rows }) {
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
        <thead>
          <tr>{cols.map(c=>(
            <th key={c} style={{ padding:"8px 12px", textAlign:"left",
              color: T.textSub, borderBottom:`1px solid ${T.border}`,
              fontFamily:"'Space Mono',monospace", fontSize:10,
              letterSpacing:"0.06em", fontWeight:400, textTransform:"uppercase" }}>{c}</th>
          ))}</tr>
        </thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i} style={{ borderBottom:`1px solid ${T.border}22`,
              transition:"background 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.background=T.borderHi+"22"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              {r.map((c,j)=>(
                <td key={j} style={{ padding:"10px 12px", color: T.text }}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── DASHBOARD MODULE ─────────────────────────────────────────────────────────
function Dashboard() {
  const [occ, setOcc] = useState(78);
  useEffect(()=>{
    const t = setInterval(()=>setOcc(v => Math.max(60, Math.min(95, v + (Math.random()-0.48)*3))), 3000);
    return ()=>clearInterval(t);
  },[]);

  const kpis = [
    { label:"Occupancy Rate", value:`${occ.toFixed(1)}%`, sub:"vs last week", trend:4.2,
      spark:[61,65,70,68,74,71,78,75,occ], color: T.accent },
    { label:"Revenue Today", value:"$24,830", sub:"vs yesterday", trend:8.1,
      spark:[18000,19500,21000,20200,22100,21800,24830], color: T.blue },
    { label:"ADR", value:"$189.40", sub:"avg daily rate", trend:2.3,
      spark:[175,178,182,179,185,183,189], color: T.gold },
    { label:"RevPAR", value:"$147.73", sub:"rev per avail room", trend:6.7,
      spark:[120,125,130,128,138,135,148], color: T.purple },
    { label:"Arrivals Today", value:"34", sub:"confirmed", trend:0,
      spark:[28,31,25,34,30,32,34], color: T.rose },
    { label:"Pending Invoices", value:"12", sub:"require action", trend:-3,
      spark:[15,14,16,13,14,13,12], color: T.accent },
  ];

  const recentActivity = [
    ["#R-4821", "Suite 1201", "Marina Chen", "Check-In", <Badge label="ARRIVED" color={T.accent}/>, "$320/nt"],
    ["#R-4819", "Apt 3B", "James Okafor", "Reservation", <Badge label="CONFIRMED" color={T.blue}/>, "$185/nt"],
    ["#R-4820", "Bed 12 (Hostel)", "Sofia Reyes", "Check-Out", <Badge label="DEPARTED" color={T.textSub}/>, "$45/nt"],
    ["#L-0042", "Unit 7F (Tenant)", "Ravi Corp Ltd", "Lease", <Badge label="ACTIVE" color={T.gold}/>, "$4,200/mo"],
    ["#SO-0381", "F&B — Bar", "Walk-in", "POS Sale", <Badge label="PAID" color={T.accent}/>, "$148"],
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <div>
        <h1 style={{ margin:"0 0 4px", color: T.text, fontSize:22,
          fontFamily:"'DM Serif Display',serif", fontWeight:400 }}>
          Command Center
        </h1>
        <p style={{ margin:0, color: T.textSub, fontSize:12 }}>
          Live across all properties · {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
        </p>
      </div>

      {/* Property Type Selector */}
      <div style={{ display:"flex", gap:10 }}>
        {PROPERTY_TYPES.map(p=>(
          <div key={p.id} style={{
            flex:1, background: T.card, border:`1px solid ${T.border}`,
            borderRadius:10, padding:"12px 16px", cursor:"pointer",
            transition:"border-color 0.2s"
          }}
          onMouseEnter={e=>e.currentTarget.style.borderColor=T.accent}
          onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
            <div style={{ fontSize:20, marginBottom:4 }}>{p.icon}</div>
            <div style={{ fontSize:12, color: T.text, fontWeight:600 }}>{p.label}</div>
            <div style={{ fontSize:11, color: T.textSub }}>{p.rooms} units</div>
          </div>
        ))}
      </div>

      {/* KPI Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12 }}>
        {kpis.map(k=><KpiCard key={k.label} {...k}/>)}
      </div>

      {/* Occupancy Heatmap + Activity */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.6fr", gap:16 }}>
        {/* Floor plan occupancy */}
        <div style={{ background: T.card, border:`1px solid ${T.border}`,
          borderRadius:12, padding:20 }}>
          <SectionHead title="Occupancy by Floor" sub="Live availability"/>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {["L12","L11","L10","L9","L8","L7"].map((fl,i)=>{
              const pct = [92,85,78,95,60,72][i];
              const c = pct>88 ? T.rose : pct>70 ? T.gold : T.accent;
              return <Bar key={fl} pct={pct} color={c} label={`Floor ${fl}`} sub={`${pct}%`}/>;
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ background: T.card, border:`1px solid ${T.border}`,
          borderRadius:12, padding:20 }}>
          <SectionHead title="Recent Activity" sub="All property types" action="View All"/>
          <DataTable
            cols={["Ref","Unit","Guest/Tenant","Type","Status","Rate"]}
            rows={recentActivity}/>
        </div>
      </div>
    </div>
  );
}

// ─── PMS MODULE ───────────────────────────────────────────────────────────────
function PMS() {
  const [view, setView] = useState("grid");
  const rooms = [
    { id:"1201", type:"Suite",    floor:12, status:"occupied",   guest:"Marina Chen",   rate:320, nights:3, propType:"hotel"     },
    { id:"1202", type:"Deluxe",   floor:12, status:"vacant",     guest:null,            rate:195, nights:0, propType:"hotel"     },
    { id:"1203", type:"Deluxe",   floor:12, status:"cleaning",   guest:null,            rate:195, nights:0, propType:"hotel"     },
    { id:"1101", type:"Standard", floor:11, status:"occupied",   guest:"Tom Walsh",     rate:145, nights:1, propType:"hotel"     },
    { id:"3B",   type:"1-Bed Apt",floor:3,  status:"occupied",   guest:"James Okafor",  rate:185, nights:14,propType:"apartment" },
    { id:"7F",   type:"2-Bed Apt",floor:7,  status:"leased",     guest:"Ravi Corp Ltd", rate:4200,nights:365,propType:"tenant"   },
    { id:"B12",  type:"Dorm Bed", floor:1,  status:"vacant",     guest:null,            rate:45,  nights:0, propType:"hostel"    },
    { id:"B13",  type:"Dorm Bed", floor:1,  status:"occupied",   guest:"Ana Lima",      rate:45,  nights:2, propType:"hostel"    },
    { id:"B14",  type:"Priv Rm",  floor:1,  status:"reserved",   guest:"Booking.com",   rate:89,  nights:1, propType:"hostel"    },
    { id:"1102", type:"Standard", floor:11, status:"maintenance",guest:null,            rate:145, nights:0, propType:"hotel"     },
    { id:"4C",   type:"Studio",   floor:4,  status:"vacant",     guest:null,            rate:155, nights:0, propType:"apartment" },
    { id:"9A",   type:"3-Bed Apt",floor:9,  status:"leased",     guest:"LPQ Holdings",  rate:6800,nights:365,propType:"tenant"  },
  ];

  const statusColor = { occupied: T.accent, vacant: T.textMut, cleaning: T.gold,
    reserved: T.blue, maintenance: T.rose, leased: T.purple };
  const typeIcon = { hotel:"🏨", apartment:"🏢", hostel:"🛏", tenant:"🔑" };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h1 style={{ margin:"0 0 4px", color: T.text, fontSize:22,
            fontFamily:"'DM Serif Display',serif", fontWeight:400 }}>Property Management</h1>
          <p style={{ margin:0, color: T.textSub, fontSize:12 }}>
            Multi-type inventory · Hotels, Apartments, Hostels, Tenancies
          </p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {["grid","list"].map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{
              background: view===v ? T.accentDim : "transparent",
              color: view===v ? T.accent : T.textSub,
              border:`1px solid ${view===v ? T.accent+"44" : T.border}`,
              borderRadius:6, padding:"6px 14px", fontSize:11, cursor:"pointer",
              fontFamily:"'Space Mono',monospace", textTransform:"uppercase"
            }}>{v}</button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display:"flex", gap:16, marginBottom:20 }}>
        {Object.entries(statusColor).map(([k,c])=>(
          <div key={k} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:c }}/>
            <span style={{ fontSize:11, color: T.textSub, textTransform:"capitalize" }}>{k}</span>
          </div>
        ))}
      </div>

      {view === "grid" ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:10 }}>
          {rooms.map(r=>(
            <div key={r.id} style={{
              background: T.card, border:`1px solid ${T.border}`,
              borderRadius:10, padding:14, cursor:"pointer",
              borderLeft:`3px solid ${statusColor[r.status]}`,
              transition:"transform 0.15s, border-color 0.15s"
            }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.borderColor=statusColor[r.status]}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor=T.border}}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:13,
                  color: T.text, fontWeight:700 }}>{r.id}</span>
                <span style={{ fontSize:14 }}>{typeIcon[r.propType]}</span>
              </div>
              <div style={{ fontSize:11, color: T.textSub, marginBottom:4 }}>{r.type}</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <Badge label={r.status.toUpperCase()} color={statusColor[r.status]}/>
                <span style={{ fontSize:11, color: T.gold, fontFamily:"'Space Mono',monospace" }}>
                  ${r.propType==="tenant" ? (r.rate/1000).toFixed(1)+"k" : r.rate}
                  {r.propType==="tenant" ? "/mo" : "/nt"}
                </span>
              </div>
              {r.guest && <div style={{ fontSize:10, color: T.textSub, marginTop:6,
                whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {r.guest}
              </div>}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:20 }}>
          <DataTable
            cols={["Unit","Type","Property","Status","Guest/Tenant","Rate","Nights"]}
            rows={rooms.map(r=>[
              <span style={{ fontFamily:"'Space Mono',monospace", color: T.accent }}>{r.id}</span>,
              r.type,
              <span style={{ fontSize:14 }}>{typeIcon[r.propType]} {r.propType}</span>,
              <Badge label={r.status.toUpperCase()} color={statusColor[r.status]}/>,
              r.guest || "—",
              <span style={{ color: T.gold, fontFamily:"'Space Mono',monospace" }}>
                ${r.propType==="tenant"?(r.rate/1000).toFixed(1)+"k/mo":r.rate+"/nt"}
              </span>,
              r.nights || "—"
            ])}
          />
        </div>
      )}
    </div>
  );
}

// ─── RATE ENGINE MODULE ───────────────────────────────────────────────────────
function RateEngine() {
  const [occ, setOcc] = useState(78);
  const [bar, setBar] = useState(195);
  const [strategy, setStrategy] = useState("yield");

  const derived = {
    floor: Math.round(bar * 0.65),
    negotiated: Math.round(bar * 0.82),
    wholesaler: Math.round(bar * 0.72),
    ota: Math.round(bar * 1.05),
    walkIn: Math.round(bar * 1.18),
  };

  const occColor = occ > 85 ? T.rose : occ > 70 ? T.gold : T.accent;

  const strategies = [
    { id:"yield",    label:"Yield Mgmt",   desc:"OPERA-style real-time occupancy triggers" },
    { id:"condition",label:"Condition Rule",desc:"SAP SD-style multi-variable price lookup" },
    { id:"hybrid",   label:"Hybrid AI",    desc:"ML-driven combining both approaches" },
  ];

  const conditionRules = [
    ["Corporate", "Rate Plan", "Negotiated Profile Required", "$159", T.blue],
    ["Leisure",   "Season+LOS","Min 2 nights, BAR-based",    "$195", T.accent],
    ["Wholesale", "Contract",  "Account-gated, margin-floor", "$140", T.purple],
    ["Walk-In",   "Rack Rate", "No restriction",             "$230", T.rose],
    ["Gov/NGO",   "Special",   "ID verification required",   "$139", T.gold],
  ];

  return (
    <div>
      <h1 style={{ margin:"0 0 4px", color: T.text, fontSize:22,
        fontFamily:"'DM Serif Display',serif", fontWeight:400 }}>Dynamic Rate Engine</h1>
      <p style={{ margin:"0 0 24px", color: T.textSub, fontSize:12 }}>
        Combines OPERA yield logic + SAP SD condition technique in a unified pricing layer
      </p>

      {/* Strategy Selector */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:24 }}>
        {strategies.map(s=>(
          <div key={s.id} onClick={()=>setStrategy(s.id)} style={{
            background: strategy===s.id ? T.accentDim : T.card,
            border:`1px solid ${strategy===s.id ? T.accent : T.border}`,
            borderRadius:10, padding:16, cursor:"pointer", transition:"all 0.2s"
          }}>
            <div style={{ color: strategy===s.id ? T.accent : T.text,
              fontWeight:700, fontSize:13, marginBottom:4 }}>{s.label}</div>
            <div style={{ color: T.textSub, fontSize:11 }}>{s.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.4fr", gap:16 }}>
        {/* Live Yield Controls */}
        <div style={{ background: T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:20 }}>
          <SectionHead title="Live Yield Controls" sub="OPERA-inspired occupancy engine"/>

          <div style={{ marginBottom:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ color: T.textSub, fontSize:12 }}>Current Occupancy</span>
              <span style={{ color: occColor, fontFamily:"'Space Mono',monospace",
                fontSize:14, fontWeight:700 }}>{occ}%</span>
            </div>
            <input type="range" min="40" max="100" value={occ}
              onChange={e=>{setOcc(+e.target.value); setBar(Math.round(145 + (+e.target.value-40)*2.5));}}
              style={{ width:"100%", accentColor: occColor }}/>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color: T.textMut }}>
              <span>40% — Open all rates</span><span>100% — Restrict to premium</span>
            </div>
          </div>

          {/* Trigger thresholds */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {[
              { threshold:60, label:"Open negotiated rates", active: occ >= 0 },
              { threshold:70, label:"Close wholesale rates",  active: occ >= 70 },
              { threshold:80, label:"Close promotional BAR",  active: occ >= 80 },
              { threshold:90, label:"Restrict to rack/walk-in",active: occ >= 90 },
            ].map(t=>(
              <div key={t.threshold} style={{
                display:"flex", alignItems:"center", gap:10, padding:"8px 12px",
                borderRadius:6, background: t.active ? T.accentDim : T.surface,
                border:`1px solid ${t.active ? T.accent+"44" : T.border}`
              }}>
                <div style={{ width:8, height:8, borderRadius:"50%",
                  background: t.active ? T.accent : T.textMut }}/>
                <span style={{ fontSize:11, color: t.active ? T.text : T.textSub, flex:1 }}>
                  {t.label}
                </span>
                <span style={{ fontSize:10, color: T.textMut,
                  fontFamily:"'Space Mono',monospace" }}>≥{t.threshold}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Derived Rate Cascade */}
        <div style={{ background: T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:20 }}>
          <SectionHead title="Rate Cascade (SAP SD Condition Logic)" sub="Derived from BAR"/>
          <div style={{ marginBottom:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ color: T.textSub, fontSize:12 }}>Best Available Rate (BAR)</span>
              <span style={{ color: T.gold, fontFamily:"'Space Mono',monospace",
                fontSize:18, fontWeight:700 }}>${bar}</span>
            </div>
            <input type="range" min="120" max="380" value={bar}
              onChange={e=>setBar(+e.target.value)}
              style={{ width:"100%", accentColor: T.gold }}/>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {Object.entries(derived).map(([k,v])=>{
              const pct = Math.round((v/bar)*100);
              const c = v > bar ? T.rose : v > bar*0.9 ? T.gold : v > bar*0.75 ? T.accent : T.blue;
              return (
                <div key={k} style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ width:90, fontSize:11, color: T.textSub, textTransform:"capitalize" }}>{k}</span>
                  <div style={{ flex:1, height:4, borderRadius:2, background: T.border }}>
                    <div style={{ width:`${pct}%`, height:"100%", background:c, borderRadius:2 }}/>
                  </div>
                  <span style={{ width:40, fontSize:12, color:c,
                    fontFamily:"'Space Mono',monospace", textAlign:"right" }}>${v}</span>
                  <span style={{ width:36, fontSize:10, color: T.textMut,
                    fontFamily:"'Space Mono',monospace" }}>{pct}%</span>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop:16, padding:"10px 14px", borderRadius:8,
            background: T.surface, border:`1px solid ${T.border}` }}>
            <div style={{ fontSize:11, color: T.textSub, marginBottom:6 }}>
              Rate Floor (Cannot sell below)</div>
            <div style={{ fontSize:20, color: T.rose, fontFamily:"'Space Mono',monospace",
              fontWeight:700 }}>${derived.floor}
              <span style={{ fontSize:11, color: T.textMut, marginLeft:8 }}>
                locked by CO margin rule</span>
            </div>
          </div>
        </div>
      </div>

      {/* Condition Records Table */}
      <div style={{ background: T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:20, marginTop:16 }}>
        <SectionHead title="Condition Records" sub="SAP SD-style rate plan matrix · All property types" action="+ New Rule"/>
        <DataTable
          cols={["Segment", "Condition Type", "Access Rule", "Rate", ""]}
          rows={conditionRules.map(([seg,ct,rule,rate,c])=>[
            <span style={{ fontWeight:600, color: T.text }}>{seg}</span>,
            <Badge label={ct} color={c}/>,
            <span style={{ color: T.textSub }}>{rule}</span>,
            <span style={{ fontFamily:"'Space Mono',monospace", color: T.gold, fontWeight:700 }}>{rate}</span>,
            <button style={{ background:"transparent", color: T.accent, border:"none",
              cursor:"pointer", fontSize:11 }}>Edit →</button>
          ])}
        />
      </div>
    </div>
  );
}

// ─── INVENTORY / MM MODULE ────────────────────────────────────────────────────
function Inventory() {
  const items = [
    { code:"FBG-001", name:"Craft Beer (Bottle)", cat:"F&B", stock:124, reorder:50,  unitCost:2.80, sellPrice:8.50,  supplier:"City Brewery",   status:"ok"  },
    { code:"HKG-012", name:"Bed Linen Set",       cat:"HK",  stock:18,  reorder:30,  unitCost:22.0, sellPrice:null,  supplier:"Linens Direct",  status:"low" },
    { code:"SPA-004", name:"Massage Oil 100ml",   cat:"SPA", stock:62,  reorder:20,  unitCost:4.20, sellPrice:12.00, supplier:"WellCo",         status:"ok"  },
    { code:"FBG-009", name:"Bottled Water 500ml", cat:"F&B", stock:8,   reorder:100, unitCost:0.35, sellPrice:3.50,  supplier:"AquaPure",       status:"crit"},
    { code:"MNT-003", name:"HVAC Filter",         cat:"MNT", stock:6,   reorder:10,  unitCost:15.0, sellPrice:null,  supplier:"TechParts Co",   status:"low" },
    { code:"AMN-007", name:"Welcome Kit",         cat:"AMN", stock:95,  reorder:40,  unitCost:6.50, sellPrice:null,  supplier:"GiftCraft",      status:"ok"  },
  ];

  const catColor = { "F&B": T.gold, "HK": T.blue, "SPA": T.purple, "MNT": T.rose, "AMN": T.accent };
  const statColor = { ok: T.accent, low: T.gold, crit: T.rose };

  return (
    <div>
      <h1 style={{ margin:"0 0 4px", color: T.text, fontSize:22,
        fontFamily:"'DM Serif Display',serif", fontWeight:400 }}>Inventory & Materials (MM)</h1>
      <p style={{ margin:"0 0 24px", color: T.textSub, fontSize:12 }}>
        SAP MM-inspired · Stock management, procurement triggers, COGS auto-posting
      </p>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
        {[
          { label:"Total SKUs", value:"247", color: T.accent },
          { label:"Low Stock Alerts", value:"18", color: T.rose },
          { label:"Pending POs", value:"6", color: T.gold },
          { label:"Inventory Value", value:"$48,230", color: T.blue },
        ].map(c=>(
          <div key={c.label} style={{ background: T.card, border:`1px solid ${T.border}`,
            borderRadius:10, padding:16 }}>
            <div style={{ fontSize:11, color: T.textSub, fontFamily:"'Space Mono',monospace",
              letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8 }}>{c.label}</div>
            <div style={{ fontSize:24, color: c.color,
              fontFamily:"'DM Serif Display',serif" }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:20 }}>
        <SectionHead title="Stock Register" sub="Auto COGS posting · Selling price engine" action="+ Add Item"/>
        <DataTable
          cols={["Code","Item","Category","Stock","Reorder","Unit Cost","Sell Price","Margin","Supplier","Status"]}
          rows={items.map(it=>{
            const margin = it.sellPrice ? Math.round(((it.sellPrice-it.unitCost)/it.sellPrice)*100) : null;
            return [
              <span style={{ fontFamily:"'Space Mono',monospace", color: T.textSub, fontSize:11 }}>{it.code}</span>,
              <span style={{ color: T.text, fontWeight:600 }}>{it.name}</span>,
              <Badge label={it.cat} color={catColor[it.cat]}/>,
              <span style={{ color: it.status==="crit" ? T.rose : it.status==="low" ? T.gold : T.text }}>
                {it.stock}
              </span>,
              <span style={{ color: T.textSub }}>{it.reorder}</span>,
              <span style={{ fontFamily:"'Space Mono',monospace", color: T.textSub }}>${it.unitCost.toFixed(2)}</span>,
              it.sellPrice
                ? <span style={{ fontFamily:"'Space Mono',monospace", color: T.gold }}>${it.sellPrice.toFixed(2)}</span>
                : <span style={{ color: T.textMut }}>Internal</span>,
              margin !== null
                ? <Badge label={`${margin}%`} color={margin>60 ? T.accent : margin>30 ? T.gold : T.rose}/>
                : <span style={{ color: T.textMut }}>—</span>,
              <span style={{ color: T.textSub, fontSize:11 }}>{it.supplier}</span>,
              <Badge label={it.status.toUpperCase()} color={statColor[it.status]}/>
            ];
          })}
        />
      </div>

      {/* Auto-posting logic */}
      <div style={{ background: T.card, border:`1px solid ${T.border}`,
        borderRadius:12, padding:20, marginTop:16 }}>
        <SectionHead title="Auto Accounting Rules (CO Integration)"/>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
          {[
            { event:"F&B Sale", dr:"Cash/AR", cr:"Revenue — F&B", cogs:"Debit COGS, Credit Inventory", color: T.gold },
            { event:"Room Service Consumption", dr:"Room Cost Centre", cr:"Inventory", cogs:"Direct cost allocation", color: T.blue },
            { event:"Restock PO Receipt", dr:"Inventory Asset", cr:"AP/Vendor", cogs:"Standard cost valuation", color: T.purple },
          ].map(a=>(
            <div key={a.event} style={{ padding:14, borderRadius:8,
              background: T.surface, border:`1px solid ${T.border}` }}>
              <Badge label={a.event} color={a.color}/>
              <div style={{ marginTop:10, fontSize:11, color: T.textSub }}>
                <div>Dr: <span style={{ color: T.text }}>{a.dr}</span></div>
                <div>Cr: <span style={{ color: T.text }}>{a.cr}</span></div>
                <div style={{ marginTop:6, color: T.textMut }}>{a.cogs}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── FINANCE MODULE ───────────────────────────────────────────────────────────
function Finance() {
  const glEntries = [
    ["2024-01-11","JV-0841","Room Revenue — Suite 1201","4100-Revenue","Cr","$320.00", T.accent],
    ["2024-01-11","JV-0841","Accounts Receivable","1200-AR","Dr","$320.00", T.blue],
    ["2024-01-11","JV-0842","F&B Revenue — Bar","4200-F&B Rev","Cr","$148.00", T.gold],
    ["2024-01-11","JV-0842","Cash","1100-Cash","Dr","$148.00", T.accent],
    ["2024-01-11","JV-0843","COGS — Bottled Water","5100-COGS","Dr","$2.80", T.rose],
    ["2024-01-11","JV-0843","Inventory","1300-Inv","Cr","$2.80", T.purple],
    ["2024-01-11","JV-0844","Housekeeping Labour","6200-Payroll","Dr","$480.00", T.rose],
    ["2024-01-11","JV-0844","Accrued Payroll","2100-AP","Cr","$480.00", T.textSub],
  ];

  const plData = [
    { account:"Room Revenue",   amount: 18450, type:"income",  color: T.accent },
    { account:"F&B Revenue",    amount:  4820, type:"income",  color: T.gold   },
    { account:"Services Revenue",amount: 1240, type:"income",  color: T.blue   },
    { account:"COGS — F&B",     amount: -1420, type:"expense", color: T.rose   },
    { account:"Payroll",        amount: -6800, type:"expense", color: T.rose   },
    { account:"Utilities",      amount:  -980, type:"expense", color: T.rose   },
    { account:"Depreciation",   amount:  -340, type:"expense", color: T.textMut},
  ];

  const totalRev = plData.filter(x=>x.type==="income").reduce((s,x)=>s+x.amount,0);
  const totalExp = Math.abs(plData.filter(x=>x.type==="expense").reduce((s,x)=>s+x.amount,0));
  const ebitda = totalRev - totalExp;

  return (
    <div>
      <h1 style={{ margin:"0 0 4px", color: T.text, fontSize:22,
        fontFamily:"'DM Serif Display',serif", fontWeight:400 }}>Finance & Controlling (FI/CO)</h1>
      <p style={{ margin:"0 0 24px", color: T.textSub, fontSize:12 }}>
        SAP FI/CO-inspired · Auto GL posting, cost centre allocation, P&L drill-down
      </p>

      {/* P&L Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:24 }}>
        {[
          { label:"Total Revenue", value:`$${totalRev.toLocaleString()}`, color: T.accent },
          { label:"Total Expenses", value:`$${totalExp.toLocaleString()}`, color: T.rose },
          { label:"EBITDA", value:`$${ebitda.toLocaleString()}`, color: ebitda>0 ? T.gold : T.rose },
        ].map(c=>(
          <div key={c.label} style={{ background: T.card, border:`1px solid ${T.border}`,
            borderRadius:10, padding:20 }}>
            <div style={{ fontSize:11, color: T.textSub, fontFamily:"'Space Mono',monospace",
              letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8 }}>{c.label}</div>
            <div style={{ fontSize:28, color: c.color,
              fontFamily:"'DM Serif Display',serif" }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:16 }}>
        {/* GL Journal */}
        <div style={{ background: T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:20 }}>
          <SectionHead title="Auto-Posted GL Journal" sub="Real-time from all modules" action="Export"/>
          <DataTable
            cols={["Date","Ref","Description","Account","Dr/Cr","Amount"]}
            rows={glEntries.map(([date,ref,desc,acc,dc,amt,c])=>[
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color: T.textMut }}>{date}</span>,
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color: T.textSub }}>{ref}</span>,
              <span style={{ fontSize:12, color: T.text }}>{desc}</span>,
              <Badge label={acc} color={c}/>,
              <span style={{ color: dc==="Dr" ? T.blue : T.accent, fontFamily:"'Space Mono',monospace",
                fontSize:11 }}>{dc}</span>,
              <span style={{ fontFamily:"'Space Mono',monospace", color: T.gold }}>{amt}</span>
            ])}
          />
        </div>

        {/* P&L Waterfall */}
        <div style={{ background: T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:20 }}>
          <SectionHead title="P&L Breakdown" sub="This month · All properties"/>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {plData.map(p=>(
              <div key={p.account} style={{
                display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"8px 12px", borderRadius:6, background: T.surface
              }}>
                <span style={{ fontSize:12, color: T.text }}>{p.account}</span>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:80, height:4, borderRadius:2, background: T.border }}>
                    <div style={{
                      width:`${Math.abs(p.amount)/totalRev*100}%`, height:"100%",
                      background: p.color, borderRadius:2
                    }}/>
                  </div>
                  <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11,
                    color: p.type==="income" ? T.accent : T.rose, width:70, textAlign:"right" }}>
                    {p.type==="income" ? "+" : ""}${Math.abs(p.amount).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
            <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:10, marginTop:4,
              display:"flex", justifyContent:"space-between" }}>
              <span style={{ color: T.gold, fontWeight:700 }}>EBITDA</span>
              <span style={{ fontFamily:"'Space Mono',monospace", color: T.gold,
                fontWeight:700 }}>${ebitda.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SALES MODULE ─────────────────────────────────────────────────────────────
function Sales() {
  const orders = [
    { id:"SO-0381", customer:"Walk-in Guest",   type:"F&B POS",     items:"2x Beer, 1x Nachos", total:24.50,  tax:2.45, status:"paid",    channel:"POS"        },
    { id:"SO-0382", customer:"Marina Chen",     type:"Room Service", items:"Breakfast Package",  total:48.00,  tax:4.80, status:"billed",  channel:"In-Room"    },
    { id:"SO-0383", customer:"LPQ Holdings",    type:"Event Hire",   items:"Boardroom 4h + AV", total:1200.0, tax:120,  status:"invoiced",channel:"Corporate"  },
    { id:"SO-0384", customer:"Booking.com",     type:"Accommodation",items:"Std Room 2n",        total:290.00, tax:29.0, status:"pending", channel:"OTA"        },
    { id:"SO-0385", customer:"Ana Lima",        type:"Hostel Bed",   items:"Dorm 2n",            total:90.00,  tax:9.0,  status:"paid",    channel:"Direct"     },
    { id:"SO-0386", customer:"Ravi Corp Ltd",   type:"Lease",        items:"Unit 7F — Jan",      total:4200.0, tax:0,    status:"invoiced",channel:"Tenant"     },
  ];

  const statColor = { paid: T.accent, billed: T.blue, invoiced: T.gold, pending: T.textSub };
  const chColor = { POS: T.gold, "In-Room": T.blue, Corporate: T.purple, OTA: T.rose, Direct: T.accent, Tenant: T.textSub };

  return (
    <div>
      <h1 style={{ margin:"0 0 4px", color: T.text, fontSize:22,
        fontFamily:"'DM Serif Display',serif", fontWeight:400 }}>Sales & Distribution (SD)</h1>
      <p style={{ margin:"0 0 24px", color: T.textSub, fontSize:12 }}>
        SAP SD-inspired · Unified sales order across all revenue streams with auto-billing
      </p>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
        {[
          { label:"Today's Sales", value:"$5,852", color: T.gold },
          { label:"Open Invoices", value:"12", color: T.rose },
          { label:"Avg Order Value", value:"$975", color: T.accent },
          { label:"Channel Mix: OTA", value:"34%", color: T.blue },
        ].map(c=>(
          <div key={c.label} style={{ background: T.card, border:`1px solid ${T.border}`,
            borderRadius:10, padding:16 }}>
            <div style={{ fontSize:11, color: T.textSub, fontFamily:"'Space Mono',monospace",
              letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8 }}>{c.label}</div>
            <div style={{ fontSize:24, color: c.color,
              fontFamily:"'DM Serif Display',serif" }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:20 }}>
        <SectionHead title="Sales Orders" sub="All types — rooms, F&B, events, leases" action="+ New Order"/>
        <DataTable
          cols={["Order","Customer","Type","Items","Subtotal","Tax","Status","Channel"]}
          rows={orders.map(o=>[
            <span style={{ fontFamily:"'Space Mono',monospace", color: T.accent, fontSize:11 }}>{o.id}</span>,
            <span style={{ color: T.text }}>{o.customer}</span>,
            <span style={{ color: T.textSub, fontSize:11 }}>{o.type}</span>,
            <span style={{ color: T.textSub, fontSize:11 }}>{o.items}</span>,
            <span style={{ fontFamily:"'Space Mono',monospace", color: T.gold }}>
              ${o.total.toFixed(2)}
            </span>,
            <span style={{ fontFamily:"'Space Mono',monospace", color: T.textSub, fontSize:11 }}>
              ${o.tax.toFixed(2)}
            </span>,
            <Badge label={o.status.toUpperCase()} color={statColor[o.status]}/>,
            <Badge label={o.channel} color={chColor[o.channel]}/>
          ])}
        />
      </div>

      {/* Pricing determination flow */}
      <div style={{ background: T.card, border:`1px solid ${T.border}`,
        borderRadius:12, padding:20, marginTop:16 }}>
        <SectionHead title="Pricing Determination Flow"
          sub="How the system resolves price for any transaction"/>
        <div style={{ display:"flex", alignItems:"center", gap:0, overflowX:"auto", paddingBottom:4 }}>
          {[
            { step:"Property Type", desc:"Hotel / Hostel / Apt / Tenant", color: T.blue },
            { step:"Sales Channel", desc:"Direct / OTA / Corp / POS", color: T.gold },
            { step:"Customer Segment", desc:"Leisure / Corp / Gov / Walk-in", color: T.purple },
            { step:"Date & Season", desc:"Peak / Shoulder / Off-peak", color: T.accent },
            { step:"Occupancy Yield", desc:"OPERA trigger logic", color: T.rose },
            { step:"Rate Floor Check", desc:"CO margin validation", color: T.rose },
            { step:"Final Price", desc:"Apply tax + package", color: T.accent },
          ].map((s,i)=>(
            <div key={s.step} style={{ display:"flex", alignItems:"center" }}>
              <div style={{ padding:"10px 14px", borderRadius:8,
                background: T.surface, border:`1px solid ${s.color}44`,
                minWidth:110, textAlign:"center" }}>
                <div style={{ fontSize:10, color: s.color,
                  fontFamily:"'Space Mono',monospace", marginBottom:4 }}>Step {i+1}</div>
                <div style={{ fontSize:11, color: T.text, fontWeight:700 }}>{s.step}</div>
                <div style={{ fontSize:10, color: T.textSub }}>{s.desc}</div>
              </div>
              {i<6 && <div style={{ fontSize:16, color: T.borderHi, margin:"0 4px" }}>→</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ARCHITECTURE PAGE ────────────────────────────────────────────────────────
function Architecture() {
  const layers = [
    {
      label:"Presentation Layer", color: T.blue,
      items:["Web Dashboard","Mobile App","POS Terminal","Guest Self-Service Kiosk"]
    },
    {
      label:"Application Layer", color: T.accent,
      items:["PMS Engine (OPERA logic)","Rate Engine (Yield + Conditions)","Sales Order Mgmt (SAP SD)","Inventory/MM","Finance FI/CO","Guest CRM"]
    },
    {
      label:"Business Rules Engine", color: T.gold,
      items:["Dynamic Pricing Triggers","Occupancy Yield Rules","Condition Technique Lookup","Rate Floor / Margin Guard","Auto GL Mapping","Tax Determination"]
    },
    {
      label:"Data Layer (HANA-class)", color: T.purple,
      items:["In-memory columnar DB","Real-time analytics","Master Data (Guest/Material/Vendor)","Financial Ledger","Time-series Rate History"]
    },
    {
      label:"Integration Layer", color: T.rose,
      items:["GDS/OTA Connector","Payment Gateway","RMS (Duetto/IDeaS)","IoT/BMS","Tax Compliance API","Tenant Billing (EDI)"]
    },
  ];

  const principles = [
    { title:"OPERA Yield Logic", from:"Oracle OPERA", desc:"Real-time occupancy-driven rate open/close, hurdle rates, BAR cascade", color: T.blue },
    { title:"Condition Technique", from:"SAP SD", desc:"Multi-variable pricing lookup: customer + segment + channel + date + quantity", color: T.gold },
    { title:"MM Materials Mgmt", from:"SAP MM", desc:"Inventory valuation, COGS posting, procurement triggers, standard costing", color: T.purple },
    { title:"FI/CO Accounting", from:"SAP FI/CO", desc:"Auto GL posting, cost centre allocation, P&L by property/department", color: T.accent },
    { title:"Unified Guest Profile", from:"Oracle OPERA", desc:"Cross-property CRM, stay history, preference engine, loyalty", color: T.rose },
    { title:"HANA In-Memory", from:"SAP HANA", desc:"Sub-second analytics on live transactional data, no data warehouse lag", color: T.blue },
  ];

  return (
    <div>
      <h1 style={{ margin:"0 0 4px", color: T.text, fontSize:22,
        fontFamily:"'DM Serif Display',serif", fontWeight:400 }}>System Architecture</h1>
      <p style={{ margin:"0 0 24px", color: T.textSub, fontSize:12 }}>
        Design blueprint — best-of-breed from Oracle OPERA + SAP ECC/HANA SD/MM/FI/CO
      </p>

      {/* Architecture Stack */}
      <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
        {layers.map(l=>(
          <div key={l.label} style={{ background: T.card, border:`1px solid ${l.color}33`,
            borderRadius:10, padding:"14px 20px", display:"flex", alignItems:"center", gap:20 }}>
            <div style={{ width:160, flexShrink:0 }}>
              <div style={{ fontSize:12, fontWeight:700, color: l.color }}>{l.label}</div>
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {l.items.map(it=>(
                <Badge key={it} label={it} color={l.color}/>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Borrowed principles */}
      <div style={{ background: T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:20 }}>
        <SectionHead title="Design Principles — What Was Borrowed & Why"/>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
          {principles.map(p=>(
            <div key={p.title} style={{ padding:16, borderRadius:8,
              background: T.surface, border:`1px solid ${p.color}33` }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontWeight:700, color: T.text, fontSize:13 }}>{p.title}</span>
                <Badge label={p.from} color={p.color}/>
              </div>
              <p style={{ margin:0, fontSize:11, color: T.textSub, lineHeight:1.6 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Adaptability matrix */}
      <div style={{ background: T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:20, marginTop:16 }}>
        <SectionHead title="Property Type Adaptability Matrix"/>
        <DataTable
          cols={["Feature","Hotel","Hostel","Serviced Apt","Tenant/Lease"]}
          rows={[
            ["Yield / Rate Strategy",        "✅ Full","✅ Simplified","⚡ Date-based","❌ N/A"],
            ["Condition Rate Records",        "✅ Full","✅ Segment","✅ Package deals","✅ Contract terms"],
            ["Inventory / F&B Items",         "✅ Full","✅ Basic","⚡ Optional","❌ N/A"],
            ["Auto GL Posting",               "✅ Real-time","✅ Real-time","✅ Real-time","✅ Monthly"],
            ["Sales Order Types",             "Folio","Folio","Folio+Retail","Lease Invoice"],
            ["Guest CRM",                     "✅ Full","✅ Lite","✅ Full","✅ Tenant profile"],
            ["Multi-currency",                "✅","✅","✅","✅"],
            ["Tax Handling",                  "VAT/GST","VAT","VAT","Commercial lease"],
          ].map(r=>[
            <span style={{ color: T.text, fontWeight:600 }}>{r[0]}</span>,
            ...r.slice(1).map(v=><span style={{ color: T.textSub, fontSize:11 }}>{v}</span>)
          ])}
        />
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [active, setActive] = useState("dashboard");
  const [sideCollapsed, setSideCollapsed] = useState(false);

  const moduleComponents = {
    dashboard:  <Dashboard/>,
    pms:        <PMS/>,
    rates:      <RateEngine/>,
    inventory:  <Inventory/>,
    sales:      <Sales/>,
    finance:    <Finance/>,
    guests:     <div style={{padding:40,textAlign:"center",color:T.textSub}}>Guest CRM — coming in next sprint</div>,
    reports:    <div style={{padding:40,textAlign:"center",color:T.textSub}}>Analytics — coming in next sprint</div>,
  };

  const archItem = { id:"arch", label:"Architecture", icon:"◻", color: T.textSub };

  return (
    <div style={{ display:"flex", height:"100vh", background: T.bg, color: T.text,
      fontFamily:"'DM Sans', system-ui, sans-serif", overflow:"hidden" }}>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2A3545; border-radius:2px; }
        input[type=range] { -webkit-appearance:none; height:4px; border-radius:2px;
          background:#1E2530; outline:none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:14px;
          height:14px; border-radius:50%; cursor:pointer; background: var(--thumb-color, #00C6A2); }
      `}</style>

      {/* SIDEBAR */}
      <div style={{
        width: sideCollapsed ? 60 : 220, flexShrink:0,
        background: T.surface, borderRight:`1px solid ${T.border}`,
        display:"flex", flexDirection:"column", transition:"width 0.25s ease",
        overflow:"hidden"
      }}>
        {/* Logo */}
        <div style={{ padding:"20px 16px", borderBottom:`1px solid ${T.border}`,
          display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, flexShrink:0,
            background:`linear-gradient(135deg, ${T.accent}, ${T.blue})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:16, fontWeight:700, color:"#0A0C10" }}>H</div>
          {!sideCollapsed && (
            <div>
              <div style={{ fontSize:13, fontWeight:700, color: T.text,
                fontFamily:"'DM Serif Display',serif" }}>HorizonERP</div>
              <div style={{ fontSize:10, color: T.textSub }}>Hospitality Suite</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"12px 8px", overflowY:"auto" }}>
          {[...MODULES, archItem].map(m=>(
            <button key={m.id} onClick={()=>setActive(m.id)} style={{
              width:"100%", display:"flex", alignItems:"center",
              gap:10, padding:"9px 10px", borderRadius:8, marginBottom:2,
              background: active===m.id ? `${m.color}20` : "transparent",
              border: active===m.id ? `1px solid ${m.color}40` : "1px solid transparent",
              color: active===m.id ? m.color : T.textSub,
              cursor:"pointer", transition:"all 0.15s", textAlign:"left"
            }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{m.icon}</span>
              {!sideCollapsed && (
                <span style={{ fontSize:12, fontWeight: active===m.id ? 600 : 400 }}>
                  {m.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button onClick={()=>setSideCollapsed(v=>!v)} style={{
          margin:"12px 8px", padding:"8px", borderRadius:8,
          background:"transparent", border:`1px solid ${T.border}`,
          color: T.textSub, cursor:"pointer", fontSize:12,
          transition:"all 0.15s"
        }}>
          {sideCollapsed ? "→" : "← Collapse"}
        </button>
      </div>

      {/* TOPBAR + CONTENT */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Topbar */}
        <div style={{
          height:52, background: T.surface, borderBottom:`1px solid ${T.border}`,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 24px", flexShrink:0
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Badge label="LIVE" color={T.accent}/>
            <span style={{ fontSize:11, color: T.textSub }}>
              All systems operational · Last sync 12s ago
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <span style={{ fontSize:11, color: T.textSub,
              fontFamily:"'Space Mono',monospace" }}>Property: All</span>
            <div style={{ width:28, height:28, borderRadius:8,
              background:`linear-gradient(135deg, ${T.purple}, ${T.blue})`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:11, fontWeight:700, color:"#fff" }}>AM</div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ flex:1, overflowY:"auto", padding:28 }}>
          {active === "arch"
            ? <Architecture/>
            : moduleComponents[active] || null}
        </div>
      </div>
    </div>
  );
}
