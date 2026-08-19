export interface CityData {
  defaultDisco: string
  areas: string[]
}

export const PAKISTAN_CITIES_AREAS: Record<string, CityData> = {
  'Lahore': {
    defaultDisco: 'LESCO',
    areas: [
      'DHA Phase 1', 'DHA Phase 2', 'DHA Phase 3', 'DHA Phase 4', 'DHA Phase 5',
      'DHA Phase 6', 'DHA Phase 7', 'DHA Phase 8', 'DHA Phase 9 Town', 'DHA Phase 9 Prism',
      'DHA Rahbar', 'Bahria Town - Sector A', 'Bahria Town - Sector B', 'Bahria Town - Sector C',
      'Bahria Town - Sector D', 'Bahria Town - Sector E', 'Bahria Town - Sector F',
      'Johar Town - Block A', 'Johar Town - Block B', 'Johar Town - Block C', 'Johar Town - Block D',
      'Johar Town - Block E', 'Johar Town - Block F', 'Johar Town - Block G', 'Johar Town - Block H',
      'Johar Town - Block J', 'Johar Town - Block K', 'Johar Town - Block L', 'Johar Town - Block M',
      'Johar Town - Block N', 'Johar Town - Block P', 'Johar Town - Block Q', 'Johar Town - Block R',
      'Model Town', 'Gulberg I', 'Gulberg II', 'Gulberg III', 'Gulberg IV', 'Gulberg V',
      'Askari 1', 'Askari 2', 'Askari 3', 'Askari 4', 'Askari 5', 'Askari 8', 'Askari 9', 'Askari 10', 'Askari 11',
      'Lake City', 'Wapda Town', 'Paragon City', 'Valencia Town', 'Garden Town',
      'State Life Housing Society', 'Bankers Housing Society', 'Executive Lodges', 'Cantt',
      'Allama Iqbal Town', 'Green City', 'Park View City', 'Pine Avenue', 'Architect Housing Society',
      'Eden City', 'Eden Gardens', 'PCSIR Phase 1', 'PCSIR Phase 2', 'Sabzazar', 'Faisal Town',
      'Cavalry Ground', 'Divine Gardens', 'LDA City', 'Shadman', 'Samanabad', 'Township',
      'Muslim Town', 'New Garden Town', 'Thokar Niaz Baig', 'Bedian Road', 'Barki Road',
      'Raiwind Road', 'Multan Road', 'Ferozepur Road', 'Canal Bank Housing Scheme',
      'Punjab Small Industries Society', 'NFC Phase 1', 'NFC Phase 2', 'Audit & Accounts Society',
      'Tariq Gardens', 'Khayaban-e-Amin', 'Central Park', 'Sui Gas Society'
    ]
  },
  'Karachi': {
    defaultDisco: 'K-Electric',
    areas: [
      'DHA Phase 1', 'DHA Phase 2', 'DHA Phase 4', 'DHA Phase 5', 'DHA Phase 6', 'DHA Phase 7', 'DHA Phase 8',
      'Clifton - Block 1', 'Clifton - Block 2', 'Clifton - Block 3', 'Clifton - Block 4', 'Clifton - Block 5',
      'Clifton - Block 7', 'Clifton - Block 8', 'Clifton - Block 9',
      'Gulshan-e-Iqbal - Block 1', 'Gulshan-e-Iqbal - Block 2', 'Gulshan-e-Iqbal - Block 3',
      'Gulshan-e-Iqbal - Block 4', 'Gulshan-e-Iqbal - Block 5', 'Gulshan-e-Iqbal - Block 6',
      'Gulshan-e-Iqbal - Block 7', 'Gulshan-e-Iqbal - Block 10', 'Gulshan-e-Iqbal - Block 13',
      'PECHS - Block 2', 'PECHS - Block 6', 'North Nazimabad', 'Bahria Town Karachi',
      'Gulistan-e-Johar - Block 1', 'Gulistan-e-Johar - Block 2', 'Gulistan-e-Johar - Block 3',
      'Gulistan-e-Johar - Block 12', 'Gulistan-e-Johar - Block 13', 'Gulistan-e-Johar - Block 15',
      'Malir Cantt', 'KDA Scheme 1', 'Federal B Area', 'Tariq Road', 'Defence View', 'Scheme 33',
      'Saddar', 'Korangi', 'Nazimabad', 'Gulberg Karachi', 'DHA City Karachi', 'Garden West',
      'Naya Nazimabad', 'Anchor City', 'Navy Housing Scheme', 'Askari 4 Karachi', 'Falcon Complex'
    ]
  },
  'Islamabad': {
    defaultDisco: 'IESCO',
    areas: [
      'Sector F-6', 'Sector F-7', 'Sector F-8', 'Sector F-10', 'Sector F-11',
      'Sector G-6', 'Sector G-7', 'Sector G-8', 'Sector G-9', 'Sector G-10', 'Sector G-11', 'Sector G-13', 'Sector G-14', 'Sector G-15',
      'Sector E-7', 'Sector E-11', 'Sector H-11', 'Sector I-8', 'Sector I-9', 'Sector I-10', 'Sector I-11',
      'DHA Phase 1', 'DHA Phase 2', 'DHA Phase 3', 'DHA Phase 4', 'DHA Phase 5', 'DHA Valley',
      'Bahria Town Phase 1', 'Bahria Town Phase 2', 'Bahria Town Phase 3', 'Bahria Town Phase 4',
      'Bahria Town Phase 5', 'Bahria Town Phase 6', 'Bahria Town Phase 7', 'Bahria Town Phase 8', 'Bahria Enclave',
      'Naval Anchorage', 'Park Enclave', 'Gulberg Greens', 'B-17 Multi Gardens', 'Top City-1', 'Mumtaz City',
      'PWD Housing Scheme', 'CBR Town', 'Soan Gardens', 'Media Town', 'Faisal Town', 'Korang Town', 'Diplomatic Enclave'
    ]
  },
  'Rawalpindi': {
    defaultDisco: 'IESCO',
    areas: [
      'Bahria Town Phase 1', 'Bahria Town Phase 2', 'Bahria Town Phase 3', 'Bahria Town Phase 4',
      'Bahria Town Phase 5', 'Bahria Town Phase 6', 'Bahria Town Phase 7', 'Bahria Town Phase 8',
      'DHA Phase 1', 'DHA Phase 2', 'Satellite Town', 'Chaklala Scheme 3', 'Saddar',
      'Gulraiz Housing Scheme', 'Westridge', 'Askari 1', 'Askari 2', 'Askari 3', 'Askari 4',
      'Askari 7', 'Askari 10', 'Askari 13', 'Askari 14', 'Adiala Road', 'Peshawar Road',
      'High Court Road', 'Khayaban-e-Sir Syed', 'Airport Housing Society', 'Gulshan-e-Abad',
      'Morgah', 'Harley Street', 'Commercial Market', 'Lalkurti', 'Tarlai', 'Gulzar-e-Quaid'
    ]
  },
  'Faisalabad': {
    defaultDisco: 'FESCO',
    areas: [
      'Canal Road', 'Madina Town', 'Peoples Colony 1', 'Peoples Colony 2', 'Kohinoor City',
      'FDA City', 'Eden Garden', 'Officers Colony', 'Susan Road', 'Batala Colony',
      'Samanabad', 'Sargodha Road', 'Gulberg Faisalabad', 'D Ground', 'Jinnah Colony',
      'University Town', 'Millat Town', 'Gatwala', 'Civil Lines'
    ]
  },
  'Multan': {
    defaultDisco: 'MEPCO',
    areas: [
      'Multan Cantt', 'Model Town', 'Bosan Road', 'Gulgasht Colony', 'Officers Colony',
      'DHA Multan', 'Royal Orchard', 'Wapda Town Multan', 'Shalimar Colony', 'New Multan',
      'Shah Rukn-e-Alam Colony', 'Zakariya Town', 'Suraj Miani', 'Multan Public School Road',
      'Northern Bypass', 'Buch Executive Villas', 'Garden Town'
    ]
  },
  'Gujranwala': {
    defaultDisco: 'GEPCO',
    areas: [
      'Gujranwala Cantt', 'DC Colony', 'Model Town', 'Wapda Town Gujranwala', 'Citi Housing',
      'Master City', 'Satellite Town', 'Garden Town', 'Rahwali Cantt', 'Peoples Colony',
      'Canal View', 'Shalimar Town', 'Civil Lines'
    ]
  },
  'Sialkot': {
    defaultDisco: 'GEPCO',
    areas: [
      'Sialkot Cantt', 'Citi Housing Sialkot', 'Paris Road', 'Model Town', 'Defence Road',
      'Kashmir Road', 'Shatab Garh', 'Ugoki', 'Sambrial Road', 'Askari Sialkot', 'Khadim Ali Road'
    ]
  },
  'Peshawar': {
    defaultDisco: 'PESCO',
    areas: [
      'Hayatabad - Phase 1', 'Hayatabad - Phase 2', 'Hayatabad - Phase 3', 'Hayatabad - Phase 4',
      'Hayatabad - Phase 5', 'Hayatabad - Phase 6', 'Hayatabad - Phase 7', 'University Town',
      'Peshawar Cantt', 'Warsak Road', 'Regi Model Town', 'DHA Peshawar', 'Gulbahar',
      'Board Bazaar', 'Charsadda Road', 'Dalazak Road', 'Ring Road'
    ]
  },
  'Quetta': {
    defaultDisco: 'QESCO',
    areas: [
      'Quetta Cantt', 'Zarghoon Road', 'Airport Road', 'Samungli Road', 'Model Town Quetta',
      'Jinnah Town', 'Satellite Town Quetta', 'Nawan Killi', 'Chaman Housing Scheme',
      'Shahbaz Town', 'Spinny Road', 'Chiltan Housing Scheme'
    ]
  },
  'Hyderabad': {
    defaultDisco: 'HESCO',
    areas: [
      'Auto Bhan Road', 'Latifabad Unit 1-12', 'Qasimabad', 'Saddar Hyderabad', 'Defense Hyderabad',
      'Citizen Colony', 'Gulshan-e-Shahbaz', 'Jamshoro Road', 'Bhitai Town'
    ]
  },
  'Sukkur': {
    defaultDisco: 'SEPCO',
    areas: [
      'Military Road', 'Sukkur Cantt', 'Model Town Sukkur', 'Shikarpur Road', 'Bunder Road', 'Civil Lines'
    ]
  },
  'Abbottabad': {
    defaultDisco: 'PESCO',
    areas: [
      'Supply Area', 'Mansehra Road', 'Jinnahabad', 'Mandian', 'Abbottabad Cantt', 'Pine City'
    ]
  },
  'Sargodha': {
    defaultDisco: 'FESCO',
    areas: [
      'Satellite Town Sargodha', 'University Road', 'Sargodha Cantt', 'Model Town', 'New Satellite Town'
    ]
  },
  'Bahawalpur': {
    defaultDisco: 'MEPCO',
    areas: [
      'Model Town Bahawalpur', 'Bahawalpur Cantt', 'DHA Bahawalpur', 'Satellite Town', 'University Town'
    ]
  },
  'Rahim Yar Khan': {
    defaultDisco: 'MEPCO',
    areas: [
      'Model Town RYK', 'Abbasia Town', 'Gulshan-e-Iqbal RYK', 'Officers Colony'
    ]
  },
  'Gujrat': {
    defaultDisco: 'GEPCO',
    areas: [
      'GTS Chowk Area', 'Court Road', 'Model Town Gujrat', 'Rehman Shaheed Road'
    ]
  },
  'Mirpur (AJK)': {
    defaultDisco: 'IESCO',
    areas: [
      'Sector F-1', 'Sector F-2', 'Sector F-3', 'Sector F-4', 'New City Mirpur'
    ]
  },
  'Muzaffarabad': {
    defaultDisco: 'IESCO',
    areas: [
      'Plate Area', 'Upper Chattar', 'Lower Chattar', 'Bank Road'
    ]
  }
}

export const CITIES_LIST = Object.keys(PAKISTAN_CITIES_AREAS)

const DEFAULT_AREAS = [
  'DHA', 'Bahria Town', 'Model Town', 'Gulberg', 'Askari', 'Johar Town',
  'Cantt', 'Satellite Town', 'Civil Lines', 'Officers Colony', 'Peoples Colony',
  'Garden Town', 'Wapda Town', 'Commercial Area', 'Main Market'
]

export function getAreasForCity(city?: string): string[] {
  if (!city) return DEFAULT_AREAS
  const normalized = city.trim()
  if (PAKISTAN_CITIES_AREAS[normalized]) {
    return PAKISTAN_CITIES_AREAS[normalized].areas
  }
  const foundKey = Object.keys(PAKISTAN_CITIES_AREAS).find(
    k => k.toLowerCase() === normalized.toLowerCase()
  )
  if (foundKey) {
    return PAKISTAN_CITIES_AREAS[foundKey].areas
  }
  return DEFAULT_AREAS
}

export function getDefaultDiscoForCity(city?: string): string | null {
  if (!city) return null
  const normalized = city.trim()
  if (PAKISTAN_CITIES_AREAS[normalized]) {
    return PAKISTAN_CITIES_AREAS[normalized].defaultDisco
  }
  const foundKey = Object.keys(PAKISTAN_CITIES_AREAS).find(
    k => k.toLowerCase() === normalized.toLowerCase()
  )
  if (foundKey) {
    return PAKISTAN_CITIES_AREAS[foundKey].defaultDisco
  }
  return null
}
