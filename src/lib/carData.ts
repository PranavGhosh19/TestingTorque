// Automotive dataset for car registration
// Popular Indian makes, models, body types, and wash schedule times

export interface CarMakeInfo {
  make: string;
  popularModels: string[];
}

export const POPULAR_CAR_MAKES: CarMakeInfo[] = [
  {
    make: 'Maruti Suzuki',
    popularModels: ['Swift', 'Baleno', 'Brezza', 'Grand Vitara', 'Dzire', 'Ertiga', 'Fronx', 'Wagon R', 'Alto K10', 'Jimny', 'Invicto', 'Ciaz'],
  },
  {
    make: 'Hyundai',
    popularModels: ['Creta', 'Venue', 'i20', 'Exter', 'Verna', 'Tucson', 'Alcazar', 'Aura', 'Grand i10 Nios', 'Ioniq 5'],
  },
  {
    make: 'Tata Motors',
    popularModels: ['Nexon', 'Punch', 'Harrier', 'Safari', 'Altroz', 'Tiago', 'Tigor', 'Curvv', 'Nexon EV', 'Punch EV'],
  },
  {
    make: 'Mahindra',
    popularModels: ['Thar', 'Scorpio-N', 'XUV700', 'Scorpio Classic', 'XUV 3XO', 'Bolero', 'XUV400 EV', 'Thar Roxx'],
  },
  {
    make: 'Toyota',
    popularModels: ['Innova Crysta', 'Innova Hycross', 'Fortuner', 'Urban Cruiser Hyryder', 'Glanza', 'Rumion', 'Hilux', 'Camry'],
  },
  {
    make: 'Kia',
    popularModels: ['Seltos', 'Sonet', 'Carens', 'EV6', 'Carnival'],
  },
  {
    make: 'Honda',
    popularModels: ['City', 'Elevate', 'Amaze', 'City e:HEV'],
  },
  {
    make: 'Volkswagen',
    popularModels: ['Virtus', 'Taigun', 'Tiguan'],
  },
  {
    make: 'Skoda',
    popularModels: ['Slavia', 'Kushaq', 'Kodiaq', 'Superb'],
  },
  {
    make: 'MG Motor',
    popularModels: ['Hector', 'Astor', 'ZS EV', 'Comet EV', 'Windsor EV', 'Gloster'],
  },
  {
    make: 'BMW',
    popularModels: ['3 Series', '5 Series', 'X1', 'X3', 'X5', 'X7', 'i4', 'iX1'],
  },
  {
    make: 'Mercedes-Benz',
    popularModels: ['C-Class', 'E-Class', 'GLA', 'GLC', 'GLE', 'S-Class', 'A-Class Limousine'],
  },
  {
    make: 'Audi',
    popularModels: ['A4', 'A6', 'Q3', 'Q5', 'Q7', 'e-tron'],
  },
  {
    make: 'Volvo',
    popularModels: ['XC40 Recharge', 'XC60', 'XC90', 'EX40'],
  },
  {
    make: 'BYD',
    popularModels: ['Atto 3', 'Seal', 'e6'],
  },
  {
    make: 'Jeep',
    popularModels: ['Compass', 'Meridian', 'Wrangler', 'Grand Cherokee'],
  },
  {
    make: 'Renault',
    popularModels: ['Kiger', 'Triber', 'Kwid'],
  },
  {
    make: 'Nissan',
    popularModels: ['Magnite', 'X-Trail'],
  },
];

export const PREFERRED_COMPLETION_TIMES = [
  '06:30 AM',
  '07:00 AM',
  '07:30 AM',
  '08:00 AM',
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
];

/**
 * Returns list of all car makes
 */
export function getCarMakes(): string[] {
  return POPULAR_CAR_MAKES.map((c) => c.make);
}

/**
 * Returns popular models for a given car make
 */
export function getCarModels(makeName: string): string[] {
  const found = POPULAR_CAR_MAKES.find(
    (c) => c.make.toLowerCase() === (makeName || '').trim().toLowerCase()
  );
  return found ? found.popularModels : [];
}

/**
 * Suggests vehicle body type based on make/model
 */
export function inferVehicleType(make: string, model: string): 'car' | 'suv' | 'luxury' | 'bike' {
  const luxuryMakes = ['bmw', 'mercedes-benz', 'audi', 'volvo', 'jaguar', 'land rover', 'porsche'];
  if (luxuryMakes.includes(make.toLowerCase())) {
    return 'luxury';
  }

  const suvKeywords = [
    'creta', 'seltos', 'harrier', 'safari', 'scorpio', 'thar', 'xuv', 'fortuner', 'innova',
    'compass', 'brezza', 'grand vitara', 'venue', 'sonet', 'elevate', 'kushaq', 'taigun',
    'hector', 'tucson', 'astor', 'gloster', 'punch', 'nexon', 'curvv', 'hyryder', 'meridian'
  ];
  if (suvKeywords.some((k) => model.toLowerCase().includes(k))) {
    return 'suv';
  }

  return 'car';
}
