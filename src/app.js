// ============================================
// STATE MANAGEMENT
// ============================================

let hospitals = [];
let serviceTypes = [];
let services = [];
let currentService = null;
let currentHospitalId = null;
let map = null;

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

document.addEventListener('DOMContentLoaded', () => {
    loadInitialData();
    setupFormHandler();
});

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
        typeSelect.innerHTML += `<option value="${t.id}"> ${t.name}</option>`;
    });

    // Add service page hospital select
    const addHospitalSelect = document.getElementById('addHospitalSelect');
    addHospitalSelect.innerHTML = '<option value="">Select hospital...</option>';
    hospitals.forEach(h => {
        addHospitalSelect.innerHTML += `<option value=${h.id}>${h.name}</option>`;
    });

    // Add service page service type select
    const addTypeSelect = document.getElementById('addServiceTypeSelect');
    addTypeSelect.innerHTML = '<option value="">Select service type...</option>';
    serviceTypes.forEach(t => {
        addTypeSelect.innerHTML += `<option value=${t.id}>${t.name}</option>`;
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
    if (hospitalId) endpoint += `?hospital_id=${hospitalId}`
    if (serviceType) endpoint += `&service_type_id=${serviceType}`;

    try {
        services = await apiRequest(endpoint);
        
        console.log(services)
        const hospital = hospitals.find(h => h.id === hospitalId);
        // document.getElementById('servicesTitle').textContent = hospital.name;
        document.getElementById('servicesCount').textContent = `${services.length} services available`;
        
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
            <div class="card" style="text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 16px;">😔</div>
                <h3 style="margin-bottom: 8px;">No Services Found</h3>
                <p style="color: #6b7280;">No services are currently available for this selection.</p>
            </div>
        `;
        return;
    }

    list.innerHTML = services.map(s => `
        <div class="service-card" onclick="showServiceDetail('${s.id}')">
            <div class="service-title">${s.name || 'Service'}</div>

            <div style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">
                ${s.description || ''}
            </div>

            <div class="service-info">🏥 ${s.hospital_name || 'Hospital'}</div>
            <div class="service-info">⏰ ${s.timings || 'Timings not specified'}</div>
            <div class="service-info">📞 ${s.contact || 'Contact not available'}</div>

            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                <span style="color: #2563eb; font-size: 13px; font-weight: 500;">
                    Tap for details →
                </span>
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
        console.log(currentService)
        
        document.getElementById('detailTitle').textContent = currentService.name;
        
        document.getElementById('detailContent').innerHTML = `
            <div style="margin-bottom: 12px;">
                <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px;">Provider</div>
                <div>${currentService.provider}</div>
            </div>
            <div style="margin-bottom: 12px;">
                <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px;">Description</div>
                <div>${currentService.description}</div>
            </div>
            <div style="margin-bottom: 12px;">
                <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px;">Timings</div>
                <div>🕐 ${currentService.timings}</div>
            </div>
            <div style="margin-bottom: 12px;">
                <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px;">Contact</div>
                <div>📞 ${currentService.contact}</div>
            </div>
            ${currentService.eligibility ? `
                <div style="margin-bottom: 12px;">
                    <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px;">Eligibility</div>
                    <div>${currentService.eligibility}</div>
                </div>
            ` : ''}
            ${currentService.required_docs ? `
                <div style="margin-bottom: 12px;">
                    <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px;">Required Documents</div>
                    <div>${currentService.required_docs}</div>
                </div>
            ` : ''}
        `;

        document.getElementById('callBtn').onclick = () => {
            window.location.href = `tel:${currentService.provider_contact}`;
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
        .bindPopup(currentService.provider_name)
        .openPopup();
}

// ============================================
// LOCATION DETECTION
// ============================================

async function useLocation() {
    let {latitude, longitude } = await getCurrentPosition()

    document.getElementById('latitude').value = latitude;
    document.getElementById('longitude').value = longitude;
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

            alert('Service added successfully!');
            document.getElementById('addServiceForm').reset();
            showHome();
        } catch (error) {
            console.error('Error:', error);
            alert(error)
            // alert('Failed to add service');
        }
    };
}

// ============================================
// FIND NEARBY SERVICES
// ============================================

async function findNearby() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    services = await apiRequest(
                        `/services/nearby?lat=${position.coords.latitude}&lng=${position.coords.longitude}&radius=5`
                    );
                    
                    document.getElementById('servicesTitle').textContent = 'Nearby Services';
                    document.getElementById('servicesCount').textContent = `${services.length} services found`;
                    
                    displayServices();
                    showPage('servicesPage');
                } catch (error) {
                    console.error('Error:', error);
                    alert('Failed to find nearby services');
                }
            },
            () => {
                alert('Failed to get location. Please enable location services.');
            }
        );
    } else {
        alert('Geolocation not supported by your device');
    }
}

// ============================================
// PAGE NAVIGATION
// ============================================

function showPage(pageId) {
    document.getElementById('homePage').classList.add('hidden');
    document.getElementById('servicesPage').classList.add('hidden');
    document.getElementById('detailPage').classList.add('hidden');
    document.getElementById('addServicePage').classList.add('hidden');
    document.getElementById(pageId).classList.remove('hidden');
}

function showHome() {
    showPage('homePage');
}

function showServices() {
    showPage('servicesPage');
}

function showAddService() {
    showPage('addServicePage');
}
