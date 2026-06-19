// App state and simulated apps lists
let activeWallpaper = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop&q=80';
let currentTheme = 'dark';
let iconStyle = 'squircle';
let isDrawerOpen = false;
let isSettingsOpen = false;
let currentActiveScreen = 'home'; // 'zero' or 'home'
let launchedApp = null;
let flashlightActive = false;

// Mock list of apps in alphabetical order
const mockAppsList = [
  { id: 'browser', label: 'Browser', iconClass: 'ri-chrome-fill', wrapperClass: 'app-chrome', category: 'B' },
  { id: 'calculator', label: 'Calculator', iconClass: 'ri-calculator-line', wrapperClass: 'app-notes', category: 'C' },
  { id: 'camera', label: 'Camera', iconClass: 'ri-camera-fill', wrapperClass: 'app-camera', category: 'C' },
  { id: 'contacts', label: 'Contacts', iconClass: 'ri-contacts-book-2-fill', wrapperClass: 'app-contacts', category: 'C' },
  { id: 'facebook', label: 'Facebook', iconClass: 'ri-facebook-fill', wrapperClass: 'app-facebook', category: 'F' },
  { id: 'files', label: 'Files Manager', iconClass: 'ri-folder-open-fill', wrapperClass: 'app-files', category: 'F' },
  { id: 'gallery', label: 'Gallery', iconClass: 'ri-image-2-fill', wrapperClass: 'app-gallery', category: 'G' },
  { id: 'messages', label: 'Messages', iconClass: 'ri-chat-3-fill', wrapperClass: 'app-messages', category: 'M' },
  { id: 'music', label: 'Music Player', iconClass: 'ri-music-fill', wrapperClass: 'app-music', category: 'M' },
  { id: 'notes', label: 'Quick Notes', iconClass: 'ri-file-text-fill', wrapperClass: 'app-notes', category: 'N' },
  { id: 'phone', label: 'Phone Dialer', iconClass: 'ri-phone-fill', wrapperClass: 'app-phone', category: 'P' },
  { id: 'playstore', label: 'Play Store', iconClass: 'ri-play-store-fill', wrapperClass: 'app-playstore', category: 'P' },
  { id: 'settings', label: 'HiOS Settings', iconClass: 'ri-settings-4-fill', wrapperClass: 'app-settings-icon', category: 'S' },
  { id: 'weather', label: 'Weather', iconClass: 'ri-sun-cloudy-fill', wrapperClass: 'app-gallery', category: 'W' },
  { id: 'whatsapp', label: 'WhatsApp', iconClass: 'ri-whatsapp-fill', wrapperClass: 'app-whatsapp', category: 'W' },
  { id: 'youtube', label: 'YouTube', iconClass: 'ri-youtube-fill', wrapperClass: 'app-youtube', category: 'Y' }
];

// Touch swiping tracking variables
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

// Initialize elements on load
document.addEventListener("DOMContentLoaded", () => {
  initClock();
  initBattery();
  renderDrawerApps();
  renderAlphabetIndex();
  initSwiping();
  initWallpaperAndCustomization();
  
  // Clear search on drawer close
  document.getElementById('drawerSearchInput').addEventListener('input', handleDrawerSearch);
  document.getElementById('clearSearchBtn').addEventListener('click', () => {
    document.getElementById('drawerSearchInput').value = '';
    handleDrawerSearch();
  });
  
  // RAM booster listener
  document.getElementById('ramBooster').addEventListener('click', runRamBooster);
  
  // Flashlight click listener
  document.getElementById('flashlightBtn').addEventListener('click', toggleFlashlight);

  // Keyboard navigation back/home keys simulation on desktop
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      handleNavBack();
    }
  });
});

// 1. DYNAMIC CLOCK & WEATHER WIDGET LOGIC
function initClock() {
  const updateTime = () => {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    const timeStr = `${hours}:${minutes}`;
    
    // Update status bar time
    document.getElementById('statusTime').textContent = `${timeStr} ${ampm}`;
    
    // Update widget times if they exist
    if (document.getElementById('widgetTime')) {
      document.getElementById('widgetTime').textContent = timeStr;
      document.getElementById('widgetAmPm').textContent = ampm;
    }
    
    // Format Date: e.g. "Friday, June 19"
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('en-US', options);
    
    if (document.getElementById('widgetDate')) {
      document.getElementById('widgetDate').textContent = dateStr;
    }
    if (document.getElementById('zeroDate')) {
      document.getElementById('zeroDate').textContent = dateStr;
    }
  };
  
  updateTime();
  setInterval(updateTime, 10000); // Update every 10 seconds
}

function initBattery() {
  const bat = document.getElementById('statusBattery');
  if (navigator.getBattery) {
    navigator.getBattery().then(battery => {
      const updateBatteryStatus = () => {
        const level = Math.round(battery.level * 100);
        if (battery.charging) {
          bat.className = 'ri-battery-2-charge-fill';
        } else if (level > 80) {
          bat.className = 'ri-battery-fill';
        } else if (level > 40) {
          bat.className = 'ri-battery-low-fill';
        } else {
          bat.className = 'ri-battery-line';
        }
      };
      updateBatteryStatus();
      battery.addEventListener('levelchange', updateBatteryStatus);
      battery.addEventListener('chargingchange', updateBatteryStatus);
    });
  }
}

// 2. RAM BOOSTER ANIMATION
function runRamBooster() {
  const card = document.getElementById('ramBooster');
  const percentEl = document.getElementById('ramPercent');
  const feedbackEl = document.getElementById('ramFeedback');
  const ring = card.querySelector('.booster-ring');
  
  if (card.classList.contains('boosting')) return;
  
  card.classList.add('boosting');
  feedbackEl.textContent = 'Clearing cache & boosting system...';
  
  let currentVal = parseInt(percentEl.textContent);
  let targetVal = Math.floor(Math.random() * 20) + 30; // Random target 30-50%
  
  let interval = setInterval(() => {
    if (currentVal > targetVal) {
      currentVal--;
      percentEl.textContent = currentVal + '%';
      ring.style.background = `conic-gradient(#30d158 ${currentVal}%, rgba(255,255,255,0.1) 0)`;
    } else {
      clearInterval(interval);
      card.classList.remove('boosting');
      feedbackEl.textContent = `Super Boosted! Freed ${(Math.random()*1.5 + 0.5).toFixed(1)}GB RAM`;
      setTimeout(() => {
        feedbackEl.textContent = 'Tap to boost and free up memory';
      }, 4000);
    }
  }, 40);
}

// 3. FLASHLIGHT TOGGLE
function toggleFlashlight() {
  flashlightActive = !flashlightActive;
  const icon = document.querySelector('#flashlightBtn i');
  const beam = document.getElementById('flashlightBeam');
  
  if (flashlightActive) {
    icon.style.color = '#ffd60a';
    beam.style.display = 'block';
  } else {
    icon.style.color = '';
    beam.style.display = 'none';
  }
}

// 4. TOUCH SWIPING NAVIGATION (Zero Screen <-> Homescreen)
function initSwiping() {
  const viewport = document.getElementById('launcherViewport');
  
  viewport.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });
  
  viewport.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipeGesture();
  }, { passive: true });
}

function handleSwipeGesture() {
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;
  
  // horizontal swipe
  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
    if (diffX > 0 && currentActiveScreen === 'home') {
      // Swipe Right -> Show Zero Screen
      changeScreen('zero');
    } else if (diffX < 0 && currentActiveScreen === 'zero') {
      // Swipe Left -> Show Homescreen
      changeScreen('home');
    }
  }
  
  // vertical swipe (swipe up to open drawer)
  if (Math.abs(diffY) > Math.abs(diffX) && diffY < -60 && currentActiveScreen === 'home' && !isDrawerOpen) {
    openAppDrawer(true);
  }
}

function changeScreen(screen) {
  const viewport = document.getElementById('launcherViewport');
  const indHome = document.getElementById('indHome');
  const indZero = document.getElementById('indZero');
  
  if (screen === 'zero') {
    viewport.style.transform = 'translateX(0%)';
    currentActiveScreen = 'zero';
    indZero.classList.add('active');
    indHome.classList.remove('active');
  } else {
    viewport.style.transform = 'translateX(-50%)';
    currentActiveScreen = 'home';
    indHome.classList.add('active');
    indZero.classList.remove('active');
  }
}

// 5. APP DRAWER CONTROLLER
function openAppDrawer(open = true) {
  const drawer = document.getElementById('appDrawer');
  isDrawerOpen = open;
  if (open) {
    drawer.classList.add('open');
    document.getElementById('drawerSearchInput').focus();
  } else {
    drawer.classList.remove('open');
    document.getElementById('drawerSearchInput').value = '';
    document.getElementById('drawerSearchInput').blur();
    handleDrawerSearch();
  }
}

function renderDrawerApps() {
  const grid = document.getElementById('drawerAppGrid');
  grid.innerHTML = '';
  
  mockAppsList.forEach(app => {
    const item = document.createElement('div');
    item.className = 'app-icon-item';
    item.setAttribute('data-label', app.label.toLowerCase());
    item.setAttribute('data-category', app.category);
    
    // Map settings app icon shape
    let shapeClass = `icon-${iconStyle}`;
    
    if (app.id === 'settings') {
      item.onclick = () => { openSettings(); openAppDrawer(false); };
    } else {
      item.onclick = () => { toggleSimApp(app.id); openAppDrawer(false); };
    }
    
    item.innerHTML = `
      <div class="icon-wrapper ${app.wrapperClass} ${shapeClass}"><i class="${app.iconClass}"></i></div>
      <span class="app-label">${app.label}</span>
    `;
    grid.appendChild(item);
  });
}

function renderAlphabetIndex() {
  const indexEl = document.getElementById('alphabetIndex');
  indexEl.innerHTML = '';
  
  const chars = ['#', 'B', 'C', 'F', 'G', 'M', 'N', 'P', 'S', 'W', 'Y'];
  chars.forEach(char => {
    const span = document.createElement('span');
    span.textContent = char;
    span.onclick = () => {
      // Find first app starting with char
      const apps = document.querySelectorAll('#drawerAppGrid .app-icon-item');
      for (let app of apps) {
        if (app.getAttribute('data-category') === char || char === '#') {
          app.scrollIntoView({ behavior: 'smooth', block: 'start' });
          break;
        }
      }
      // Set active letter
      document.querySelectorAll('.alphabet-index span').forEach(s => s.classList.remove('active'));
      span.classList.add('active');
    };
    indexEl.appendChild(span);
  });
}

function handleDrawerSearch() {
  const query = document.getElementById('drawerSearchInput').value.toLowerCase();
  const apps = document.querySelectorAll('#drawerAppGrid .app-icon-item');
  const clearBtn = document.getElementById('clearSearchBtn');
  
  if (query.length > 0) {
    clearBtn.style.display = 'block';
  } else {
    clearBtn.style.display = 'none';
  }

  apps.forEach(app => {
    const label = app.getAttribute('data-label');
    if (label.includes(query)) {
      app.style.display = 'flex';
    } else {
      app.style.display = 'none';
    }
  });
}

// 6. SIMULATED APP LAUNCH FRAMEWORK
function toggleSimApp(appId) {
  const overlay = document.getElementById('appLaunchOverlay');
  const title = document.getElementById('launchedAppTitle');
  const body = document.getElementById('launchedAppBody');
  
  launchedApp = appId;
  overlay.classList.add('open');
  
  // Capitalize name
  const appData = mockAppsList.find(a => a.id === appId) || { label: appId };
  title.textContent = appData.label;
  
  // Load Mock app body content
  body.innerHTML = getAppContent(appId);
  
  if (appId === 'phone') {
    initPhoneAppLogic();
  }
}

function closeSimApp() {
  const overlay = document.getElementById('appLaunchOverlay');
  overlay.classList.remove('open');
  launchedApp = null;
}

// Simulated App Contents
function getAppContent(appId) {
  switch(appId) {
    case 'phone':
      return `
        <div class="sim-app-phone-container">
          <div class="sim-dialer-display" id="dialerDisplay"></div>
          <div class="sim-dialer-pad">
            <div class="dial-btn" onclick="dialDigit('1')">1<span>o_o</span></div>
            <div class="dial-btn" onclick="dialDigit('2')">2<span>ABC</span></div>
            <div class="dial-btn" onclick="dialDigit('3')">3<span>DEF</span></div>
            <div class="dial-btn" onclick="dialDigit('4')">4<span>GHI</span></div>
            <div class="dial-btn" onclick="dialDigit('5')">5<span>JKL</span></div>
            <div class="dial-btn" onclick="dialDigit('6')">6<span>MNO</span></div>
            <div class="dial-btn" onclick="dialDigit('7')">7<span>PQRS</span></div>
            <div class="dial-btn" onclick="dialDigit('8')">8<span>TUV</span></div>
            <div class="dial-btn" onclick="dialDigit('9')">9<span>WXYZ</span></div>
            <div class="dial-btn" onclick="dialDigit('*')">*</div>
            <div class="dial-btn" onclick="dialDigit('0')">0<span>+</span></div>
            <div class="dial-btn" onclick="dialDigit('#')">#</div>
            <div class="dial-btn call-btn" onclick="placeSimCall()"><i class="ri-phone-fill"></i></div>
            <div class="dial-btn" onclick="backspaceDigit()" style="background: none; border: none; box-shadow: none;"><i class="ri-backspace-fill"></i></div>
          </div>
        </div>
      `;
    case 'messages':
      return `
        <div class="sms-sim">
          <div style="background: var(--glass-current); padding: 12px; border-radius: 12px; margin-bottom: 12px; border: 1px solid var(--glass-border)">
            <strong>HiOS Support:</strong> Karibu kwenye HiOS Launcher Simulator.
            <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Received: Leo 12:00 PM</div>
          </div>
          <div style="background: var(--glass-current); padding: 12px; border-radius: 12px; margin-bottom: 12px; border: 1px solid var(--glass-border)">
            <strong>Silatech Support:</strong> Kazi yako ya kusanidi Android APK imekamilika!
            <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Received: Leo 12:05 PM</div>
          </div>
        </div>
      `;
    case 'chrome':
      return `
        <div class="browser-url-bar">
          <i class="ri-global-line"></i>
          <input type="text" value="https://google.com" readonly>
        </div>
        <div class="browser-web-content">
          <h4>Google Search</h4>
          <input type="text" placeholder="Tafuta kwenye Google..." style="width: 100%; max-width: 300px; padding: 10px 14px; margin: 15px 0; border-radius: 20px; border: 1px solid #ddd; outline: none;">
          <button style="background: var(--primary-color); border: none; color: #fff; padding: 8px 18px; border-radius: 18px; cursor: pointer;">Search</button>
        </div>
      `;
    case 'gallery':
      return `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
          <div style="aspect-ratio: 1; background: url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200') center/cover; border-radius: 8px;"></div>
          <div style="aspect-ratio: 1; background: url('https://images.unsplash.com/photo-1604871000636-074fa5117945?w=200') center/cover; border-radius: 8px;"></div>
          <div style="aspect-ratio: 1; background: url('https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=200') center/cover; border-radius: 8px;"></div>
          <div style="aspect-ratio: 1; background: url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200') center/cover; border-radius: 8px;"></div>
        </div>
      `;
    case 'playstore':
      return `
        <div style="text-align: center; padding: 30px 10px;">
          <i class="ri-play-store-fill" style="font-size: 60px; color: var(--primary-color);"></i>
          <h3 style="margin-top: 15px;">Google Play Store</h3>
          <p style="color: var(--text-muted); font-size: 13px; margin-top: 8px;">No internet connection or store simulation offline.</p>
        </div>
      `;
    case 'youtube':
      return `
        <div style="background: #111; color: #fff; padding: 15px; border-radius: 12px;">
          <div style="height: 160px; background: #222; border-radius: 8px; display: flex; justify-content: center; align-items: center;">
            <i class="ri-play-circle-fill" style="font-size: 50px; color: #ff0000;"></i>
          </div>
          <h4 style="margin-top: 12px; font-weight: 500;">HiOS Features & Tutorial</h4>
          <p style="color: #999; font-size: 11px; margin-top: 4px;">1,204 views • Jun 19, 2026</p>
        </div>
      `;
    case 'weather':
      return `
        <div style="text-align: center; padding: 20px 0;">
          <h2>Nairobi</h2>
          <h1 style="font-size: 54px; font-weight: 300; margin: 10px 0;">24°C</h1>
          <p style="font-weight: 500;">Sunny</p>
          <div style="display: flex; justify-content: space-around; margin-top: 40px; border-top: 1px solid var(--glass-border); padding-top: 20px;">
            <div>Sat<br><i class="ri-sun-line"></i><br>25°</div>
            <div>Sun<br><i class="ri-sun-line"></i><br>24°</div>
            <div>Mon<br><i class="ri-showers-line"></i><br>22°</div>
            <div>Tue<br><i class="ri-sun-cloudy-line"></i><br>23°</div>
          </div>
        </div>
      `;
    default:
      return `
        <div style="text-align: center; padding: 40px 10px;">
          <i class="ri-file-warning-line" style="font-size: 40px; color: var(--text-muted);"></i>
          <h4 style="margin-top: 12px;">Simulated App</h4>
          <p style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">App launcher test mode successful.</p>
        </div>
      `;
  }
}

// Dialer specific triggers
function initPhoneAppLogic() {
  window.dialDigit = (digit) => {
    const d = document.getElementById('dialerDisplay');
    if (d.textContent.length < 15) {
      d.textContent += digit;
    }
  };
  window.backspaceDigit = () => {
    const d = document.getElementById('dialerDisplay');
    d.textContent = d.textContent.slice(0, -1);
  };
  window.placeSimCall = () => {
    const d = document.getElementById('dialerDisplay');
    if (d.textContent) {
      alert(`Piga simu kwenda: ${d.textContent}`);
    }
  };
}

// 7. LAUNCHER SETTINGS & CUSTOMIZATION
function openSettings() {
  const modal = document.getElementById('settingsModal');
  isSettingsOpen = true;
  modal.classList.add('open');
  
  // Set controls current values
  document.getElementById('darkModeToggle').checked = (currentTheme === 'dark');
  document.getElementById('iconStyleSelect').value = iconStyle;
}

function closeSettings() {
  const modal = document.getElementById('settingsModal');
  isSettingsOpen = false;
  modal.classList.remove('open');
}

function initWallpaperAndCustomization() {
  // Wallpaper triggers
  const wpOptions = document.querySelectorAll('.wp-option');
  wpOptions.forEach(opt => {
    // Set background dynamically in JavaScript to avoid HTML proxy static analysis errors in Vite
    const bgUrl = opt.getAttribute('data-url');
    // Use a smaller image size for thumbnails
    const thumbUrl = bgUrl.replace('w=1080', 'w=150');
    opt.style.backgroundImage = `url('${thumbUrl}')`;

    opt.onclick = () => {
      wpOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      activeWallpaper = opt.getAttribute('data-url');
      document.getElementById('phoneScreen').style.backgroundImage = `url('${activeWallpaper}')`;
    };
  });
  
  // Dark mode switch
  const toggle = document.getElementById('darkModeToggle');
  toggle.onchange = () => {
    if (toggle.checked) {
      currentTheme = 'dark';
      document.body.className = 'theme-dark';
    } else {
      currentTheme = 'light';
      document.body.className = 'theme-light';
    }
  };
  
  // Icon style switcher
  const iconSelect = document.getElementById('iconStyleSelect');
  iconSelect.onchange = () => {
    iconStyle = iconSelect.value;
    
    // Update all app wrapper elements
    const wrappers = document.querySelectorAll('.icon-wrapper');
    wrappers.forEach(wrap => {
      wrap.classList.remove('icon-round', 'icon-square', 'icon-squircle');
      wrap.classList.add(`icon-${iconStyle}`);
    });
  };
}

// 8. ANDROID NATIVE NAVIGATION BAR LOGIC
function handleNavBack() {
  if (launchedApp) {
    closeSimApp();
  } else if (isSettingsOpen) {
    closeSettings();
  } else if (isDrawerOpen) {
    openAppDrawer(false);
  } else if (currentActiveScreen === 'zero') {
    changeScreen('home');
  }
}

function handleNavHome() {
  closeSimApp();
  closeSettings();
  openAppDrawer(false);
  changeScreen('home');
}

function handleNavRecents() {
  // Flash effect / hint to show it is a mockup
  const screen = document.getElementById('phoneScreen');
  screen.style.opacity = 0.5;
  setTimeout(() => {
    screen.style.opacity = 1;
    alert("HiOS System: No recent apps running in background.");
  }, 200);
}
