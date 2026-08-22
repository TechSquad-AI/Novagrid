import React, { useState, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

const MC = { GET: "#10b981", POST: "#6366f1", PUT: "#f59e0b", PATCH: "#f59e0b", DELETE: "#ef4444" };

/* =============================================================
   LAYOUT CONSTANTS
   ============================================================= */
const ROOT_W = 140;
const ROOT_H = 44;
const ROUTER_CARD_PAD = 12;
const ROUTER_HEADER_H = 32;
const EP_NODE_W = 200;
const EP_NODE_H = 34;
const EP_GAP = 6;
const ROUTER_GAP = 16;
const LEVEL1_GAP = 90;
const LEVEL2_GAP = 60;
const PAD_X = 30;
const PAD_Y = 20;

/* =============================================================
   LAYOUT ENGINE — 3-tier structured layout
   Root → Router Cards → Endpoint nodes inside cards
   ============================================================= */
function layoutTree(root) {
    const nodes = [];
    const edges = [];
    const groups = []; // router card rectangles

    if (!root?.children || root.children.length === 0) {
        return { nodes: [], edges: [], groups: [], width: 600, height: 200 };
    }

    // Step 1: Calculate each router card's width based on its endpoints
    const routers = root.children.map((router) => {
        const epCount = router.children?.length || 0;
        const cardH = ROUTER_HEADER_H + ROUTER_CARD_PAD * 2 + epCount * (EP_NODE_H + EP_GAP) - EP_GAP;
        const cardW = EP_NODE_W + ROUTER_CARD_PAD * 2;
        return { ...router, _cardW: cardW, _cardH: cardH, _epCount: epCount };
    });

    // Step 2: Calculate total width
    const totalRouterW = routers.reduce((s, r) => s + r._cardW, 0) + (routers.length - 1) * ROUTER_GAP;
    const svgWidth = Math.max(totalRouterW + PAD_X * 2, 800);

    // Step 3: Position root
    const rootX = svgWidth / 2 - ROOT_W / 2;
    const rootY = PAD_Y;

    nodes.push({
        ...root, _x: rootX, _y: rootY, _w: ROOT_W, _h: ROOT_H, _type: "root",
        id: root.name || "root",
    });

    // Step 4: Position router cards
    const routerY = rootY + ROOT_H + LEVEL1_GAP;
    let rx = PAD_X + (svgWidth - PAD_X * 2 - totalRouterW) / 2;

    routers.forEach((router) => {
        const cardX = rx;
        const cardY = routerY;
        const headerY = cardY;
        const epStartY = cardY + ROUTER_HEADER_H + ROUTER_CARD_PAD;

        groups.push({
            x: cardX, y: cardY, w: router._cardW, h: router._cardH,
            name: router.name || "Group",
            count: router._epCount,
            id: router.name,
        });

        // Router label node (centered above or inside card header)
        nodes.push({
            ...router, _x: cardX, _y: headerY, _w: router._cardW, _h: ROUTER_HEADER_H, _type: "router",
            id: router.name,
        });

        // Edge from root to router
        edges.push({
            x1: rootX + ROOT_W / 2, y1: rootY + ROOT_H,
            x2: cardX + router._cardW / 2, y2: cardY,
        });

        // Position endpoint nodes inside card
        if (router.children) {
            router.children.forEach((ep, i) => {
                const epX = cardX + ROUTER_CARD_PAD;
                const epY = epStartY + i * (EP_NODE_H + EP_GAP);

                nodes.push({
                    ...ep, _x: epX, _y: epY, _w: EP_NODE_W, _h: EP_NODE_H, _type: "endpoint",
                    id: `${ep.method}-${ep.path}-${i}`,
                });

                // Edge from router to endpoint
                edges.push({
                    x1: cardX + router._cardW / 2, y1: cardY + ROUTER_HEADER_H,
                    x2: epX + EP_NODE_W / 2, y2: epY,
                });
            });
        }

        rx += router._cardW + ROUTER_GAP;
    });

    const svgHeight = routerY + Math.max(...routers.map(r => r._cardH)) + PAD_Y + 20;

    return { nodes, edges, groups, width: svgWidth, height: svgHeight };
}

/* =============================================================
   SVG TREE GRAPH COMPONENT
   ============================================================= */
export default function TreeGraph({ tree, onSelect, selectedId, accentColor = "#6366f1" }) {
    const [hovered, setHovered] = useState(null);

    const { nodes, edges, groups, width, height } = useMemo(() => {
        if (!tree) return { nodes: [], edges: [], groups: [], width: 0, height: 0 };
        return layoutTree(tree);
    }, [tree]);

    // Family = hovered node + its ancestors + its descendants
    const hoveredFamily = useMemo(() => {
        if (!hovered) return new Set();
        const set = new Set([hovered]);

        // Find ancestors
        edges.forEach(e => {
            const child = nodes.find(n => n._x === e.x2 - EP_NODE_W / 2 + (n._w || 0) / 2);
            // Simpler: just check which nodes are connected
        });

        // Find descendants: walk the tree
        const findDesc = (nodeList, targetId) => {
            for (const n of nodeList) {
                if (n.id === targetId) {
                    if (n.children) {
                        const addAll = (c) => {
                            set.add(c.method ? `${c.method}-${c.path}` : c.name);
                            c.children?.forEach(addAll);
                        };
                        n.children.forEach(addAll);
                    }
                    return true;
                }
            }
            return false;
        };
        nodes.forEach(n => findDesc(nodes, n.id));

        // Find parents
        edges.forEach(e => {
            const childNode = nodes.find(n => n._x + (n._w || 0) / 2 === e.x2 && n._y === e.y2);
            const parentNode = nodes.find(n => n._x + (n._w || 0) / 2 === e.x1 && n._y + (n._h || 0) === e.y1);
            if (childNode && set.has(childNode.id) && parentNode) {
                set.add(parentNode.id);
            }
        });

        return set;
    }, [hovered, nodes, edges]);

    const truncate = (s, n) => s && s.length > n ? s.slice(0, n) + "\u2026" : s;
    const isDimmed = (id) => hovered && !hoveredFamily.has(id);

    if (nodes.length === 0) return (
        <Box sx={{ p: 6, textAlign: "center" }}>
            <AccountTreeRoundedIcon sx={{ fontSize: 40, color: "#d1d5db", mb: 1 }} />
            <Typography sx={{ color: "#94a3b8", fontSize: 13 }}>No tree data. Click "Scan Now" to discover endpoints.</Typography>
        </Box>
    );

    return (
        <Box sx={{ overflow: "auto", maxHeight: 700, background: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
                <defs>
                    <pattern id="tg-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                        <circle cx="8" cy="8" r="0.6" fill="#dde1e6" />
                    </pattern>
                    <filter id="tg-shadow" x="-4%" y="-4%" width="108%" height="112%">
                        <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.06" />
                    </filter>
                    <linearGradient id="tg-root-grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={accentColor} />
                        <stop offset="100%" stopColor={accentColor} stopOpacity="0.8" />
                    </linearGradient>
                </defs>

                <rect width="100%" height="100%" fill="url(#tg-grid)" />

                {/* ── ROUTER GROUP CARDS (background rects) ── */}
                {groups.map((g, i) => (
                    <g key={`g${i}`}>
                        <rect x={g.x} y={g.y} width={g.w} height={g.h}
                            rx={8} fill="#fff" stroke="#e2e8f0" strokeWidth={1}
                            filter="url(#tg-shadow)" />
                        {/* Card header background */}
                        <rect x={g.x} y={g.y} width={g.w} height={ROUTER_HEADER_H}
                            rx={8} fill="#f1f5f9" />
                        <rect x={g.x} y={g.y + ROUTER_HEADER_H - 8} width={g.w} height={8} fill="#f1f5f9" />
                        {/* Router name */}
                        <text x={g.x + 10} y={g.y + 21} fontSize={11} fontWeight={700} fill="#334155" fontFamily="sans-serif">
                            {truncate(g.name, 20)}
                        </text>
                        {/* Endpoint count badge */}
                        <rect x={g.x + g.w - 30} y={g.y + 10} width={22} height={14} rx={7} fill={accentColor} opacity={0.12} />
                        <text x={g.x + g.w - 19} y={g.y + 20.5} fontSize={8} fontWeight={700} fill={accentColor} textAnchor="middle">
                            {g.count}
                        </text>
                    </g>
                ))}

                {/* ── EDGES (root → routers, routers → endpoints) ── */}
                {edges.map((e, i) => {
                    const midY = (e.y1 + e.y2) / 2;
                    const d = `M ${e.x1} ${e.y1} C ${e.x1} ${midY}, ${e.x2} ${midY}, ${e.x2} ${e.y2}`;

                    // Determine if this edge is highlighted
                    const isHighlighted = hovered && (() => {
                        const childNode = nodes.find(n => Math.abs(n._x + (n._w || 0) / 2 - e.x2) < 1 && Math.abs(n._y - e.y2) < 1);
                        const parentNode = nodes.find(n => Math.abs(n._x + (n._w || 0) / 2 - e.x1) < 1 && Math.abs(n._y + (n._h || 0) - e.y1) < 1);
                        if (childNode && hoveredFamily.has(childNode.id)) return true;
                        if (parentNode && hoveredFamily.has(parentNode.id)) return true;
                        return false;
                    })();

                    return (
                        <path key={i} d={d} fill="none"
                            stroke={hovered ? (isHighlighted ? accentColor : "#e9ecf0") : "#c8cdd3"}
                            strokeWidth={hovered && isHighlighted ? 2 : 1.2}
                            strokeLinecap="round"
                            style={{ transition: "stroke 0.15s, stroke-width 0.15s" }} />
                    );
                })}

                {/* ── NODES ── */}
                {nodes.map((n, i) => {
                    const dimmed = isDimmed(n.id);
                    const isEndpoint = n._type === "endpoint";
                    const isRoot = n._type === "root";
                    const isRouter = n._type === "router";
                    const mc = isEndpoint ? (MC[n.method] || "#666") : null;
                    const selected = selectedId === `${n.method}${n.path}`;
                    const w = n._w || ROOT_W;
                    const h = n._h || ROOT_H;

                    return (
                        <g key={i}
                            onMouseEnter={() => setHovered(n.id)}
                            onMouseLeave={() => setHovered(null)}
                            onClick={() => { if (isEndpoint && onSelect) onSelect(n); }}
                            style={{ cursor: isEndpoint ? "pointer" : "default", opacity: dimmed ? 0.2 : 1, transition: "opacity 0.15s" }}>

                            {/* ── ROOT NODE ── */}
                            {isRoot && (
                                <>
                                    <rect x={n._x + 1} y={n._y + 2} width={w} height={h} rx={22} fill="rgba(0,0,0,0.08)" />
                                    <rect x={n._x} y={n._y} width={w} height={h} rx={22} fill="url(#tg-root-grad)" />
                                    <text x={n._x + w / 2} y={n._y + 18} fontSize={11} fontWeight={800} fill="#fff" textAnchor="middle" fontFamily="sans-serif">
                                        NovaGrid
                                    </text>
                                    <text x={n._x + w / 2} y={n._y + 32} fontSize={8} fill="rgba(255,255,255,0.7)" textAnchor="middle" fontFamily="monospace">
                                        {n.children?.length || 0} routers
                                    </text>
                                </>
                            )}

                            {/* ── ROUTER HEADER (inside card) ── */}
                            {isRouter && (
                                <>
                                    <rect x={n._x - 4} y={n._y - 1} width={8} height={h - 2} rx={2} fill={accentColor} opacity={0.7} />
                                </>
                            )}

                            {/* ── ENDPOINT NODE ── */}
                            {isEndpoint && (
                                <>
                                    {/* Selection highlight */}
                                    {selected && (
                                        <rect x={n._x - 2} y={n._y - 2} width={w + 4} height={h + 4} rx={8}
                                            fill="none" stroke={accentColor} strokeWidth={2} opacity={0.5} />
                                    )}

                                    {/* Node body */}
                                    <rect x={n._x} y={n._y} width={w} height={h} rx={6}
                                        fill={selected ? "#eef2ff" : "#fafbfc"}
                                        stroke={selected ? accentColor : "#e8ecf0"} strokeWidth={1} />

                                    {/* Left color strip */}
                                    <rect x={n._x} y={n._y} width={4} height={h} rx={6} fill={mc} />
                                    <rect x={n._x + 2} y={n._y} width={2} height={h} fill={mc} />

                                    {/* Method badge */}
                                    <rect x={n._x + 10} y={n._y + 8} width={36} height={16} rx={4} fill={mc} opacity={0.1} />
                                    <text x={n._x + 12} y={n._y + 19.5} fontSize={8} fontWeight={800} fill={mc} fontFamily="monospace">
                                        {n.method}
                                    </text>

                                    {/* Path */}
                                    <text x={n._x + 52} y={n._y + 17} fontSize={10} fontWeight={500} fill="#1e293b" fontFamily="monospace">
                                        {truncate(n.path, 16)}
                                    </text>

                                    {/* Function name */}
                                    <text x={n._x + 52} y={n._y + 28} fontSize={8} fill="#94a3b8" fontFamily="monospace">
                                        {truncate(n.function || "", 18)}
                                    </text>

                                    {/* Validation indicator */}
                                    {!n.has_validation && (
                                        <g>
                                            <circle cx={n._x + w - 14} cy={n._y + h / 2} r={7} fill="#fef3c7" stroke="#f59e0b" strokeWidth={0.8} />
                                            <text x={n._x + w - 17.5} y={n._y + h / 2 + 3.5} fontSize={8} fill="#d97706" fontWeight={800}>!</text>
                                        </g>
                                    )}
                                    {n.has_validation && (
                                        <g>
                                            <circle cx={n._x + w - 14} cy={n._y + h / 2} r={7} fill="#ecfdf5" stroke="#10b981" strokeWidth={0.8} />
                                            <text x={n._x + w - 16.5} y={n._y + h / 2 + 3.5} fontSize={7} fill="#059669" fontWeight={800}>{"\u2713"}</text>
                                        </g>
                                    )}
                                </>
                            )}
                        </g>
                    );
                })}
            </svg>
        </Box>
    );
}

/* =============================================================
   LEGEND
   ============================================================= */
export function TreeLegend({ accentColor = "#6366f1" }) {
    return (
        <Box sx={{ display: "flex", gap: 2, mt: 1.5, px: 1, flexWrap: "wrap", alignItems: "center" }}>
            <Typography sx={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Methods</Typography>
            {Object.entries(MC).map(([m, c]) => (
                <Box key={m} sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: 1, background: c }} />
                    <Typography sx={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>{m}</Typography>
                </Box>
            ))}
            <Box sx={{ width: 1, height: 14, background: "#e2e8f0", mx: 0.5 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                <CheckCircleRoundedIcon sx={{ fontSize: 12, color: "#10b981" }} />
                <Typography sx={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>Validated</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                <WarningAmberRoundedIcon sx={{ fontSize: 12, color: "#f59e0b" }} />
                <Typography sx={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>No validation</Typography>
            </Box>
        </Box>
    );
}
