import type { ReactNode } from "react";

/* Isometric projection: x → right-down, y → left-down, z → up. */
const C = Math.cos(Math.PI / 6);
type V = [number, number];
const P = (x: number, y: number, z: number): V => [(x - y) * C, (x + y) * 0.5 - z];
const pts = (a: V[]) => a.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
const L = (a: V, b: V, cls = "i-line", k?: string | number) => <line key={k} className={cls} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />;

interface BoxProps { x: number; y: number; z?: number; w: number; d: number; h: number; top?: string; left?: string; right?: string; children?: ReactNode }
function Box({ x, y, z = 0, w, d, h, top, left, right, children }: BoxProps) {
  const T0 = P(x, y, z + h), T1 = P(x + w, y, z + h), T2 = P(x + w, y + d, z + h), T3 = P(x, y + d, z + h);
  const B1 = P(x + w, y, z), B2 = P(x + w, y + d, z), B3 = P(x, y + d, z);
  return (
    <g>
      <polygon className="i-left" points={pts([T3, T2, B2, B3])} style={left ? { fill: left } : undefined} />
      <polygon className="i-right" points={pts([T2, T1, B1, B2])} style={right ? { fill: right } : undefined} />
      <polygon className="i-top" points={pts([T0, T1, T2, T3])} style={top ? { fill: top } : undefined} />
      {children}
    </g>
  );
}
const Shadow = ({ w, d }: { w: number; d: number }) => (
  <polygon className="i-shadow" points={pts([P(-w, -d, 0), P(w + 8, -d, 0), P(w + 14, d + 8, 0), P(-w, d + 14, 0)])} />
);

const Docs = () => (
  <g>
    <Shadow w={28} d={22} />
    {[0, 1, 2].map((i) => <Box key={i} x={-26 + i * 2} y={-18} z={i * 6} w={48} d={36} h={4} top={i === 2 ? undefined : undefined} />)}
    {[0, 1, 2, 3].map((k) => L(P(-20, -11 + k * 7, 16), P(k === 3 ? -4 : 10, -11 + k * 7, 16), "i-line", k))}
    <Box x={8} y={-18} z={12} w={0.01} d={0.01} h={0.01} />
  </g>
);
const Chunker = () => (
  <g>
    <Shadow w={34} d={28} />
    <Box x={-26} y={-22} w={22} h={14} d={18} />
    <Box x={2} y={-22} w={22} h={14} d={18} />
    <Box x={-26} y={4} w={22} h={14} d={18} />
    <Box x={2} y={4} z={8} w={22} h={14} d={18} top="var(--acc)" />
  </g>
);
const Chip = () => (
  <g>
    <Shadow w={34} d={34} />
    {[0, 1, 2, 3, 4].map((k) => L(P(26, -20 + k * 10, 3), P(34, -20 + k * 10, 3), "i-line", "r" + k))}
    {[0, 1, 2, 3, 4].map((k) => L(P(-20 + k * 10, 26, 3), P(-20 + k * 10, 34, 3), "i-line", "l" + k))}
    <Box x={-26} y={-26} w={52} d={52} h={7} />
    <Box x={-14} y={-14} z={7} w={28} d={28} h={5} top="var(--acc)" />
  </g>
);
const Rack = () => (
  <g>
    <Shadow w={26} d={22} />
    {[0, 1, 2].map((i) => {
      const z = i * 17;
      return (
        <Box key={i} x={-21} y={-17} z={z} w={42} d={34} h={14}>
          {L(P(21, -11, z + 5), P(21, 11, z + 5))}
          {L(P(21, -11, z + 9), P(21, 11, z + 9))}
          <polygon className="i-acc" points={pts([P(-14, 17, z + 4), P(-4, 17, z + 4), P(-4, 17, z + 10), P(-14, 17, z + 10)])} />
        </Box>
      );
    })}
  </g>
);
const Laptop = () => (
  <g>
    <Shadow w={34} d={26} />
    <polygon className="i-right" points={pts([P(-28, -20, 4), P(28, -20, 4), P(28, -20, 42), P(-28, -20, 42)])} />
    <polygon className="i-screen" points={pts([P(-24, -20, 8), P(24, -20, 8), P(24, -20, 38), P(-24, -20, 38)])} />
    {[0, 1, 2].map((k) => L(P(-18, -20, 16 + k * 7), P(k === 2 ? 0 : 14, -20, 16 + k * 7), "i-line", k))}
    <Box x={-28} y={-20} w={56} d={40} h={4} />
    {[0, 1, 2, 3].map((k) => L(P(-20, -12 + k * 8, 4), P(20, -12 + k * 8, 4), "i-line", "k" + k))}
  </g>
);
const Layers = () => (
  <g>
    <Shadow w={30} d={22} />
    <Box x={-25} y={-18} z={0} w={50} d={36} h={3} />
    <Box x={-25} y={-18} z={10} w={50} d={36} h={3} top="var(--acc)" />
    <Box x={-25} y={-18} z={20} w={50} d={36} h={3}>
      {[0, 1, 2].map((k) => L(P(-17, -8 + k * 8, 23), P(k === 2 ? -2 : 12, -8 + k * 8, 23), "i-line", k))}
    </Box>
  </g>
);
const Tower = () => (
  <g>
    <Shadow w={30} d={28} />
    <Box x={-24} y={-22} w={48} d={44} h={62}>
      {[0, 1, 2].map((i) => {
        const z = 8 + i * 17;
        return (
          <g key={i}>
            <polygon className="i-slot" points={pts([P(-18, 22, z), P(18, 22, z), P(18, 22, z + 12), P(-18, 22, z + 12)])} />
            <polygon className="i-acc" points={pts([P(-14, 22, z + 4), P(-8, 22, z + 4), P(-8, 22, z + 8), P(-14, 22, z + 8)])} />
          </g>
        );
      })}
      {[0, 1, 2, 3, 4].map((k) => L(P(24, -14 + k * 7, 10), P(24, -14 + k * 7, 52), "i-line", k))}
    </Box>
    {[0, 1, 2].map((k) => L(P(-14, -14 + k * 14, 62), P(14, -14 + k * 14, 62), "i-line", "t" + k))}
  </g>
);

export const ICONS: Record<string, () => JSX.Element> = { docs: Docs, chunker: Chunker, chip: Chip, rack: Rack, laptop: Laptop, layers: Layers, tower: Tower };
