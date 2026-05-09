/** Static decorative pixel props strewn around the floor / shelves to add density. */
export function Clutter() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[5]">
      {/* Toolbox bottom-left */}
      <div className="absolute bottom-2 left-20">
        <svg width="34" height="20" shapeRendering="crispEdges">
          <rect x="0" y="6" width="34" height="14" fill="#cc3322" stroke="#000" />
          <rect x="0" y="10" width="34" height="2" fill="#88180f" />
          <rect x="10" y="0" width="14" height="6" fill="none" stroke="#cc3322" strokeWidth="2" />
          <rect x="14" y="14" width="6" height="2" fill="#222" />
        </svg>
      </div>
      {/* Thermal paste tube */}
      <div className="absolute bottom-2 left-56">
        <svg width="18" height="8" shapeRendering="crispEdges">
          <rect x="0" y="2" width="14" height="4" fill="#dddddd" stroke="#000" />
          <rect x="14" y="3" width="3" height="2" fill="#888" />
        </svg>
      </div>
      {/* USB stick */}
      <div className="absolute bottom-3 left-72">
        <svg width="16" height="6" shapeRendering="crispEdges">
          <rect x="0" y="0" width="10" height="6" fill="#222" stroke="#444" />
          <rect x="10" y="1" width="6" height="4" fill="#aaa" />
        </svg>
      </div>
      {/* Screwdriver */}
      <div className="absolute bottom-2 right-32">
        <svg width="40" height="6" shapeRendering="crispEdges">
          <rect x="0" y="2" width="14" height="3" fill="#ffaa22" />
          <rect x="14" y="2" width="22" height="2" fill="#ddd" />
          <rect x="36" y="2" width="4" height="2" fill="#888" />
        </svg>
      </div>
      {/* Sticky note */}
      <div className="absolute top-[55%] right-2 w-12 h-12 rotate-6"
        style={{ background: "#f4e060", boxShadow: "1px 1px 0 #000, 2px 2px 0 rgba(0,0,0,0.5)" }}>
        <div className="text-[8px] font-pixel text-black p-1 leading-tight">DO NOT TOUCH!!</div>
      </div>
      {/* Soda can stack */}
      <div className="absolute bottom-3 right-56 flex gap-0.5">
        <div className="w-2 h-4" style={{ background: "linear-gradient(180deg,#33aa55,#114422)", boxShadow: "0 0 0 1px #000" }} />
        <div className="w-2 h-4" style={{ background: "linear-gradient(180deg,#aa3333,#441111)", boxShadow: "0 0 0 1px #000" }} />
      </div>
      {/* Danger sign */}
      <div className="absolute top-32 right-44 px-1 py-0.5 font-pixel text-[7px] text-black"
        style={{ background: "#ffd700", border: "1px solid #000", transform: "rotate(-4deg)" }}>
        ⚠ HV
      </div>
      {/* Dust pile */}
      <div className="absolute bottom-1 left-44 w-6 h-1.5 rounded-full"
        style={{ background: "rgba(160,140,100,0.5)", filter: "blur(1px)" }} />
    </div>
  );
}