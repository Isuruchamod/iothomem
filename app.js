// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDml7yKe_irqHKTeDzusrN8spLDXVO78p0",
    authDomain: "iot1-4accc.firebaseapp.com",
    databaseURL: "https://iot1-4accc-default-rtdb.firebaseio.com",
    projectId: "iot1-4accc",
    storageBucket: "iot1-4accc.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// DOM elements
const notificationContainer = document.getElementById('notificationContainer');
const darkModeToggle = document.getElementById('darkModeToggle');
const allOnBtn = document.getElementById('allOnBtn');
const allOffBtn = document.getElementById('allOffBtn');
const deviceModal = document.getElementById('deviceModal');
const closeModal = document.querySelector('.close-modal');
const modalDeviceName = document.getElementById('modalDeviceName');
const brightnessSlider = document.getElementById('brightnessSlider');
const brightnessValue = document.getElementById('brightnessValue');
const colorOptions = document.querySelectorAll('.color-option');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const devicesGrid = document.querySelector('.devices-grid');

// Device data
const devices = [
    { id: 'led1', name: 'Main Light', icon: 'lightbulb', description: 'Central ceiling light' },
    { id: 'led2', name: 'Lamp', icon: 'lamp', description: 'Side table lamp' },
    { id: 'led3', name: 'Ambient Light', icon: 'lightbulb', description: 'Wall ambient lighting' },
    { id: 'led4', name: 'Reading Light', icon: 'book-open', description: 'Desk reading light' }
];

// Current device being edited in modal
let currentDevice = null;

// Initialize the app
function initApp() {
    // Check for saved dark mode preference
    const darkMode = localStorage.getItem('darkMode') === 'true';
    darkModeToggle.checked = darkMode;
    document.body.classList.toggle('dark-mode', darkMode);
    
    // Create device cards
    renderDeviceCards();
    
    // Set up event listeners
    setupEventListeners();
    
    // Check connection status
    monitorConnection();
}

// Render device cards
function renderDeviceCards() {
    devicesGrid.innerHTML = '';
    
    devices.forEach(device => {
        const deviceCard = document.createElement('div');
        deviceCard.className = 'device-card animate__animated animate__fadeIn';
        deviceCard.setAttribute('data-device', device.id);
        deviceCard.innerHTML = `
            <div class="device-icon bulb">
                <div class="bulb-glass"></div>
                <div class="filament"></div>
                <div class="base"></div>
            </div>
            <h3>${device.name}</h3>
            <p>${device.description}</p>
            <div class="device-control">
                <label class="switch">
                    <input type="checkbox" class="device-toggle">
                    <span class="slider round"></span>
                </label>
            </div>
        `;
        devicesGrid.appendChild(deviceCard);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Dark mode toggle
    darkModeToggle.addEventListener('change', toggleDarkMode);
    
    // All on/off buttons
    allOnBtn.addEventListener('click', turnAllDevicesOn);
    allOffBtn.addEventListener('click', turnAllDevicesOff);
    
    // Modal controls
    closeModal.addEventListener('click', closeDeviceModal);
    brightnessSlider.addEventListener('input', updateBrightnessValue);
    colorOptions.forEach(option => {
        option.addEventListener('click', selectColor);
    });
    saveSettingsBtn.addEventListener('click', saveDeviceSettings);
    
    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target === deviceModal) {
            closeDeviceModal();
        }
    });
    
    // Listen for device card clicks (delegated)
    devicesGrid.addEventListener('click', handleDeviceCardClick);
}

// Toggle dark mode
function toggleDarkMode() {
    const isDarkMode = darkModeToggle.checked;
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
    
    showNotification(`Dark mode ${isDarkMode ? 'enabled' : 'disabled'}`, isDarkMode ? 'info' : 'warning');
}

// Handle device card clicks
function handleDeviceCardClick(e) {
    const card = e.target.closest('.device-card');
    if (!card) return;
    
    const deviceId = card.getAttribute('data-device');
    const toggle = card.querySelector('.device-toggle');
    
    // If clicking directly on toggle, let that handle it
    if (e.target.classList.contains('device-toggle') || e.target.classList.contains('slider')) {
        return;
    }
    
    // If clicking on the card, open modal
    currentDevice = devices.find(d => d.id === deviceId);
    openDeviceModal(currentDevice, card);
}

// Open device modal
function openDeviceModal(device, card) {
    modalDeviceName.textContent = device.name;
    currentDevice = device;
    currentDevice.cardElement = card;
    
    // Set initial values
    brightnessSlider.value = 100;
    brightnessValue.textContent = '100%';
    
    // Reset color selection
    colorOptions.forEach(option => {
        option.classList.remove('selected');
    });
    
    // Show modal
    deviceModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Close device modal
function closeDeviceModal() {
    deviceModal.classList.remove('show');
    document.body.style.overflow = 'auto';
    setTimeout(() => {
        deviceModal.style.display = 'none';
    }, 300);
}

// Update brightness value display
function updateBrightnessValue() {
    brightnessValue.textContent = `${brightnessSlider.value}%`;
}

// Select color option
function selectColor(e) {
    colorOptions.forEach(option => {
        option.classList.remove('selected');
    });
    e.target.classList.add('selected');
}

// Save device settings
function saveDeviceSettings() {
    const brightness = brightnessSlider.value;
    const selectedColor = document.querySelector('.color-option.selected')?.getAttribute('data-color') || '#ffffff';
    
    // In a real app, you would send these to Firebase
    console.log(`Saving settings for ${currentDevice.name}:`, { brightness, color: selectedColor });
    
    showNotification(`${currentDevice.name} settings saved`, 'success');
    closeDeviceModal();
}

// Turn all devices on
function turnAllDevicesOn() {
    devices.forEach(device => {
        database.ref(`led/${device.id}`).set(1);
    });
    showNotification('All devices turned on', 'success');
    
    // Add pulse animation to all cards
    document.querySelectorAll('.device-card').forEach(card => {
        card.classList.add('animate__pulse');
        setTimeout(() => {
            card.classList.remove('animate__pulse');
        }, 1000);
    });
}

// Turn all devices off
function turnAllDevicesOff() {
    devices.forEach(device => {
        database.ref(`led/${device.id}`).set(0);
    });
    showNotification('All devices turned off', 'warning');
    
    // Add shake animation to all cards
    document.querySelectorAll('.device-card').forEach(card => {
        card.classList.add('animate__headShake');
        setTimeout(() => {
            card.classList.remove('animate__headShake');
        }, 1000);
    });
}

// Monitor connection status
function monitorConnection() {
    const connectionStatus = document.querySelector('.connection-status');
    const connectionRef = database.ref('.info/connected');
    
    connectionRef.on('value', (snapshot) => {
        if (snapshot.val() === true) {
            connectionStatus.classList.add('connected');
            connectionStatus.classList.remove('disconnected');
            connectionStatus.innerHTML = '<i class="fas fa-wifi"></i><span>Connected</span>';
        } else {
            connectionStatus.classList.remove('connected');
            connectionStatus.classList.add('disconnected');
            connectionStatus.innerHTML = '<i class="fas fa-wifi-slash"></i><span>Disconnected</span>';
            showNotification('Disconnected from server', 'error');
        }
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = '';
    switch(type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle"></i>';
    }
    
    notification.innerHTML = `${icon} ${message}`;
    notificationContainer.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// Initialize Firebase device listeners
function initDeviceListeners() {
    // Remove any existing listeners first
    devicesGrid.removeEventListener('change', handleToggleChange);
    
    // Add single delegated listener
    devicesGrid.addEventListener('change', handleToggleChange);
    
    // Set up Firebase listeners without notification triggers
    devices.forEach(device => {
        const deviceRef = database.ref(`led/${device.id}`);
        deviceRef.on('value', (snapshot) => {
            const state = snapshot.val();
            const card = document.querySelector(`.device-card[data-device="${device.id}"]`);
            
            if (card) {
                const toggle = card.querySelector('.device-toggle');
                // Update without triggering notification
                if (toggle.checked !== (state === 1)) {
                    toggle.checked = state === 1;
                    card.classList.toggle('active', state === 1);
                    card.style.boxShadow = state === 1 ? '0 0 15px rgba(255, 250, 205, 0.5)' : '';
                }
            }
        });
    });
}

// Separate handler function for toggle changes
function handleToggleChange(e) {
    if (e.target.classList.contains('device-toggle')) {
        const card = e.target.closest('.device-card');
        const deviceId = card.getAttribute('data-device');
        const isOn = e.target.checked;
        const deviceName = card.querySelector('h3').textContent;
        
        // Update Firebase
        updateDeviceState(deviceId, isOn);
        
        // Update UI
        card.classList.toggle('active', isOn);
        card.style.boxShadow = isOn ? '0 0 15px rgba(255, 250, 205, 0.5)' : '';
        
        // Show single notification
        showNotification(`${deviceName} turned ${isOn ? 'on' : 'off'}`, 
                        isOn ? 'success' : 'warning');
        
        // Add pulse animation only for turn on
        if (isOn) {
            card.classList.add('animate__pulse');
            setTimeout(() => card.classList.remove('animate__pulse'), 1000);
        }
    }
}

// Update device state in Firebase
function updateDeviceState(deviceId, state) {
    database.ref(`led/${deviceId}`).set(state ? 1 : 0)
        .catch(error => {
            console.error('Error updating device:', error);
            showNotification('Failed to update device', 'error');
        });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    initDeviceListeners();
});