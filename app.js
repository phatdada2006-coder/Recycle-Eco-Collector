const cats = [
  ['ພລາສຕິກ (PET/ຂວດໃສ)', 15, 'fa-bottle-water'],
  ['ພລາສຕິກຂຸ້ນ (HDPE)', 12, 'fa-prescription-bottle'],
  ['ເຈ້ຍກ່ອງ (ກ່ອງກະດາດ)', 10, 'fa-box'],
  ['ເຈ້ຍຂາວ-ດຳ (ເອກະສານ)', 18, 'fa-file-lines'],
  ['ແກ້ວ (ຂວດແກ້ວ)', 20, 'fa-wine-bottle'],
  ['ຂີ້ເຫຍື້ອ IT (ເຄື່ອງໃຊ້ໄຟຟ້າ)', 50, 'fa-laptop'],
  ['ກະປອງເຫຼັກ / ສັງກະສີ', 30, 'fa-dumpster'],
  ['ອາລູມິເນຽມ (ກະປອງນ້ຳອັດລົມ)', 45, 'fa-whiskey-glass'],
  ['ຢາງລົດເກົ່າ', 25, 'fa-compact-disc'],
  ['ແບັດເຕີຣີເກົ່າ', 60, 'fa-car-battery'],
  ['ຂີ້ເຫຍື້ອອິນຊີ (ເສດຜັກ-ຜົນໄມ້)', 8, 'fa-apple-whole'],
  ['ເສດອາຫານ / ກາກກາເຟ', 5, 'fa-utensils']
].map(([name, rate, icon]) => ({ name, rate, icon }));

const rewards = [
  { id: 1, name: 'ຄູປອງກາເຟ 10,000 ກີບ', cost: 100, icon: 'fa-mug-hot' },
  { id: 2, name: 'ບັດເຕີມເງິນ 20,000 ກີບ', cost: 200, icon: 'fa-mobile-screen-button' },
  { id: 6, name: 'ຕົ້ນໄມ້ມົງຄຸນ 1 ຕົ້ນ', cost: 300, icon: 'fa-plant-wilt' },
  { id: 3, name: 'ຖົງຜ້າ Eco-Bag', cost: 350, icon: 'fa-bag-shopping' },
  { id: 4, name: 'ກະຕຸກນ້ຳເກັບຄວາມຮ້ອນ', cost: 500, icon: 'fa-glass-water' },
  { id: 5, name: 'ຄູປອງຊຸບເປີ 50,000 ກີບ', cost: 800, icon: 'fa-cart-shopping' }
];

const LEVELS = ['ເມັດພັນ 🌰', 'ຕົ້ນກ້າ 🌱', 'ຕົ້ນໄມ້ນ້ອຍ 🌿', 'ຕົ້ນໄມ້ໃຫຍ່ 🌳', 'ຜູ້ພິທັກໂລກ 🌍'], STEP = 25;
const KEY = 'luna_v6_clean', $ = id => document.getElementById(id), fmt = n => Number(n || 0).toLocaleString('en-US');
const esc = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => new Date().toISOString().split('T')[0];

let S = { userName: '',balance: 0, kg: 0, history: [], order: null, cart: [], photo: null, notifs: [] }, timers = [], tt;

function sanitizeData() {
  if (typeof S.balance !== 'number' || isNaN(S.balance)) S.balance = 0;
  if (typeof S.kg !== 'number' || isNaN(S.kg)) S.kg = 0;
  if (!Array.isArray(S.notifs)) S.notifs = [];
  if (!Array.isArray(S.cart)) S.cart = [];
  if (!Array.isArray(S.history)) S.history = [];
}
function loadUserData(name) {
  const userKey = 'luna_v6_user_' + name.toLowerCase();
  try {
    const v = JSON.parse(localStorage.getItem(userKey));
    if (v && typeof v === 'object') {
      S = { balance: 0, kg: 0, history: [], order: null, cart: [], photo: null, notifs: [], ...v, userName: name };
    } else {
      S = { userName: name, balance: 0, kg: 0, history: [], order: null, cart: [], photo: null, notifs: [] };
    }
  } catch (e) {
    S = { userName: name, balance: 0, kg: 0, history: [], order: null, cart: [], photo: null, notifs: [] };
  }
  sanitizeData();
}

function save() {
  if (!S.userName) return;
  try {
    const userKey = 'luna_v6_user_' + S.userName.toLowerCase();
    localStorage.setItem(userKey, JSON.stringify(S));
    localStorage.setItem('luna_v6_last_user', S.userName);
  } catch (e) { }
}

function toast(m, err) { const t = $('toast'); if (!t) return; t.textContent = m; t.className = 'toast show' + (err ? ' error' : ''); clearTimeout(tt); tt = setTimeout(() => t.className = 'toast', 2800) }
function confetti() {
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  for (let i = 0; i < 40; i++) {
    const c = document.createElement('i'); c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw'; c.style.background = ['#c9f26b', '#1c6b48', '#ffd43b', '#74c0fc'][i % 4];
    c.style.animationDelay = Math.random() * .5 + 's'; document.body.appendChild(c); setTimeout(() => c.remove(), 2600)
  }
}

function addNotification(msg) {
  const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  S.notifs.unshift({ msg, time, unread: true });
  save();
  updateNotifBadge();
}

function updateNotifBadge() {
  const unread = S.notifs.filter(n => n.unread).length;
  const badge = $('notif-badge');
  if (badge) {
    badge.textContent = unread;
    badge.style.display = unread > 0 ? 'block' : 'none';
  }
}

function renderNotifs() {
  const container = $('notif-list-body');
  if (!container) return;
  container.innerHTML = S.notifs.length ? S.notifs.map(n => `<div class="notif-item"><b>${esc(n.msg)}</b><small>${n.time}</small></div>`).join('') : '<p class="empty">ບໍ່ມີການແຈ້ງເຕືອນ</p>';
  S.notifs.forEach(n => n.unread = false);
  save();
  updateNotifBadge();
}

function renderPriceTable() {
  const container = $('price-table-body');
  if (container) container.innerHTML = cats.map(c => `<div class="price-row"><span><i class="fa-solid ${c.icon}"></i>${esc(c.name)}</span><b>${c.rate} Pt/ກກ.</b></div>`).join('');
}

function renderCertificate() {
  if ($('cert-kg'))$('cert-kg').textContent = fmt(+S.kg.toFixed(1));
  if ($('cert-co2'))$('cert-co2').textContent = fmt(+(S.kg * 1.5).toFixed(1));
  if ($('cert-tree'))$('cert-tree').textContent = (S.kg * 1.5 / 21).toFixed(1);
  if ($('cert-user-name'))$('cert-user-name').textContent = `ທ່ານ ${S.userName || 'Luna'}`;
}


function renderStats() {
  if ($('wallet-balance'))$('wallet-balance').textContent = fmt(S.balance);
  const lv = Math.min(LEVELS.length - 1, Math.floor(S.kg / STEP)), max = lv === LEVELS.length - 1;
  if ($('lv-name'))$('lv-name').textContent = LEVELS[lv];
  if ($('lv-next'))$('lv-next').textContent = max ? 'ລະດັບສູງສຸດ!' : `ອີກ ${fmt(+(STEP * (lv + 1) - S.kg).toFixed(1))} ກກ. ຂຶ້ນລະດັບ`;
  if ($('lv-bar'))$('lv-bar').style.width = (max ? 100 : (S.kg % STEP) / STEP * 100) + '%';
  if ($('st-kg'))$('st-kg').textContent = fmt(+S.kg.toFixed(1));
  if ($('st-co2'))$('st-co2').textContent = fmt(+(S.kg * 1.5).toFixed(1));
  if ($('st-tree'))$('st-tree').textContent = (S.kg * 1.5 / 21).toFixed(1);
  save();
}

function renderCats(list) {
  const el = $('category-list');
  if (!el) return;
  el.innerHTML = (list && list.length) 
    ? list.map(c => {
        const idx = cats.indexOf(c);
        return `<div class="cat-card" data-i="${idx}" tabindex="0" role="button"><i class="fa-solid ${c.icon}"></i><span>${esc(c.name)}</span><small>${c.rate} Pt / ກກ.</small></div>`;
      }).join('') 
    : '<p class="empty">ບໍ່ພົບປະເພດທີ່ຄົ້ນຫາ</p>';
}

function cartPts() { return S.cart.reduce((a, x) => a + Math.round(x.w * (cats[x.i]?.rate || 0)), 0) }

function updateTotalPoints() {
  const total = cartPts();
  if ($('estimated-points'))$('estimated-points').textContent = fmt(total) + ' Pt';
}

function renderCart() {
  const cartEl = $('cart');
  if (cartEl) {
    cartEl.innerHTML = S.cart.length 
      ? S.cart.map((x, n) => `<div class="cart-item"><span>${esc(cats[x.i]?.name)} · ${x.w} ກກ.</span><span>${fmt(Math.round(x.w * (cats[x.i]?.rate || 0)))} Pt<button data-del="${n}" aria-label="ລຶບ">✕</button></span></div>`).join('') 
      : '<p class="note">ຕະກ້າຍັງວ່າງ ເລືອກປະເພດແລ້ວກົດເພີ່ມ</p>';
  }
  updateTotalPoints();
  save();
}

function addToCart(silent = false) {
  const w = parseFloat($('weight-input')?.value || 0), i = +($('cat-select')?.value || 0);
  if (!(w >= .5)) {
    if (!silent) toast('ນ້ຳໜັກຕ້ອງຢ່າງໜ້ອຍ 0.5 ກກ.', 1);
    return false;
  }
  const ex = S.cart.find(x => x.i === i);
  if (ex) { ex.w += w; } else { S.cart.push({ i, w }); }
  if ($('weight-input'))$('weight-input').value = 1;
  renderCart();
  if (!silent) toast('ເພີ່ມເຂົ້າກະະຕ່າແລ້ວ');
  return true;
}

function renderThumb() {
  const t = $('photo-thumb'), b =$('btn-remove-photo');
  if (!t) return;
  t.style.backgroundImage = S.photo ? `url(${S.photo})` : '';
  t.innerHTML = S.photo ? '' : '<i class="fa-solid fa-camera"></i>';
  if (b) b.style.display = S.photo ? 'block' : 'none';
}

function go(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('active', b.dataset.screen === id));
  const main = $('main'); if (main) main.scrollTop = 0;
  if (id === 'reward-screen') renderRewards();
  if (id === 'history-screen') renderHistory();
  if (id === 'sell-screen') updateTotalPoints();
}

function confirmOrder() {
  const date = $('pickup-date')?.value, address = $('pickup-address')?.value.trim(), phone =$('pickup-phone')?.value.trim();
  if (S.order) return toast('ທ່ານມີນັດໝາຍທີ່ກຳລັງດຳເນີນຢູ່ແລ້ວ', 1);
  if (!S.cart.length) return toast('ກະລຸນາເພີ່ມຂີ້ເຫຍື້ອຢ່າງໜ້ອຍ 1 ລາຍການ', 1);
  if (!date) return toast('ກະລຸນາເລືອກວັນທີ', 1);
  if (!address) return toast('ກະລຸນາໃສ່ທີ່ຢູ່', 1);
  if (!/^[0-9+\s-]{8,}$/.test(phone)) return toast('ກະລຸນາໃສ່ເບີໂທໃຫ້ຖືກຕ້ອງ', 1);

  S.order = { items: S.cart.map(x => ({ ...x })), photo: S.photo, date, address, phone, time: $('pickup-time')?.value || '', points: cartPts(), stage: 1 };
  S.cart = []; S.photo = null; renderCart(); renderThumb(); renderTracking(); startTracking(); go('tracking-screen');
  addNotification('ຢືນຢັນຄຳຮ້ອງຂໍນັດໝາຍຮັບຂີ້ເຫຍື້ອແລ້ວ');
  toast('ນັດໝາຍສຳເລັດແລ້ວ!');
}

function renderTracking() {
  const o = S.order, st = o ? o.stage : 0;
  if ($('order-details-box'))$('order-details-box').style.display = o ? 'flex' : 'none';
  if ($('rider-info-box'))$('rider-info-box').style.display = (o && st >= 2) ? 'flex' : 'none';
  if (o) {
    if ($('info-date'))$('info-date').textContent = o.date;
    if ($('info-time'))$('info-time').textContent = o.time;
    if ($('info-address'))$('info-address').textContent = o.address;
    if ($('info-phone'))$('info-phone').textContent = o.phone;
    if ($('info-items'))$('info-items').textContent = o.items.map(x => `${cats[x.i]?.name || ''} ${x.w}ກກ.`).join(', ');
    if ($('info-photo')) {$('info-photo').style.display = o.photo ? 'block' : 'none'; if (o.photo) $('info-photo').src = o.photo; }   }   [1, 2, 3].forEach(n => { const el =$('st-' + n); if (el) el.className = st > n ? 'done' : st === n ? 'active' : ''; });
  if ($('tracking-text'))$('tracking-text').textContent = ['ຍັງບໍ່ມີການນັດໝາຍ', 'ຢືນຢັນຄຳຮ້ອງຂໍແລ້ວ', 'ໄຮເດີກຳລັງເດີນທາງມາ...', 'ໄຮເດີມາຮອດແລ້ວ ກຳລັງຊັ່ງນ້ຳໜັກ'][st];
  if ($('btn-complete'))$('btn-complete').style.display = st === 3 ? 'block' : 'none';
  if ($('btn-cancel'))$('btn-cancel').style.display = o ? 'block' : 'none';
}

function startTracking() {
  timers.forEach(clearTimeout); timers = []; const o = S.order; if (!o) return;
  [[2, 4000], [3, 9000]].forEach(([n, ms]) => {
    timers.push(setTimeout(() => {
      if (S.order) {
        S.order.stage = n; save(); renderTracking();
        if (n === 2) addNotification('ໄຮເດີກຳລັງເດີນທາງມາຫາທ່ານ');
        if (n === 3) addNotification('ໄຮເດີມາຮອດແລ້ວ ກຳລັງຊັ່ງນ້ຳໜັກ');
      }
    }, ms));
  });
}

function completeOrder() {
  const o = S.order; 
  if (!o) return; 

  S.order = null; 

  timers.forEach(clearTimeout);
  timers = [];

  const kg = o.items.reduce((a, x) => a + x.w, 0);
  S.balance += o.points; 
  S.kg += kg;

  S.history.unshift({ 
    title: 'ຂາຍຂີ້ເຫຍື້ອ: ' + o.items.map(x => (cats[x.i]?.name || '').split(' ')[0]).join(', '), 
    points: '+' + o.points, 
    type: 'plus', 
    date: o.date, 
    status: 'ສຳເລັດ', 
    photo: o.photo 
  });

  addNotification(`ໂອນ +${fmt(o.points)} Pt ເຂົ້າກະເປົ໋າຮຽບຮ້ອຍແລ້ວ! 🎉`);
  
  save(); // บันทึกข้อมูลทันที

  renderStats(); 
  renderTracking(); 
  confetti(); 
  toast(`ໄດ້ຮັບ +${fmt(o.points)} Points 🎉`); 
  go('history-screen');
}

function cancelOrder() {
  if (!S.order || !confirm('ຕ້ອງການຍົກເລີກການນັດໝາຍນີ້ແມ່ນບໍ?')) return;
  timers.forEach(clearTimeout); S.history.unshift({ title: 'ນັດໝາຍຂາຍຂີ້ເຫຍື້ອ', points: '0', type: 'plus', date: S.order.date, status: 'ຍົກເລີກ' });
  addNotification('ຍົກເລີກການນັດໝາຍຮຽບຮ້ອຍແລ້ວ');
  S.order = null; save(); renderTracking(); toast('ຍົກເລີກແລ້ວ');
}

function renderRewards() {
  const el = $('reward-list'); if (!el) return;
  el.innerHTML = rewards.map(r => { const ok = S.balance >= r.cost; return `<div class="reward-card"><i class="fa-solid ${r.icon}"></i><h5>${esc(r.name)}</h5><p>${fmt(r.cost)} Pt</p>${ok ? '' : `<span class="need">ຂາດອີກ ${fmt(r.cost - S.balance)} Pt</span>`}<button class="btn-redeem" data-id="${r.id}" ${ok ? '' : 'disabled'}>ແລກ</button></div>` }).join('');
}

function redeem(id) {
  const r = rewards.find(x => x.id === id); if (!r || S.balance < r.cost) return toast('ຄະແນນບໍ່ພໍ', 1);
  if (!confirm(`ແລກ "${r.name}" ດ້ວຍ ${fmt(r.cost)} Pt ແມ່ນບໍ?`)) return;
  S.balance -= r.cost; S.history.unshift({ title: 'ແລກລາງວັນ: ' + r.name, points: '-' + r.cost, type: 'minus', date: today(), status: 'ສຳເລັດ' });
  addNotification(`ແລກລາງວັນ ${r.name} ສຳເລັດແລ້ວ`);
  renderStats(); renderRewards(); confetti(); toast('ແລກລາງວັນສຳເລັດ!');
}

function renderHistory() {
  const el = $('history-container'); if (!el) return;
  el.innerHTML = S.history.length ? S.history.map(i => `<div class="history-item"><div><b>${esc(i.title)}</b><br><small>${esc(i.date)} · ${esc(i.status)}</small></div><span class="${i.type === 'plus' ? 'plus' : 'minus'}">${esc(i.points)} Pt</span></div>`).join('') : '<p class="empty">ຍັງບໍ່ມີປະວັດ ລອງຂາຍຂີ້ເຫຍື້ອຄັ້ງທຳອິດ</p>';
}

// -------------------------------------------------------------
// -------------------------------------------------------------
 function downloadCertificate() {
  const canvas = document.createElement('canvas');
  // ปรับความละเอียดภาพ Ultra HD (2400x1680 px) คมชัดสูงมาก
  const width = 1200;
  const height = 840;
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. พื้นหลังการ์ดสีเขียวพรีเมียม
  ctx.fillStyle = '#1c6b48';
  ctx.fillRect(0, 0, width, height);

  // 2. กรอบนอกสีทอง/เขียวอ่อน
  ctx.strokeStyle = '#c9f26b';
  ctx.lineWidth = 6;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  // 3. กรอบชั้นในเพิ่มความหรูหรา
  ctx.strokeStyle = 'rgba(201, 242, 107, 0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(42, 42, width - 84, height - 84);

  // 4. หัวข้อใบประกาศ
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 42px "Noto Sans Lao", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CERTIFICATE OF ECO-ACHIEVEMENT', width / 2, 160);

  // 5. ชื่อผู้รับ
  ctx.fillStyle = '#c9f26b';
  ctx.font = 'bold 34px "Noto Sans Lao", sans-serif';
  const displayName = S.userName || 'Luna';
  ctx.fillText(`Presented to: ${displayName}`, width / 2, 250);

  // 6. สถิติความสำเร็จ
  const kg = (S.kg || 0).toFixed(1);
  const co2 = (S.kg * 1.5).toFixed(1);
  const tree = (S.kg * 1.5 / 21).toFixed(1);

  ctx.fillStyle = '#ffffff';
  ctx.font = '28px "Noto Sans Lao", sans-serif';
  ctx.fillText(`Recycled Waste: ${kg} kg`, width / 2, 380);
  ctx.fillText(`CO₂ Reduction: ${co2} kg`, width / 2, 450);
  ctx.fillText(`Tree Equivalent: ${tree} trees`, width / 2, 520);

  // 7. ข้อความขอบคุณด้านล่าง
  ctx.fillStyle = '#d0f0c0';
  ctx.font = '20px "Noto Sans Lao", sans-serif';
  ctx.fillText('Thank you for protecting our planet with Recycle & Eco-Collector Platform', width / 2, 680);

  // 8. สั่งแชร์หรือดาวน์โหลด
  const fileName = `Eco-Certificate-${displayName}.png`;

  canvas.toBlob(async (blob) => {
    if (!blob) return toast('ເກີດຂໍ້ຜິດພາດໃນການສ້າງໃບCertificate', 1);

    const file = new File([blob], fileName, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Eco Certificate',
          text: 'ໃບຮັບຮອງຄວາມສຳເລັດໃນການຣີໄຊຣເຄິ'
        });
        toast('ບັນທຶກ/ແຊຣຮຽບຮ້ອຍແລ້ວ! 🎓');
        confetti();
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = fileName;
    a.href = blobUrl;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);

    toast('ດາວໂຫຼດໃບCertificateແລ້ວ! 🎓');
    confetti();
  }, 'image/png');
}
function initApp() {
  // เช็คผู้ใช้ล่าสุด (ถ้ามี)
  const lastUser = localStorage.getItem('luna_v6_last_user');
  if (lastUser) {
    loadUserData(lastUser);
    if ($('modal-login'))$('modal-login').classList.remove('active');
    if ($('user-display-name'))$('user-display-name').textContent = S.userName;
  } else {
    if ($('modal-login'))$('modal-login').classList.add('active');
  }

  // ปุ่มกดล็อกอิน
  if ($('btn-login'))$('btn-login').onclick = () => {
    const name = $('input-username')?.value.trim();
    if (!name) return toast('ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້', 1);
    
    loadUserData(name);
    save();
    
    if ($('modal-login'))$('modal-login').classList.remove('active');
    if ($('user-display-name'))$('user-display-name').textContent = S.userName;
    
    renderStats();
    renderCart();
    renderTracking();
    renderNotifs();
    renderCertificate();
    
    toast(`ຍິນດີຕ້ອນຮັບ ${S.userName}! 🎉`);
  };
  const select = $('cat-select');
  if (select) select.innerHTML = cats.map((c, i) => `<option value="${i}">${esc(c.name)} (${c.rate} Pt/ກກ.)</option>`).join('');

  renderCats(cats);
  renderStats();
  renderCart();
  renderThumb();
  renderTracking();
  startTracking();
  updateNotifBadge();

  const d = $('pickup-date'); if (d) d.min = d.value = today();

  const search = $('search-cat');
  if (search) search.addEventListener('input', e => { const q = e.target.value.toLowerCase().trim(); renderCats(cats.filter(c => c.name.toLowerCase().includes(q))) });

  const pick = e => { const c = e.target.closest('.cat-card'); if (c) { if (select) select.value = c.dataset.i; go('sell-screen'); } };
  const catList = $('category-list');
  if (catList) { catList.addEventListener('click', pick); catList.addEventListener('keydown', e => e.key === 'Enter' && pick(e)); }

  const nav = document.querySelector('nav');
  if (nav) nav.addEventListener('click', e => { const b = e.target.closest('button'); if (b) go(b.dataset.screen) });

  if ($('w-minus')) $('w-minus').onclick = () => { const input =$('weight-input'); if (input) { input.value = Math.max(.5, (parseFloat(input.value) || 1) - .5); } };
  if ($('w-plus')) $('w-plus').onclick = () => { const input =$('weight-input'); if (input) { input.value = (parseFloat(input.value) || 0) + .5; } };

  if ($('btn-add'))$('btn-add').onclick = () => addToCart(false);
  if ($('cart'))$('cart').addEventListener('click', e => { const b = e.target.closest('[data-del]'); if (b) { S.cart.splice(+b.dataset.del, 1); renderCart() } });
  if ($('btn-confirm'))$('btn-confirm').onclick = confirmOrder;
  if ($('btn-complete'))$('btn-complete').onclick = completeOrder;
  if ($('btn-cancel'))$('btn-cancel').onclick = cancelOrder;
  if ($('reward-list'))$('reward-list').addEventListener('click', e => { const b = e.target.closest('.btn-redeem'); if (b && !b.disabled) redeem(+b.dataset.id) });
  if ($('btn-locate'))$('btn-locate').onclick = () => { if (!navigator.geolocation) return toast('ອຸປະກອນບໍ່ຮອງຮັບ', 1); toast('ກຳລັງຊອກຫາຕຳແໜ່ງ...'); navigator.geolocation.getCurrentPosition(p => { const a = $('pickup-address'); if (a) { a.value += (a.value ? '\n' : '') + `GPS: ${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`; toast('ເພີ່ມຕຳແໜ່ງແລ້ວ') } }, () => toast('ບໍ່ສາມາດລະບຸຕຳແໜ່ງໄດ້', 1)) };

  const photoFile = $('photo-file');
  if (photoFile) photoFile.addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    const reader = new FileReader(); reader.onload = evt => { S.photo = evt.target.result; save(); renderThumb(); toast('ເພີ່ມຮູບແລ້ວ') };
    reader.readAsDataURL(f);
  });

  if ($('btn-remove-photo'))$('btn-remove-photo').onclick = () => { S.photo = null; if (photoFile) photoFile.value = ''; save(); renderThumb(); toast('ລຶບຮູບແລ້ວ') };

  if ($('btn-open-prices')) $('btn-open-prices').onclick = () => { renderPriceTable();$('modal-prices').classList.add('active') };
  if ($('btn-close-prices')) $('btn-close-prices').onclick = () =>$('modal-prices').classList.remove('active');
  if ($('btn-open-cert')) $('btn-open-cert').onclick = () => { renderCertificate();$('modal-cert').classList.add('active') };
  if ($('btn-close-cert')) $('btn-close-cert').onclick = () =>$('modal-cert').classList.remove('active');
  
  // เปลี่ยนปุ่มแชร์เป็นดาวน์โหลดรูปภาพ
  if ($('btn-share-cert'))$('btn-share-cert').onclick = downloadCertificate;
  
  if ($('btn-show-notifs')) $('btn-show-notifs').onclick = () => { renderNotifs();$('modal-notifs').classList.add('active') };
  if ($('btn-close-notifs')) $('btn-close-notifs').onclick = () =>$('modal-notifs').classList.remove('active');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}