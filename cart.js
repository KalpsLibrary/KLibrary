// KLibrary cart logic
async function getSessionOrRedirect() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) { window.location.href = "index.html"; return null; }
  return session;
}

function money(n) {
  return `₹${Number(n).toFixed(0)}`;
}

async function refreshCartCount() {
  if (!document.querySelector('.cart-count, #cartCount')) return;
  const { count } = await db.from('cart').select('*', { count: 'exact', head: true });
  document.querySelectorAll('.cart-count, #cartCount').forEach(el => el.textContent = count ?? 0);
}

async function addBook(button) {
  const card = button.closest('.book-card');
  const title = card.querySelector('h3').textContent.trim();
  const priceText = card.querySelector('.book-price')?.textContent || '';
  const priceMatch = priceText.replace(/,/g, '').match(/₹\s*(\d+(?:\.\d+)?)/);
  const price = priceMatch ? Number(priceMatch[1]) : NaN;

  if (!Number.isFinite(price)) {
    alert('This book does not have a price yet.');
    return;
  }

  button.disabled = true;
  const { error } = await db.rpc('add_to_cart', { p_book_title: title, p_price: price });
  button.disabled = false;

  if (error) {
    alert(error.message);
    return;
  }
  button.textContent = '✓';
  await refreshCartCount();
}

if (document.body.classList.contains('genre-page') || document.querySelector('#cartCount, .cart-count')) {
  getSessionOrRedirect().then(async session => {
    if (!session) return;
    document.querySelectorAll('.add-to-cart').forEach(btn => btn.addEventListener('click', () => addBook(btn)));
    await refreshCartCount();
  });
}

if (document.body.classList.contains('cart-page')) {
  getSessionOrRedirect().then(session => { if (session) loadCart(); });
}

async function loadCart() {
  const list = document.getElementById('cartItems');
  const subtotalEl = document.getElementById('subtotal');
  const discountEl = document.getElementById('discount');
  const totalEl = document.getElementById('total');
  const message = document.getElementById('cartMessage');

  const { data: items, error } = await db.from('cart').select('id, book_title, price').order('added_at');
  if (error) { message.textContent = error.message; return; }

  list.innerHTML = '';
  (items || []).forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `<div><h3>${escapeHtml(item.book_title)}</h3><p>${money(item.price)} / month</p></div><button class="remove-cart" data-id="${item.id}">Remove</button>`;
    list.appendChild(row);
  });

  document.querySelectorAll('.remove-cart').forEach(btn => btn.addEventListener('click', async () => {
    const { error } = await db.rpc('remove_from_cart', { p_cart_id: btn.dataset.id });
    if (error) { alert(error.message); return; }
    await loadCart();
  }));

  const prices = (items || []).map(x => Number(x.price));
  const subtotal = prices.reduce((a,b) => a+b, 0);
  let discount = 0;
  if (prices.length === 2) {
    discount = (subtotal * 0.10);
  }
  const total = subtotal - discount;
  subtotalEl.textContent = money(subtotal);
  discountEl.textContent = `− ${money(discount)}`;
  totalEl.textContent = money(total);
  document.getElementById('placeOrderBtn').disabled = prices.length === 0;
  document.getElementById('twoBookNote').textContent = prices.length === 2 ? '10% two-book discount applied.' : '';
}

function escapeHtml(s) {
  return s.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

const placeOrderBtn = document.getElementById('placeOrderBtn');
if (placeOrderBtn) {
  placeOrderBtn.addEventListener('click', async () => {
    placeOrderBtn.disabled = true;
    const { data, error } = await db.rpc('place_order');
    if (error) {
      alert(error.message);
      placeOrderBtn.disabled = false;
      return;
    }
    const total = Number(data.total).toFixed(0);
    document.getElementById('orderResult').textContent = `Order placed! Please pay ${money(total)} in cash when you collect the book${data.item_count === 2 ? 's' : ''}.`;
    await loadCart();
  });
}
