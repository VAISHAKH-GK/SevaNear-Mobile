// ============================================
// CONFIG - Update these for your backend
// ============================================

const CONFIG = {
  // Set to true to use dummy data, false to use real API
  USE_DUMMY_DATA: false,

  // Your backend API URL (update when you build your backend)
  API_URL: "https://sevanear.onrender.com",
};

// ============================================
// DUMMY DATA - For testing without backend
// ============================================

const DUMMY_DATA = {
  hospitals: [
    {
      id: "1",
      name: "Medical College Hospital Kozhikode",
      location: { lat: 11.2588, lng: 75.7804 },
      address: "Medical College, Kozhikode",
      district: "Kozhikode",
      phone: "0495-2350471",
    },
    {
      id: "2",
      name: "Baby Memorial Hospital",
      location: { lat: 11.2513, lng: 75.7777 },
      address: "Indira Gandhi Rd, Kozhikode",
      district: "Kozhikode",
      phone: "0495-2366001",
    },
    {
      id: "3",
      name: "Malabar Cancer Centre",
      location: { lat: 11.2631, lng: 75.7847 },
      address: "Moozhikkal, Kozhikode",
      district: "Kozhikode",
      phone: "0495-2370101",
    },
  ],

  serviceTypes: [
    { id: 1, name: "Food", icon: "🍽️" },
    { id: 2, name: "Medicine", icon: "💊" },
    { id: 3, name: "Shelter", icon: "🏠" },
    { id: 4, name: "Medical Care", icon: "🏥" },
    { id: 5, name: "Transport", icon: "🚗" },
    { id: 6, name: "Counseling", icon: "💬" },
  ],

  services: [
    {
      id: "s1",
      hospital_id: "1",
      hospital_name: "Medical College Hospital Kozhikode",
      service_type_id: 1,
      service_type_name: "Food",
      provider_name: "Helping Hands NGO",
      provider_contact: "9876543210",
      description: "Free meals for cancer patients undergoing treatment",
      timings: "8:00 AM - 8:00 PM",
      eligibility: "Cancer patients with medical certificate",
      required_documents: "Medical certificate, Patient ID card",
      location: { lat: 11.2588, lng: 75.7804 },
      is_active: true,
    },
    {
      id: "s2",
      hospital_id: "1",
      hospital_name: "Medical College Hospital Kozhikode",
      service_type_id: 2,
      service_type_name: "Medicine",
      provider_name: "Care Foundation",
      provider_contact: "9876543211",
      description: "Free medicines for TB patients",
      timings: "9:00 AM - 5:00 PM",
      eligibility: "TB patients registered in government program",
      required_documents: "TB registration card, Prescription",
      location: { lat: 11.259, lng: 75.78 },
      is_active: true,
    },
    {
      id: "s3",
      hospital_id: "1",
      hospital_name: "Medical College Hospital Kozhikode",
      service_type_id: 3,
      service_type_name: "Shelter",
      provider_name: "Hope House",
      provider_contact: "9876543212",
      description: "Free accommodation for patient attendants",
      timings: "24 hours",
      eligibility: "Attendants of critical patients",
      required_documents: "Patient admission slip",
      location: { lat: 11.2585, lng: 75.781 },
      is_active: true,
    },
    {
      id: "s4",
      hospital_id: "2",
      hospital_name: "Baby Memorial Hospital",
      service_type_id: 1,
      service_type_name: "Food",
      provider_name: "Community Kitchen",
      provider_contact: "9876543213",
      description: "Subsidized meals for low-income patients",
      timings: "7:00 AM - 9:00 PM",
      eligibility: "Below poverty line patients",
      required_documents: "BPL card, Patient ID",
      location: { lat: 11.2513, lng: 75.7777 },
      is_active: true,
    },
    {
      id: "s5",
      hospital_id: "3",
      hospital_name: "Malabar Cancer Centre",
      service_type_id: 1,
      service_type_name: "Food",
      provider_name: "Cancer Care Volunteers",
      provider_contact: "9876543214",
      description: "Free nutritious meals for cancer patients",
      timings: "8:00 AM - 8:00 PM",
      eligibility: "All cancer patients",
      required_documents: "Hospital registration",
      location: { lat: 11.2631, lng: 75.7847 },
      is_active: true,
    },
    {
      id: "s6",
      hospital_id: "3",
      hospital_name: "Malabar Cancer Centre",
      service_type_id: 5,
      service_type_name: "Transport",
      provider_name: "Free Ambulance Service",
      provider_contact: "9876543215",
      description: "Free ambulance for chemotherapy patients",
      timings: "6:00 AM - 10:00 PM",
      eligibility: "Chemotherapy patients within 20km",
      required_documents: "Treatment schedule, ID proof",
      location: { lat: 11.2631, lng: 75.7847 },
      is_active: true,
    },
  ],
};

// ============================================
// API FUNCTIONS - Switch between dummy/real
// ============================================

async function apiRequest(endpoint, options = {}) {
  if (CONFIG.USE_DUMMY_DATA) {
    // Return dummy data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getDummyData(endpoint, options));
      }, 300); // Simulate network delay
    });
  } else {
    // Real API call
    const url = `${CONFIG.API_URL}${endpoint}`;
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(response);
    }
    return response.json();
  }
}

function getDummyData(endpoint, options) {
  console.log("Using dummy data for:", endpoint);

  // Parse endpoint
  if (endpoint === "/hospitals") {
    return DUMMY_DATA.hospitals;
  }

  if (endpoint === "/service-types") {
    return DUMMY_DATA.serviceTypes;
  }

  if (endpoint.startsWith("/hospitals/") && endpoint.includes("/services")) {
    const hospitalId = endpoint.split("/")[2];
    const params = new URLSearchParams(endpoint.split("?")[1]);
    const typeId = params.get("type");

    let services = DUMMY_DATA.services.filter(
      (s) => s.hospital_id === hospitalId,
    );
    if (typeId) {
      services = services.filter((s) => s.service_type_id === parseInt(typeId));
    }
    return services;
  }

  if (endpoint.startsWith("/services/") && !endpoint.includes("nearby")) {
    const serviceId = endpoint.split("/")[2];
    return DUMMY_DATA.services.find((s) => s.id === serviceId);
  }

  if (endpoint.includes("/services/nearby")) {
    return DUMMY_DATA.services; // Return all for demo
  }

  // POST request - return success
  if (options.method === "POST") {
    return { id: "new-" + Date.now(), message: "Created successfully" };
  }

  return [];
}
