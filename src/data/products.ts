export interface Product {
  id: string;
  slug?: string;
  name: string;
  category: string;
  categoryId?: number;
  categoryName?: string;
  categoryIcon?: string;
  rentPrice: number;
  rentUnit: string;
  buyPrice: number;
  image: string;
  images?: string[];
  description: string;
  specs: string[];
  features: string[];
  benefits?: string[];
  specifications?: string[];
  priceType?: string;
  topSelling?: boolean;
  displayOrder?: number;
  available: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  slug?: string;
  image?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export const categories: Category[] = [
  { id: "hospital-beds", name: "Hospital Beds", icon: "🛏️", count: 12 },
  { id: "wheelchairs", name: "Wheelchairs", icon: "♿", count: 8 },
  { id: "oxygen-equipment", name: "Oxygen Equipment", icon: "💨", count: 10 },
  { id: "patient-monitors", name: "Patient Monitors", icon: "📊", count: 6 },
  { id: "walkers", name: "Walkers & Crutches", icon: "🚶", count: 9 },
  { id: "icu-setup", name: "ICU at Home", icon: "🏥", count: 5 },
  { id: "commode-chairs", name: "Commode Chairs", icon: "🪑", count: 7 },
  { id: "air-mattress", name: "Air Mattresses", icon: "🛌", count: 4 },
  { id: "bipap-cpap", name: "BiPAP / CPAP", icon: "😮‍💨", count: 6 },
  { id: "suction-machines", name: "Suction Machines", icon: "⚙️", count: 3 },
  { id: "iv-stands", name: "IV Stands & Tables", icon: "💉", count: 5 },
  { id: "accessories", name: "Accessories", icon: "🧰", count: 15 },
];

export const products: Product[] = [
  {
    id: "semi-fowler-bed",
    name: "Semi Fowler Hospital Bed",
    category: "hospital-beds",
    rentPrice: 1800,
    rentUnit: "month",
    buyPrice: 18500,
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=300&fit=crop",
    description: "Premium semi-fowler hospital bed with adjustable backrest and knee rest. Ideal for home patient care with easy-to-use manual cranks.",
    specs: ["Adjustable backrest: 0-80°", "Knee rest adjustment", "Side railings included", "Castors with brakes", "Weight capacity: 150kg"],
    features: ["Easy manual operation", "Collapsible side rails", "IV pole holder", "Mattress included"],
    available: true,
  },
  {
    id: "fowler-bed-electric",
    name: "Full Fowler Electric Bed",
    category: "hospital-beds",
    rentPrice: 3500,
    rentUnit: "month",
    buyPrice: 45000,
    image: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400&h=300&fit=crop",
    description: "Fully electric hospital bed with remote control for backrest, knee rest, and height adjustment.",
    specs: ["Electric backrest: 0-85°", "Electric knee rest", "Height adjustable", "Battery backup", "Weight capacity: 200kg"],
    features: ["Remote controlled", "Trendelenburg position", "CPR release", "Anti-bacterial coating"],
    available: true,
  },
  {
    id: "standard-wheelchair",
    name: "Standard Wheelchair",
    category: "wheelchairs",
    rentPrice: 1000,
    rentUnit: "month",
    buyPrice: 5500,
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop",
    description: "Durable standard wheelchair with chrome-plated steel frame. Comfortable seating with armrests and footrests.",
    specs: ["Seat width: 18 inches", "Chrome steel frame", "Solid tyres", "Weight capacity: 100kg", "Foldable design"],
    features: ["Lightweight foldable", "Detachable footrests", "Comfortable armrests", "Easy to transport"],
    available: true,
  },
  {
    id: "oxygen-concentrator-5l",
    name: "Oxygen Concentrator 5L",
    category: "oxygen-equipment",
    rentPrice: 4500,
    rentUnit: "month",
    buyPrice: 42000,
    image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=300&fit=crop",
    description: "Medical-grade 5-liter oxygen concentrator for home use. Continuous flow with adjustable settings.",
    specs: ["Flow rate: 1-5 LPM", "Oxygen purity: 93% ± 3%", "Noise level: ≤45 dB", "Power: 350W", "Weight: 14kg"],
    features: ["Low noise operation", "Timer function", "Nebulizer connection", "Alarm system"],
    available: true,
  },
  {
    id: "walker-without-wheel",
    name: "Walker Without Wheels",
    category: "walkers",
    rentPrice: 550,
    rentUnit: "month",
    buyPrice: 2200,
    image: "https://images.unsplash.com/photo-1559757175-7cb057fba93c?w=400&h=300&fit=crop",
    description: "Standard aluminum walker for elderly and post-surgery patients. Lightweight and foldable.",
    specs: ["Height adjustable", "Aluminum frame", "Foldable", "Weight: 2.5kg", "Capacity: 100kg"],
    features: ["Anti-slip rubber tips", "Easy height adjustment", "Compact fold", "Comfortable grip"],
    available: true,
  },
  {
    id: "tripod-walking-stick",
    name: "Tripod Walking Stick",
    category: "walkers",
    rentPrice: 450,
    rentUnit: "month",
    buyPrice: 1600,
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=400&h=300&fit=crop",
    description:
      "Self-standing tripod walking stick with a broad three-pronged base for better balance, fall prevention, and stable home mobility support.",
    specs: [
      "Three-pronged self-standing base",
      "Height-adjustable shaft",
      "Reinforced aluminium body",
      "Anti-slip rubber tips",
      "Suitable for elderly and post-surgery support",
    ],
    features: [
      "Maximum base stability",
      "Broad-load support",
      "Dual-sided orientation",
      "Heavy-duty aluminium frame",
      "Non-slip floor grip",
    ],
    available: true,
  },
  {
    id: "patient-monitor",
    name: "Multi-Para Patient Monitor",
    category: "patient-monitors",
    rentPrice: 5000,
    rentUnit: "month",
    buyPrice: 55000,
    image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400&h=300&fit=crop",
    description: "5-parameter patient monitor tracking ECG, SpO2, NIBP, temperature, and respiration rate.",
    specs: ["12.1 inch display", "5 parameters", "Battery backup: 3hrs", "Alarm system", "Data storage"],
    features: ["Real-time monitoring", "Visual & audio alarms", "Trend analysis", "Portable design"],
    available: true,
  },
  {
    id: "bipap-machine",
    name: "BiPAP Machine",
    category: "bipap-cpap",
    rentPrice: 6000,
    rentUnit: "month",
    buyPrice: 65000,
    image: "https://images.unsplash.com/photo-1631815587646-b85a1bb027e1?w=400&h=300&fit=crop",
    description: "Advanced BiPAP machine for sleep apnea and respiratory support with humidifier.",
    specs: ["Pressure: 4-30 cmH2O", "Built-in humidifier", "Auto-titrating", "SD card data", "Quiet: ≤30 dB"],
    features: ["Auto pressure adjust", "Heated humidifier", "Mask leak compensation", "Ramp function"],
    available: true,
  },
  {
    id: "commode-chair",
    name: "Commode Chair with Wheels",
    category: "commode-chairs",
    rentPrice: 800,
    rentUnit: "month",
    buyPrice: 3800,
    image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&h=300&fit=crop",
    description: "Height-adjustable commode chair with wheels for easy mobility. Suitable for bedside use.",
    specs: ["Height adjustable", "Removable bucket", "Locking wheels", "Capacity: 120kg", "Armrests included"],
    features: ["Easy to clean", "Foldable design", "Padded seat", "Anti-tip wheels"],
    available: true,
  },
];

export const cities = [
  "Mumbai", "Pune", "Nashik", "Nagpur", "Thane",
  "Navi Mumbai", "Kolhapur", "Aurangabad", "Solapur", "Satara",
];
