let cookies = 0;
let cps = 0;
let goldenClicks = 0;
let timePlayed = 0;
let prestigePoints = 0;
let goldenCookieActive = false;
let frenzyActive = false;

const buildings = {
  cursor: { name: 'Cursor 🖱️', cost: 15, rate: 0.1, count: 0, baseCost: 15 },
  grandma: { name: 'Grandma 👵', cost: 100, rate: 1, count: 0, baseCost: 100 },
  farm: { name: 'Farm 🌾', cost: 500, rate: 8, count: 0, baseCost: 500 },
  factory: { name: 'Factory 🏭', cost: 3000, rate: 47, count: 0, baseCost: 3000 },
  bank: { name: 'Bank 🏦', cost: 10000, rate: 150, count: 0, baseCost: 10000 },
  temple: { name: 'Temple 🛐', cost: 40000, rate: 600, count: 0, baseCost: 40000 },
  portal: { name: 'Portal 🌌', cost: 123456, rate: 1800, count: 0, baseCost: 123456 },
};

const shop = document.getElementById('shop');
const countEl = document.getElementById('count');
const cpsEl = document.getElementById('cps');
const goldenClicksEl = document.getElementById('golden-clicks');
const timePlayedEl = document.getElementById('time-played');
const totalCookiesEl = document.getElementById('total-cookies');

function format(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n);
}

function updateCPS() {
  cps = Object.values(buildings).reduce((sum, b) => sum + b.count * b.rate, 0);
  cpsEl.textContent = `Cookies per second: ${format(cps)}`;
}

function updateUI() {
  countEl.textContent = `Cookies: ${format(cookies)}`;
  totalCookiesEl.textContent = format(cookies);
  goldenClicksEl.textContent = goldenClicks;
  timePlayedEl.textContent = `${timePlayed}s`;
}

function renderShop() {
  shop.innerHTML = '';
  for (let key in buildings) {
    const b = buildings[key];
    const item = document.createElement('div');
    item.className = 'item';
    item.innerHTML = `
      <h3>${b.name}</h3>
      <p>Owned: ${b.count}</p>
      <p>Generates ${b.rate} cookies/sec</p>
      <button onclick="buy('${key}')">Buy (Cost: ${format(b.cost)})</button>
    `;
    shop.appendChild(item);
  }
}

function buy(key) {
  const b = buildings[key];
  if (cookies >= b.cost) {
    cookies -= b.cost;
    b.count++;
    b.cost = Math.floor(b.baseCost * Math.pow(1.15, b.count));
    updateCPS();
    renderShop();
    updateUI();
  }
}

document.getElementById('cookie').onclick = () => {
  cookies += goldenCookieActive ? 5 : 1;
  updateUI();
};

function loop() {
  cookies += cps / 10;
  timePlayed++;
  if (frenzyActive) {
    cookies += cps / 10000;
  }
  updateUI();
}

function spawnGoldenCookie() {
  const goldenCookie = document.createElement('div');
  goldenCookie.classList.add('golden-cookie');
  goldenCookie.onclick = () => {
    goldenClicks++;
    const effect = Math.random();
    if (effect < 0.5) {
      alert("Lucky! +50000 cookies.");
      cookies += 50000;
    } else if (effect < 0.6) {
      alert("Frenzy! Double your CPS for 10 seconds.");
      frenzyActive = true;
      setTimeout(() => frenzyActive = false, 10000);
    } else {
      alert("Click Frenzy! Double click power for 10 seconds.");
      goldenCookieActive = true;
      setTimeout(() => goldenCookieActive = false, 10000);
    }
    updateUI();
    goldenCookie.remove();
  };
  document.body.appendChild(goldenCookie);
  setTimeout(() => goldenCookie.remove(), 13000);
}

function prestige() {
  if (cookies >= 1e12) {
    prestigePoints++;
    cookies = 0;
    goldenClicks = 0;
    timePlayed = 0;
    updateUI();
    renderShop();
  }
}

function saveGame() {
  const saveData = {
    cookies,
    goldenClicks,
    timePlayed,
    prestigePoints,
    buildings: {}
  };
  for (let key in buildings) {
    saveData.buildings[key] = { count: buildings[key].count, cost: buildings[key].cost };
  }
  localStorage.setItem('cookieClickerSave', JSON.stringify(saveData));
}

function loadGame() {
  const savedData = JSON.parse(localStorage.getItem('cookieClickerSave'));
  if (savedData) {
    cookies = savedData.cookies;
    goldenClicks = savedData.goldenClicks;
    timePlayed = savedData.timePlayed;
    prestigePoints = savedData.prestigePoints;
    for (let key in savedData.buildings) {
      buildings[key].count = savedData.buildings[key].count;
      buildings[key].cost = savedData.buildings[key].cost;
    }
    updateCPS();
  }
  updateUI();
  renderShop();
}

setInterval(loop, 100);
setInterval(() => spawnGoldenCookie(), Math.random() * 240000 + 30000);
loadGame();
renderShop();
