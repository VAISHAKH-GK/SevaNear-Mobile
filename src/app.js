// ============================================
// STATE MANAGEMENT
// ============================================

let hospitals = [];
let serviceTypes = [];
let services = [];
let currentService = null;
let currentHospitalId = null;
let map = null;

// Navigation stack for back button handling
let navigationStack = ['homePage'];

// ============================================
// CAPACITOR BACK BUTTON HANDLING
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadInitialData();
    setupFormHandler();
    setupBackButtonHandler();
});

function setupBackButtonHandler() {
    // Handle Android hardware/gesture back button
    if (window.Capacitor && window.Capacitor.Plugins.App) {
        window.Capacitor.Plugins.App.addListener('backButton', ({ canGoBack }) => {
            handleBackButton();
        });
    }
}

function handleBackButton() {
    // Remove current page from stack
    if (navigationStack.length > 1) {
        navigationStack.pop();
        const previousPage = navigationStack[navigationStack.length - 1];
        
        // Navigate to previous page without adding to stack
        showPageDirect(previousPage);
        
        return true; // Handled the back button
    } else {
        // On home page, exit app
        if (window.Capacitor && window.Capacitor.Plugins.App) {
            window.Capacitor.Plugins.App.exitApp();
        }
        return false;
    }
}

// ============================================
// GEOLOCATION
// ============================================

const getCurrentPosition = async () => {
    try {
        // Try Capacitor Geolocation first (for mobile app)
        if (window.Capacitor && window.Capacitor.Plugins.Geolocation) {
            const permissions = await window.Capacitor.Plugins.Geolocation.checkPermissions();
            
            if (permissions.location !== 'granted') {
                const request = await window.Capacitor.Plugins.Geolocation.requestPermissions();
                if (request.location !== 'granted') {
                    throw new Error('Location permission denied');
                }
            }
            
            const position = await window.Capacitor.Plugins.Geolocation.getCurrentPosition();
            return {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
        }
    } catch (error) {
        console.log('Capacitor geolocation not available, using browser API:', error);
    }
    
    // Fallback to browser Geolocation API
    return new Promise((resolve, reject) => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Browser geolocation error:', error);
                    // Return default location (Kozhikode) if permission denied
                    resolve({
                        latitude: 11.2588,
                        longitude: 75.7804
                    });
                }
            );
        } else {
            // Return default location if geolocation not supported
            resolve({
                latitude: 11.2588,
                longitude: 75.7804
            });
        }
    });
};

// ============================================
// INITIALIZATION
// ============================================

async function loadInitialData() {
    try {
        hospitals = await apiRequest('/hospitals');
        serviceTypes = await apiRequest('/service-types');
        populateDropdowns();
    } catch (error) {
        console.error('Error loading data:', error);
        if (!CONFIG.USE_DUMMY_DATA) {
            alert('Failed to load data. Check if backend is running or enable dummy data.');
        }
    }
}

// ============================================
// UI - DROPDOWNS
// ============================================

function populateDropdowns() {
    // Home page hospital select
    const hospitalSelect = document.getElementById('hospitalSelect');
    hospitalSelect.innerHTML = '<option value="">Choose a hospital...</option>';
    hospitals.forEach(h => {
        hospitalSelect.innerHTML += `<option value="${h.id}">${h.name}</option>`;
    });

    // Home page service type select
    const typeSelect = document.getElementById('serviceTypeSelect');
    typeSelect.innerHTML = '<option value="">All Services</option>';
    serviceTypes.forEach(t => {
        typeSelect.innerHTML += `<option value="${t.id}">${t.name}</option>`;
    });

    // Add service page hospital select
    const addHospitalSelect = document.getElementById('addHospitalSelect');
    addHospitalSelect.innerHTML = '<option value="">Select hospital...</option>';
    hospitals.forEach(h => {
        addHospitalSelect.innerHTML += `<option value="${h.id}">${h.name}</option>`;
    });

    // Add service page service type select
    const addTypeSelect = document.getElementById('addServiceTypeSelect');
    addTypeSelect.innerHTML = '<option value="">Select service type...</option>';
    serviceTypes.forEach(t => {
        addTypeSelect.innerHTML += `<option value="${t.id}">${t.name}</option>`;
    });
}

// ============================================
// SEARCH SERVICES
// ============================================

async function searchServices() {
    const hospitalId = document.getElementById('hospitalSelect').value;
    const serviceType = document.getElementById('serviceTypeSelect').value;

    if (!hospitalId) {
        alert('Please select a hospital');
        return;
    }

    currentHospitalId = hospitalId;
    let endpoint = `/services/filter`;
    if (hospitalId) endpoint += `?hospital_id=${hospitalId}`;
    if (serviceType) endpoint += `&service_type_id=${serviceType}`;

    try {
        services = await apiRequest(endpoint);
        
        const hospital = hospitals.find(h => h.id === hospitalId);
        document.getElementById('servicesTitle').textContent = hospital ? hospital.name : 'Services';
        document.getElementById('servicesCount').textContent = `${services.length} service${services.length !== 1 ? 's' : ''} available`;
        
        displayServices();
        showPage('servicesPage');
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load services');
    }
}

// ============================================
// DISPLAY SERVICES LIST
// ============================================

function displayServices() {
    const list = document.getElementById('servicesList');
    
    if (services.length === 0) {
        list.innerHTML = `
            <div class="card empty-state">
                <div class="empty-icon">🔍</div>
                <h3 class="empty-title">No Services Found</h3>
                <p class="empty-text">No services are currently available for this selection. Try a different hospital or service type.</p>
            </div>
        `;
        return;
    }

    list.innerHTML = services.map(s => `
        <div class="service-card" onclick="showServiceDetail('${s.id}')">
            <div class="service-title">${s.name || 'Service'}</div>

            ${s.description ? `
                <div class="service-description">
                    ${s.description}
                </div>
            ` : ''}

            <div class="service-info">
                <span>🏥</span>
                <span>${s.hospital_name || 'Hospital'}</span>
            </div>
            <div class="service-info">
                <span>⏰</span>
                <span>${s.timings || 'Timings not specified'}</span>
            </div>
            <div class="service-info">
                <span>📞</span>
                <span>${s.contact || 'Contact not available'}</span>
            </div>

            <div class="tap-hint">
                <span>View Details</span>
                <span>→</span>
            </div>
        </div>
    `).join('');
}

// ============================================
// SERVICE DETAIL
// ============================================

async function showServiceDetail(serviceId) {
    try {
        currentService = await apiRequest(`/services/${serviceId}`);
        
        document.getElementById('detailTitle').textContent = currentService.name;
        
        document.getElementById('detailContent').innerHTML = `
            <div class="detail-section">
                <div class="detail-label">Provider</div>
                <div class="detail-value">👤 ${currentService.provider}</div>
            </div>
            
            <div class="detail-section">
                <div class="detail-label">Description</div>
                <div class="detail-value">${currentService.description}</div>
            </div>
            
            <div class="detail-section">
                <div class="detail-label">Timings</div>
                <div class="detail-value">🕐 ${currentService.timings}</div>
            </div>
            
            <div class="detail-section">
                <div class="detail-label">Contact</div>
                <div class="detail-value">📞 ${currentService.contact}</div>
            </div>
            
            ${currentService.eligibility ? `
                <div class="detail-section">
                    <div class="detail-label">Eligibility</div>
                    <div class="detail-value">${currentService.eligibility}</div>
                </div>
            ` : ''}
            
            ${currentService.required_docs ? `
                <div class="detail-section">
                    <div class="detail-label">Required Documents</div>
                    <div class="detail-value">${currentService.required_docs}</div>
                </div>
            ` : ''}
        `;

        document.getElementById('callBtn').onclick = () => {
            window.location.href = `tel:${currentService.provider_contact || currentService.contact}`;
        };

        document.getElementById('directionsBtn').onclick = () => {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${currentService.latitude},${currentService.longitude}`, '_blank');
        };

        showPage('detailPage');
        initMap(currentService.latitude, currentService.longitude);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load service details');
    }
}

// ============================================
// MAP INITIALIZATION
// ============================================

function initMap(lat, lng) {
    if (map) {
        map.remove();
    }
    
    map = L.map('map').setView([lat, lng], 15);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    L.marker([lat, lng]).addTo(map)
        .bindPopup(currentService.provider || currentService.name)
        .openPopup();
}

// ============================================
// LOCATION DETECTION
// ============================================

async function useLocation() {
    try {
        let { latitude, longitude } = await getCurrentPosition();

        document.getElementById('latitude').value = latitude;
        document.getElementById('longitude').value = longitude;
        
        alert(`Location captured: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    } catch (error) {
        console.error('Error getting location:', error);
        alert('Failed to get location. Using default location (Kozhikode).');
    }
}

// ============================================
// ADD SERVICE FORM
// ============================================

function setupFormHandler() {
    document.getElementById('addServiceForm').onsubmit = async (e) => {
        e.preventDefault();
        
        const data = {
            hospital_id: parseInt(document.getElementById('addHospitalSelect').value),
            service_type_id: parseInt(document.getElementById('addServiceTypeSelect').value),
            name: document.getElementById('name').value,
            provider: document.getElementById('providerName').value,
            contact: document.getElementById('providerContact').value,
            description: document.getElementById('description').value,
            timings: document.getElementById('timings').value,
            eligibility: document.getElementById('eligibility').value,
            required_docs: document.getElementById('requiredDocs').value,
            latitude: parseFloat(document.getElementById('latitude').value),
            longitude: parseFloat(document.getElementById('longitude').value)
        };

        try {
            await apiRequest('/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            alert('✅ Service added successfully! Thank you for helping your community.');
            document.getElementById('addServiceForm').reset();
            showHome();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to add service: ' + error);
        }
    };
}

// ============================================
// FIND NEARBY SERVICES
// ============================================

async function findNearby() {
    try {
        const position = await getCurrentPosition();
        
        services = await apiRequest(
            `/services/nearby?lat=${position.latitude}&lng=${position.longitude}&radius=5`
        );
        
        document.getElementById('servicesTitle').textContent = '📍 Nearby Services';
        document.getElementById('servicesCount').textContent = `${services.length} service${services.length !== 1 ? 's' : ''} found within 5km`;
        
        displayServices();
        showPage('servicesPage');
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to find nearby services. Please enable location services.');
    }
}

// ============================================
// PAGE NAVIGATION
// ============================================

function showPage(pageId) {
    // Hide all pages
    document.getElementById('homePage').classList.add('hidden');
    document.getElementById('servicesPage').classList.add('hidden');
    document.getElementById('detailPage').classList.add('hidden');
    document.getElementById('addServicePage').classList.add('hidden');
    
    // Show requested page
    document.getElementById(pageId).classList.remove('hidden');
    
    // Add to navigation stack
    navigationStack.push(pageId);
}

function showPageDirect(pageId) {
    // Hide all pages
    document.getElementById('homePage').classList.add('hidden');
    document.getElementById('servicesPage').classList.add('hidden');
    document.getElementById('detailPage').classList.add('hidden');
    document.getElementById('addServicePage').classList.add('hidden');
    
    // Show requested page
    document.getElementById(pageId).classList.remove('hidden');
    
    // Don't add to navigation stack (used for back navigation)
}

function showHome() {
    // Reset navigation stack when going home
    navigationStack = [];
    showPage('homePage');
}

function showServices() {
    showPageDirect('servicesPage');
}

function showAddService() {
    showPage('addServicePage');
}