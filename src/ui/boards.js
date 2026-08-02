// 盤面の描画。question.board.type ごとにHTMLを返す。
// 決まり: 盤面は「問題の状態」だけを描く。答えの形・正誤・過不足は描かない。
// 教材図(数直線・時計・ブロック・グラフ)はHTML/CSS/SVGで正確に描く。

function esc(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

// 学習対象の絵。色ちがいの丸で「りんご」と言い張らないための、それと分かる形。
const PIECE_SVG = {
  apple: '<svg viewBox="0 0 32 32"><path d="M16 9 q-1.5 -4.5 2.5 -7" fill="none" stroke="#7a4a21" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="21.8" cy="6.8" rx="4.2" ry="2.5" fill="#5da53f" transform="rotate(22 21.8 6.8)"/><path d="M16 10.5 C8.5 10.5 5.5 17 8.5 23 C10.5 27 13 29 16 29 C19 29 21.5 27 23.5 23 C26.5 17 23.5 10.5 16 10.5 Z" fill="#d94436"/><ellipse cx="12" cy="15.5" rx="2.4" ry="3.2" fill="#f28b7d" opacity=".7"/></svg>',
  orange: '<svg viewBox="0 0 32 32"><circle cx="16" cy="18" r="11.5" fill="#f59a23"/><circle cx="12" cy="14" r="2.6" fill="#ffd28c" opacity=".8"/><ellipse cx="20" cy="6.4" rx="3.8" ry="2.2" fill="#5da53f" transform="rotate(18 20 6.4)"/><circle cx="16" cy="7.4" r="1.3" fill="#8a5a2c"/></svg>',
  grape: '<svg viewBox="0 0 32 32"><path d="M16 8 q0 -4 3 -6" fill="none" stroke="#7a4a21" stroke-width="2.2" stroke-linecap="round"/><circle cx="10.5" cy="13" r="4.4" fill="#8a4fc0"/><circle cx="21.5" cy="13" r="4.4" fill="#8a4fc0"/><circle cx="16" cy="11" r="4.4" fill="#9d68d0"/><circle cx="12.5" cy="19.5" r="4.4" fill="#8a4fc0"/><circle cx="19.5" cy="19.5" r="4.4" fill="#9d68d0"/><circle cx="16" cy="25.5" r="4.4" fill="#8a4fc0"/></svg>',
  strawberry: '<svg viewBox="0 0 32 32"><path d="M9 8 L16 11 L23 8 L20.5 13 L11.5 13 Z" fill="#4d9e3c"/><path d="M16 29 C8 24 6.5 15 16 11.5 C25.5 15 24 24 16 29 Z" fill="#e0405f"/><circle cx="13" cy="18" r="1" fill="#ffe08a"/><circle cx="19" cy="18" r="1" fill="#ffe08a"/><circle cx="16" cy="23" r="1" fill="#ffe08a"/></svg>',
  acorn: '<svg viewBox="0 0 32 32"><path d="M16 4 q1 -2 3 -2" stroke="#5a3a1a" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M7 12 Q16 5 25 12 L25 14 L7 14 Z" fill="#6d4a26"/><path d="M9 14 L23 14 Q22 26 16 29 Q10 26 9 14 Z" fill="#b57f3f"/></svg>',
  button: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12.5" fill="#e8ecf4" stroke="#8a93ad" stroke-width="2"/><circle cx="16" cy="16" r="8.6" fill="none" stroke="#b9c1d4" stroke-width="1.2"/><circle cx="13" cy="13.4" r="1.5" fill="#7d879f"/><circle cx="19" cy="13.4" r="1.5" fill="#7d879f"/><circle cx="13" cy="18.6" r="1.5" fill="#7d879f"/><circle cx="19" cy="18.6" r="1.5" fill="#7d879f"/></svg>',
  block: '<svg viewBox="0 0 32 32"><rect x="4" y="4" width="24" height="24" rx="4" fill="#e8a33d"/><path d="M4 13 L28 13 L28 8 Q28 4 24 4 L8 4 Q4 4 4 8 Z" fill="#f5c26b"/></svg>',
  bead: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12.5" fill="#5c8fd6"/><path d="M9 12 q4 -6 12 -4" stroke="#cfe4ff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".9"/></svg>'
};

function pieceInner(icon) {
  return PIECE_SVG[icon] || '';
}

function dot(icon, extra) {
  const svg = pieceInner(icon);
  return '<span class="piece' + (svg ? ' svg-icon' : '') + ' icon-' + esc(icon || 'dot') + (extra ? ' ' + extra : '') + '">' + svg + '</span>';
}

function dots(n, icon, arrange) {
  const items = [];
  for (let i = 0; i < n; i += 1) items.push(dot(icon, arrange === 'two-color' && i >= 5 ? 'alt' : ''));
  return '<div class="dot-field arrange-' + esc(arrange || 'rows') + '">' + items.join('') + '</div>';
}

function tapPieces(n, icon, selected, mode) {
  const items = [];
  for (let i = 0; i < n; i += 1) {
    const on = selected && selected.has(i);
    const svg = pieceInner(icon);
    items.push('<button type="button" class="piece tap' + (svg ? ' svg-icon' : '') + ' icon-' + esc(icon || 'dot') + (on ? (mode === 'remove' ? ' removed' : ' selected') : '') + '" data-piece="' + i + '" aria-pressed="' + Boolean(on) + '">' + svg + '</button>');
  }
  return items.join('');
}

function tenFrame(filled, icon) {
  let cells = '';
  for (let i = 0; i < 10; i += 1) {
    cells += '<span class="frame-cell">' + (i < filled ? dot(icon) : '') + '</span>';
  }
  return '<div class="ten-frame">' + cells + '</div>';
}

function clockSvg(h, m, size) {
  const s = size || 180;
  const c = s / 2;
  const rim = c - 6;
  let marks = '';
  for (let i = 1; i <= 12; i += 1) {
    const a = (i * 30 - 90) * Math.PI / 180;
    const x = c + Math.cos(a) * (rim - 16);
    const y = c + Math.sin(a) * (rim - 16) + 5;
    marks += '<text x="' + x + '" y="' + y + '" text-anchor="middle" class="clock-num">' + i + '</text>';
  }
  let ticks = '';
  for (let i = 0; i < 60; i += 1) {
    const a = (i * 6 - 90) * Math.PI / 180;
    const r1 = rim - (i % 5 === 0 ? 8 : 4);
    ticks += '<line x1="' + (c + Math.cos(a) * r1) + '" y1="' + (c + Math.sin(a) * r1) + '" x2="' + (c + Math.cos(a) * rim) + '" y2="' + (c + Math.sin(a) * rim) + '" class="clock-tick' + (i % 5 === 0 ? ' major' : '') + '"/>';
  }
  const hourAngle = ((h % 12) + m / 60) * 30 - 90;
  const minAngle = m * 6 - 90;
  const ha = hourAngle * Math.PI / 180;
  const ma = minAngle * Math.PI / 180;
  return '<svg class="clock" viewBox="0 0 ' + s + ' ' + s + '" role="img" aria-label="とけい">' +
    '<circle cx="' + c + '" cy="' + c + '" r="' + rim + '" class="clock-face"/>' + ticks + marks +
    '<line x1="' + c + '" y1="' + c + '" x2="' + (c + Math.cos(ha) * (rim - 42)) + '" y2="' + (c + Math.sin(ha) * (rim - 42)) + '" class="hand hour"/>' +
    '<line x1="' + c + '" y1="' + c + '" x2="' + (c + Math.cos(ma) * (rim - 24)) + '" y2="' + (c + Math.sin(ma) * (rim - 24)) + '" class="hand minute"/>' +
    '<circle cx="' + c + '" cy="' + c + '" r="4" class="clock-pin"/></svg>';
}

function gridPanel(size, marked, interactive, selected, dotStyle) {
  let cells = '';
  for (let i = 0; i < size * size; i += 1) {
    const on = marked && marked.includes(i);
    const sel = selected && selected.has(i);
    if (interactive) {
      cells += '<button type="button" class="grid-cell tap' + (sel ? ' selected' : '') + (dotStyle ? ' dotted' : '') + '" data-piece="' + i + '" aria-pressed="' + Boolean(sel) + '"></button>';
    } else {
      cells += '<span class="grid-cell' + (on ? ' marked' : '') + (dotStyle ? ' dotted' : '') + '"></span>';
    }
  }
  return '<div class="mini-grid size-' + size + '">' + cells + '</div>';
}

const SOLID_SVG = {
  box: '<svg viewBox="0 0 120 100"><rect x="14" y="34" width="70" height="50" rx="4" class="s-face"/><path d="M14 34 L38 14 L108 14 L84 34 Z" class="s-top"/><path d="M84 34 L108 14 L108 64 L84 84 Z" class="s-side"/></svg>',
  cube: '<svg viewBox="0 0 120 100"><rect x="20" y="30" width="54" height="54" rx="4" class="s-face"/><path d="M20 30 L44 12 L98 12 L74 30 Z" class="s-top"/><path d="M74 30 L98 12 L98 66 L74 84 Z" class="s-side"/></svg>',
  tube: '<svg viewBox="0 0 120 100"><rect x="30" y="22" width="60" height="60" class="s-face"/><ellipse cx="60" cy="22" rx="30" ry="10" class="s-top"/><ellipse cx="60" cy="82" rx="30" ry="10" class="s-side"/></svg>',
  ball: '<svg viewBox="0 0 120 100"><circle cx="60" cy="52" r="36" class="s-face"/><ellipse cx="60" cy="52" rx="36" ry="12" class="s-line"/></svg>'
};

const FACE_SVG = {
  'まる': '<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="26" class="mark"/></svg>',
  'さんかく': '<svg viewBox="0 0 80 80"><path d="M40 12 L68 64 L12 64 Z" class="mark"/></svg>',
  'ましかく': '<svg viewBox="0 0 80 80"><rect x="16" y="16" width="48" height="48" class="mark"/></svg>',
  'ながしかく': '<svg viewBox="0 0 80 80"><rect x="8" y="24" width="64" height="32" class="mark"/></svg>'
};

import { STICK_FIGURES } from '../gen/g1/shape.js';

function stickSvg(figureKey) {
  const figure = STICK_FIGURES.find(f => f.key === figureKey);
  if (!figure) return '';
  const scale = 52;
  const pad = 14;
  let maxX = 0;
  let maxY = 0;
  figure.segments.forEach(([x1, y1, x2, y2]) => {
    maxX = Math.max(maxX, x1, x2);
    maxY = Math.max(maxY, y1, y2);
  });
  const w = maxX * scale + pad * 2;
  const hgt = maxY * scale + pad * 2;
  const lines = figure.segments.map(([x1, y1, x2, y2]) =>
    '<line x1="' + (pad + x1 * scale) + '" y1="' + (pad + y1 * scale) + '" x2="' + (pad + x2 * scale) + '" y2="' + (pad + y2 * scale) + '" class="stick"/>'
  ).join('');
  return '<svg class="stick-figure" viewBox="0 0 ' + w + ' ' + hgt + '">' + lines + '</svg>';
}

function bars(units, max, label) {
  let cells = '';
  for (let i = 0; i < max; i += 1) cells += '<span class="bar-unit' + (i < units ? ' on' : '') + '"></span>';
  return '<div class="bar-row"><span class="bar-label">' + esc(label) + '</span><span class="bar-track">' + cells + '</span></div>';
}

// 実物の形の連続した棒。問題文の呼び名(えんぴつ・リボン…)と見た目を一致させる
function objRow(units, label, key) {
  return '<div class="bar-row"><span class="bar-label">' + esc(label) + '</span><span class="obj-lane"><span class="obj-bar obj-' + esc(key || 'tape') + '" style="width:' + (units * 10) + '%"></span></span></div>';
}

function cupsRow(n, label) {
  let cups = '';
  for (let i = 0; i < n; i += 1) cups += '<span class="cup"></span>';
  return '<div class="cup-row"><span class="bar-label">' + esc(label) + '</span><span class="cup-track">' + cups + '</span></div>';
}

function areaPatch(n, label) {
  const w = n <= 4 ? 2 : n <= 6 ? 3 : n <= 8 ? 4 : 5;
  const h = Math.ceil(n / w);
  let cells = '';
  for (let i = 0; i < w * h; i += 1) cells += '<span class="area-cell' + (i < n ? ' on' : '') + '"></span>';
  return '<div class="area-wrap"><span class="bar-label">' + esc(label) + '</span><div class="area-grid" style="grid-template-columns:repeat(' + w + ',1fr)">' + cells + '</div></div>';
}

export function renderBoard(q) {
  const b = q.board;
  if (!b) return '';
  const sel = q.ui && q.ui.selected;
  switch (b.type) {
    case 'dots':
      return frame(dots(b.count, b.icon, b.arrange));
    case 'two-groups':
      return frame('<div class="two-groups"><div class="group">' + dots(b.left, b.icon) + '</div><span class="group-op">' + (b.merge ? 'と' : '') + '</span><div class="group">' + dots(b.right, b.icon) + '</div></div>');
    case 'hidden-split':
      return frame('<div class="two-groups"><div class="group tray"><small>みえている</small>' + dots(b.shown, b.icon) + '</div><div class="group tray closed"><small>ふた つき</small><span class="mystery">？</span></div></div><p class="board-note">ぜんぶで ' + b.total + 'こ</p>');
    case 'bond-pool':
      return frame('<div class="bond-wrap"><div class="group"><small>いま</small>' + dots(b.current, b.icon) + '</div><div class="group pool"><small>ここから いれる</small><div class="dot-field arrange-rows">' + tapPieces(b.supply, b.icon, sel) + '</div></div></div>');
    case 'equation':
      return frame('<div class="equation">' + esc(b.text) + '</div>' + (b.dots ? '<div class="two-groups small"><div class="group">' + dots(b.dots[0], 'dot') + '</div><span class="group-op"></span><div class="group">' + dots(b.dots[1], 'dot') + '</div></div>' : ''));
    case 'three-steps':
      return frame('<div class="three-steps">' + b.values.map((v, i) => '<span class="step-num">' + v + '</span>' + (i < 2 ? '<span class="step-op">' + esc(b.ops[i]) + '</span>' : '')).join('') + '</div>');
    case 'ten-frame-plus':
      return frame('<div class="teen-wrap">' + tenFrame(10, b.icon) + '<div class="loose">' + dots(b.ones, b.icon) + '</div></div>');
    case 'teen-remove':
      return frame('<div class="teen-wrap">' + tenFrame(10, 'dot') + '<div class="loose">' + dots(b.a - 10, 'dot') + '</div></div>');
    case 'place-value': {
      let rods = '';
      for (let i = 0; i < b.tens; i += 1) rods += '<span class="rod' + (b.removedTens && i >= b.tens - b.removedTens ? ' ghost' : '') + '"></span>';
      let ones = '';
      for (let i = 0; i < b.ones; i += 1) ones += '<span class="cube' + (b.removedOnes && i >= b.ones - b.removedOnes ? ' ghost' : '') + '"></span>';
      return frame('<div class="pv-wrap"><div class="pv-col"><small>10の たば</small><div class="rod-row">' + rods + '</div></div><div class="pv-col"><small>ばら</small><div class="cube-row">' + ones + '</div></div></div>');
    }
    case 'remove-board':
      return frame('<div class="dot-field arrange-rows">' + tapPieces(b.total, b.icon, sel, 'remove') + '</div>');
    case 'remove-shown': {
      const items = [];
      for (let i = 0; i < b.total; i += 1) items.push(dot(b.icon, i < b.removed ? 'removed' : ''));
      return frame('<div class="dot-field arrange-rows">' + items.join('') + '</div><p class="board-note">くらい まるが とった ぶん</p>');
    }
    case 'numberline': {
      const pos = q.ui ? q.ui.pos : b.start;
      let stops = '';
      for (let v = b.min; v <= b.max; v += 1) {
        stops += '<span class="nl-stop' + (v === pos ? ' current' : '') + (v === b.start ? ' start' : '') + '"><i></i><b>' + v + '</b></span>';
      }
      return frame('<div class="numberline">' + stops + '</div><p class="board-note">いま: ' + pos + '</p>');
    }
    case 'sequence':
      return frame('<div class="sequence">' + b.shown.map(v => v === null ? '<span class="seq-card hole">？</span>' : '<span class="seq-card">' + v + '</span>').join('') + '</div>');
    case 'row': {
      const pieces = b.items.map((icon, i) => '<button type="button" class="piece tap icon-' + esc(icon) + (sel && sel.has(i) ? ' selected' : '') + '" data-piece="' + i + '"></button>').join('');
      return frame('<div class="pick-row">' + pieces + '</div><p class="board-note">' + (b.direction === 'right' ? '← みぎから かぞえる' : 'ひだりから かぞえる →') + '</p>');
    }
    case 'object-card':
      return frame('<div class="object-card">' + esc(b.label) + '</div>');
    case 'solid':
      return frame('<div class="solid-wrap">' + (SOLID_SVG[b.solid] || '') + (b.label ? '<p class="board-note">' + esc(b.label) + '</p>' : '') + '</div>');
    case 'stamp-mark':
      return frame('<div class="solid-wrap stamp">' + (FACE_SVG[b.face] || '') + '<p class="board-note">かみに ついた あと</p></div>');
    case 'grid-copy':
      return frame('<div class="copy-wrap"><div><small>みほん</small>' + gridPanel(b.size, b.pattern, false) + '</div><div><small>つくる ばん</small>' + gridPanel(b.size, null, true, sel) + '</div></div>');
    case 'dot-copy':
      return frame('<div class="copy-wrap"><div><small>みほん</small>' + gridPanel(b.size, b.pattern, false, null, true) + '</div><div><small>つくる ばん</small>' + gridPanel(b.size, null, true, sel, true) + '</div></div>');
    case 'grid-move': {
      let cells = '';
      for (let i = 0; i < b.size * b.size; i += 1) {
        cells += '<button type="button" class="grid-cell tap' + (i === b.from ? ' origin' : '') + (sel && sel.has(i) ? ' selected' : '') + '" data-piece="' + i + '">' + (i === b.from ? '●' : '') + '</button>';
      }
      return frame('<div class="mini-grid size-' + b.size + '">' + cells + '</div><p class="board-note">いろの マスが いまの ばしょ</p>');
    }
    case 'flip-pair':
      return frame('<div class="copy-wrap"><div><small>みほん</small>' + gridPanel(b.size, b.model, false) + '</div><div><small>この いた</small>' + gridPanel(b.size, b.piece, false) + '</div></div>');
    case 'stick-figure':
      return frame('<div class="solid-wrap">' + stickSvg(b.figure) + '</div>');
    case 'compare-bars':
      return frame('<div class="compare-stack">' + objRow(b.left, 'あ', b.objectKey) + objRow(b.right, 'い', b.objectKey) + '</div>');
    case 'tape-compare':
      return frame('<div class="compare-stack">' + objRow(b.left, 'あ', 'tape') + objRow(b.right, 'い', 'tape') + '</div><p class="board-note">テープに うつした ながさ</p>');
    case 'block-ruler': {
      const blocks = b.items.map((_, i) => '<button type="button" class="ruler-block' + (sel && sel.has(i) ? ' selected' : '') + '" data-piece="' + i + '" aria-label="ブロック"></button>').join('');
      return frame('<div class="ruler-wrap"><div class="ruler-bar obj-' + esc(b.objectKey || 'tape') + '" style="width:' + (b.barUnits * 10) + '%"><span>' + esc(b.object || 'ぼう') + '</span></div><div class="ruler-blocks">' + blocks + '</div></div>');
    }
    case 'cups':
      return frame('<div class="compare-stack">' + cupsRow(b.left, 'あ') + cupsRow(b.right, 'い') + '</div><p class="board-note">おなじ カップの いくつぶん</p>');
    case 'area-grid':
      return frame('<div class="area-pair">' + areaPatch(b.left, 'あ') + areaPatch(b.right, 'い') + '</div>');
    case 'clock':
      return frame('<div class="clock-wrap">' + clockSvg(b.h, b.m) + '</div>');
    case 'clock-set': {
      const ch = q.ui ? q.ui.clockH : b.startH;
      const cm = q.ui ? q.ui.clockM : b.startM;
      return frame('<div class="clock-wrap">' + clockSvg(ch, cm) + '<p class="board-note">いま: ' + ch + 'じ' + (cm === 0 ? '' : cm === 30 ? 'はん' : cm + 'ふん') + '</p></div>');
    }
    case 'rows-compare':
      return frame('<div class="rows-compare">' + b.rows.map(r => '<div class="fruit-row"><span class="bar-label">' + esc(r.label) + '</span><span class="fruit-track">' + Array.from({ length: r.count }, () => dot(r.icon)).join('') + '</span></div>').join('') + '</div>');
    case 'pictograph': {
      const max = Math.max(...b.columns.map(c => c.count), 5);
      return frame('<div class="pictograph">' + b.columns.map(c => {
        let cells = '';
        for (let i = 0; i < max; i += 1) {
          const svg = i < c.count ? pieceInner(c.icon) : '';
          cells += '<span class="graph-cell' + (i < c.count ? ' on' : '') + (svg ? ' pic' : ' icon-' + esc(c.icon)) + '">' + svg + '</span>';
        }
        return '<div class="graph-col"><div class="graph-stack">' + cells + '</div><span class="bar-label">' + esc(c.label) + '</span></div>';
      }).join('') + '</div>');
    }
    case 'graph-make': {
      let cells = '';
      for (let i = 0; i < b.supply; i += 1) {
        const svg = sel && sel.has(i) ? pieceInner(b.icon) : '';
        cells += '<button type="button" class="graph-cell tap' + (sel && sel.has(i) ? ' selected' : '') + (svg ? ' pic' : '') + '" data-piece="' + i + '">' + svg + '</button>';
      }
      return frame('<div class="pictograph make"><div class="graph-col"><div class="graph-stack">' + cells + '</div><span class="bar-label">' + esc(b.label) + '</span></div></div>');
    }
    case 'story-strip': {
      // 群には かならず名前と数を付ける(「あげた 1こ」)。裸の「→へる」の隣に
      // 1こだけ置くと「1こに なる」と誤読されるため。へる側の群は うすく描く。
      const verb = b.verb || (b.add ? 'ふえた' : 'へった');
      const second = b.add
        ? dots(b.b, b.icon)
        : '<div class="dot-field arrange-rows">' + Array.from({ length: b.b }, () => dot(b.icon, 'removed')).join('') + '</div>';
      return frame('<div class="story-strip"><div class="group tray"><small>はじめ ' + b.a + 'こ</small>' + dots(b.a, b.icon) + '</div><div class="group tray"><small>' + esc(verb) + ' ' + b.b + 'こ</small>' + second + '</div></div>');
    }
    case 'picture-op': {
      const first = dots(b.a, 'dot');
      const second = b.add ? dots(b.b, 'dot') : '<div class="dot-field arrange-rows">' + Array.from({ length: b.b }, () => dot('dot', 'removed')).join('') + '</div>';
      return frame('<div class="story-strip"><div class="group"><small>はじめ</small>' + first + '</div><span class="story-op">' + (b.add ? 'ふえた' : 'へった') + '</span><div class="group">' + second + '</div></div>');
    }
    case 'share-people': {
      let people = '';
      for (let i = 0; i < b.people; i += 1) people += '<span class="person"></span>';
      return frame('<div class="share-wrap"><div class="pool">' + dots(b.total, b.icon) + '</div><div class="people-row">' + people + '</div></div><p class="board-note">' + b.people + 'にんで わける</p>');
    }
    case 'share-pool':
      return frame('<div class="share-wrap"><div class="pool">' + dots(b.total, b.icon) + '</div></div><p class="board-note">' + b.per + 'こずつ まとめる</p>');
    case 'make-ten':
      return frame('<div class="teen-wrap">' + tenFrame(b.a, 'dot') + '<div class="loose">' + dots(b.b, 'dot') + '</div></div><p class="board-note">10の わくの あきを みよう</p>');
    default:
      return frame('<div class="object-card">' + esc(b.type) + '</div>');
  }
}

function frame(inner) {
  return '<div class="board">' + inner + '</div>';
}
