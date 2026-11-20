// Generates public/lottie/mandap.json — an original Lottie animation of a wedding mandap/stage
// with swinging marigold garlands, twinkling fairy lights and flickering diyas.
// Written from scratch for Rasm, so it is free to use. Run: npm run lottie
import { writeFileSync, mkdirSync } from "node:fs";

const FR = 30, OP = 120, W = 400, H = 400;
const C = {
  maroon: [0.357, 0.102, 0.169, 1],
  dark: [0.227, 0.059, 0.106, 1],
  gold: [0.722, 0.525, 0.184, 1],
  soft: [0.914, 0.78, 0.482, 1],
  marigold: [0.93, 0.58, 0.13, 1],
  rose: [0.78, 0.22, 0.33, 1],
  ivory: [0.984, 0.965, 0.933, 1],
  flame: [1, 0.78, 0.3, 1],
};
const ease = { o: { x: [0.45], y: [0] }, i: { x: [0.55], y: [1] } };
const st = (k) => ({ a: 0, k });
// looping keyframes: values at evenly spaced times, last == first
const anim = (values, offset = 0) => {
  const n = values.length;
  const step = OP / n;
  const kf = values.map((v, i) => ({ t: Math.round((i * step + offset) % OP), s: Array.isArray(v) ? v : [v], ...ease }));
  kf.sort((a, b) => a.t - b.t);
  if (kf[0].t !== 0) kf.unshift({ ...kf[kf.length - 1], t: 0 });
  kf.push({ t: OP, s: kf[0].s });
  return { a: 1, k: kf };
};
const tr = (o = {}) => ({ ty: "tr", p: st(o.p || [0, 0]), a: st(o.a || [0, 0]), s: st(o.s || [100, 100]), r: o.r || st(0), o: o.o || st(100), sk: st(0), sa: st(0) });
const fill = (c, o = 100) => ({ ty: "fl", c: st(c), o: typeof o === "number" ? st(o) : o, r: 1 });
const stroke = (c, w, o = 100) => ({ ty: "st", c: st(c), o: st(o), w: st(w), lc: 2, lj: 2 });
const rect = (x, y, w, h, r = 0) => ({ ty: "rc", d: 1, s: st([w, h]), p: st([x, y]), r: st(r) });
const ellipse = (x, y, w, h) => ({ ty: "el", d: 1, s: st([w, h]), p: st([x, y]) });
const path = (v, i, o, c = true) => ({ ty: "sh", d: 1, ks: st({ v, i: i || v.map(() => [0, 0]), o: o || v.map(() => [0, 0]), c }) });
const group = (items, t = {}) => ({ ty: "gr", it: [...items, tr(t)] });

let ind = 1;
const layer = (nm, shapes, ks = {}) => ({
  ddd: 0, ind: ind++, ty: 4, nm, sr: 1, ao: 0, ip: 0, op: OP, st: 0, bm: 0,
  ks: { o: ks.o || st(100), r: ks.r || st(0), p: ks.p || st([0, 0, 0]), a: ks.a || st([0, 0, 0]), s: ks.s || st([100, 100, 100]) },
  shapes,
});

const layers = [];

// --- diyas in front (top layer) ---
for (const x of [70, 330]) {
  layers.push(layer(`diya ${x}`, [
    group([path([[x - 6, 0], [x, -16], [x + 6, 0]], [[0, 0], [-6, 6], [0, 0]], [[0, 0], [6, 6], [0, 0]]), fill(C.flame)], {
      p: [x, 336], a: [x, 336], s: [100, 100],
    }),
  ], { s: anim([[100, 100, 100], [92, 118, 100], [104, 96, 100], [96, 112, 100]], x === 70 ? 0 : 9), a: st([x, 336, 0]), p: st([x, 336, 0]) }));
  layers.push(layer(`diya glow ${x}`, [group([ellipse(x, 328, 34, 34), fill(C.soft)])], { o: anim([35, 15, 40, 20], x === 70 ? 3 : 12) }));
  layers.push(layer(`diya base ${x}`, [group([path([[x - 14, 338], [x + 14, 338], [x + 8, 348], [x - 8, 348]]), fill(C.gold)])]));
}

// --- fairy lights along the dome ---
const domePt = (t) => {
  // cubic bezier (70,165) (90,70) (310,70) (330,165)
  const p0 = [70, 165], p1 = [92, 72], p2 = [308, 72], p3 = [330, 165];
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]);
};
for (let i = 1; i < 14; i++) {
  const [x, y] = domePt(i / 14);
  layers.push(layer(`light ${i}`, [group([ellipse(x, y - 1, 6, 6), fill(C.ivory)])], { o: anim([100, 30, 100, 55], (i * 17) % OP) }));
}

// --- hanging flower strings (lariyan) between the pillars ---
for (let i = 0; i < 7; i++) {
  const x = 116 + i * 28;
  const len = 70 + (i % 2) * 22 + (i === 3 ? 18 : 0);
  const dots = [];
  for (let d = 8; d <= len; d += 11) dots.push(group([ellipse(x, 170 + d, 7, 7), fill(d % 22 < 11 ? C.marigold : C.rose)]));
  layers.push(layer(`lari ${i}`, [
    group([path([[x, 168], [x, 168 + len]], null, null, false), stroke(C.soft, 1.2)]),
    ...dots,
  ], { a: st([x, 168, 0]), p: st([x, 168, 0]), r: anim([-3, 3], i * 11) }));
}

// --- front swag garlands ---
const swag = (x1, x2, y, sag, name, off) => {
  const mx = (x1 + x2) / 2;
  const dots = [];
  for (let t = 0; t <= 1.0001; t += 0.1) {
    const u = 1 - t;
    const px = u * u * x1 + 2 * u * t * mx + t * t * x2;
    const py = u * u * y + 2 * u * t * (y + sag * 2) + t * t * y;
    dots.push(group([ellipse(px, py, 9, 9), fill(Math.round(t * 10) % 2 ? C.marigold : C.rose)]));
  }
  return layer(name, dots, { a: st([mx, y, 0]), p: st([mx, y, 0]), r: anim([-1.5, 1.5], off) });
};
layers.push(swag(84, 200, 170, 22, "swag left", 0));
layers.push(swag(200, 316, 170, 22, "swag right", 30));

// --- kalash on top ---
layers.push(layer("kalash", [
  group([ellipse(200, 60, 18, 16), fill(C.gold)]),
  group([path([[196, 52], [200, 36], [204, 52]]), fill(C.gold)]),
  group([ellipse(200, 34, 6, 6), fill(C.soft)]),
]));

// --- dome roof ---
layers.push(layer("dome", [
  group([
    path([[70, 165], [330, 165]], null, null, false),
    stroke(C.gold, 4),
  ]),
  group([
    path(
      [[70, 165], [200, 70], [330, 165]],
      [[0, 0], [-90, 0], [20, -70]],
      [[-20, -70], [90, 0], [0, 0]]
    ),
    fill(C.maroon),
    stroke(C.gold, 3),
  ]),
  // inner arch detail
  group([
    path([[110, 165], [200, 104], [290, 165]], [[0, 0], [-60, 0], [14, -46]], [[-14, -46], [60, 0], [0, 0]], false),
    stroke(C.soft, 1.5, 70),
  ]),
]));
// scallop border under the dome
const scallops = [];
for (let x = 76; x <= 324; x += 16) scallops.push(group([ellipse(x, 168, 14, 12), fill(C.gold)]));
layers.push(layer("scallops", scallops));

// --- pillars ---
const pillar = (x, top, h, c, w = 12) =>
  group([
    rect(x, top + h / 2, w, h, 2), fill(c),
  ]);
const caps = (x, top, h) => [group([rect(x, top + 2, 22, 8, 2), fill(C.soft)]), group([rect(x, top + h - 2, 22, 8, 2), fill(C.soft)])];
layers.push(layer("front pillars", [pillar(84, 168, 154, C.gold), ...caps(84, 168, 154), pillar(316, 168, 154, C.gold), ...caps(316, 168, 154)]));
layers.push(layer("back pillars", [pillar(142, 178, 140, C.soft, 9), pillar(258, 178, 140, C.soft, 9)], { o: st(75) }));

// --- stage sofa + platform ---
layers.push(layer("sofa", [
  group([rect(200, 296, 120, 34, 10), fill(C.rose)]),
  group([rect(200, 280, 132, 22, 12), fill(C.maroon)]),
  group([rect(200, 312, 140, 10, 4), fill(C.gold)]),
]));
layers.push(layer("platform", [
  group([rect(200, 330, 300, 18, 3), fill(C.maroon)]),
  group([rect(200, 346, 340, 14, 3), fill(C.dark)]),
  group([rect(200, 322, 300, 3, 1), fill(C.gold)]),
]));

// --- soft background glow ---
layers.push(layer("glow", [group([ellipse(200, 210, 330, 300), fill(C.soft)])], { o: anim([18, 30]) }));

const lottie = { v: "5.7.4", fr: FR, ip: 0, op: OP, w: W, h: H, nm: "Rasm mandap", ddd: 0, assets: [], layers };
mkdirSync("public/lottie", { recursive: true });
writeFileSync("public/lottie/mandap.json", JSON.stringify(lottie));
console.log(`Wrote public/lottie/mandap.json (${layers.length} layers)`);
