export const INVERTER_SIZES = [
  '3kW',
  '5kW',
  '6kW',
  '8kW',
  '10kW',
  '12kW',
  '15kW',
  '16kW',
  '20kW',
  '25kW',
  '30kW',
  '33kW',
  '50kW',
  '80kW',
  '100kW',
  '125kW',
  '150kW',
]

export const SYSTEM_SIZES = [
  '1 - 5 kW',
  '6 - 10 kW',
  '11 - 15 kW',
  '16 - 20 kW',
  '21 - 25 kW',
  '26 - 30 kW',
  '30 kW & Above',
]

export const INVERTER_BRANDS = [
  'Knox', 'Fronius', 'Livoltek', 'GoodWe', 'Galaxy', 'Solis', 'CoreTech', 'Inverex',
  'Ziewnic', 'Itel', 'Sunviour', 'Yinergy', 'Huawei', 'SAJ', 'Fox ESS', 'Solplanet',
  'Solax Power', 'Tesla', 'Crown', 'Growatt', 'Deye', 'Sungrow', 'Sofar', 'SMA',
  'SolarEdge', 'KSTAR', 'SolarMax', 'SRNE', 'Voltronic/Axpert', 'Kodak', 'Sineng',
  'FIMER', 'Canadian Solar', 'Apex', 'Gripsun', 'Anicsun', 'Maxpower', 'Auxsol',
  'Onyx', 'Powerage', 'Sunlife', 'EY Power', 'Other'
]

export const PANEL_BRANDS = [
  'JA Solar', 'Jinko', 'Longi', 'Trina', 'Canadian', 'Risen', 'Qcells', 'SunPower',
  'REC', 'Hanwha', 'Yingli', 'Talesun', 'Seraphim', 'HT-SAAE', 'ZNSHINE', 'DAH Solar',
  'Eging PV', 'GCL', 'Other'
]

export const BATTERY_BRANDS = [
  'Dyness', 'Narada', 'Pylontech', 'Sunwoda', 'Dongjin', 'BYD', 'Knox', 'GoodWe',
  'Sacred Sun', 'Genix Green', 'Inverex', 'Growatt', 'Deye', 'Huawei', 'Fox ESS',
  'Sungrow', 'Sofar', 'SolaX', 'SRNE', 'Osaka', 'Phoenix', 'Apex Solar', 'MaxPower', 'EY Power', 'Other'
]

export const IP_LIST = ['IP20', 'IP21', 'IP34', 'IP40', 'IP54', 'IP55', 'IP65', 'IP66', 'IP67', 'IP68']

export const DISCO_LIST = [
  'LESCO', 'GEPCO', 'FESCO', 'IESCO', 'MEPCO', 'PESCO', 'HESCO', 'SEPCO', 'QESCO', 'TESCO', 'K-Electric', 'Other'
]

export const STRUCTURE_TYPES = [
  'Aluminium - L1 Z-Type Structure',
  'Aluminium - L2 Z-Type Structure',
  'Aluminium - L3 Z-Type Structure',
  'Aluminium - Flushmount Structure',
  'G.I. - L1 Z-Type Structure',
  'G.I. - L2 Z-Type Structure',
  'G.I. - L3 Z-Type Structure',
  'H.D.G.I. - L1 Z-Type Structure',
  'H.D.G.I. - L2 Z-Type Structure',
  'H.D.G.I. - L3 Z-Type Structure',
  'M.S. - Elevated Structure with Walkway',
  'M.S. - L2 Z-Type Elevated Structure',
  'M.S. - L3 Z-Type Elevated Structure',
  'H.D.G.I. / Aluminium - L2 Z-Type Structure',
  'H.D.G.I. Elevated Structure with Walkway',
  'E.P.G.I. - Elevated Structure with Walkway',
  'Aluminium Elevated Structure with Walkway',
  'Other',
]

export const STRUCTURE_MATERIALS = [
  'Pre Galvanized', 'Hot Dip Galvanized', 'Aluminum', 'Painted Steel', 'L1', 'L2', 'L3', 'L4', 'Other'
]

export const PV_DG_CONTROLLER_BRANDS = [
  'DSE',
  'ComAp',
  'DEIF',
  'SmartGen',
  'Woodward',
  'SICES',
  'Datakom',
  'Lovato',
  'SMA',
  'Other',
]

export const ENERGY_ANALYZER_BRANDS = [
  'Chint',
  'Acrel',
  'Eastron',
  'Other',
  'Not Installed',
]

export const DATALOGGER_BRANDS = [
  'Huawei',
  'GoodWe',
  'Solis',
  'Growatt',
  'Sungrow',
  'Fronius',
  'SMA',
  'Deye',
  'SOFAR',
  'FoxESS',
  'SolarEdge',
  'SAJ',
  'SolaX',
  'Livoltek',
  'Inverex',
  'Knox',
  'Fronus',
  'Crown',
  'MaxPower',
  'Other',
]

export const DATALOGGER_ECOSYSTEM_MAP: Record<string, string> = {
  'Huawei': 'FusionSolar / Smart Dongle',
  'GoodWe': 'SEMS Portal / WiFi kit',
  'Solis': 'SolisCloud / WiFi or 4G datalogger',
  'Growatt': 'Shine series / ShineServer',
  'Sungrow': 'iSolarCloud / WiNet',
  'Fronius': 'Solar.web / Datamanager',
  'SMA': 'Sunny Portal / Data Manager',
  'Deye': 'Solarman / WiFi-LAN-4G monitoring',
  'SOFAR': 'Solarman / WiFi monitoring',
  'Sofar': 'Solarman / WiFi monitoring',
  'FoxESS': 'FoxCloud / WiFi or 4G',
  'Fox ESS': 'FoxCloud / WiFi or 4G',
  'SolarEdge': 'Monitoring platform / communication gateway',
  'SAJ': 'eSolar / monitoring devices',
  'SolaX': 'SolaxCloud / Pocket WiFi',
  'Solax': 'SolaxCloud / Pocket WiFi',
  'Solax Power': 'SolaxCloud / Pocket WiFi',
  'Livoltek': 'monitoring / WiFi communication',
  'Inverex': 'WiFi/monitoring solutions depending on inverter model',
  'Knox': 'WiFi/monitoring solutions depending on model',
  'Fronus': 'WiFi monitoring depending on inverter series',
  'Crown': 'WiFi/monitoring depending on inverter series',
  'MaxPower': 'Monitoring options depending on inverter model',
  'Maxpower': 'Monitoring options depending on inverter model',
}

export function getDataloggerEcosystem(brand: string): string {
  if (!brand) return ''
  const trimmed = brand.trim()
  if (DATALOGGER_ECOSYSTEM_MAP[trimmed]) return DATALOGGER_ECOSYSTEM_MAP[trimmed]
  // Case-insensitive fallback
  const foundKey = Object.keys(DATALOGGER_ECOSYSTEM_MAP).find(
    k => k.toLowerCase() === trimmed.toLowerCase()
  )
  if (foundKey) return DATALOGGER_ECOSYSTEM_MAP[foundKey]
  return ''
}

