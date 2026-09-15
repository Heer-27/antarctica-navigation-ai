/**
 * Authentic Antarctic scientific dataset for offline development, demonstrations, and resilient fallback.
 * Based on real Southern Ocean geographical stations, ice shelf coordinates, and maritime corridors.
 */

export const MOCK_SHIPS = [
  {
    id: 'rv-polarstern',
    name: 'R/V Polarstern',
    latitude: -64.82,
    longitude: -58.25,
    maxSpeed: 15.5,
    normalSpeed: 11.2,
    fuelCapacity: 950000,
    fuelConsumptionRate: 85, // L/nm
    iceClass: 'PC3 (Polar Class 3)',
    destination: 'Rothera Station',
    destLatitude: -67.57,
    destLongitude: -68.13,
    status: 'IN TRANSIT',
    operator: 'Alfred Wegener Institute',
    crew: 44,
    scientists: 52
  },
  {
    id: 'rv-attenborough',
    name: 'R/V Sir David Attenborough',
    latitude: -62.20,
    longitude: -58.90,
    maxSpeed: 17.0,
    normalSpeed: 13.0,
    fuelCapacity: 1200000,
    fuelConsumptionRate: 92,
    iceClass: 'PC4 (Polar Class 4)',
    destination: 'Halley VI Research Station',
    destLatitude: -75.58,
    destLongitude: -26.54,
    status: 'SURVEYING',
    operator: 'British Antarctic Survey',
    crew: 30,
    scientists: 60
  },
  {
    id: 'rv-agulhas',
    name: 'S.A. Agulhas II',
    latitude: -69.45,
    longitude: 39.50,
    maxSpeed: 16.0,
    normalSpeed: 12.0,
    fuelCapacity: 880000,
    fuelConsumptionRate: 78,
    iceClass: 'PC5 (Polar Class 5)',
    destination: 'Maitri Station (India)',
    destLatitude: -70.77,
    destLongitude: 11.73,
    status: 'APPROACHING PACK ICE',
    operator: 'SANAP / Polar Expeditions',
    crew: 45,
    scientists: 50
  }
];

export const MOCK_ICEBERGS = [
  {
    id: 'A-23a',
    name: 'A-23a (Mega-Tabular Berg)',
    latitude: -60.45,
    longitude: -46.22,
    lastObserved: '2026-09-14T11:30:00Z',
    length: 62000, // 62 km
    width: 38000,  // 38 km
    height: 390,   // meters
    speed: 1.42,   // knots
    heading: 42,   // degrees (NE)
    direction: 'NE 042°',
    riskLevel: 'CRITICAL',
    riskScore: 92,
    origin: 'Filchner-Ronne Ice Shelf',
    notes: 'Grounding-free drifting in the Antarctic Circumpolar Current. Extreme radar cross-section.',
    trajectory: [
      { step: 'CURRENT', time: 'NOW', latitude: -60.45, longitude: -46.22, probability: 100, speed: 1.42 },
      { step: '+6H', time: '+6 HOURS', latitude: -60.32, longitude: -46.04, probability: 96, speed: 1.45 },
      { step: '+12H', time: '+12 HOURS', latitude: -60.18, longitude: -45.85, probability: 92, speed: 1.48 },
      { step: '+18H', time: '+18 HOURS', latitude: -60.05, longitude: -45.68, probability: 88, speed: 1.50 },
      { step: '+24H', time: '+24 HOURS', latitude: -59.91, longitude: -45.50, probability: 84, speed: 1.52 },
      { step: '+48H', time: '+48 HOURS', latitude: -59.35, longitude: -44.80, probability: 76, speed: 1.58 }
    ]
  },
  {
    id: 'A-017',
    name: 'A-017 (Drift Hazard)',
    latitude: -63.15,
    longitude: -56.80,
    lastObserved: '2026-09-14T12:00:00Z',
    length: 850,
    width: 420,
    height: 48,
    speed: 1.82,
    heading: 65,
    direction: 'ENE 065°',
    riskLevel: 'HIGH',
    riskScore: 78,
    origin: 'Larsen C Calving',
    notes: 'Rapid drift along Bransfield Strait shipping corridor. High collision hazard for non-ice-strengthened vessels.',
    trajectory: [
      { step: 'CURRENT', time: 'NOW', latitude: -63.15, longitude: -56.80, probability: 100, speed: 1.82 },
      { step: '+6H', time: '+6 HOURS', latitude: -63.08, longitude: -56.55, probability: 94, speed: 1.85 },
      { step: '+12H', time: '+12 HOURS', latitude: -63.01, longitude: -56.28, probability: 89, speed: 1.88 },
      { step: '+18H', time: '+18 HOURS', latitude: -62.94, longitude: -56.02, probability: 85, speed: 1.90 },
      { step: '+24H', time: '+24 HOURS', latitude: -62.88, longitude: -55.76, probability: 81, speed: 1.92 },
      { step: '+48H', time: '+48 HOURS', latitude: -62.62, longitude: -54.70, probability: 71, speed: 1.95 }
    ]
  },
  {
    id: 'A-81',
    name: 'A-81 (Weddell Tabular)',
    latitude: -71.12,
    longitude: -32.45,
    lastObserved: '2026-09-14T10:45:00Z',
    length: 32000,
    width: 18000,
    height: 240,
    speed: 0.65,
    heading: 315,
    direction: 'NW 315°',
    riskLevel: 'MODERATE',
    riskScore: 54,
    origin: 'Brunt Ice Shelf',
    notes: 'Transiting the Weddell Gyre westward. High concentration of bergy bits trailing downstream.',
    trajectory: [
      { step: 'CURRENT', time: 'NOW', latitude: -71.12, longitude: -32.45, probability: 100, speed: 0.65 },
      { step: '+6H', time: '+6 HOURS', latitude: -71.07, longitude: -32.65, probability: 95, speed: 0.66 },
      { step: '+12H', time: '+12 HOURS', latitude: -71.01, longitude: -32.86, probability: 91, speed: 0.67 },
      { step: '+18H', time: '+18 HOURS', latitude: -70.96, longitude: -33.08, probability: 87, speed: 0.68 },
      { step: '+24H', time: '+24 HOURS', latitude: -70.90, longitude: -33.30, probability: 83, speed: 0.70 },
      { step: '+48H', time: '+48 HOURS', latitude: -70.68, longitude: -34.20, probability: 74, speed: 0.72 }
    ]
  },
  {
    id: 'B-015K',
    name: 'B-015K (Ross Sea Fragment)',
    latitude: -74.20,
    longitude: 172.50,
    lastObserved: '2026-09-14T09:15:00Z',
    length: 18500,
    width: 12000,
    height: 185,
    speed: 0.85,
    heading: 285,
    direction: 'WNW 285°',
    riskLevel: 'MODERATE',
    riskScore: 48,
    origin: 'Ross Ice Shelf',
    notes: 'Stable drift pattern near Terra Nova Bay Polynya entrance.',
    trajectory: [
      { step: 'CURRENT', time: 'NOW', latitude: -74.20, longitude: 172.50, probability: 100, speed: 0.85 },
      { step: '+6H', time: '+6 HOURS', latitude: -74.17, longitude: 172.10, probability: 94, speed: 0.86 },
      { step: '+12H', time: '+12 HOURS', latitude: -74.14, longitude: 171.70, probability: 90, speed: 0.87 },
      { step: '+18H', time: '+18 HOURS', latitude: -74.11, longitude: 171.30, probability: 86, speed: 0.88 },
      { step: '+24H', time: '+24 HOURS', latitude: -74.07, longitude: 170.90, probability: 82, speed: 0.89 },
      { step: '+48H', time: '+48 HOURS', latitude: -73.95, longitude: 169.20, probability: 72, speed: 0.91 }
    ]
  },
  {
    id: 'C-028',
    name: 'C-028 (Shackleton Cluster)',
    latitude: -66.50,
    longitude: 92.10,
    lastObserved: '2026-09-14T11:10:00Z',
    length: 450,
    width: 220,
    height: 32,
    speed: 0.52,
    heading: 140,
    direction: 'SE 140°',
    riskLevel: 'LOW',
    riskScore: 24,
    origin: 'Shackleton Ice Shelf',
    notes: 'Small isolated tabular berg surrounded by open leads.',
    trajectory: [
      { step: 'CURRENT', time: 'NOW', latitude: -66.50, longitude: 92.10, probability: 100, speed: 0.52 },
      { step: '+6H', time: '+6 HOURS', latitude: -66.53, longitude: 92.18, probability: 96, speed: 0.53 },
      { step: '+12H', time: '+12 HOURS', latitude: -66.56, longitude: 92.26, probability: 93, speed: 0.54 },
      { step: '+18H', time: '+18 HOURS', latitude: -66.59, longitude: 92.34, probability: 89, speed: 0.55 },
      { step: '+24H', time: '+24 HOURS', latitude: -66.62, longitude: 92.42, probability: 86, speed: 0.56 },
      { step: '+48H', time: '+48 HOURS', latitude: -66.75, longitude: 92.75, probability: 77, speed: 0.58 }
    ]
  },
  {
    id: 'BYU-A01',
    name: 'BYU-A01 (BYU v8.0 Track)',
    latitude: -50.20,
    longitude: -26.30,
    lastObserved: '1979-05-06T00:00:00Z',
    length: 1200,
    width: 600,
    height: 45,
    speed: 0.20,
    heading: 66.1,
    direction: 'ENE 066°',
    riskLevel: 'LOW',
    riskScore: 22,
    origin: 'BYU Consolidated v8.0 (NIC)',
    source: 'BYU / NIC Scatterometer',
    notes: 'Historical radar-tracked iceberg sequence from BYU dataset (100 observations). Persistence velocity: 0.20 km/h.',
    trajectory: [
      { step: 'CURRENT', time: 'NOW', latitude: -50.20, longitude: -26.30, probability: 100, speed: 0.20 },
      { step: '+24H', time: '+24 HOURS', latitude: -50.18, longitude: -26.24, probability: 95, speed: 0.20 },
      { step: '+72H', time: '+72 HOURS', latitude: -50.14, longitude: -26.12, probability: 88, speed: 0.21 },
      { step: '+168H', time: '+168 HOURS (7D)', latitude: -50.05, longitude: -25.85, probability: 74, speed: 0.22 }
    ]
  },
  {
    id: 'BYU-A02',
    name: 'BYU-A02 (BYU v8.0 Track)',
    latitude: -54.60,
    longitude: -32.80,
    lastObserved: '1979-10-21T00:00:00Z',
    length: 1800,
    width: 900,
    height: 52,
    speed: 0.92,
    heading: 17.2,
    direction: 'NNE 017°',
    riskLevel: 'MODERATE',
    riskScore: 38,
    origin: 'BYU Consolidated v8.0 (NIC)',
    source: 'BYU / NIC Radar',
    notes: 'Historical radar sequence with 92 observations from BYU Consolidated Database v8.0. Persistence velocity: 1.70 km/h.',
    trajectory: [
      { step: 'CURRENT', time: 'NOW', latitude: -54.60, longitude: -32.80, probability: 100, speed: 0.92 },
      { step: '+24H', time: '+24 HOURS', latitude: -54.35, longitude: -32.68, probability: 95, speed: 0.93 },
      { step: '+72H', time: '+72 HOURS', latitude: -53.85, longitude: -32.44, probability: 88, speed: 0.95 },
      { step: '+168H', time: '+168 HOURS (7D)', latitude: -52.60, longitude: -31.85, probability: 74, speed: 0.98 }
    ]
  },
  {
    id: 'BYU-A20A',
    name: 'BYU-A20A (BYU v8.0 Track)',
    latitude: -55.6507,
    longitude: -38.3611,
    lastObserved: '1987-10-08T00:00:00Z',
    length: 2200,
    width: 1100,
    height: 60,
    speed: 0.24,
    heading: 69.7,
    direction: 'ENE 070°',
    riskLevel: 'LOW',
    riskScore: 24,
    origin: 'BYU Consolidated v8.0 (NIC)',
    source: 'BYU / NIC Multi-sensor',
    notes: 'Long-term 130-observation track from BYU consolidated database. Persistence velocity: 0.45 km/h.',
    trajectory: [
      { step: 'CURRENT', time: 'NOW', latitude: -55.6507, longitude: -38.3611, probability: 100, speed: 0.24 },
      { step: '+24H', time: '+24 HOURS', latitude: -55.61, longitude: -38.25, probability: 95, speed: 0.24 },
      { step: '+72H', time: '+72 HOURS', latitude: -55.53, longitude: -38.02, probability: 88, speed: 0.25 },
      { step: '+168H', time: '+168 HOURS (7D)', latitude: -55.33, longitude: -37.45, probability: 74, speed: 0.26 }
    ]
  }
];

export const MOCK_SEA_ICE_CURRENT = {
  timestamp: '2026-09-14T12:00:00Z',
  averageConcentration: 72.4,
  extentSqKm: 18450000,
  regionalZones: [
    { name: 'Weddell Sea Pack', center: [-70.5, -45.0], radiusKm: 350, concentration: 88.5, status: 'CONSOLIDATED PACK' },
    { name: 'Ross Sea Continental Margin', center: [-75.0, 175.0], radiusKm: 280, concentration: 82.1, status: 'CLOSE PACK' },
    { name: 'Bransfield Strait Corridor', center: [-63.2, -58.0], radiusKm: 140, concentration: 62.4, status: 'OPEN PACK / LEADS' },
    { name: 'Bellingshausen Sea Outer Edge', center: [-68.0, -85.0], radiusKm: 260, concentration: 46.8, status: 'VERY OPEN PACK' },
    { name: 'Amundsen Sea Coastal Polynya', center: [-72.5, -110.0], radiusKm: 180, concentration: 28.3, status: 'POLYNYA / OPEN WATER' },
    { name: 'Prydz Bay / Amery Margin', center: [-68.2, 75.0], radiusKm: 210, concentration: 74.0, status: 'CLOSE PACK' }
  ]
};

export const MOCK_WEATHER = {
  timestamp: '2026-09-14T12:00:00Z',
  locationName: 'Antarctic Peninsula / Weddell Gateway',
  latitude: -64.82,
  longitude: -58.25,
  airTemperature: -8.4, // °C
  windSpeed: 18.2,      // knots
  windDirectionDegrees: 134,
  windDirectionText: 'SE',
  barometricPressure: 982.5, // hPa
  pressureTrend: 'FALLING SLOWLY (-1.2 hPa/3h)',
  visibilityKm: 12.0,
  freezingSprayRisk: 'MODERATE',
  gustSpeed: 28.5
};

export const MOCK_OCEAN = {
  timestamp: '2026-09-14T12:00:00Z',
  seaSurfaceTemperature: -1.6, // °C
  significantWaveHeight: 2.4,  // meters
  peakWavePeriod: 8.5,        // seconds
  currentSpeed: 0.72,         // knots
  currentDirectionDegrees: 142,
  currentDirectionText: 'SE',
  salinityPsu: 34.2,
  tideState: 'FLOOD (+0.4m)'
};

export const MOCK_ROUTES = {
  recommendedId: 'balanced',
  options: [
    {
      id: 'shortest',
      name: 'SHORTEST (Direct Rhumb Line)',
      type: 'Direct',
      distanceKm: 500.0,
      travelTimeHours: 29.0,
      estimatedFuelLiters: 1020,
      riskScore: 72,
      riskCategory: 'HIGH',
      summary: 'Intersects dense pack ice (78%) in Sector 03 with proximate drift of A-017 within 9.2 km.',
      riskBreakdown: { seaIce: 38, icebergs: 22, weather: 8, ocean: 4 },
      color: '#D9534F',
      waypoints: [
        { lat: -64.82, lon: -58.25, step: 'WP 00 (Departure)' },
        { lat: -65.40, lon: -60.50, step: 'WP 01' },
        { lat: -66.10, lon: -63.00, step: 'WP 02 (Dense Ice)' },
        { lat: -66.80, lon: -65.50, step: 'WP 03' },
        { lat: -67.57, lon: -68.13, step: 'WP 04 (Destination)' }
      ]
    },
    {
      id: 'safest',
      name: 'SAFEST (Maximum Ice Avoidance)',
      type: 'Circumnavigation',
      distanceKm: 560.0,
      travelTimeHours: 34.2,
      estimatedFuelLiters: 935,
      riskScore: 25,
      riskCategory: 'LOW',
      summary: 'Wide seaward detour through open water leads. Maintains >40 km separation from all tracked icebergs.',
      riskBreakdown: { seaIce: 10, icebergs: 5, weather: 6, ocean: 4 },
      color: '#4EBA6F',
      waypoints: [
        { lat: -64.82, lon: -58.25, step: 'WP 00 (Departure)' },
        { lat: -64.50, lon: -61.20, step: 'WP 01 (Open Sea Detour)' },
        { lat: -65.20, lon: -64.80, step: 'WP 02' },
        { lat: -66.30, lon: -67.50, step: 'WP 03' },
        { lat: -67.57, lon: -68.13, step: 'WP 04 (Destination)' }
      ]
    },
    {
      id: 'fuel',
      name: 'FUEL-EFFICIENT (Ekman Current Assist)',
      type: 'Optimal Fuel',
      distanceKm: 540.0,
      travelTimeHours: 32.5,
      estimatedFuelLiters: 848,
      riskScore: 38,
      riskCategory: 'MODERATE',
      summary: 'Leverages southeastward Antarctic Coastal Current vector to reduce total main engine power output.',
      riskBreakdown: { seaIce: 18, icebergs: 9, weather: 7, ocean: 4 },
      color: '#74B3CE',
      waypoints: [
        { lat: -64.82, lon: -58.25, step: 'WP 00 (Departure)' },
        { lat: -65.10, lon: -60.80, step: 'WP 01 (Current Entry)' },
        { lat: -65.85, lon: -63.90, step: 'WP 02' },
        { lat: -66.70, lon: -66.50, step: 'WP 03' },
        { lat: -67.57, lon: -68.13, step: 'WP 04 (Destination)' }
      ]
    },
    {
      id: 'balanced',
      name: 'BALANCED (Multi-Objective AI Recommended)',
      type: 'Recommended',
      distanceKm: 535.0,
      travelTimeHours: 31.4,
      estimatedFuelLiters: 870,
      riskScore: 31,
      riskCategory: 'LOW',
      summary: 'Optimal Pareto compromise. Avoids A-017 drift cone by 28.5 km while maintaining low fuel burn in light pack ice.',
      riskBreakdown: { seaIce: 14, icebergs: 7, weather: 6, ocean: 4 },
      color: '#E09F3E',
      isRecommended: true,
      waypoints: [
        { lat: -64.82, lon: -58.25, step: 'WP 00 (R/V Polarstern Departure)' },
        { lat: -64.95, lon: -60.20, step: 'WP 01 (Larsen Entry Lead)' },
        { lat: -65.65, lon: -63.20, step: 'WP 02 (Iceberg Clearance Corridor)' },
        { lat: -66.45, lon: -65.80, step: 'WP 03 (Grandidier Channel)' },
        { lat: -67.57, lon: -68.13, step: 'WP 04 (Rothera Station Arrival)' }
      ]
    }
  ],
  decisionExplanation: {
    title: 'WHY THIS ROUTE WAS SELECTED',
    highlights: [
      'Avoids the high-risk drift cone of Iceberg A-017 with a 28.5 km margin of safety.',
      '14.7% lower predicted fuel consumption compared to the direct shortest route.',
      'Navigates through fractured leads where sea-ice concentration is below vessel Polar Class limit (PC3 limit: 80%).',
      'Minimizes exposure to forecast gale force gusts off Adelaide Island.'
    ],
    tradeoff: 'The recommended route is 35 km (+7.0%) longer than the direct shortest route, but achieves a 57% reduction in composite navigation risk score.'
  },
  segments: [
    {
      id: 'SEG-01',
      title: 'Segment 01: Departure Lead',
      startPoint: 'WP 00',
      endPoint: 'WP 01',
      distanceKm: 104.2,
      seaIceConcentration: 38,
      icebergRisk: 'LOW',
      windSpeedKnots: 15.2,
      waveHeightMeters: 1.4,
      currentKnots: 0.5,
      currentDirection: 'ESE',
      fuelEstimateLiters: 168
    },
    {
      id: 'SEG-02',
      title: 'Segment 02: Larsen Marginal Ice Zone',
      startPoint: 'WP 01',
      endPoint: 'WP 02',
      distanceKm: 148.5,
      seaIceConcentration: 54,
      icebergRisk: 'MODERATE',
      windSpeedKnots: 19.4,
      waveHeightMeters: 2.1,
      currentKnots: 0.8,
      currentDirection: 'SE',
      fuelEstimateLiters: 242
    },
    {
      id: 'SEG-03',
      title: 'Segment 03: Iceberg A-017 Clearance Passage',
      startPoint: 'WP 02',
      endPoint: 'WP 03',
      distanceKm: 132.8,
      seaIceConcentration: 61,
      icebergRisk: 'MODERATE',
      windSpeedKnots: 18.0,
      waveHeightMeters: 1.8,
      currentKnots: 0.7,
      currentDirection: 'S',
      fuelEstimateLiters: 226
    },
    {
      id: 'SEG-04',
      title: 'Segment 04: Rothera Station Final Approach',
      startPoint: 'WP 03',
      endPoint: 'WP 04',
      distanceKm: 149.5,
      seaIceConcentration: 42,
      icebergRisk: 'LOW',
      windSpeedKnots: 14.5,
      waveHeightMeters: 1.2,
      currentKnots: 0.4,
      currentDirection: 'SW',
      fuelEstimateLiters: 234
    }
  ],
  proximityAlert: {
    severity: 'WARNING',
    icebergId: 'A-017',
    icebergName: 'Iceberg A-017',
    closestApproachKm: 18.4,
    estimatedTimeToCpaHours: 14.3,
    riskCategory: 'MODERATE',
    coordinates: [-63.15, -56.80],
    message: 'Iceberg A-017 is projected to approach the recommended route within 18.4 km in approximately 14 hours 20 minutes.'
  }
};

export const MOCK_TIMELINE = [
  {
    step: 'NOW',
    timeHours: 0,
    label: 'Departure from Station',
    lat: -64.82,
    lon: -58.25,
    seaIce: 38,
    weather: 'Wind 15 kn · -8.4°C',
    icebergRisk: 'LOW',
    fuelConsumedLiters: 0
  },
  {
    step: '+6 HOURS',
    timeHours: 6,
    label: 'Entering Bransfield Channel',
    lat: -65.25,
    lon: -59.70,
    seaIce: 46,
    weather: 'Wind 17 kn · -9.1°C',
    icebergRisk: 'LOW',
    fuelConsumedLiters: 165
  },
  {
    step: '+12 HOURS',
    timeHours: 12,
    label: 'Marginal Ice Zone Transit',
    lat: -65.85,
    lon: -62.10,
    seaIce: 55,
    weather: 'Wind 20 kn · -10.5°C',
    icebergRisk: 'MODERATE',
    fuelConsumedLiters: 335
  },
  {
    step: '+24 HOURS',
    timeHours: 24,
    label: 'Clearing A-017 Drift Corridor',
    lat: -66.70,
    lon: -65.40,
    seaIce: 59,
    weather: 'Wind 18 kn · -11.2°C',
    icebergRisk: 'MODERATE',
    fuelConsumedLiters: 670
  },
  {
    step: '+31.4 HOURS',
    timeHours: 31.4,
    label: 'Rothera Station Anchorage',
    lat: -67.57,
    lon: -68.13,
    seaIce: 42,
    weather: 'Wind 14 kn · -8.0°C',
    icebergRisk: 'LOW',
    fuelConsumedLiters: 870
  }
];

export const MOCK_SYSTEM_STATUS = {
  status: 'ONLINE',
  timestamp: '2026-09-14T12:00:00Z',
  demo_mode: true,
  components: {
    api: { status: 'ONLINE', latencyMs: 14 },
    database: { status: 'ONLINE', pool: 'HEALTHY' },
    seaIceModel: { status: 'READY', version: 'v1.0.4', engine: 'RandomForestRegressor' },
    icebergModel: { status: 'READY', version: 'v1.2.1', engine: 'LagrangianDriftModel' },
    routingEngine: { status: 'READY', version: 'v2.1', engine: 'ParetoAStar' }
  },
  dataSources: {
    seaIce: { source: 'Copernicus Sentinel-1 SAR & AMSR2 (25km Resolution)', lastUpdated: '18 min ago', mode: 'SYNTHETIC_DEMO' },
    icebergs: { source: 'BYU Antarctic Iceberg Tracking Database v8.0 & NIC/Scatterometers (ascat, qscat, ers, sass)', lastUpdated: '34 min ago', mode: 'SYNTHETIC_DEMO' },
    ocean: { source: 'HYCOM Global Ocean Hydrodynamic Current Vectors', lastUpdated: '1 hr ago', mode: 'SYNTHETIC_DEMO' },
    weather: { source: 'ECMWF Integrated Forecasting System Synoptic Grid', lastUpdated: '25 min ago', mode: 'SYNTHETIC_DEMO' }
  },
  telemetry: {
    seaIceAverage: 72.4,
    icebergsTracked: 184,
    vesselsActive: 3,
    activeAlerts: 2,
    dataAgeMinutes: 18
  }
};

export const MOCK_MODELS = [
  {
    id: 'iceberg-persistence-model',
    name: 'BYU v8.0 Iceberg Trajectory Forecasting (Persistence Velocity Engine)',
    type: 'Kinematic Persistence Velocity Vector Model with Velocity Lag Features',
    version: 'v2.0.0 (Reference Benchmark Default)',
    target: 'Multi-horizon future position coordinates across 24h, 72h, and 168h',
    features: [
      'Origin timestamp & BYU Consolidated Database v8.0 observations',
      'Velocity lat/lon degrees per hour (most recent observed track)',
      'Sensor priority arbitration: ascat > qscat > oscat > seawinds > ers > nscat > sass > nic',
      'Domain heuristic risk score: 0.6 * density_score + 0.4 * speed_score (50km radius count)',
      '10.0 km safety separation buffer threshold for encounter detection'
    ],
    metrics: {
      '24h Test Median Error': '0.00 km (N = 76,624 held-out test rows)',
      '72h Test Median Error': '0.00 km (N = 75,303 held-out test rows)',
      '168h Test Median Error': '2.76 km (N = 80,483 held-out test rows)',
      'RF Regressor 24h': '0.40 km (Comparative ML Baseline)'
    },
    trainingPeriod: 'BYU Consolidated Database v8.0 (1978 – 2024)',
    confidenceEstimate: 94,
    status: 'OPERATIONAL (DEFAULT)'
  },
  {
    id: 'sea-ice-forecast',
    name: 'Antarctic Sea-Ice Concentration Regressor',
    type: 'Spatiotemporal Random Forest & Gradient Boosted Ensemble',
    version: 'v1.0.4',
    target: 'Sea-ice concentration % at 25km grid resolution',
    features: [
      'Historical 14-day sea-ice concentration lag',
      'Sea surface temperature (SST)',
      '10-meter wind velocity vectors (U, V)',
      'Near-surface air temperature (T2M)',
      'Ocean mixed layer current velocities',
      'Solar declination and day of polar year',
      'Geographic latitude, longitude, and bathymetry'
    ],
    metrics: {
      mae: '3.42%',
      rmse: '4.81%',
      r2: '0.914',
      sampleCount: '1,420,000 grid points'
    },
    trainingPeriod: '2012 – 2025 Polar Seasons',
    confidenceEstimate: 87,
    status: 'OPERATIONAL'
  }
];

