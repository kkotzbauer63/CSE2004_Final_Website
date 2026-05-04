// Expanded info view shown whenever currentState is a CONFIG_MENU node.
// Displays entry info, the 3-phase interaction guide, and per-item details.
import { stateGroups } from "../../stateMachine/states.js";
import { nodeMap } from "../../data/graph.js";

// ── Layout constants ──────────────────────────────────────────────────────────
const GUIDE_TOP  = 86;       // y-top of the "how it works" guide section
const BOX_Y      = GUIDE_TOP + 18;   // 104  — y-top of the three phase boxes
const BOX_H      = 84;
const ITEMS_TOP  = BOX_Y + BOX_H + 12; // 200  — y-top of the item list
const ITEM_H     = 50;       // height allocated per item row (4px gap between rows)
const FOOTER     = 24;

// Three equal guide boxes across the 620px viewBox (14px side margins, 8px gaps)
const BOX_W  = 192;
const BOX1_X = 14;
const BOX2_X = BOX1_X + BOX_W + 8;  // 214
const BOX3_X = BOX2_X + BOX_W + 8;  // 414

export default function StateMapConfigMenu({ node, onGoToState, rampStyle = "smooth" }) {
  if (!node) return null;

  const isVariant  = !!node.menuVariants;
  const isVariable = node.id === "CHANNEL_MODE_CONFIG";
  const returnsTo  = node.returnsTo ?? "OFF";
  const returnsNode = nodeMap[returnsTo];
  const fromNode    = nodeMap[node.enteredFrom];

  // ── Resolve items (handle menuItems vs menuVariants) ─────────────────────
  let items, altItems;
  if (isVariant) {
    const keys    = Object.keys(node.menuVariants);
    const primKey = keys.includes(rampStyle) ? rampStyle : keys[0];
    const altKey  = keys.find((k) => k !== primKey) ?? keys[0];
    const primary = node.menuVariants[primKey];
    const alt     = node.menuVariants[altKey];
    items    = primary;
    altItems = primary.map((item, i) => {
      const a = alt[i];
      if (!a) return null;
      const differs =
        item.name !== a.name ||
        String(item.default) !== String(a.default) ||
        item.valueScheme !== a.valueScheme;
      return differs ? { ...a, label: altKey } : null;
    });
  } else {
    items    = node.menuItems ?? [];
    altItems = items.map(() => null);
  }

  const totalH = ITEMS_TOP + items.length * ITEM_H + FOOTER;

  return (
    <div className="statemap">
      <div className="statemap__header">
        <h3 className="statemap__title">{node.name}</h3>
        <span className="statemap__mode">
          {isVariable
            ? "N items · hardware-dependent"
            : `${items.length} item${items.length !== 1 ? "s" : ""}`}
        </span>
      </div>
      <div className="statemap__container">
        <svg className="statemap__svg" viewBox={`0 0 620 ${totalH}`} xmlns="http://www.w3.org/2000/svg">

          {/* ── Entry info (left) ──────────────────────────────────────── */}
          <rect x="14" y="12" width="360" height="62" rx="2"
            fill="#111" stroke="#2a2a2a" strokeWidth="1" />
          <text x="24" y="28"
            style={{ fontSize: "9px", fill: "#555", fontFamily: "monospace", letterSpacing: "0.06em" }}>
            ENTERED VIA
          </text>
          <text x="24" y="48"
            style={{ fontSize: "18px", fill: "#aaa", fontFamily: "monospace", fontWeight: "bold" }}>
            {node.enteredVia}
          </text>
          <text x="98" y="48"
            style={{ fontSize: "11px", fill: "#666" }}>
            from {fromNode?.name ?? node.enteredFrom}
          </text>
          <text x="24" y="65"
            style={{ fontSize: "8.5px", fill: "#404040" }}>
            {node.description}
          </text>
          {isVariant && (
            <text x="24" y="77"
              style={{ fontSize: "7.5px", fill: "#555", fontStyle: "italic", fontFamily: "monospace" }}>
              showing: {rampStyle} variant
            </text>
          )}

          {/* ── Return button (right) ──────────────────────────────────── */}
          <g role="button" style={{ cursor: "pointer" }} onClick={() => onGoToState(returnsTo)}>
            <rect x="386" y="22" width="220" height="32" rx="2"
              fill="#1c1c1e" stroke="#8B8B8B" strokeWidth="1.5" />
            <text x="496" y="42" textAnchor="middle" dominantBaseline="middle"
              className="statemap__node-label" fill="#bbb">
              ← {returnsNode?.name ?? returnsTo}
            </text>
          </g>
          <text x="496" y="68" textAnchor="middle" className="statemap__edge-label">
            1C — exit config
          </text>

          {/* ── Guide section title ─────────────────────────────────────── */}
          <text x="310" y={GUIDE_TOP + 12} textAnchor="middle"
            style={{ fontSize: "8.5px", fill: "#383838", fontFamily: "monospace", letterSpacing: "0.06em" }}>
            HOW CONFIG MENUS WORK
          </text>

          {/* ── Box 1: Presenting ──────────────────────────────────────── */}
          <rect x={BOX1_X} y={BOX_Y} width={BOX_W} height={BOX_H} rx="2"
            fill="#0e0e0e" stroke="#2a2a2a" strokeWidth="1" />
          <text x={BOX1_X + BOX_W / 2} y={BOX_Y + 14} textAnchor="middle"
            style={{ fontSize: "9px", fill: "#D4A84B", fontFamily: "monospace" }}>
            ① PRESENTING
          </text>
          <text x={BOX1_X + 8} y={BOX_Y + 28} style={{ fontSize: "8.5px", fill: "#777" }}>Light blinks once per item</text>
          <text x={BOX1_X + 8} y={BOX_Y + 41} style={{ fontSize: "8.5px", fill: "#777" }}>Hold = skip this item</text>
          <text x={BOX1_X + 8} y={BOX_Y + 54} style={{ fontSize: "8.5px", fill: "#777" }}>Release = configure item</text>
          <text x={BOX1_X + 8} y={BOX_Y + 70} style={{ fontSize: "8px", fill: "#444", fontStyle: "italic" }}>repeats for all items</text>

          {/* ── Box 2: Accepting ───────────────────────────────────────── */}
          <rect x={BOX2_X} y={BOX_Y} width={BOX_W} height={BOX_H} rx="2"
            fill="#0e0e0e" stroke="#2a2a2a" strokeWidth="1" />
          <text x={BOX2_X + BOX_W / 2} y={BOX_Y + 14} textAnchor="middle"
            style={{ fontSize: "9px", fill: "#7aadff", fontFamily: "monospace" }}>
            ② ACCEPTING
          </text>
          <text x={BOX2_X + 8} y={BOX_Y + 28} style={{ fontSize: "8.5px", fill: "#777" }}>Click = +1 to counter</text>
          <text x={BOX2_X + 8} y={BOX_Y + 41} style={{ fontSize: "8.5px", fill: "#777" }}>Hold = +10 to counter</text>
          <text x={BOX2_X + 8} y={BOX_Y + 54} style={{ fontSize: "8.5px", fill: "#777" }}>No input 3s = confirm value</text>
          <text x={BOX2_X + 8} y={BOX_Y + 70} style={{ fontSize: "8px", fill: "#444", fontStyle: "italic" }}>counter starts at 0</text>

          {/* ── Box 3: Complete ────────────────────────────────────────── */}
          <rect x={BOX3_X} y={BOX_Y} width={BOX_W} height={BOX_H} rx="2"
            fill="#0e0e0e" stroke="#2a2a2a" strokeWidth="1" />
          <text x={BOX3_X + BOX_W / 2} y={BOX_Y + 14} textAnchor="middle"
            style={{ fontSize: "9px", fill: "#888", fontFamily: "monospace" }}>
            ③ COMPLETE
          </text>
          <text x={BOX3_X + 8} y={BOX_Y + 28} style={{ fontSize: "8.5px", fill: "#777" }}>
            Returns to {returnsNode?.name ?? returnsTo}
          </text>
          <text x={BOX3_X + 8} y={BOX_Y + 41} style={{ fontSize: "8.5px", fill: "#777" }}>1C to exit early</text>
          <text x={BOX3_X + 8} y={BOX_Y + 54} style={{ fontSize: "8.5px", fill: "#555" }}>Skipped items keep</text>
          <text x={BOX3_X + 8} y={BOX_Y + 68} style={{ fontSize: "8.5px", fill: "#555" }}>current/default values.</text>

          {/* ── Item list ──────────────────────────────────────────────── */}
          {items.map((item, i) => {
            const iy  = ITEMS_TOP + i * ITEM_H;
            const alt = altItems[i];
            const ih  = ITEM_H - 4;  // inner row height
            return (
              <g key={i}>
                <rect x="14" y={iy} width="592" height={ih} rx="2"
                  fill="#0e0e0e" stroke="#222" strokeWidth="1" />
                {/* Number badge */}
                <rect x="14" y={iy} width="30" height={ih} rx="2"
                  fill="#181818" stroke="none" />
                <text x="29" y={iy + ih / 2 + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  style={{ fontSize: "11px", fill: "#555", fontFamily: "monospace", fontWeight: "bold" }}>
                  {item.position}
                </text>
                {/* Item name */}
                <text x="52" y={iy + 16} style={{ fontSize: "11px", fill: "#ccc" }}>
                  {item.name}
                </text>
                {/* Default value */}
                <text x="52" y={iy + 30}
                  style={{ fontSize: "9px", fill: "#666", fontFamily: "monospace" }}>
                  default: {String(item.default)}
                </text>
                {/* Value scheme */}
                <text x="52" y={iy + 42} style={{ fontSize: "8.5px", fill: "#484848" }}>
                  {item.valueScheme}
                </text>
                {/* Alt variant note (RAMP_CONFIG smooth vs stepped) */}
                {alt && (
                  <>
                    <text x="606" y={iy + 16} textAnchor="end"
                      style={{ fontSize: "9px", fill: "#555", fontStyle: "italic" }}>
                      {alt.label}: {alt.name}
                    </text>
                    <text x="606" y={iy + 30} textAnchor="end"
                      style={{ fontSize: "8.5px", fill: "#444", fontFamily: "monospace" }}>
                      default: {String(alt.default)}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* Hardware-variable item count note */}
          {isVariable && (
            <text x="310" y={ITEMS_TOP + items.length * ITEM_H + 14}
              textAnchor="middle"
              style={{ fontSize: "9px", fill: "#3a3a3a", fontStyle: "italic" }}>
              Item count varies by hardware model — check your light's documentation
            </text>
          )}
        </svg>
      </div>
      <div className="statemap__legend">
        <span className="statemap__legend-item">
          <span className="statemap__legend-dot" style={{ background: stateGroups.config.color }} />
          Config Menu
        </span>
      </div>
    </div>
  );
}
