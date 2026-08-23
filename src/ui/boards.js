// 盤面の描画。question.board.type ごとにHTMLを返す。
// 決まり: 盤面は「問題の状態」だけを描く。答えの形・正誤・過不足は描かない。
// 教材図(数直線・時計・ブロック・グラフ)はHTML/CSS/SVGで正確に描く。

function esc(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

// 学習対象の絵。色ちがいの丸で「りんご」と言い張らないための、それと分かる形。
const PIECE_SVG = {
  apple: '<svg viewBox="0 0 32 32"><path d="M16 9 q-1.5 -4.5 2.5 -7" fill="none" stroke="#65452e" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="21.8" cy="6.8" rx="4.2" ry="2.5" fill="#5d9b49" stroke="#456d38" stroke-width="1" transform="rotate(22 21.8 6.8)"/><path d="M16 10.5 C8.5 10.5 5.5 17 8.5 23 C10.5 27 13 29 16 29 C19 29 21.5 27 23.5 23 C26.5 17 23.5 10.5 16 10.5 Z" fill="#d94f3f" stroke="#743e35" stroke-width="1.5" stroke-linejoin="round"/><path d="M11 15 q2 -3 5 -2" fill="none" stroke="#ffc2ad" stroke-width="2.3" stroke-linecap="round" opacity=".8"/></svg>',
  bread: '<svg viewBox="0 0 32 32"><path d="M5 14 C5 7 10 4 16 4 C22 4 27 7 27 14 L27 26 Q27 29 24 29 L8 29 Q5 29 5 26 Z" fill="#d9943f" stroke="#6f513b" stroke-width="1.6"/><path d="M8 14 C8 9 11 7 16 7 C21 7 24 9 24 14 L24 25 L8 25 Z" fill="#f3c878"/><path d="M11 11 q2 2 4 0 M17 10 q2 2 4 0" fill="none" stroke="#c47b34" stroke-width="1.5" stroke-linecap="round"/></svg>',
  orange: '<svg viewBox="0 0 32 32"><circle cx="16" cy="18" r="11.5" fill="#f39a2d" stroke="#85512e" stroke-width="1.5"/><path d="M10 14 q3 -4 7 -4" fill="none" stroke="#ffd99a" stroke-width="2.4" stroke-linecap="round" opacity=".85"/><circle cx="21" cy="20" r=".8" fill="#cf7727"/><circle cx="17" cy="25" r=".7" fill="#cf7727"/><ellipse cx="20" cy="6.4" rx="3.8" ry="2.2" fill="#5d9b49" stroke="#456d38" stroke-width="1" transform="rotate(18 20 6.4)"/><circle cx="16" cy="7.4" r="1.4" fill="#75512f"/></svg>',
  'rice-ball': '<svg viewBox="0 0 32 32"><path d="M16 4 C12 4 5 18 5 24 Q5 28 9 28 L23 28 Q27 28 27 24 C27 18 20 4 16 4 Z" fill="#fffaf0" stroke="#6f513b" stroke-width="1.6"/><rect x="11" y="19" width="10" height="10" rx="1" fill="#263748"/><path d="M11 9 q5 -4 10 0" fill="none" stroke="#fff" stroke-width="2" opacity=".75"/></svg>',
  banana: '<svg viewBox="0 0 32 32"><path d="M7 7 C9 19 17 25 27 19 C23 29 9 29 4 13 Z" fill="#f2c84a" stroke="#75562c" stroke-width="1.6" stroke-linejoin="round"/><path d="M7 10 C10 20 18 23 25 19" fill="none" stroke="#ffe88a" stroke-width="2" stroke-linecap="round"/></svg>',
  grape: '<svg viewBox="0 0 32 32"><path d="M16 8 q0 -4 3 -6" fill="none" stroke="#65452e" stroke-width="2.2" stroke-linecap="round"/><path d="M15 6 Q9 3 8 8 Q13 10 16 8" fill="#5d9b49" stroke="#456d38" stroke-width="1"/><g stroke="#5d397b" stroke-width="1"><circle cx="10.5" cy="13" r="4.4" fill="#8552b7"/><circle cx="21.5" cy="13" r="4.4" fill="#8552b7"/><circle cx="16" cy="11" r="4.4" fill="#a16dcc"/><circle cx="12.5" cy="19.5" r="4.4" fill="#8552b7"/><circle cx="19.5" cy="19.5" r="4.4" fill="#9a63c5"/><circle cx="16" cy="25.5" r="4.4" fill="#8552b7"/></g><circle cx="14.4" cy="9.8" r="1.2" fill="#e1c8f2" opacity=".8"/></svg>',
  strawberry: '<svg viewBox="0 0 32 32"><path d="M9 8 L16 11 L23 8 L20.5 13 L11.5 13 Z" fill="#579944" stroke="#416f36" stroke-width="1.2" stroke-linejoin="round"/><path d="M16 29 C8 24 6.5 15 16 11.5 C25.5 15 24 24 16 29 Z" fill="#df4c62" stroke="#7c3b47" stroke-width="1.5"/><path d="M11 16 q2 -2 4 -2" fill="none" stroke="#ff9bac" stroke-width="2" stroke-linecap="round"/><circle cx="13" cy="19" r="1" fill="#ffe19a"/><circle cx="19" cy="18" r="1" fill="#ffe19a"/><circle cx="16" cy="23" r="1" fill="#ffe19a"/><circle cx="20" cy="24" r=".8" fill="#ffe19a"/></svg>',
  rabbit: '<svg viewBox="0 0 32 32"><ellipse cx="11" cy="8" rx="4" ry="8" fill="#f2d7c4" stroke="#6f513b" stroke-width="1.4" transform="rotate(-12 11 8)"/><ellipse cx="21" cy="8" rx="4" ry="8" fill="#f2d7c4" stroke="#6f513b" stroke-width="1.4" transform="rotate(12 21 8)"/><circle cx="16" cy="20" r="10" fill="#f7e5d6" stroke="#6f513b" stroke-width="1.6"/><circle cx="12.5" cy="18" r="1.4" fill="#27354a"/><circle cx="19.5" cy="18" r="1.4" fill="#27354a"/><path d="M14 23 q2 2 4 0" fill="none" stroke="#a15f5f" stroke-width="1.4" stroke-linecap="round"/></svg>',
  cat: '<svg viewBox="0 0 32 32"><path d="M7 12 L8 4 L14 9 Q16 8 18 9 L24 4 L25 12 Q28 16 26 23 Q23 29 16 29 Q9 29 6 23 Q4 16 7 12 Z" fill="#d99a56" stroke="#6f513b" stroke-width="1.6" stroke-linejoin="round"/><path d="M11 17 l2 1 -2 1 M21 17 l-2 1 2 1 M14 23 q2 2 4 0" fill="none" stroke="#27354a" stroke-width="1.4" stroke-linecap="round"/></svg>',
  dog: '<svg viewBox="0 0 32 32"><path d="M8 12 Q3 10 4 21 Q6 26 10 23" fill="#9f673b" stroke="#6f513b" stroke-width="1.6"/><path d="M24 12 Q29 10 28 21 Q26 26 22 23" fill="#9f673b" stroke="#6f513b" stroke-width="1.6"/><circle cx="16" cy="19" r="10" fill="#d7a065" stroke="#6f513b" stroke-width="1.6"/><circle cx="12" cy="17" r="1.4" fill="#27354a"/><circle cx="20" cy="17" r="1.4" fill="#27354a"/><path d="M13 22 Q16 25 19 22" fill="#fff0df"/><circle cx="16" cy="21" r="1.8" fill="#27354a"/></svg>',
  bird: '<svg viewBox="0 0 32 32"><path d="M6 20 Q7 9 18 9 Q26 10 27 18 Q24 27 13 27 Q7 26 6 20 Z" fill="#78a9cf" stroke="#526071" stroke-width="1.6"/><path d="M7 20 L2 17 L5 24 Z" fill="#e8a33d" stroke="#6f513b" stroke-width="1.2"/><path d="M14 16 q5 1 7 7 q-7 1 -9 -3" fill="#bcdaf0"/><circle cx="21" cy="14" r="1.4" fill="#27354a"/><path d="M12 27 l-2 3 M17 27 l2 3" stroke="#75562c" stroke-width="1.4"/></svg>',
  goldfish: '<svg viewBox="0 0 32 32"><path d="M23 16 L30 9 L29 23 Z" fill="#f0a23c" stroke="#75562c" stroke-width="1.4"/><ellipse cx="14" cy="16" rx="11" ry="8" fill="#ee7d3f" stroke="#75562c" stroke-width="1.6"/><path d="M11 10 Q15 16 11 22" fill="none" stroke="#ffd39a" stroke-width="1.6"/><circle cx="8" cy="14" r="1.4" fill="#27354a"/><path d="M15 17 q4 -3 7 1 q-4 4 -8 1" fill="#f8bd6e"/></svg>',
  squirrel: '<svg viewBox="0 0 32 32"><path d="M22 20 Q31 17 27 7 Q23 1 18 7 Q26 8 22 13" fill="#c9894b" stroke="#6f513b" stroke-width="1.6"/><ellipse cx="15" cy="21" rx="8" ry="8" fill="#dca15f" stroke="#6f513b" stroke-width="1.6"/><circle cx="11" cy="12" r="6" fill="#dca15f" stroke="#6f513b" stroke-width="1.6"/><path d="M8 7 L9 3 L13 7" fill="#dca15f" stroke="#6f513b" stroke-width="1.4"/><circle cx="9.5" cy="11" r="1.2" fill="#27354a"/><path d="M12 21 q4 -4 7 0" fill="none" stroke="#f4d2a0" stroke-width="2"/></svg>',
  scissors: '<svg viewBox="0 0 32 32"><circle cx="9" cy="23" r="5" fill="#d85f68" stroke="#57494b" stroke-width="1.6"/><circle cx="18" cy="24" r="5" fill="#d85f68" stroke="#57494b" stroke-width="1.6"/><path d="M12 20 L25 4 L16 21 M17 20 L29 12" fill="#dce4e8" stroke="#526071" stroke-width="2" stroke-linecap="round"/><circle cx="15" cy="19" r="2" fill="#e8a33d"/></svg>',
  pencil: '<svg viewBox="0 0 32 32"><path d="M5 24 L22 7 L27 12 L10 29 L4 29 Z" fill="#f0bd43" stroke="#6f513b" stroke-width="1.5"/><path d="M22 7 L26 3 L30 7 L27 12 Z" fill="#e56f6f"/><path d="M5 24 L4 29 L10 29 Z" fill="#f2ddba"/><path d="M4 29 l3 -1" stroke="#27354a" stroke-width="1.4"/></svg>',
  eraser: '<svg viewBox="0 0 32 32"><path d="M5 20 L15 6 Q17 4 19 6 L28 13 Q30 15 28 17 L19 29 Z" fill="#7eb6df" stroke="#526071" stroke-width="1.6"/><path d="M5 20 L11 28 Q13 30 15 28 L20 21 L12 14 Z" fill="#f4b1ad"/><path d="M12 14 L20 21" stroke="#fff0df" stroke-width="1.6"/></svg>',
  ruler: '<svg viewBox="0 0 32 32"><path d="M4 20 L23 5 L29 12 L10 27 Z" fill="#f1c95a" stroke="#75562c" stroke-width="1.6"/><path d="M10 18 l3 3 M13 15 l2 2 M16 12 l3 3 M20 9 l2 2 M23 7 l3 3" stroke="#75562c" stroke-width="1.2"/></svg>',
  brush: '<svg viewBox="0 0 32 32"><path d="M18 18 L27 4 Q29 2 30 4 Q31 5 29 7 L21 20 Z" fill="#b87842" stroke="#6f513b" stroke-width="1.5"/><path d="M6 29 Q4 23 11 18 Q16 15 20 20 Q17 28 10 29 Z" fill="#5b90c9" stroke="#526071" stroke-width="1.5"/><path d="M8 24 q5 2 9 -3" fill="none" stroke="#cce1f2" stroke-width="1.5"/></svg>',
  crayon: '<svg viewBox="0 0 32 32"><path d="M8 25 L21 5 L27 9 L14 29 L7 29 Z" fill="#de6b70" stroke="#6f513b" stroke-width="1.5"/><path d="M21 5 L25 2 L29 5 L27 9 Z" fill="#f0a0a0"/><path d="M11 20 L17 24 M14 16 L20 20" stroke="#f7d06b" stroke-width="2"/></svg>',
  'tissue-case': '<svg viewBox="0 0 32 32"><path d="M4 13 L11 8 L28 11 L21 16 Z" fill="#9fc8df" stroke="#526071" stroke-width="1.4"/><path d="M4 13 L21 16 L21 28 L4 25 Z" fill="#76a9c9" stroke="#526071" stroke-width="1.4"/><path d="M21 16 L28 11 L28 23 L21 28 Z" fill="#5f8fae" stroke="#526071" stroke-width="1.4"/><path d="M13 11 Q11 3 17 3 Q20 6 18 13" fill="#fffaf0" stroke="#a9a092" stroke-width="1.2"/></svg>',
  'snack-package': '<svg viewBox="0 0 32 32"><path d="M7 4 L25 4 L27 28 L5 28 Z" fill="#e77754" stroke="#6f513b" stroke-width="1.6"/><path d="M7 8 L25 8 M6 24 L26 24" stroke="#f6c67b" stroke-width="2"/><circle cx="16" cy="16" r="5" fill="#f6c67b"/><path d="M13 16 q3 -4 6 0 q-3 4 -6 0" fill="#bd7540"/></svg>',
  'picture-book': '<svg viewBox="0 0 32 32"><path d="M5 5 Q12 3 16 7 L16 28 Q11 24 5 26 Z" fill="#5f91c9" stroke="#526071" stroke-width="1.5"/><path d="M27 5 Q20 3 16 7 L16 28 Q21 24 27 26 Z" fill="#78abd8" stroke="#526071" stroke-width="1.5"/><path d="M9 10 q3 -2 5 0 M19 10 q3 -2 5 0" stroke="#f7f0dc" stroke-width="1.4" fill="none"/></svg>',
  die: '<svg viewBox="0 0 32 32"><path d="M5 10 L15 4 L27 9 L17 15 Z" fill="#fff3de" stroke="#6f513b" stroke-width="1.4"/><path d="M5 10 L17 15 L17 28 L5 23 Z" fill="#e9d9be" stroke="#6f513b" stroke-width="1.4"/><path d="M17 15 L27 9 L27 22 L17 28 Z" fill="#d8c3a4" stroke="#6f513b" stroke-width="1.4"/><circle cx="11" cy="17" r="1.3" fill="#31415b"/><circle cx="22" cy="16" r="1.3" fill="#31415b"/><circle cx="22" cy="22" r="1.3" fill="#31415b"/></svg>',
  'wrap-core': '<svg viewBox="0 0 32 32"><path d="M8 8 L24 8 L24 25 L8 25 Z" fill="#c89a62" stroke="#6f513b" stroke-width="1.5"/><ellipse cx="16" cy="8" rx="8" ry="3.2" fill="#e5bd86" stroke="#6f513b" stroke-width="1.5"/><ellipse cx="16" cy="8" rx="3.8" ry="1.5" fill="#5f4936"/><ellipse cx="16" cy="25" rx="8" ry="3.2" fill="#a97849" stroke="#6f513b" stroke-width="1.5"/></svg>',
  'juice-can': '<svg viewBox="0 0 32 32"><path d="M7 7 L25 7 L24 27 Q16 30 8 27 Z" fill="#7aaed2" stroke="#526071" stroke-width="1.6"/><ellipse cx="16" cy="7" rx="9" ry="3.2" fill="#dbe7eb" stroke="#526071" stroke-width="1.5"/><ellipse cx="16" cy="7" rx="3.5" ry="1.3" fill="none" stroke="#72808a" stroke-width="1"/><path d="M10 13 h12 M10 22 h12" stroke="#bfe0ea" stroke-width="1.5"/></svg>',
  'pencil-cup': '<svg viewBox="0 0 32 32"><path d="M10 17 L7 4 L11 3 L14 17 M17 17 L20 2 L24 4 L21 18" fill="#efbd45" stroke="#6f513b" stroke-width="1.4"/><path d="M5 13 L27 13 L24 29 L8 29 Z" fill="#6f9fc0" stroke="#526071" stroke-width="1.6"/><path d="M9 17 h14" stroke="#a9d2e4" stroke-width="1.5"/></svg>',
  'tennis-ball': '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="13" fill="#c5d947" stroke="#657238" stroke-width="1.6"/><path d="M7 6 Q17 11 26 7 M6 25 Q15 20 26 25" fill="none" stroke="#f7f0d2" stroke-width="2"/></svg>',
  marble: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="13" fill="#5b9fd2" stroke="#526071" stroke-width="1.6"/><path d="M8 21 Q15 8 24 13 Q17 17 13 27" fill="#8fd1d5" opacity=".8"/><ellipse cx="11" cy="10" rx="3" ry="4" fill="#e7f7ff" opacity=".75"/> </svg>',
  'water-bottle': '<svg viewBox="0 0 32 32"><path d="M12 3 L20 3 L20 8 Q24 11 24 17 L23 29 L9 29 L8 17 Q8 11 12 8 Z" fill="#66a8b5" stroke="#40566b" stroke-width="1.5"/><path d="M11 4 h10 v4 H11 Z" fill="#e8a33d" stroke="#75562c" stroke-width="1.2"/><path d="M11 14 Q16 11 21 14 L21 24 Q16 26 11 24 Z" fill="#9bc8c7"/><path d="M13 16 q3 -2 6 0" fill="none" stroke="#e8f2e9" stroke-width="1.4"/></svg>',
  'pet-bottle': '<svg viewBox="0 0 32 32"><path d="M13 3 H19 L19 8 Q23 11 22 16 L21 29 H11 L10 16 Q9 11 13 8 Z" fill="#d7ecf2" stroke="#526071" stroke-width="1.5"/><path d="M12 4 h8 v4 h-8 Z" fill="#5c8fd6"/><path d="M11 16 Q16 14 22 16 L21 23 Q16 25 11 23 Z" fill="#79bca8"/><path d="M12 11 q4 2 8 0 M12 26 q4 -2 8 0" fill="none" stroke="#fff" stroke-width="1.2" opacity=".85"/></svg>',
  kettle: '<svg viewBox="0 0 32 32"><path d="M8 13 Q7 7 16 6 Q25 7 24 15 L23 26 Q16 30 9 26 Z" fill="#e6a34b" stroke="#6f513b" stroke-width="1.6"/><path d="M10 9 Q16 2 22 9" fill="none" stroke="#40566b" stroke-width="2.4" stroke-linecap="round"/><path d="M23 13 L30 16 L24 20 Z" fill="#e6a34b" stroke="#6f513b" stroke-width="1.5"/><path d="M11 14 q5 -4 10 0" fill="none" stroke="#f5cf85" stroke-width="1.8"/><circle cx="16" cy="7" r="2" fill="#40566b"/></svg>',
  'closed-box': '<svg viewBox="0 0 72 58"><path d="M9 20 L21 10 H65 L54 20 Z" fill="#e7bd7a" stroke="#654b34" stroke-width="2" stroke-linejoin="round"/><path d="M9 20 H54 V51 H9 Z" fill="#bd8149" stroke="#654b34" stroke-width="2"/><path d="M54 20 L65 10 V41 L54 51 Z" fill="#976039" stroke="#654b34" stroke-width="2"/><path d="M7 16 L20 5 H67 L65 10 H21 L9 20 Z" fill="#f0ce91" stroke="#654b34" stroke-width="2" stroke-linejoin="round"/><path d="M13 25 H50 M13 45 H50" stroke="#dca66a" stroke-width="2" opacity=".7"/><rect x="27" y="18" width="10" height="8" rx="2" fill="#40566b"/><path d="M14 11 H59" stroke="#fff0c4" stroke-width="2" opacity=".8"/></svg>',
  'device-number': '<svg viewBox="0 0 64 52"><path d="M9 9 H55 V43 H9 Z" fill="#315071" stroke="#172641" stroke-width="2.5"/><path d="M14 14 H50 V34 H14 Z" fill="#f7ebcf" stroke="#b5824c" stroke-width="2"/><circle cx="22" cy="24" r="5" fill="#e8a33d"/><circle cx="32" cy="24" r="5" fill="#e8a33d"/><circle cx="42" cy="24" r="5" fill="#e8a33d"/><path d="M20 43 v5 M44 43 v5" stroke="#b5824c" stroke-width="4" stroke-linecap="round"/><circle cx="49" cy="39" r="2.5" fill="#79bca8"/></svg>',
  'device-addition': '<svg viewBox="0 0 64 52"><path d="M6 13 H27 L36 22 H58 V39 H34 L25 30 H6 Z" fill="#c98856" stroke="#172641" stroke-width="2.5" stroke-linejoin="round"/><path d="M9 18 H24 L33 27 H55" fill="none" stroke="#f7ebcf" stroke-width="6" stroke-linecap="round"/><circle cx="14" cy="18" r="4" fill="#e8734a"/><circle cx="14" cy="31" r="4" fill="#5c8fd6"/><circle cx="48" cy="27" r="5" fill="#e8a33d"/><path d="M16 39 v7 M50 39 v7" stroke="#315071" stroke-width="4"/></svg>',
  'device-subtraction': '<svg viewBox="0 0 64 52"><path d="M8 9 H56 V24 L46 32 H18 L8 24 Z" fill="#c98856" stroke="#172641" stroke-width="2.5"/><path d="M32 12 V31 M32 31 L20 42 M32 31 L44 42" stroke="#f7ebcf" stroke-width="6" stroke-linecap="round"/><circle cx="32" cy="16" r="5" fill="#5c8fd6"/><path d="M8 40 H26 V48 H8 Z M38 40 H56 V48 H38 Z" fill="#315071" stroke="#172641" stroke-width="2"/></svg>',
  'device-measure': '<svg viewBox="0 0 64 52"><path d="M6 35 H58 V46 H6 Z" fill="#b5824c" stroke="#172641" stroke-width="2.5"/><path d="M12 31 H51" stroke="#2f9e6f" stroke-width="7" stroke-linecap="round"/><path d="M14 18 H50 V31 H14 Z" fill="#f7ebcf" stroke="#172641" stroke-width="2"/><path d="M18 21 v7 M24 24 v4 M30 21 v7 M36 24 v4 M42 21 v7 M48 24 v4" stroke="#315071" stroke-width="2"/><path d="M15 46 v4 M49 46 v4" stroke="#315071" stroke-width="4"/></svg>',
  'device-shape': '<svg viewBox="0 0 64 52"><path d="M7 32 H57 V43 H7 Z" fill="#b5824c" stroke="#172641" stroke-width="2.5"/><path d="M14 43 v7 M50 43 v7" stroke="#315071" stroke-width="4"/><path d="M14 26 L22 12 L30 26 Z" fill="#e8734a" stroke="#744839" stroke-width="2"/><circle cx="40" cy="19" r="8" fill="#5c8fd6" stroke="#40566b" stroke-width="2"/><path d="M48 12 h9 v14 h-9 Z" fill="#a06cc7" stroke="#65476f" stroke-width="2"/><path d="M12 36 H52" stroke="#f0ce91" stroke-width="2"/></svg>',
  'device-solve': '<svg viewBox="0 0 64 52"><path d="M8 8 H56 V37 H8 Z" fill="#315071" stroke="#172641" stroke-width="2.5"/><path d="M13 13 H51 V32 H13 Z" fill="#f7ebcf"/><path d="M18 28 V23 H24 V28 M29 28 V17 H35 V28 M40 28 V12 H46 V28" fill="#d65c86"/><path d="M19 18 L31 13 L43 20" fill="none" stroke="#2f9e6f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 37 v7 M42 37 v7 M17 45 H47" stroke="#b5824c" stroke-width="4" stroke-linecap="round"/></svg>',
  'toto-person': '<svg viewBox="0 0 42 56"><path d="M9 16 L7 3 L17 11 M33 16 L35 3 L25 11" fill="#d9782f" stroke="#68452f" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 15 Q21 5 32 15 L31 29 Q21 36 11 29 Z" fill="#dc7b32" stroke="#68452f" stroke-width="1.8"/><path d="M13 22 Q21 16 29 22 L27 30 Q21 34 15 30 Z" fill="#fff0d6"/><circle cx="16" cy="20" r="1.5" fill="#263748"/><circle cx="26" cy="20" r="1.5" fill="#263748"/><path d="M19 25 q2 2 4 0" fill="none" stroke="#68452f" stroke-width="1.3"/><path d="M11 33 Q21 29 31 33 L33 51 H9 Z" fill="#3e9b88" stroke="#31566b" stroke-width="1.8"/><path d="M15 32 v19 M27 32 v19" stroke="#f2dfbd" stroke-width="3"/><path d="M12 51 l-4 4 M30 51 l4 4" stroke="#68452f" stroke-width="3" stroke-linecap="round"/><path d="M10 37 Q2 36 4 47 Q7 52 11 47" fill="#d9782f" stroke="#68452f" stroke-width="1.8"/></svg>',
  'mokumo-person': '<svg viewBox="0 0 42 56"><path d="M21 7 V2 M18 2 H24" stroke="#31566b" stroke-width="2" stroke-linecap="round"/><circle cx="21" cy="8" r="3" fill="#64aeb0" stroke="#31566b" stroke-width="1.4"/><rect x="7" y="10" width="28" height="24" rx="10" fill="#f0dfbd" stroke="#40566b" stroke-width="2"/><rect x="11" y="15" width="20" height="13" rx="5" fill="#203453"/><circle cx="17" cy="21" r="2" fill="#77d5dc"/><circle cx="25" cy="21" r="2" fill="#77d5dc"/><path d="M18 25 q3 2 6 0" fill="none" stroke="#77d5dc" stroke-width="1.3"/><rect x="10" y="33" width="22" height="17" rx="5" fill="#e6d4b2" stroke="#40566b" stroke-width="2"/><path d="M14 37 H28 V44 H14 Z" fill="#5b91c4"/><circle cx="18" cy="40.5" r="1.5" fill="#e8a33d"/><circle cx="24" cy="40.5" r="1.5" fill="#e8734a"/><path d="M10 37 L5 44 M32 37 L37 44 M15 50 v4 M27 50 v4" stroke="#40566b" stroke-width="3" stroke-linecap="round"/></svg>',
  acorn: '<svg viewBox="0 0 32 32"><path d="M16 5 q1 -3 4 -3" stroke="#5b402b" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M7 12 Q16 5 25 12 L25 15 L7 15 Z" fill="#765032" stroke="#513b2c" stroke-width="1.4"/><path d="M9 15 L23 15 Q22 26 16 29 Q10 26 9 15 Z" fill="#b77b42" stroke="#65452e" stroke-width="1.5"/><path d="M12 18 q3 -2 6 -1" fill="none" stroke="#e3ae71" stroke-width="2" stroke-linecap="round"/><path d="M10 11 l3 4 M15 9 l3 6 M20 9 l2 5" stroke="#a2764e" stroke-width=".8"/></svg>',
  button: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12.5" fill="#d8e2ec" stroke="#667388" stroke-width="1.8"/><circle cx="16" cy="16" r="9" fill="#edf3f5" stroke="#a7b1c0" stroke-width="1.2"/><path d="M9 12 q4 -5 9 -4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".9"/><g fill="#667388"><circle cx="13" cy="13.4" r="1.6"/><circle cx="19" cy="13.4" r="1.6"/><circle cx="13" cy="18.6" r="1.6"/><circle cx="19" cy="18.6" r="1.6"/></g></svg>',
  block: '<svg viewBox="0 0 32 32"><path d="M4 10 L13 4 L28 8 L19 14 Z" fill="#f2c069" stroke="#75512f" stroke-width="1.3"/><path d="M4 10 L19 14 L19 29 L4 25 Z" fill="#e79c3e" stroke="#75512f" stroke-width="1.4"/><path d="M19 14 L28 8 L28 23 L19 29 Z" fill="#bd7133" stroke="#75512f" stroke-width="1.4"/><path d="M8 14 l7 2" stroke="#ffd994" stroke-width="1.6" stroke-linecap="round"/></svg>',
  bead: '<svg viewBox="0 0 32 32"><ellipse cx="16" cy="17" rx="13" ry="11" fill="#568fc8" stroke="#40566b" stroke-width="1.6"/><ellipse cx="16" cy="17" rx="8.5" ry="7" fill="#73acd7" stroke="#a8d6ee" stroke-width="1.1"/><path d="M9 13 q4 -6 11 -4" stroke="#e3f3ff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".9"/><ellipse cx="16" cy="24" rx="7" ry="1.8" fill="#315f99" opacity=".35"/></svg>'
};

function pieceInner(icon) {
  return PIECE_SVG[icon] || '';
}

export function iconSvg(icon) {
  return pieceInner(icon);
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

const SOLID_DEFS = '<defs><linearGradient id="solid-face" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe4b3"/><stop offset=".58" stop-color="#e8ad65"/><stop offset="1" stop-color="#c98545"/></linearGradient><linearGradient id="solid-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0cb"/><stop offset="1" stop-color="#e8bd7d"/></linearGradient><linearGradient id="solid-side" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d79452"/><stop offset="1" stop-color="#a96437"/></linearGradient><radialGradient id="solid-ball" cx="34%" cy="28%" r="72%"><stop offset="0" stop-color="#fff0c7"/><stop offset=".48" stop-color="#e6ae69"/><stop offset="1" stop-color="#bd7440"/></radialGradient></defs>';

const SOLID_SVG = {
  box: '<svg viewBox="0 0 120 100">' + SOLID_DEFS + '<rect x="14" y="34" width="70" height="50" rx="4" class="s-face"/><path d="M14 34 L38 14 L108 14 L84 34 Z" class="s-top"/><path d="M84 34 L108 14 L108 64 L84 84 Z" class="s-side"/><path d="M21 42 H75 M21 50 H68" class="s-highlight"/><path d="M43 21 H95 M91 39 V70" class="s-grain"/><circle cx="31" cy="69" r="2.5" class="s-knot"/></svg>',
  cube: '<svg viewBox="0 0 120 100">' + SOLID_DEFS + '<rect x="20" y="30" width="54" height="54" rx="4" class="s-face"/><path d="M20 30 L44 12 L98 12 L74 30 Z" class="s-top"/><path d="M74 30 L98 12 L98 66 L74 84 Z" class="s-side"/><path d="M27 38 H67 M27 46 H60" class="s-highlight"/><path d="M47 19 H88 M82 36 V73" class="s-grain"/><circle cx="54" cy="67" r="2.4" class="s-knot"/></svg>',
  tube: '<svg viewBox="0 0 120 100">' + SOLID_DEFS + '<path d="M30 22 H90 V82 H30 Z" class="s-face"/><ellipse cx="60" cy="22" rx="30" ry="10" class="s-top"/><path d="M30 82 A30 10 0 0 0 90 82 A30 10 0 0 1 30 82 Z" class="s-side"/><path d="M39 30 V71" class="s-highlight"/><path d="M78 31 V73 M47 52 H70" class="s-grain"/><ellipse cx="60" cy="22" rx="23" ry="5.5" class="s-rim"/></svg>',
  ball: '<svg viewBox="0 0 120 100">' + SOLID_DEFS + '<circle cx="60" cy="52" r="36" class="s-face s-ball"/><ellipse cx="60" cy="52" rx="36" ry="12" class="s-line"/><path d="M38 35 Q48 23 62 23" class="s-highlight ball-shine"/><path d="M35 61 Q56 71 82 61" class="s-grain"/><circle cx="73" cy="42" r="2.8" class="s-knot"/></svg>'
};

const FACE_SVG = {
  'まる': '<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="26" class="mark"/></svg>',
  'さんかく': '<svg viewBox="0 0 80 80"><path d="M40 12 L68 64 L12 64 Z" class="mark"/></svg>',
  'ましかく': '<svg viewBox="0 0 80 80"><rect x="16" y="16" width="48" height="48" class="mark"/></svg>',
  'ながしかく': '<svg viewBox="0 0 80 80"><rect x="8" y="24" width="64" height="32" class="mark"/></svg>'
};

import { STICK_FIGURES } from '../gen/g1/shape.js';
import { POLYS } from '../gen/g2/shape.js';

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

// 小2の図形。POLYS の座標から描く。markVertices で頂点に印
function polySvg(key, markVertices) {
  const p = POLYS[key];
  if (!p) return '';
  if (p.curved) {
    return '<svg class="poly-svg" viewBox="0 0 100 100"><path d="M50 12 C85 15 92 55 70 80 C50 98 15 85 12 55 C10 28 25 15 50 12 Z" class="poly-shape"/></svg>';
  }
  const pts = p.points.map(pt => pt.join(',')).join(' ');
  const marks = markVertices ? p.points.map(pt => '<circle cx="' + pt[0] + '" cy="' + pt[1] + '" r="4" class="poly-vertex"/>').join('') : '';
  if (p.open) {
    return '<svg class="poly-svg" viewBox="0 0 100 100"><polyline points="' + pts + '" class="poly-open"/></svg>';
  }
  return '<svg class="poly-svg" viewBox="0 0 100 100"><polygon points="' + pts + '" class="poly-shape"/>' + marks + '</svg>';
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

function cupsRow(n, label, object, objectKey) {
  let cups = '';
  for (let i = 0; i < n; i += 1) cups += '<span class="cup"></span>';
  return '<div class="cup-row"><span class="capacity-label"><b>' + esc(label) + '</b><span class="capacity-object" role="img" aria-label="' + esc(object) + '">' + pieceInner(objectKey) + '</span></span><span class="cup-track">' + cups + '</span></div>';
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
      return frame('<div class="two-groups"><div class="group tray"><small>みえている</small>' + dots(b.shown, b.icon) + '</div><div class="group tray closed"><small>ふた つき</small><span class="hidden-box" role="img" aria-label="ふたつきの はこ">' + pieceInner('closed-box') + '<b class="mystery">？</b></span></div></div><p class="board-note">ぜんぶで ' + b.total + 'こ</p>');
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
    // ---------- 小2の盤面 ----------
    case 'place-table': {
      const cols = [];
      const push = (label, n, cls) => {
        if (label === 'せん' && n === 0) return;
        let tokens = '';
        for (let i = 0; i < n; i += 1) tokens += '<span class="pv-token ' + cls + '"></span>';
        cols.push('<div class="pt-col"><small>' + label + '</small><div class="pt-cell">' + (n ? tokens : '<span class="pt-zero">0</span>') + '</div></div>');
      };
      push('せん', b.sen || 0, 'tok-sen');
      push('ひゃく', b.hyaku || 0, 'tok-hyaku');
      push('じゅう', b.ju || 0, 'tok-ju');
      push('いち', b.ichi || 0, 'tok-ichi');
      return frame('<div class="place-table">' + cols.join('') + '</div>');
    }
    case 'number-card':
      return frame('<div class="big-number">' + esc(b.value) + '</div>');
    case 'compare-pair':
      return frame('<div class="compare-pair"><div class="cmp-box"><small>あ</small><b>' + esc(b.left) + '</b></div><div class="cmp-box"><small>い</small><b>' + esc(b.right) + '</b></div></div>');
    case 'numberline-read': {
      let stops = '';
      const ticks = Math.round((b.max - b.min) / b.step);
      for (let i = 0; i <= ticks; i += 1) {
        const labeled = i === 0 || i === ticks;
        const tick = b.step < 1 ? (b.min + b.step * i).toFixed(1) : b.min + b.step * i;
        stops += '<span class="nl-stop"><i></i><b>' + (labeled ? esc(tick) : '') + '</b>' + (i === b.at ? '<span class="nl-arrow">▲</span>' : '') + '</span>';
      }
      return frame('<div class="numberline read">' + stops + '</div>');
    }
    case 'frac-tape': {
      let cells = '';
      for (let i = 0; i < b.parts; i += 1) cells += '<span class="frac-cell' + (i < b.shaded ? ' on' : '') + '"></span>';
      return frame('<div class="frac-tape">' + cells + '</div><p class="board-note">おなじ おおきさに わけた テープ</p>');
    }
    case 'trays': {
      const trays = [];
      for (let g = 0; g < b.groups; g += 1) {
        let dotsHtml = '';
        for (let i = 0; i < b.per; i += 1) dotsHtml += dot(b.icon);
        trays.push('<div class="tray-box">' + dotsHtml + '</div>');
      }
      return frame('<div class="tray-row">' + trays.join('') + '</div>');
    }
    case 'column-calc': {
      const w = Math.max(String(b.a).length, String(b.b).length) + 1;
      const padRow = v => String(v).padStart(w, '　').split('').map(ch => '<span class="col-digit">' + (ch === '　' ? '' : esc(ch)) + '</span>').join('');
      return frame('<div class="column-calc"><div class="col-row">' + padRow(b.a) + '</div>' +
        '<div class="col-row op-row"><span class="col-op">' + (b.hideOp ? '？' : esc(b.op)) + '</span>' + padRow(b.b) + '</div>' +
        '<div class="col-line"></div><div class="col-row answer-row"><span class="col-q">？</span></div></div>');
    }
    case 'array-grid': {
      let rows = '';
      for (let r = 0; r < b.rows; r += 1) {
        let cells = '';
        for (let c = 0; c < b.cols; c += 1) cells += '<span class="arr-dot' + (b.splitAt != null && c >= b.splitAt ? ' alt' : '') + '"></span>';
        rows += '<div class="arr-row">' + cells + '</div>';
      }
      return frame('<div class="array-grid">' + rows + '</div>');
    }
    case 'ruler-cm': {
      const max = b.max || 15;
      let ticks = '';
      for (let i = 0; i <= max; i += 1) {
        ticks += '<span class="cm-tick"><i></i><b>' + i + '</b></span>';
      }
      return frame('<div class="ruler-cm-wrap"><span class="obj-bar obj-' + esc(b.objectKey || 'tape') + '" style="width:' + (b.length / max * 100) + '%"></span>' +
        '<div class="ruler-cm">' + ticks + '</div></div><p class="board-note">0に はしを そろえて ある</p>');
    }
    case 'tank': {
      let big = '';
      for (let i = 0; i < (b.l || 0); i += 1) big += '<span class="tank-l"><small>1L</small></span>';
      let cups = '';
      for (let i = 0; i < (b.dl || 0); i += 1) cups += '<span class="tank-dl' + (b.removedDl && i >= b.dl - b.removedDl ? ' ghost' : '') + '"></span>';
      return frame('<div class="tank-row">' + big + '<div class="tank-dls">' + cups + '</div></div><p class="board-note">' + ((b.l || 0) > 0 ? '1Lの ますと 1dLの ます' : '1dLの ます') + '</p>');
    }
    case 'clock-span':
      return frame('<div class="clock-pair"><div class="clock-cell"><small>はじめ</small>' + clockSvg(b.startH, b.startM, 120) + '</div><span class="clock-arrow">→</span><div class="clock-cell"><small>おわり</small>' + clockSvg(b.endH, b.endM, 120) + '</div></div>');
    case 'poly':
      return frame('<div class="poly-single">' + polySvg(b.item, b.markVertices) + '</div>');
    case 'poly-set': {
      const cells = b.items.map((key, i) =>
        '<div class="poly-cell"><small>' + esc(b.labels[i]) + '</small>' + polySvg(key) + '</div>').join('');
      return frame('<div class="poly-set">' + cells + '</div>');
    }
    case 'tally-marks': {
      const groups = Math.floor(b.count / 5);
      const rest = b.count % 5;
      let html = '';
      for (let g = 0; g < groups; g += 1) html += '<span class="tally-group">' + '<i></i>'.repeat(5) + '</span>';
      if (rest) html += '<span class="tally-group">' + '<i></i>'.repeat(rest) + '</span>';
      return frame('<div class="tally-wrap"><small>' + esc(b.label) + '</small><div class="tally-row">' + html + '</div></div>');
    }
    case 'table-1d': {
      const head = b.rows.map(r => '<th>' + esc(r.label) + '</th>').join('');
      const vals = b.rows.map(r => '<td>' + r.count + '</td>').join('');
      return frame('<table class="data-table"><tr><th>しゅるい</th>' + head + '</tr><tr><th>かず</th>' + vals + '</tr></table>');
    }
    case 'tape-2': {
      // 未知の部分は 値に比例させず、見やすい幅で描く(つぶれると 図の意味が失われる)
      const knownMax = Math.max(...b.parts.map(part => part.value == null ? 0 : part.value), 1);
      const partHtml = b.parts.map(part => {
        const flexValue = part.value == null ? Math.max(2, Math.round(knownMax * 0.75)) : Math.max(part.value, 2);
        return '<span class="tape-part' + (part.value == null ? ' unknown' : '') + '" style="flex:' + flexValue + '">' + esc(part.label) + (part.value == null ? '<b>？</b>' : '') + '</span>';
      }).join('');
      return frame('<div class="tape-diagram"><div class="tape-top' + (b.top.value == null ? ' unknown' : '') + '">' + esc(b.top.label) + (b.top.value == null ? '<b>？</b>' : '') + '</div><div class="tape-parts">' + partHtml + '</div></div>');
    }
    case 'times-tape': {
      let copies = '';
      for (let i = 0; i < b.times; i += 1) copies += '<span class="times-unit"></span>';
      return frame('<div class="times-tape"><div class="tt-row"><small>もと</small><span class="times-unit base"></span></div><div class="tt-row"><small>ばい</small>' + copies + '</div></div>');
    }
    // ---------- 小3の盤面 ----------
    case 'abacus': {
      // そろばん: 5だま1つ+1だま4つ。value の各けたを 珠の位置で示す
      const digits = String(b.value).split('').map(Number);
      // 珠は「はりに よせる」ことで数を表す。5だまは 下げる、1だまは 上げる
      const rods = digits.map(d => {
        const five = d >= 5;
        const ones = d % 5;
        const onBeads = Array.from({ length: ones }, () => '<span class="ab-bead on"></span>').join('');
        const offBeads = Array.from({ length: 4 - ones }, () => '<span class="ab-bead"></span>').join('');
        return '<div class="ab-rod">' +
          '<div class="ab-upper">' + (five ? '<span class="ab-space"></span><span class="ab-bead on"></span>' : '<span class="ab-bead"></span><span class="ab-space"></span>') + '</div>' +
          '<span class="ab-bar"></span>' +
          '<div class="ab-lower">' + onBeads + (ones < 4 ? '<span class="ab-space"></span>' : '') + offBeads + '</div>' +
          '</div>';
      }).join('');
      return frame('<div class="abacus">' + rods + '</div><p class="board-note">うえの 5だまは さげると 5</p>');
    }
    case 'circle': {
      const lines = b.show === 'diameter'
        ? '<line x1="14" y1="60" x2="106" y2="60" class="circ-line"/><text x="60" y="52" text-anchor="middle" class="circ-label">ちょっけい</text>'
        : '<line x1="60" y1="60" x2="106" y2="60" class="circ-line"/><text x="83" y="52" text-anchor="middle" class="circ-label">はんけい</text>';
      return frame('<svg class="circle-svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="46" class="circ-shape"/><circle cx="60" cy="60" r="3.5" class="circ-center"/>' + (b.show === 'plain' ? '' : lines) + '</svg>');
    }
    case 'circle-pattern': {
      let circles = '';
      for (let i = 0; i < b.count; i += 1) {
        circles += '<circle cx="' + (34 + i * 26) + '" cy="40" r="24" class="circ-shape thin"/>';
      }
      return frame('<svg class="circle-svg wide" viewBox="0 0 ' + (68 + (b.count - 1) * 26) + ' 80">' + circles + '</svg><p class="board-note">おなじ はんけいの えん</p>');
    }
    case 'sphere-cut':
      return frame('<svg class="circle-svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="46" class="sphere-shape"/><ellipse cx="60" cy="60" rx="46" ry="14" class="sphere-line"/><line x1="10" y1="' + (b.cutY || 60) + '" x2="110" y2="' + (b.cutY || 60) + '" class="cut-line"/></svg><p class="board-note">てんせんで きる</p>');
    case 'angle-pair': {
      const wedge = deg => {
        const rad = (180 - deg) * Math.PI / 180;
        const x = 10 + 80 * Math.cos(rad) * -1;
        const y = 90 - 80 * Math.sin(rad);
        return '<svg class="angle-svg" viewBox="0 0 100 100"><path d="M10 90 L90 90 L' + x.toFixed(1) + ' ' + y.toFixed(1) + '" class="angle-arm"/><path d="M30 90 A20 20 0 0 0 ' + (10 + 20 * Math.cos(rad) * -1).toFixed(1) + ' ' + (90 - 20 * Math.sin(rad)).toFixed(1) + '" class="angle-arc"/></svg>';
      };
      return frame('<div class="poly-set"><div class="poly-cell"><small>あ</small>' + wedge(b.a) + '</div><div class="poly-cell"><small>い</small>' + wedge(b.bDeg) + '</div></div>');
    }
    case 'bar-graph': {
      const maxVal = Math.max(...b.columns.map(c => c.count));
      const rows = Math.ceil(maxVal / b.step);
      const cols = b.columns.map(c => {
        let cells = '';
        for (let i = 0; i < rows; i += 1) cells += '<span class="bar-cell' + (i * b.step < c.count ? ' on' : '') + '"></span>';
        return '<div class="bar-col"><div class="bar-stack">' + cells + '</div><span class="bar-label">' + esc(c.label) + '</span></div>';
      }).join('');
      let axis = '';
      for (let i = rows; i >= 0; i -= 1) axis += '<span class="bar-axis-label">' + i * b.step + '</span>';
      return frame('<div class="bar-graph"><div class="bar-axis">' + axis + '</div>' + cols + '</div><p class="board-note">1めもりは ' + b.step + '</p>');
    }
    case 'rod-groups': {
      const rods = n => {
        let r = '';
        for (let i = 0; i < n; i += 1) r += '<span class="rod"></span>';
        return '<div class="rod-row">' + r + '</div>';
      };
      return frame('<div class="two-groups"><div class="group"><small>10の たば</small>' + rods(b.left) + '</div><span class="group-op">と</span><div class="group"><small>10の たば</small>' + rods(b.right) + '</div></div>');
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
      return frame('<div class="object-card"><span class="object-card-picture" role="img" aria-label="' + esc(b.label) + '">' + pieceInner(b.icon) + '</span><span class="object-card-label">' + esc(b.label) + '</span></div>');
    case 'solid': {
      const objectSvg = b.icon ? pieceInner(b.icon) : '';
      const art = objectSvg
        ? '<span class="solid-object">' + objectSvg + '</span>'
        : (SOLID_SVG[b.solid] || '');
      return frame('<div class="solid-wrap">' + art + (b.label ? '<p class="board-note">' + esc(b.label) + '</p>' : '') + '</div>');
    }
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
      return frame('<div class="compare-stack">' + cupsRow(b.left, 'あ', b.object, b.objectKey) + cupsRow(b.right, 'い', b.object, b.objectKey) + '</div><p class="board-note">おなじ カップの いくつぶん</p>');
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
      for (let i = 0; i < b.people; i += 1) {
        const character = i % 2 === 0 ? 'toto-person' : 'mokumo-person';
        const name = i % 2 === 0 ? 'トト' : 'モクモ';
        people += '<span class="person" role="img" aria-label="' + name + '">' + pieceInner(character) + '</span>';
      }
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
