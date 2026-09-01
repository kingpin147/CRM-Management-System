export const TICKET_SUBTYPES = {
  BILLING_COMPLAINT: [
    "Wrong arrears", "Invoice Not Received", "Billing is not Updated", 
    "Billing Plan Change", "Wrong Invoice Charged", "Others"
  ],
  SERVICE_REQUEST: [
    "Solar System Audit Request", "Internal Shifting", "Package Change", 
    "Temp. Blocked", "Permanent Disconnection", "Restoration", 
    "Profile Change Request", "Settings change in Solar system", 
    "Upgrade / extension in existing system", "Others"
  ]
};

export const TECHNICAL_CATEGORIES = [
  "Inverter", "Battery", "Solar Panels", "Breakers", "BOS"
];

export const ESCALATION_MATRIX: Record<string, string> = {
  // LOW ESCALATION
  "Grid overvoltage": "Low", "Grid undervoltage": "Low", "Grid over frequency": "Low", 
  "Grid under frequency": "Low", "String imbalance": "Low", "High temperature": "Low", 
  "Communication warning": "Low", "Meter communication loss": "Low", 
  "Battery low state of charge": "Low", "Battery temperature high": "Low", 
  "Fan warning": "Low", "Insulation resistance low": "Low", "Export limit warning": "Low",
  "Tripped": "Low", "Overcurrent": "Low", "WDN leakage": "Low", 
  "Conduit sealant / Epoxy": "Low", "Hanging wire (PV structure)": "Low",

  // MEDIUM ESCALATION
  "Grid voltage abnormal": "Medium", "Grid frequency abnormal": "Medium", "Phase loss": "Medium", 
  "PV overvoltage": "Medium", "PV overcurrent": "Medium", "Reverse polarity": "Medium", 
  "Low insulation resistance": "Medium", "Arc-fault detection": "Medium", "Meter fault": "Medium", 
  "CT wiring fault": "Medium", "Battery overvoltage": "Medium", "Battery undervoltage": "Medium", 
  "BMS communication loss": "Medium", "Relay fault": "Medium", "Fan fault": "Medium", 
  "Sensor fault": "Medium", "Internal communication fault": "Medium", "Export-control fault": "Medium",
  "Soiling": "Medium", "Color changes": "Medium", "Tharmal Trip": "Medium", 
  "Breaker Burnt": "Medium", "SPD Burnt": "Medium",

  // HIGH ESCALATION
  "PV overvoltage fault": "High", "PV reverse-polarity fault": "High", "Ground fault": "High", 
  "Insulation fault": "High", "Residual-current fault": "High", "AC relay fault": "High", 
  "Overtemperature fault": "High", "Internal hardware fault": "High", "Control-board fault": "High", 
  "Power-module fault": "High", "Memory fault": "High", "Configuration fault": "High", 
  "Battery fault": "High", "BMS fault": "High", "Parallel-system fault": "High", 
  "Frequent tripping": "High", "Synchronization fault": "High",

  // CRITICAL ESCALATION
  "DC arc fault": "Critical", "DC overvoltage": "Critical", "Severe overtemperature": "Critical", 
  "Smoke detection": "Critical", "Burning smell": "Critical", "Melted connector": "Critical", 
  "Physical damage": "Critical", "Battery thermal event": "Critical", "Battery swelling": "Critical", 
  "Battery venting": "Critical", "Internal power-stage failure": "Critical", "Fire": "Critical",
  "External damage": "Critical", "Internal damage": "Critical", "Fire / spark / fumes": "Critical",
  "Broken conduits / cable tray / duct": "Critical", "Dislocated conduits / cable tray / duct": "Critical",
  "Broken wires": "Critical"
};

export const CATEGORIZED_FAULTS: Record<string, string[]> = {
  "Inverter": [
    "Grid overvoltage", "Grid undervoltage", "Grid over frequency", "Grid under frequency",
    "String imbalance", "High temperature", "Communication warning", "Meter communication loss",
    "Fan warning", "Insulation resistance low", "Export limit warning", "Grid voltage abnormal",
    "Grid frequency abnormal", "Phase loss", "PV overvoltage", "PV overcurrent", "Reverse polarity",
    "Low insulation resistance", "Ground fault", "Arc-fault detection", "Meter fault", "CT wiring fault",
    "Internal communication fault", "Export-control fault", "Insulation fault", "Residual-current fault",
    "AC relay fault", "Overtemperature fault", "Internal hardware fault", "Control-board fault",
    "Power-module fault", "Memory fault", "Configuration fault", "Parallel-system fault",
    "Synchronization fault", "Frequent tripping", "Severe overtemperature", "Smoke detection",
    "Burning smell", "Melted connector", "Physical damage", "Internal power-stage failure", "Fire",
    "PV overvoltage fault", "PV reverse-polarity fault", "DC arc fault", "DC overvoltage"
  ],
  "Battery": [
    "High temperature", "Communication warning", "Battery low state of charge", "Battery temperature high",
    "BMS communication loss", "Relay fault", "Fan fault", "Temperature Sensor fault", "Sensor fault",
    "Internal communication fault", "Battery overvoltage", "Battery undervoltage", "Burning smell", "Fire",
    "Battery thermal event", "Battery swelling", "Battery venting", "Battery fault", "BMS fault"
  ],
  "Solar Panels": [
    "Soiling", "Color changes", "External damage", "Internal damage", "Fire / spark / fumes"
  ],
  "Breakers": [
    "Tripped", "Overcurrent", "Tharmal Trip", "Breaker Burnt", "SPD Burnt"
  ],
  "BOS": [
    "WDN leakage", "Conduit sealant / Epoxy", "Hanging wire (PV structure)", 
    "Broken conduits / cable tray / duct", "Dislocated conduits / cable tray / duct", "Broken wires"
  ]
};
