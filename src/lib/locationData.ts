// Maintained Location Dataset for Torque Care
// Covers major Indian States, Cities, and Districts/Localities
// Provides searchable dependent hierarchy: State -> City -> District -> Society

export interface CityInfo {
  name: string;
  districts: string[];
}

export interface StateInfo {
  name: string;
  cities: CityInfo[];
}

export const INDIAN_LOCATIONS: StateInfo[] = [
  {
    name: 'Maharashtra',
    cities: [
      {
        name: 'Mumbai',
        districts: [
          'Andheri West',
          'Andheri East',
          'Bandra West',
          'Bandra East',
          'Borivali West',
          'Borivali East',
          'Juhu',
          'Powai',
          'Kandivali',
          'Malad',
          'Goregaon',
          'Worli',
          'Lower Parel',
          'Dadar',
          'Santacruz',
          'Ghatkopar',
          'Chembur',
          'Mulund',
          'Colaba',
          'Prabhadevi',
        ],
      },
      {
        name: 'Pune',
        districts: [
          'Hinjawadi',
          'Wakad',
          'Baner',
          'Balewadi',
          'Kothrud',
          'Aundh',
          'Viman Nagar',
          'Kharadi',
          'Magarpatta',
          'Hadapsar',
          'Bavdhan',
          'Pashan',
          'Kalyani Nagar',
          'Pimpri-Chinchwad',
          'Ravet',
          'Koregaon Park',
          'Senapati Bapat Road',
        ],
      },
      {
        name: 'Thane',
        districts: [
          'Ghodbunder Road',
          'Majiwada',
          'Kolshet Road',
          'Vasant Vihar',
          'Naupada',
          'Kalyan West',
          'Dombivli East',
          'Mira Road',
          'Bhayandar',
        ],
      },
      {
        name: 'Navi Mumbai',
        districts: [
          'Vashi',
          'Nerul',
          'Seawoods',
          'Kharghar',
          'Belapur',
          'Airoli',
          'Kopar Khairane',
          'Panvel',
          'Ulwe',
          'Ghansoli',
        ],
      },
      {
        name: 'Nagpur',
        districts: ['Civil Lines', 'Dharampeth', 'Ramdaspeth', 'Manish Nagar', 'Wardha Road', 'Besur'],
      },
      {
        name: 'Nashik',
        districts: ['College Road', 'Gangapur Road', 'Indira Nagar', 'Panchavati', 'Cidco'],
      },
    ],
  },
  {
    name: 'Karnataka',
    cities: [
      {
        name: 'Bengaluru',
        districts: [
          'Whitefield',
          'Bellandur',
          'Sarjapur Road',
          'HSR Layout',
          'Koramangala',
          'Indiranagar',
          'Electronic City',
          'Marathahalli',
          'Yelahanka',
          'Hebbal',
          'Bannerghatta Road',
          'Jayanagar',
          'JP Nagar',
          'BTM Layout',
          'Thanisandra',
          'KR Puram',
          'Malleshwaram',
          'Rajajinagar',
          'Varthur',
          'Kadugodi',
        ],
      },
      {
        name: 'Mysuru',
        districts: ['Gokulam', 'Jayalakshmipuram', 'Vijayanagar', 'Kuvempunagar', 'Saraswathipuram'],
      },
      {
        name: 'Mangaluru',
        districts: ['Kadri', 'Bejai', 'Surathkal', 'Kodialbail', 'Urwa'],
      },
    ],
  },
  {
    name: 'Delhi (NCR)',
    cities: [
      {
        name: 'New Delhi',
        districts: [
          'Vasant Kunj',
          'Dwarka Sector 1-24',
          'Saket',
          'Hauz Khas',
          'Greater Kailash',
          'Chanakyapuri',
          'Civil Lines',
          'Rohini',
          'Pitampura',
          'Janakpuri',
          'Paschim Vihar',
          'Punjabi Bagh',
          'Mayur Vihar',
          'Preet Vihar',
          'Lajpat Nagar',
        ],
      },
    ],
  },
  {
    name: 'Haryana',
    cities: [
      {
        name: 'Gurugram',
        districts: [
          'Golf Course Road',
          'Golf Course Extension',
          'DLF Phase 1-5',
          'Cyber City',
          'Sohna Road',
          'Sector 56',
          'Sector 57',
          'Sector 65',
          'Sector 67',
          'Sector 82',
          'Sector 84',
          'Sector 102',
          'Sushant Lok',
          'South City 1 & 2',
          'Nirvana Country',
        ],
      },
      {
        name: 'Faridabad',
        districts: ['Sector 14', 'Sector 15', 'Sector 16', 'Greenfield Colony', 'Greater Faridabad (Neharpar)'],
      },
      {
        name: 'Panchkula',
        districts: ['Sector 4', 'Sector 6', 'Sector 20', 'MDC Sector 5'],
      },
    ],
  },
  {
    name: 'Uttar Pradesh',
    cities: [
      {
        name: 'Noida',
        districts: [
          'Noida Expressway',
          'Sector 50',
          'Sector 62',
          'Sector 74-79',
          'Sector 128',
          'Sector 137',
          'Sector 150',
          'Sector 44',
          'Sector 93A',
        ],
      },
      {
        name: 'Greater Noida',
        districts: [
          'Noida Extension (Greater Noida West)',
          'Pari Chowk',
          'Alpha 1 & 2',
          'Beta 1 & 2',
          'Knowledge Park',
          'Chi & Phi Sectors',
        ],
      },
      {
        name: 'Ghaziabad',
        districts: ['Indirapuram', 'Vaishali', 'Vasundhara', 'Crossings Republik', 'Raj Nagar Extension'],
      },
      {
        name: 'Lucknow',
        districts: ['Gomti Nagar', 'Gomti Nagar Extension', 'Hazratganj', 'Aliganj', 'Indira Nagar', 'Sushant Golf City'],
      },
    ],
  },
  {
    name: 'Telangana',
    cities: [
      {
        name: 'Hyderabad',
        districts: [
          'Gachibowli',
          'Hitec City',
          'Madhapur',
          'Financial District',
          'Kondapur',
          'Jubilee Hills',
          'Banjara Hills',
          'Kukatpally',
          'Miyapur',
          'Manikonda',
          'Nanakramguda',
          'Tellapur',
          'Kokapet',
          'Begumpet',
          'Secunderabad',
        ],
      },
      {
        name: 'Warangal',
        districts: ['Hanamkonda', 'Kazipet', 'Subedari'],
      },
    ],
  },
  {
    name: 'Tamil Nadu',
    cities: [
      {
        name: 'Chennai',
        districts: [
          'OMR (Old Mahabalipuram Road)',
          'ECR',
          'Velachery',
          'Adyar',
          'Besant Nagar',
          'Anna Nagar',
          'T. Nagar',
          'Sholinganallur',
          'Perungudi',
          'Thoraipakkam',
          'Porur',
          'Nungambakkam',
        ],
      },
      {
        name: 'Coimbatore',
        districts: ['RS Puram', 'Gandhipuram', 'Peelamedu', 'Saibaba Colony', 'Race Course'],
      },
    ],
  },
  {
    name: 'Gujarat',
    cities: [
      {
        name: 'Ahmedabad',
        districts: [
          'SG Highway',
          'Prahlad Nagar',
          'Bopal',
          'South Bopal',
          'Satellite',
          'Bodakdev',
          'Vastrapur',
          'Thaltej',
          'Sindhu Bhavan Road',
          'Navrangpura',
        ],
      },
      {
        name: 'Surat',
        districts: ['Vesu', 'Pal', 'Adajan', 'Piplod', 'City Light', 'Dumas Road'],
      },
      {
        name: 'Vadodara',
        districts: ['Alkapuri', 'Akota', 'Vasna Road', 'Gotri', 'Sevasi'],
      },
    ],
  },
  {
    name: 'West Bengal',
    cities: [
      {
        name: 'Kolkata',
        districts: [
          'New Town Action Area 1-3',
          'Salt Lake (Bidhannagar)',
          'Rajarhat',
          'Ballygunge',
          'Alipore',
          'EM Bypass',
          'Gariahat',
          'Tollygunge',
          'Jadavpur',
        ],
      },
    ],
  },
  {
    name: 'Rajasthan',
    cities: [
      {
        name: 'Jaipur',
        districts: ['Malviya Nagar', 'Vaishali Nagar', 'Mansarovar', 'C-Scheme', 'Jagatpura', 'Ajmer Road'],
      },
      {
        name: 'Udaipur',
        districts: ['Panchwati', 'Fatehpura', 'Sukher', 'Hiran Magri'],
      },
    ],
  },
  {
    name: 'Kerala',
    cities: [
      {
        name: 'Kochi',
        districts: ['Kakkanad (Infopark)', 'Marine Drive', 'Panampilly Nagar', 'Edappally', 'Aluva'],
      },
      {
        name: 'Thiruvananthapuram',
        districts: ['Kazhakoottam (Technopark)', 'Kowdiar', 'Vellayambalam', 'Pattom'],
      },
    ],
  },
  {
    name: 'Punjab & Chandigarh',
    cities: [
      {
        name: 'Chandigarh',
        districts: ['Sector 8-11', 'Sector 17', 'Sector 35', 'Sector 43', 'Manimajra'],
      },
      {
        name: 'Mohali',
        districts: ['Phase 7-11', 'Sector 70', 'Sector 82 (Aerocity)', 'New Chandigarh'],
      },
    ],
  },
];

/**
 * Returns sorted list of all available states
 */
export function getStates(): string[] {
  return INDIAN_LOCATIONS.map((s) => s.name).sort((a, b) => a.localeCompare(b));
}

/**
 * Returns sorted list of cities for a given state
 */
export function getCities(stateName: string): string[] {
  if (!stateName) return [];
  const foundState = INDIAN_LOCATIONS.find(
    (s) => s.name.toLowerCase() === stateName.trim().toLowerCase()
  );
  if (!foundState) return [];
  return foundState.cities.map((c) => c.name).sort((a, b) => a.localeCompare(b));
}

/**
 * Returns sorted list of districts for a given state and city
 */
export function getDistricts(stateName: string, cityName: string): string[] {
  if (!stateName || !cityName) return [];
  const foundState = INDIAN_LOCATIONS.find(
    (s) => s.name.toLowerCase() === stateName.trim().toLowerCase()
  );
  if (!foundState) return [];

  const foundCity = foundState.cities.find(
    (c) => c.name.toLowerCase() === cityName.trim().toLowerCase()
  );
  if (!foundCity) return [];

  return [...foundCity.districts].sort((a, b) => a.localeCompare(b));
}

/**
 * Validates if the selected state exists in the location dataset
 */
export function isValidState(stateName: string): boolean {
  return getStates().some((s) => s.toLowerCase() === (stateName || '').trim().toLowerCase());
}

/**
 * Validates if the selected city exists under the specified state
 */
export function isValidCity(stateName: string, cityName: string): boolean {
  return getCities(stateName).some((c) => c.toLowerCase() === (cityName || '').trim().toLowerCase());
}

/**
 * Validates if the selected district exists under the specified state and city
 */
export function isValidDistrict(stateName: string, cityName: string, districtName: string): boolean {
  return getDistricts(stateName, cityName).some(
    (d) => d.toLowerCase() === (districtName || '').trim().toLowerCase()
  );
}

/**
 * Merges any Firestore society records into the local location tree
 * to guarantee that whatever an Admin adds is always available in the dropdowns.
 */
export function mergeFirestoreSocieties(societies: Array<{ state?: string; city?: string; district?: string }>) {
  societies.forEach((soc) => {
    const stName = (soc.state || '').trim();
    const ctName = (soc.city || '').trim();
    const dtName = (soc.district || '').trim();

    if (!stName || !ctName) return;

    let existingState = INDIAN_LOCATIONS.find(
      (s) => s.name.toLowerCase() === stName.toLowerCase()
    );

    if (!existingState) {
      existingState = { name: stName, cities: [] };
      INDIAN_LOCATIONS.push(existingState);
    }

    let existingCity = existingState.cities.find(
      (c) => c.name.toLowerCase() === ctName.toLowerCase()
    );

    if (!existingCity) {
      existingCity = { name: ctName, districts: [] };
      existingState.cities.push(existingCity);
    }

    if (dtName && !existingCity.districts.some((d) => d.toLowerCase() === dtName.toLowerCase())) {
      existingCity.districts.push(dtName);
    }
  });
}
