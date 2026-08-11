export type PropertyType = "plot" | "apartment" | "villa" | "farmhouse" | "agriculture_land" | "rent" | "commercial" | "independent_house"
export type PropertyStatus = "available" | "sold" | "upcoming" | "expired"
export type ListingPurpose = "sale" | "rent" | "pg"
export type FurnishingStatus = "unfurnished" | "semi-furnished" | "fully-furnished"
export type ConstructionStatus = "ready-to-move" | "under-construction" | "new-launch"
export type FacingDirection = "north" | "south" | "east" | "west" | "north-east" | "north-west" | "south-east" | "south-west"
export type TenantType = "family" | "bachelors" | "any"

export interface Property {
  id: string
  title: string
  type: PropertyType
  price: number
  priceUnit: string
  fullAddress: string
  location?: string
  city: string
  area: number
  areaUnit: string
  bedrooms?: number
  bathrooms?: number
  description: string
  features: string[]
  images: string[]
  brochureUrl?: string
  metadata?: Record<string, any>
  status: PropertyStatus
  isActive?: boolean
  postedById?: string
  createdAt: string
  updatedAt: string
  // New fields
  listingPurpose?: ListingPurpose
  isVerified?: boolean
  viewCount?: number
  expiresAt?: string
  furnishing?: FurnishingStatus
  constructionStatus?: ConstructionStatus
  propertyAge?: string
  floor?: number
  totalFloors?: number
  balconies?: number
  parking?: number
  facing?: FacingDirection
  plotDimensions?: string
  soilType?: string
  roadWidth?: string
  gatedCommunity?: boolean
  waterSource?: boolean
  electricityStatus?: boolean
  ownerName?: string
  ownerPhone?: string
  ownerEmail?: string
  monthlyRent?: number
  securityDeposit?: number
  maintenanceCharge?: number
  maxPrice?: number
  tenantType?: TenantType
}

// ─── Filter Option Arrays ────────────────────────────────────

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "plot", label: "Plot" },
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "farmhouse", label: "Farmhouse" },
  { value: "agriculture_land", label: "Agriculture Land" },
  { value: "rent", label: "Rent" },
  { value: "commercial", label: "Commercial" },
  { value: "independent_house", label: "Independent House" },
]

export const PROPERTY_STATUSES: { value: PropertyStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "sold", label: "Sold" },
  { value: "upcoming", label: "Upcoming" },
]

export const LISTING_PURPOSE_OPTIONS: { value: string; label: string }[] = [
  { value: "sale", label: "For Sale" },
  { value: "rent", label: "For Rent" },
  { value: "pg", label: "PG / Co-Living" },
]

export const BHK_OPTIONS: { value: string; label: string }[] = [
  { value: "1", label: "1 BHK" },
  { value: "2", label: "2 BHK" },
  { value: "3", label: "3 BHK" },
  { value: "4", label: "4 BHK" },
  { value: "5", label: "5+ BHK" },
]

export const FURNISHING_OPTIONS: { value: string; label: string }[] = [
  { value: "unfurnished", label: "Unfurnished" },
  { value: "semi-furnished", label: "Semi-Furnished" },
  { value: "fully-furnished", label: "Fully Furnished" },
]

export const CONSTRUCTION_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "ready-to-move", label: "Ready to Move" },
  { value: "under-construction", label: "Under Construction" },
  { value: "new-launch", label: "New Launch" },
]

export const PROPERTY_AGE_OPTIONS: { value: string; label: string }[] = [
  { value: "less-than-1", label: "Less than 1 year" },
  { value: "1-to-5", label: "1–5 years" },
  { value: "5-to-10", label: "5–10 years" },
  { value: "more-than-10", label: "More than 10 years" },
]

export const FACING_OPTIONS: { value: string; label: string }[] = [
  { value: "north", label: "North" },
  { value: "south", label: "South" },
  { value: "east", label: "East" },
  { value: "west", label: "West" },
  { value: "north-east", label: "North-East" },
  { value: "north-west", label: "North-West" },
  { value: "south-east", label: "South-East" },
  { value: "south-west", label: "South-West" },
]

export const SOIL_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "Red Soil", label: "Red Soil" },
  { value: "Black Soil", label: "Black Soil" },
  { value: "Alluvial", label: "Alluvial" },
  { value: "Clay", label: "Clay" },
  { value: "Laterite", label: "Laterite" },
  { value: "Sandy", label: "Sandy" },
]

export const ROAD_WIDTH_OPTIONS: { value: string; label: string }[] = [
  { value: "20ft", label: "20 ft" },
  { value: "30ft", label: "30 ft" },
  { value: "40ft", label: "40 ft" },
  { value: "60ft", label: "60 ft" },
  { value: "80ft", label: "80 ft" },
]

export const PARKING_OPTIONS: { value: string; label: string }[] = [
  { value: "0", label: "No Parking" },
  { value: "1", label: "1 Parking" },
  { value: "2", label: "2 Parking" },
  { value: "3", label: "3+ Parking" },
]

export const TENANT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "family", label: "Family" },
  { value: "bachelors", label: "Bachelors" },
  { value: "any", label: "Any" },
]

export const FLOOR_OPTIONS: { value: string; label: string }[] = [
  { value: "ground", label: "Ground Floor" },
  { value: "1-3", label: "1-3 Floor" },
  { value: "4-7", label: "4-7 Floor" },
  { value: "8-15", label: "8-15 Floor" },
  { value: "16+", label: "16+ Floor" },
]

export const PRICE_RANGE_PRESETS: { label: string; min: number; max: number }[] = [
  { label: "Under ₹20L", min: 0, max: 2000000 },
  { label: "₹20L – ₹50L", min: 2000000, max: 5000000 },
  { label: "₹50L – ₹1Cr", min: 5000000, max: 10000000 },
  { label: "₹1Cr – ₹3Cr", min: 10000000, max: 30000000 },
  { label: "₹3Cr – ₹5Cr", min: 30000000, max: 50000000 },
  { label: "Above ₹5Cr", min: 50000000, max: Infinity },
]

// ─── Cities & Locations ──────────────────────────────────────

export const CITIES = [
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Delhi",
  "Gurgaon",
  "Noida",
  "Ahmedabad",
  "Kolkata",
]

export const CITY_LOCATIONS: Record<string, string[]> = {
  "Bangalore": ["Whitefield", "Sarjapur Road", "Electronic City", "Hebbal", "Kanakapura Road", "Yelahanka", "HSR Layout", "Indiranagar"],
  "Mumbai": ["Bandra West", "Worli", "Andheri East", "Juhu", "Powai", "South Mumbai", "Thane", "Navi Mumbai"],
  "Hyderabad": ["Jubilee Hills", "Banjara Hills", "Gachibowli", "HITEC City", "Kondapur", "Tellapur", "Shamshabad", "Medchal"],
  "Chennai": ["ECR", "OMR", "Adyar", "Anna Nagar", "T Nagar", "Velachery", "Guindy", "Besant Nagar"],
  "Pune": ["Koregaon Park", "Hinjewadi", "Kothrud", "Baner", "Viman Nagar", "Wakad", "Hadapsar", "Kharadi"],
  "Delhi": ["Vasant Kunj", "Hauz Khas", "Saket", "Greater Kailash", "Chanakyapuri", "Dwarka", "Rohini", "Connaught Place"],
  "Gurgaon": ["Golf Course Road", "DLF Phase 1", "DLF Phase 5", "Sohna Road", "Sector 56", "MG Road"],
  "Noida": ["Sector 150", "Sector 50", "Sector 62", "Greater Noida", "Noida Extension"],
}

// ─── Common Features per Property Type ───────────────────────

export const COMMON_FEATURES: Record<string, string[]> = {
  "plot": ["Corner Plot", "East Facing", "West Facing", "Gated Community", "Underground Drainage", "Electricity Connection", "Water Connection", "Security Wall", "DTCP Approved", "HMDA Approved", "Park Nearby", "Metro Connectivity"],
  "apartment": ["Modular Kitchen", "Gymnasium", "Swimming Pool", "Power Backup", "Clubhouse", "Children's Play Area", "CCTV Surveillance", "Lifts", "Parking", "Intercom", "Rainwater Harvesting", "Fire Safety", "Jogging Track", "Indoor Games"],
  "villa": ["Private Pool", "Private Garden", "Servant Quarters", "Home Automation", "Modular Kitchen", "Home Theater", "Solar Panels", "24/7 Security", "Rooftop Terrace", "Double-Height Living", "Wine Cellar", "EV Charging"],
  "farmhouse": ["Borewell", "Fenced", "Landscape Garden", "Road Access", "Water Source", "Fruit Trees", "Caretaker Room", "Guest House", "Outdoor Kitchen", "Horse Stable"],
  "agriculture_land": ["Borewell", "Road Access", "River/Canal Near", "Fenced", "Electricity", "Crop Ready", "Water Pump", "Drip Irrigation", "Farm House", "Storage Shed"],
  "rent": ["Modular Kitchen", "Air Conditioning", "Power Backup", "Parking", "Lift", "Security", "Gym", "Swimming Pool", "Furnished", "Semi-Furnished", "Pet Friendly", "Geyser", "Washing Machine", "Wi-Fi"],
  "commercial": ["Central AC", "Power Backup", "Lift", "Fire Safety", "Parking", "Conference Room", "Reception Area", "Pantry", "Server Room", "24/7 Access", "CCTV", "Security Guard"],
  "independent_house": ["Modular Kitchen", "Car Parking", "Garden", "Terrace", "Bore Well", "Rainwater Harvesting", "Solar Panel", "Security System", "Store Room", "Servant Quarter", "Power Backup"],
}

// ─── Helpers ─────────────────────────────────────────────────

export function formatPrice(price: number, maxPrice?: number): string {
  const format = (p: number) => {
    if (p >= 10000000) {
      return `${(p / 10000000).toFixed(2)} Cr`
    }
    if (p >= 100000) {
      return `${(p / 100000).toFixed(2)} L`
    }
    return p.toLocaleString("en-IN")
  }

  if (maxPrice && maxPrice > price) {
    return `${format(price)} - ${format(maxPrice)}`
  }
  return format(price)
}

export function generateId(): string {
  return `prop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// ─── Type-specific filter config ─────────────────────────────

export interface TypeFilterConfig {
  bhk?: boolean
  furnishing?: boolean
  constructionStatus?: boolean
  propertyAge?: boolean
  floor?: boolean
  parking?: boolean
  balconies?: boolean
  facing?: boolean
  plotDimensions?: boolean
  soilType?: boolean
  roadWidth?: boolean
  gatedCommunity?: boolean
  waterSource?: boolean
  electricityStatus?: boolean
  priceRange?: boolean
  areaRange?: boolean
  tenantType?: boolean
}

export const TYPE_FILTER_CONFIG: Record<string, TypeFilterConfig> = {
  apartment: { bhk: true, furnishing: true, constructionStatus: true, propertyAge: true, floor: true, parking: true, balconies: true, facing: true, priceRange: true, areaRange: true },
  villa: { bhk: true, furnishing: true, constructionStatus: true, propertyAge: true, parking: true, facing: true, gatedCommunity: true, priceRange: true, areaRange: true },
  rent: { bhk: true, furnishing: true, floor: true, parking: true, balconies: true, facing: true, tenantType: true, priceRange: true, areaRange: true },
  independent_house: { bhk: true, furnishing: true, constructionStatus: true, propertyAge: true, parking: true, facing: true, gatedCommunity: true, priceRange: true, areaRange: true },
  plot: { facing: true, gatedCommunity: true, roadWidth: true, plotDimensions: true, priceRange: true, areaRange: true },
  farmhouse: { bhk: true, facing: true, waterSource: true, roadWidth: true, gatedCommunity: true, priceRange: true, areaRange: true },
  agriculture_land: { soilType: true, waterSource: true, electricityStatus: true, roadWidth: true, priceRange: true, areaRange: true },
  commercial: { furnishing: true, constructionStatus: true, floor: true, parking: true, priceRange: true, areaRange: true },
}

// ─── Seed Properties ─────────────────────────────────────────

export const SEED_PROPERTIES: Property[] = [
  {
    id: "prop_001",
    title: "Emerald Heights Villa",
    type: "villa",
    price: 25000000,
    maxPrice: 30000000,
    priceUnit: "total",
    fullAddress: "Whitefield, Bangalore",
    location: "Whitefield",
    city: "Bangalore",
    area: 4500,
    areaUnit: "sq ft",
    bedrooms: 4,
    bathrooms: 4,
    description:
      "A luxurious 4BHK villa in the heart of Whitefield with modern architecture, a private pool, landscaped garden, and smart home automation.",
    features: [
      "Private Swimming Pool",
      "Smart Home Automation",
      "Home Theater",
      "Modular Kitchen",
      "24/7 Security",
      "Clubhouse Access",
      "Landscaped Garden",
      "Covered Parking for 2 Cars",
    ],
    images: ["/images/properties/villa-1.jpg"],
    brochureUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status: "available",
    furnishing: "fully-furnished",
    constructionStatus: "ready-to-move",
    facing: "east",
    parking: 2,
    gatedCommunity: true,
    isVerified: true,
    createdAt: "2025-12-01T10:00:00Z",
    updatedAt: "2025-12-01T10:00:00Z",
  },
  {
    id: "prop_002",
    title: "Royal Palms Villa",
    type: "villa",
    price: 35000000,
    priceUnit: "total",
    fullAddress: "Jubilee Hills, Hyderabad",
    location: "Jubilee Hills",
    city: "Hyderabad",
    area: 6000,
    areaUnit: "sq ft",
    bedrooms: 5,
    bathrooms: 6,
    description:
      "An opulent 5BHK villa in the prestigious Jubilee Hills locality.",
    features: [
      "Double-Height Living Room",
      "Wine Cellar",
      "Panoramic Terrace",
      "Italian Marble",
      "Golf Putting Green",
      "Gym & Spa",
      "Servant Quarters",
      "EV Charging Station",
    ],
    images: ["/images/properties/villa-2.jpg"],
    brochureUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status: "available",
    furnishing: "fully-furnished",
    constructionStatus: "ready-to-move",
    facing: "north",
    parking: 3,
    gatedCommunity: true,
    isVerified: true,
    createdAt: "2025-11-15T10:00:00Z",
    updatedAt: "2025-11-15T10:00:00Z",
  },
  {
    id: "prop_003",
    title: "Skyline Residency 3BHK",
    type: "apartment",
    price: 12000000,
    priceUnit: "total",
    fullAddress: "Bandra West, Mumbai",
    location: "Bandra West",
    city: "Mumbai",
    area: 1800,
    areaUnit: "sq ft",
    bedrooms: 3,
    bathrooms: 3,
    description:
      "A premium 3BHK apartment on the 22nd floor offering breathtaking sea views.",
    features: [
      "Sea View",
      "Infinity Pool",
      "Sky Lounge",
      "Designer Interiors",
      "High-Speed Elevators",
      "Power Backup",
      "Visitor Parking",
      "Concierge Service",
    ],
    images: ["/images/properties/apartment-1.jpg"],
    brochureUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status: "available",
    furnishing: "semi-furnished",
    constructionStatus: "ready-to-move",
    floor: 22,
    totalFloors: 35,
    balconies: 2,
    parking: 2,
    facing: "west",
    isVerified: true,
    createdAt: "2025-10-20T10:00:00Z",
    updatedAt: "2025-10-20T10:00:00Z",
  },
  {
    id: "prop_004",
    title: "Park View Apartments 2BHK",
    type: "apartment",
    price: 7500000,
    priceUnit: "total",
    fullAddress: "Koregaon Park, Pune",
    location: "Koregaon Park",
    city: "Pune",
    area: 1200,
    areaUnit: "sq ft",
    bedrooms: 2,
    bathrooms: 2,
    description:
      "A beautifully designed 2BHK apartment overlooking the lush green park.",
    features: [
      "Park Facing",
      "Modular Kitchen",
      "Gymnasium",
      "Children's Play Area",
      "Jogging Track",
      "CCTV Surveillance",
      "Rainwater Harvesting",
      "Earthquake Resistant",
    ],
    images: ["/images/properties/apartment-2.jpg"],
    brochureUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status: "available",
    furnishing: "semi-furnished",
    constructionStatus: "ready-to-move",
    floor: 8,
    totalFloors: 16,
    balconies: 1,
    parking: 1,
    facing: "east",
    createdAt: "2025-09-10T10:00:00Z",
    updatedAt: "2025-09-10T10:00:00Z",
  },
  {
    id: "prop_005",
    title: "Sunrise Heights 4BHK",
    type: "apartment",
    price: 18500000,
    priceUnit: "total",
    fullAddress: "Golf Course Road, Gurgaon",
    location: "Golf Course Road",
    city: "Gurgaon",
    area: 3200,
    areaUnit: "sq ft",
    bedrooms: 4,
    bathrooms: 4,
    description:
      "A spacious luxury penthouse apartment on Golf Course Road with a private terrace garden.",
    features: [
      "Private Terrace Garden",
      "Golf Course View",
      "Private Elevator Lobby",
      "Imported Marble",
      "Central Air Conditioning",
      "Swimming Pool",
      "Business Center",
      "Multi-Level Parking",
    ],
    images: ["/images/properties/apartment-1.jpg"],
    brochureUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status: "sold",
    furnishing: "fully-furnished",
    constructionStatus: "ready-to-move",
    floor: 32,
    totalFloors: 35,
    balconies: 3,
    parking: 2,
    facing: "north-east",
    isVerified: true,
    createdAt: "2025-08-05T10:00:00Z",
    updatedAt: "2025-08-05T10:00:00Z",
  },
  {
    id: "prop_006",
    title: "Green Valley Plot - East",
    type: "plot",
    price: 5500000,
    maxPrice: 6500000,
    priceUnit: "total",
    fullAddress: "Shamshabad, Hyderabad",
    location: "Shamshabad",
    city: "Hyderabad",
    area: 2400,
    areaUnit: "sq ft",
    description:
      "A prime east-facing residential plot in the rapidly developing Shamshabad area near the international airport.",
    features: [
      "East Facing",
      "DTCP Approved",
      "Wide 40ft Roads",
      "Underground Drainage",
      "Avenue Plantation",
      "Near Airport",
      "Gated Community",
      "24/7 Water Supply",
    ],
    images: ["/images/properties/plot-1.jpg"],
    brochureUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status: "available",
    facing: "east",
    gatedCommunity: true,
    roadWidth: "40ft",
    plotDimensions: "40x60",
    isVerified: true,
    createdAt: "2025-11-01T10:00:00Z",
    updatedAt: "2025-11-01T10:00:00Z",
  },
  {
    id: "prop_007",
    title: "Lakeview Premium Plot",
    type: "plot",
    price: 8000000,
    priceUnit: "total",
    fullAddress: "Sarjapur Road, Bangalore",
    location: "Sarjapur Road",
    city: "Bangalore",
    area: 3600,
    areaUnit: "sq ft",
    description:
      "An exclusive corner plot with lake view in a premium gated community on Sarjapur Road.",
    features: [
      "Corner Plot",
      "Lake View",
      "BDA Approved",
      "60ft Main Road Access",
      "Clubhouse",
      "Swimming Pool",
      "Central Park",
      "Underground Cabling",
    ],
    images: ["/images/properties/plot-2.jpg"],
    brochureUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status: "available",
    facing: "north-west",
    gatedCommunity: true,
    roadWidth: "60ft",
    plotDimensions: "60x60",
    createdAt: "2025-10-01T10:00:00Z",
    updatedAt: "2025-10-01T10:00:00Z",
  },
  {
    id: "prop_008",
    title: "Metro Edge Plot",
    type: "plot",
    price: 3200000,
    priceUnit: "total",
    fullAddress: "Medchal, Hyderabad",
    location: "Medchal",
    city: "Hyderabad",
    area: 1600,
    areaUnit: "sq ft",
    description:
      "A budget-friendly residential plot near the upcoming metro station in Medchal.",
    features: [
      "Near Metro Station",
      "HMDA Approved",
      "30ft Roads",
      "Street Lighting",
      "Water Connection",
      "Electricity Available",
      "Park Nearby",
      "School Proximity",
    ],
    images: ["/images/properties/plot-1.jpg"],
    brochureUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status: "upcoming",
    facing: "south",
    roadWidth: "30ft",
    plotDimensions: "40x40",
    createdAt: "2025-12-10T10:00:00Z",
    updatedAt: "2025-12-10T10:00:00Z",
  },
  {
    id: "prop_009",
    title: "Coastal Breeze Villa",
    type: "villa",
    price: 42000000,
    priceUnit: "total",
    fullAddress: "ECR, Chennai",
    location: "ECR",
    city: "Chennai",
    area: 5500,
    areaUnit: "sq ft",
    bedrooms: 5,
    bathrooms: 5,
    description:
      "A stunning beachfront villa on East Coast Road with direct beach access.",
    features: [
      "Beachfront Property",
      "Infinity Pool",
      "Rooftop Deck",
      "Ocean View",
      "Architect Designed",
      "Solar Panels",
      "Backup Generator",
      "Private Beach Access",
    ],
    images: ["/images/properties/villa-2.jpg"],
    brochureUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status: "sold",
    furnishing: "fully-furnished",
    constructionStatus: "ready-to-move",
    facing: "east",
    parking: 3,
    gatedCommunity: true,
    isVerified: true,
    createdAt: "2025-07-20T10:00:00Z",
    updatedAt: "2025-07-20T10:00:00Z",
  },
  {
    id: "prop_010",
    title: "Urban Nest 1BHK Studio",
    type: "apartment",
    price: 4500000,
    priceUnit: "total",
    fullAddress: "Hinjewadi, Pune",
    location: "Hinjewadi",
    city: "Pune",
    area: 650,
    areaUnit: "sq ft",
    bedrooms: 1,
    bathrooms: 1,
    description:
      "A compact yet elegant 1BHK studio apartment in the IT hub of Hinjewadi. Perfect for young professionals.",
    features: [
      "IT Hub Location",
      "Co-Working Space",
      "Fitted Kitchen",
      "Built-in Wardrobe",
      "Rooftop Garden",
      "EV Charging",
      "High-Speed Internet",
      "Shuttle Service",
    ],
    images: ["/images/properties/apartment-2.jpg"],
    brochureUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status: "available",
    furnishing: "fully-furnished",
    constructionStatus: "ready-to-move",
    floor: 5,
    totalFloors: 12,
    balconies: 1,
    parking: 1,
    createdAt: "2025-11-25T10:00:00Z",
    updatedAt: "2025-11-25T10:00:00Z",
  },
  {
    id: "prop_011",
    title: "Heritage Haveli Plot",
    type: "plot",
    price: 12000000,
    priceUnit: "total",
    fullAddress: "Sector 50, Noida",
    location: "Sector 50",
    city: "Noida",
    area: 4800,
    areaUnit: "sq ft",
    description:
      "A premium residential plot in Sector 50, Noida, surrounded by established residential colonies.",
    features: [
      "Noida Authority Approved",
      "Near Expressway",
      "80ft Wide Road",
      "Metro Connectivity",
      "Mall Proximity",
      "Hospital Nearby",
      "Established Area",
      "Clear Title",
    ],
    images: ["/images/properties/plot-2.jpg"],
    brochureUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status: "available",
    facing: "north",
    roadWidth: "80ft",
    plotDimensions: "60x80",
    gatedCommunity: false,
    isVerified: true,
    createdAt: "2025-09-01T10:00:00Z",
    updatedAt: "2025-09-01T10:00:00Z",
  },
  {
    id: "prop_012",
    title: "Cloud9 Penthouse",
    type: "apartment",
    price: 32000000,
    priceUnit: "total",
    fullAddress: "Worli, Mumbai",
    location: "Worli",
    city: "Mumbai",
    area: 4000,
    areaUnit: "sq ft",
    bedrooms: 4,
    bathrooms: 5,
    description:
      "An ultra-luxury duplex penthouse in the iconic Worli skyline.",
    features: [
      "Duplex Layout",
      "Private Rooftop Pool",
      "360-Degree Views",
      "Personal Elevator",
      "Italian Finishes",
      "Home Automation",
      "Valet Parking",
      "Helipad Access",
    ],
    images: ["/images/properties/apartment-1.jpg"],
    brochureUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status: "upcoming",
    furnishing: "unfurnished",
    constructionStatus: "under-construction",
    floor: 42,
    totalFloors: 45,
    balconies: 4,
    parking: 3,
    facing: "west",
    isVerified: true,
    createdAt: "2025-12-15T10:00:00Z",
    updatedAt: "2025-12-15T10:00:00Z",
  },
  // ── New: Rental Property ──
  {
    id: "prop_013",
    title: "Modern 2BHK Rental in HSR Layout",
    type: "rent",
    price: 35000,
    priceUnit: "month",
    fullAddress: "HSR Layout, Bangalore",
    location: "HSR Layout",
    city: "Bangalore",
    area: 1100,
    areaUnit: "sq ft",
    bedrooms: 2,
    bathrooms: 2,
    description:
      "A well-maintained 2BHK apartment available for rent in HSR Layout with modern amenities, close to tech parks.",
    features: [
      "Semi-Furnished",
      "Power Backup",
      "Lift",
      "CCTV",
      "Gym",
      "Parking",
      "Pet Friendly",
      "Geyser",
    ],
    images: ["/images/properties/apartment-2.jpg"],
    status: "available",
    listingPurpose: "rent",
    furnishing: "semi-furnished",
    floor: 3,
    totalFloors: 5,
    balconies: 1,
    parking: 1,
    facing: "east",
    ownerName: "Rajesh Kumar",
    ownerPhone: "+91-9876543210",
    ownerEmail: "rajesh.kumar@example.com",
    monthlyRent: 35000,
    securityDeposit: 200000,
    maintenanceCharge: 3000,
    createdAt: "2025-12-20T10:00:00Z",
    updatedAt: "2025-12-20T10:00:00Z",
  },
  // ── New: Commercial Property ──
  {
    id: "prop_014",
    title: "Premium Office Space in HITEC City",
    type: "commercial",
    price: 15000000,
    priceUnit: "total",
    fullAddress: "HITEC City, Hyderabad",
    location: "HITEC City",
    city: "Hyderabad",
    area: 2500,
    areaUnit: "sq ft",
    description:
      "A grade-A office space in the heart of HITEC City with modern infrastructure, ideal for IT companies and startups.",
    features: [
      "Central AC",
      "Power Backup",
      "Lift",
      "Fire Safety",
      "Parking",
      "Conference Room",
      "Pantry",
      "24/7 Access",
    ],
    images: ["/images/properties/apartment-1.jpg"],
    status: "available",
    furnishing: "fully-furnished",
    constructionStatus: "ready-to-move",
    floor: 5,
    totalFloors: 12,
    parking: 5,
    isVerified: true,
    createdAt: "2025-12-18T10:00:00Z",
    updatedAt: "2025-12-18T10:00:00Z",
  },
  // ── New: Agriculture Land ──
  {
    id: "prop_015",
    title: "Fertile Agriculture Land in Shamshabad",
    type: "agriculture_land",
    price: 8000000,
    priceUnit: "total",
    fullAddress: "Shamshabad, Hyderabad",
    location: "Shamshabad",
    city: "Hyderabad",
    area: 43560,
    areaUnit: "sq ft",
    description:
      "1 acre of fertile agriculture land with borewell, road access, and electricity. Ideal for farming or farmhouse construction.",
    features: [
      "Borewell",
      "Road Access",
      "Electricity",
      "Fenced",
      "Crop Ready",
      "Water Pump",
      "Near Highway",
    ],
    images: ["/images/properties/plot-1.jpg"],
    status: "available",
    soilType: "Black Soil",
    waterSource: true,
    electricityStatus: true,
    roadWidth: "30ft",
    isVerified: true,
    createdAt: "2025-12-22T10:00:00Z",
    updatedAt: "2025-12-22T10:00:00Z",
  },
]
