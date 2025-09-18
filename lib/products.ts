const productCache = new Map();

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  description: string;
  specifications?: string[];
  sizes: string[];
  colors: string[];
  inStock: boolean;
  featured: boolean;
  topRated: boolean;
  sale: boolean;
  brand: string;
  rating: number;
  reviewCount: number;
  sourceUrl?: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "1 Pack Ryze Mushroom Coffee Organic 30 Servings | Fast Free Shipping USA",
    price: 5.5,
    originalPrice: 19.99,
    image: "https://i.ebayimg.com/images/g/LQAAAOSw~xhoT7l-/s-l1600.webp",
    images: [
      "https://i.ebayimg.com/images/g/LQAAAOSw~xhoT7l-/s-l1600.webp",
      "https://i.ebayimg.com/images/g/CasAAOSwVTdoT7l-/s-l1600.webp",
    ],
    category: "health-beauty",
    description:
      "Organic mushroom coffee blend with Lion's Mane, Chaga, Reishi, and Shiitake mushrooms. Boosts energy and focus naturally with less caffeine than regular coffee. 30 servings per pack with organic certification.",
    specifications: [
      "30 servings per pack",
      "Organic certified",
      "Contains adaptogens",
      "Less than 50 calories per serving",
      "180g item weight",
      "Coffee flavor",
    ],
    sizes: ["180g"],
    colors: ["Natural"],
    inStock: true,
    featured: true,
    topRated: true,
    sale: true,
    brand: "Ryze",
    rating: 4.8,
    reviewCount: 326,
    sourceUrl: "https://www.ebay.com/itm/177019011014",
  },
  {
    id: "2",
    name: "Wilson Evolution 29.5 Inch Indoor Game Basketball - Black",
    price: 22,
    originalPrice: 44.21,
    image: "https://i.ebayimg.com/images/g/Qe8AAOSwh4BePBHy/s-l960.webp",
    category: "sports-recreation",
    description:
      "Premium Wilson Evolution basketball designed for indoor game play. Features superior grip and control for competitive basketball games. Official 29.5 inch size with excellent durability.",
    specifications: [
      "29.5 inch official size",
      "Indoor game basketball",
      "Superior grip technology",
      "Professional quality",
      "Weight: 1.45lbs",
      "Model: wtb0516r",
    ],
    sizes: ["29.5 inch"],
    colors: ["Black", "Orange"],
    inStock: true,
    featured: true,
    topRated: true,
    sale: true,
    brand: "Wilson",
    rating: 4.8,
    reviewCount: 49,
    sourceUrl: "https://www.ebay.com/itm/406195052543",
  },
  {
    id: "3",
    name: "South Beach All-In-One Anti-Aging Treatment, 2.54oz – Firming & Hydrating Care",
    price: 13,
    originalPrice: 29.5,
    image: "https://i.ebayimg.com/images/g/B5gAAeSwGwhoowr0/s-l1600.webp",
    images: [
      "https://i.ebayimg.com/images/g/B5gAAeSwGwhoowr0/s-l1600.webp",
      "https://i.ebayimg.com/images/g/BDwAAeSwi1Joowr-/s-l1600.webp",
    ],
    category: "health-beauty",
    description:
      "Advanced all-in-one anti-aging treatment that targets multiple signs of aging. Reduces fine lines, wrinkles, and improves skin texture for firming and hydrating care. Suitable for all skin types.",
    specifications: [
      "2.54oz tube",
      "All-in-one formula",
      "Suitable for all skin types",
      "Firming & hydrating",
      "Expiration: September 2026",
      "Made in United States",
    ],
    sizes: ["2.54oz"],
    colors: ["White"],
    inStock: true,
    featured: false,
    topRated: true,
    sale: true,
    brand: "South Beach",
    rating: 4.2,
    reviewCount: 85,
    sourceUrl: "https://www.ebay.com/itm/388917384745",
  },
  {
    id: "4",
    name: "LA MER THE TREATMENT LOTION 5 oz FULL SIZE - New Sealed Bottle Authentic &Fresh",
    price: 18,
    originalPrice: 121.99,
    image: "https://i.ebayimg.com/images/g/89IAAOSwktxmJtdt/s-l1600.webp",
    images: [
      "https://i.ebayimg.com/images/g/89IAAOSwktxmJtdt/s-l1600.webp",
      "https://i.ebayimg.com/images/g/RE4AAOSwylRkELZZ/s-l1600.webp",
    ],
    category: "health-beauty",
    description:
      "Luxury La Mer Treatment Lotion that prepares skin for deeper hydration and transformation. Contains the legendary Miracle Broth for optimal skincare results. Perfect for use before moisturizers.",
    specifications: [
      "5 fl oz full size",
      "Miracle Broth formula",
      "Treatment lotion",
      "New sealed bottle",
      "Weight: 0.7 pounds",
      "Authentic & fresh",
    ],
    sizes: ["5oz"],
    colors: ["Clear"],
    inStock: true,
    featured: true,
    topRated: true,
    sale: true,
    brand: "La Mer",
    rating: 5.0,
    reviewCount: 18,
    sourceUrl: "https://www.ebay.com/itm/196359086415",
  },
  {
    id: "5",
    name: "La Mer The Hydrating Infused Emulsion 4.2oz / 125ml | NEW OPEN BOX (Retail $290)",
    price: 22,
    originalPrice: 290,
    image: "https://i.ebayimg.com/images/g/gbEAAOSwOQVoOe5s/s-l1600.webp",
    images: [
      "https://i.ebayimg.com/images/g/gbEAAOSwOQVoOe5s/s-l1600.webp",
      "https://i.ebayimg.com/images/g/2RoAAeSw~FZobBag/s-l1600.webp",
      "https://i.ebayimg.com/images/g/5KwAAeSw1sJobBaa/s-l1600.webp",
      "https://i.ebayimg.com/images/g/UGkAAeSwQ6FobBaT/s-l1600.webp",
    ],
    category: "health-beauty",
    description:
      "La Mer's lightweight hydrating emulsion that delivers deep moisture while feeling weightless on skin. Perfect for day and night use with advanced hydrating technology.",
    specifications: [
      "4.2oz / 125ml",
      "Hydrating infused emulsion",
      "Day & night treatment",
      "New open box condition",
      "Retail value $290",
      "Decollete and face area",
    ],
    sizes: ["125ml"],
    colors: ["White"],
    inStock: true,
    featured: false,
    topRated: true,
    sale: true,
    brand: "La Mer",
    rating: 4.6,
    reviewCount: 178,
    sourceUrl: "https://www.ebay.com/itm/127219424656",
  },
  {
    id: "6",
    name: "La Mer halo Serum New With Box",
    price: 19,
    originalPrice: 58.99,
    image: "https://i.ebayimg.com/images/g/ujwAAeSwr7BoudyL/s-l1600.webp",
    category: "health-beauty",
    description:
      "La Mer's advanced halo serum with age-defying and hydrating properties. Perfect for addressing wrinkles and providing deep hydration to face, neck, and body.",
    specifications: [
      "1 fl oz",
      "Age-defying formula",
      "Hydration & wrinkle treatment",
      "All skin types",
      "24M PAO",
      "Oil formulation",
    ],
    sizes: ["1oz"],
    colors: ["Clear"],
    inStock: true,
    featured: false,
    topRated: false,
    sale: true,
    brand: "La Mer",
    rating: 4.5,
    reviewCount: 92,
    sourceUrl: "https://www.ebay.com/itm/267391332247",
  },
  {
    id: "7",
    name: "La Mer The Concentrate 1.7 oz / 50ml - New in Box",
    price: 17,
    originalPrice: 42,
    image: "https://i.ebayimg.com/images/g/-EIAAeSw2pZoZWLd/s-l1600.webp",
    images: [
      "https://i.ebayimg.com/images/g/-EIAAeSw2pZoZWLd/s-l1600.webp",
      "https://i.ebayimg.com/images/g/cqQAAeSwTfhoZWLd/s-l1600.webp",
      "https://i.ebayimg.com/images/g/9YUAAeSwihJoZWLd/s-l1600.webp",
      "https://i.ebayimg.com/images/g/6SkAAeSwJDBoZWLd/s-l1600.webp",
    ],
    category: "health-beauty",
    description:
      "La Mer's intensive concentrate serum designed for hydration, lifting, and skin firming. Helps reduce wrinkles while providing deep nourishment for face and neck.",
    specifications: [
      "1.7 fl oz / 50ml",
      "Concentrate serum",
      "Hydration & lifting",
      "Skin firming",
      "24M PAO",
      "All skin types",
    ],
    sizes: ["50ml"],
    colors: ["Clear"],
    inStock: true,
    featured: false,
    topRated: true,
    sale: false,
    brand: "La Mer",
    rating: 5.0,
    reviewCount: 6,
    sourceUrl: "https://www.ebay.com/itm/317049081659",
  },
  {
    id: "8",
    name: "La Mer The Eye Concentrate 0.5oz/15ml / New in Box / Free Shipping USA",
    price: 16,
    originalPrice: 34.2,
    image: "https://i.ebayimg.com/images/g/RxwAAOSwqpxoXTw2/s-l1600.webp",
    images: [
      "https://i.ebayimg.com/images/g/RxwAAOSwqpxoXTw2/s-l1600.webp",
      "https://i.ebayimg.com/images/g/xkUAAOSwN1RoXTw3/s-l1600.webp",
      "https://i.ebayimg.com/images/g/YQkAAOSwtP5oXTw2/s-l1600.webp",
      "https://i.ebayimg.com/images/g/KH8AAOSwGk9oXTw3/s-l1600.webp",
      "https://i.ebayimg.com/images/g/d1wAAOSwPT9oXTw2/s-l1600.webp",
      "https://i.ebayimg.com/images/g/vXgAAOSw36xoXTw3/s-l1600.webp",
    ],
    category: "health-beauty",
    description:
      "Specialized La Mer eye concentrate that targets hydration, dark circles, wrinkles, puffiness, and firming around the delicate eye area. Includes firming and hydrating properties with massager.",
    specifications: [
      "0.5oz / 15ml",
      "Eye concentrate",
      "Hydration & dark circles",
      "Anti-puffiness",
      "Includes massager",
      "12M PAO",
    ],
    sizes: ["15ml"],
    colors: ["White"],
    inStock: true,
    featured: false,
    topRated: false,
    sale: false,
    brand: "La Mer",
    rating: 5.0,
    reviewCount: 13,
    sourceUrl: "https://www.ebay.com/itm/177224545871",
  },
  {
    id: "9",
    name: "La Mer Creme The La Mer The Moisturizing Cream 3.4oz/100ml New Sealed",
    price: 18,
    originalPrice: 39.99,
    image: "https://i.ebayimg.com/images/g/-zUAAOSwuCtoXVkP/s-l1600.webp",
    images: [
      "https://i.ebayimg.com/images/g/-zUAAOSwuCtoXVkP/s-l1600.webp",
      "https://i.ebayimg.com/images/g/BnoAAOSwkzVoXVkZ/s-l1600.webp",
      "https://i.ebayimg.com/images/g/llsAAOSwhWtoXVkU/s-l1600.webp",
    ],
    category: "health-beauty",
    description:
      "The iconic La Mer moisturizing cream in generous 100ml size. Features Miracle Broth technology and shea butter for ultimate hydration and anti-aging benefits. Perfect for maintaining luxury skincare routine.",
    specifications: [
      "3.4oz / 100ml",
      "Moisturizing cream",
      "Miracle Broth technology",
      "Contains shea butter",
      "12M PAO",
      "All natural ingredients",
    ],
    sizes: ["100ml"],
    colors: ["White"],
    inStock: true,
    featured: true,
    topRated: true,
    sale: false,
    brand: "La Mer",
    rating: 4.8,
    reviewCount: 203,
    sourceUrl: "https://www.ebay.com/itm/365694756236",
  },

  // Tools & Equipment Products
  {
    id: "10",
    name: 'Fieldpiece HR3B Ball Valve Refrigerant Hose Set (3) with Color Tags - 1/4" x 1/4" (5\')',
    price: 89.99,
    originalPrice: 119.99,
    image: "https://m.media-amazon.com/images/I/51gLDoEnPiL._AC_SL1024_.jpg",
    images: ["https://m.media-amazon.com/images/I/51gLDoEnPiL._AC_SL1024_.jpg"],
    category: "tools-equipment",
    description:
      'Professional refrigerant hose set with ball valves and color-coded tags. Features three 5-foot hoses with 1/4" connections for HVAC and refrigeration work. Includes color tags for easy identification.',
    specifications: [
      "Set of 3 hoses",
      "5 feet long each",
      '1/4" x 1/4" connections',
      "Ball valve design",
      "Color-coded tags included",
      "Professional grade",
    ],
    sizes: ["5ft"],
    colors: ["Multi-color"],
    inStock: true,
    featured: false,
    topRated: true,
    sale: true,
    brand: "Fieldpiece",
    rating: 4.6,
    reviewCount: 87,
  },
  {
    id: "11",
    name: 'Mitutoyo 500-197-30 Electronic Digital Caliper AOS Absolute Scale Digital Caliper, 0 to 8"/0 to 200mm Measuring Range, 0.0005"/0.01mm Resolution',
    price: 159.99,
    originalPrice: 199.99,
    image: "https://m.media-amazon.com/images/I/61Gigoh3LbL._SX522_.jpg",
    images: ["https://m.media-amazon.com/images/I/61Gigoh3LbL._SX522_.jpg"],
    category: "tools-equipment",
    description:
      'Precision electronic digital caliper with absolute scale technology. Features 8-inch measuring range with 0.0005" resolution for accurate measurements. Professional-grade tool for machining and engineering.',
    specifications: [
      '0 to 8" / 0 to 200mm range',
      '0.0005" / 0.01mm resolution',
      "AOS Absolute Scale",
      "Electronic digital display",
      "Stainless steel construction",
      "Professional grade",
    ],
    sizes: ["8 inch"],
    colors: ["Silver"],
    inStock: true,
    featured: true,
    topRated: true,
    sale: true,
    brand: "Mitutoyo",
    rating: 4.9,
    reviewCount: 156,
  },
  {
    id: "12",
    name: 'Mitutoyo America 500-196-30 Digimatic Caliper Without Output, 6" Range, 1" Height, 1" Wide, 1" Length, Borosilicate Glass',
    price: 139.99,
    originalPrice: 169.99,
    image: "https://m.media-amazon.com/images/I/51xWvMGm2IL._SX522_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/51xWvMGm2IL._SX522_.jpg",
      "https://m.media-amazon.com/images/I/41Qa1jZ0dqL._SX522_.jpg",
      "https://m.media-amazon.com/images/I/51nhPRbYptL.jpg",
      "https://m.media-amazon.com/images/I/51rh+FOLysL.jpg",
    ],
    category: "tools-equipment",
    description:
      "Precision Digimatic caliper with 6-inch measuring range. Features high-quality construction and accurate measurements for professional applications. Ideal for machining, engineering, and quality control.",
    specifications: [
      "6 inch measuring range",
      "Digital display",
      "No data output",
      "Borosilicate glass scale",
      "Stainless steel construction",
      "Professional precision tool",
    ],
    sizes: ["6 inch"],
    colors: ["Silver"],
    inStock: true,
    featured: false,
    topRated: true,
    sale: true,
    brand: "Mitutoyo",
    rating: 4.8,
    reviewCount: 134,
  },

  // Automotive Products
  {
    id: "13",
    name: "Can-Am OEM Clutch Drive Belt, 422280366",
    price: 85.99,
    originalPrice: 109.99,
    image: "https://i.ebayimg.com/images/g/nzgAAeSwLSFouq6a/s-l1600.webp",
    images: [
      "https://i.ebayimg.com/images/g/nzgAAeSwLSFouq6a/s-l1600.webp",
      "https://i.ebayimg.com/images/g/CrIAAeSwo9houq6f/s-l1600.webp",
      "https://i.ebayimg.com/images/g/pZAAAeSwCpRouq6k/s-l1600.webp",
    ],
    category: "automotive",
    description:
      "Genuine Can-Am OEM clutch drive belt designed for optimal performance and durability. Part number 422280366 ensures perfect fit and reliable operation for your Can-Am vehicle.",
    specifications: [
      "OEM part number 422280366",
      "Genuine Can-Am part",
      "High-performance belt",
      "Durable construction",
      "Perfect fit guaranteed",
      "Factory specifications",
    ],
    sizes: ["Standard"],
    colors: ["Black"],
    inStock: true,
    featured: false,
    topRated: true,
    sale: true,
    brand: "Can-Am",
    rating: 4.7,
    reviewCount: 89,
  },
  {
    id: "14",
    name: "Can-Am 422280367 Clutch Drive Belt 2013-2020 Maverick Commander Max 1000R DPS",
    price: 92.99,
    originalPrice: 119.99,
    image: "https://i.ebayimg.com/images/g/0nMAAeSw07NoY1PG/s-l1600.webp",
    images: ["https://i.ebayimg.com/images/g/0nMAAeSw07NoY1PG/s-l1600.webp"],
    category: "automotive",
    description:
      "OEM Can-Am clutch drive belt for 2013-2020 Maverick Commander Max 1000R DPS models. Part number 422280367 ensures compatibility and performance for your specific vehicle model.",
    specifications: [
      "Part number 422280367",
      "Fits 2013-2020 models",
      "Maverick Commander Max compatible",
      "1000R DPS specific",
      "OEM quality construction",
      "Direct replacement part",
    ],
    sizes: ["Standard"],
    colors: ["Black"],
    inStock: true,
    featured: false,
    topRated: true,
    sale: true,
    brand: "Can-Am",
    rating: 4.6,
    reviewCount: 76,
  },
  {
    id: "15",
    name: "Drive Belt Of Can-Am Premium High-Performance for Maverick/Defender 422280656",
    price: 98.99,
    originalPrice: 129.99,
    image: "https://i.ebayimg.com/images/g/y2IAAeSww1VolZU-/s-l1600.webp",
    images: [
      "https://i.ebayimg.com/images/g/y2IAAeSww1VolZU-/s-l1600.webp",
      "https://i.ebayimg.com/images/g/a1cAAeSwiCxolZU-/s-l1600.webp",
    ],
    category: "automotive",
    description:
      "Premium high-performance drive belt designed for Can-Am Maverick and Defender models. Part number 422280656 delivers enhanced durability and performance for demanding applications.",
    specifications: [
      "Part number 422280656",
      "Premium high-performance",
      "Maverick/Defender compatible",
      "Enhanced durability",
      "Superior heat resistance",
      "Professional grade belt",
    ],
    sizes: ["Standard"],
    colors: ["Black"],
    inStock: true,
    featured: true,
    topRated: true,
    sale: true,
    brand: "Can-Am",
    rating: 4.8,
    reviewCount: 112,
  },
  {
    id: "16",
    name: "Can-Am OEM 100% PBO Performance Drive Belt Maverick X3, 422280652",
    price: 125.99,
    originalPrice: 159.99,
    image: "https://i.ebayimg.com/images/g/3d0AAeSwdQhodUYD/s-l1600.webp",
    images: [
      "https://i.ebayimg.com/images/g/3d0AAeSwdQhodUYD/s-l1600.webp",
      "https://i.ebayimg.com/images/g/PRoAAeSwojZodUYD/s-l1600.webp",
    ],
    category: "automotive",
    description:
      "Premium 100% PBO (Polybenzoxazole) performance drive belt for Can-Am Maverick X3. Part number 422280652 delivers exceptional strength and heat resistance for extreme performance applications.",
    specifications: [
      "100% PBO construction",
      "Part number 422280652",
      "Maverick X3 specific",
      "Extreme heat resistance",
      "Superior strength",
      "Performance grade belt",
    ],
    sizes: ["Standard"],
    colors: ["Black"],
    inStock: true,
    featured: true,
    topRated: true,
    sale: true,
    brand: "Can-Am",
    rating: 4.9,
    reviewCount: 145,
  },

  // Sports & Recreation Products
  {
    id: "17",
    name: "Molten Standard Volleyball Size 5 Competition Train Students Volleyball V5M4500",
    price: 32.99,
    originalPrice: 44.99,
    image: "https://i.ebayimg.com/images/g/bIwAAOSwoPRmzsLT/s-l1600.webp",
    images: [
      "https://i.ebayimg.com/images/g/bIwAAOSwoPRmzsLT/s-l1600.webp",
      "https://i.ebayimg.com/images/g/zUQAAOSwz5BmzsLS/s-l1600.webp",
    ],
    category: "sports-recreation",
    description:
      "Official size 5 Molten volleyball designed for competition and training. Features durable construction perfect for students and recreational players. Meets official volleyball specifications.",
    specifications: [
      "Official size 5",
      "Competition grade",
      "Training suitable",
      "Student appropriate",
      "Durable construction",
      "Official specifications",
    ],
    sizes: ["Size 5"],
    colors: ["Multi-color"],
    inStock: true,
    featured: false,
    topRated: true,
    sale: true,
    brand: "Molten",
    rating: 4.5,
    reviewCount: 98,
  },
  {
    id: "18",
    name: "Molten V5M5000 Volleyball Size 5, Soft Touch, Indoor/Outdoor PU Microfiber Ball",
    price: 38.99,
    originalPrice: 52.99,
    image: "https://i.ebayimg.com/images/g/vEsAAOSw66FmiYys/s-l1600.webp",
    images: [
      "https://i.ebayimg.com/images/g/vEsAAOSw66FmiYys/s-l1600.webp",
      "https://i.ebayimg.com/images/g/USUAAOSw52FmiYys/s-l1600.webp",
    ],
    category: "sports-recreation",
    description:
      "Premium Molten volleyball with soft-touch PU microfiber surface. Size 5 ball suitable for both indoor and outdoor play. Features excellent grip and durability for all skill levels.",
    specifications: [
      "Size 5 volleyball",
      "Soft-touch surface",
      "PU microfiber construction",
      "Indoor/outdoor use",
      "Excellent grip",
      "All skill levels",
    ],
    sizes: ["Size 5"],
    colors: ["Multi-color"],
    inStock: true,
    featured: true,
    topRated: true,
    sale: true,
    brand: "Molten",
    rating: 4.7,
    reviewCount: 127,
  },
  {
    id: "19",
    name: "Molten Flistatec USAV V5M5000-3USA Volleyball",
    price: 45.99,
    originalPrice: 64.99,
    image:
      "https://i5.walmartimages.com/seo/Molten-Flistatec-USAV-V5M5000-3USA-Volleyball_8d2f11ec-73fc-41ab-bd5a-e6494ca9e055.181830366359dfdbd32996ba727ffb1a.jpeg?odnHeight=573&odnWidth=573&odnBg=FFFFFF",
    images: [
      "https://i5.walmartimages.com/seo/Molten-Flistatec-USAV-V5M5000-3USA-Volleyball_8d2f11ec-73fc-41ab-bd5a-e6494ca9e055.181830366359dfdbd32996ba727ffb1a.jpeg?odnHeight=573&odnWidth=573&odnBg=FFFFFF",
    ],
    category: "sports-recreation",
    description:
      "Official USAV approved Molten Flistatec volleyball. Features advanced flight stability technology for consistent performance. Perfect for competitive play and official tournaments.",
    specifications: [
      "USAV approved",
      "Flistatec technology",
      "Flight stability",
      "Tournament grade",
      "Competitive play",
      "Official specifications",
    ],
    sizes: ["Official Size"],
    colors: ["Red/White/Blue"],
    inStock: true,
    featured: true,
    topRated: true,
    sale: true,
    brand: "Molten",
    rating: 4.8,
    reviewCount: 156,
  },
];

// Helper functions
export const getProductById = (id: string): Product | undefined => {
  const cacheKey = `product-${id}`;
  if (!productCache.has(cacheKey)) {
    productCache.set(
      cacheKey,
      products.find((product) => product.id === id)
    );
  }
  return productCache.get(cacheKey);
};

// Memoized product filters for better performance
export const getProductsByCategory = (category: string): Product[] => {
  const cacheKey = `category-${category}`;
  if (!productCache.has(cacheKey)) {
    productCache.set(
      cacheKey,
      products.filter((product) => product.category === category)
    );
  }
  return productCache.get(cacheKey);
};

export const getFeaturedProducts = (): Product[] => {
  if (!productCache.has("featured")) {
    productCache.set(
      "featured",
      products.filter((product) => product.featured)
    );
  }
  return productCache.get("featured");
};

export const getTopRatedProducts = (): Product[] => {
  if (!productCache.has("topRated")) {
    productCache.set(
      "topRated",
      products.filter((product) => product.topRated)
    );
  }
  return productCache.get("topRated");
};

export const getSaleProducts = (): Product[] => {
  if (!productCache.has("sale")) {
    productCache.set(
      "sale",
      products.filter((product) => product.sale)
    );
  }
  return productCache.get("sale");
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery) ||
      product.brand.toLowerCase().includes(lowercaseQuery) ||
      (product.specifications &&
        product.specifications.some((spec) =>
          spec.toLowerCase().includes(lowercaseQuery)
        ))
  );
};

export const categories = [
  {
    id: "health-beauty",
    name: "Health & Beauty",
    count: products.filter((p) => p.category === "health-beauty").length,
    icon: "💄",
    description: "Premium skincare, anti-aging treatments, and health products",
  },
  {
    id: "sports-recreation",
    name: "Sports & Recreation",
    count: products.filter((p) => p.category === "sports-recreation").length,
    icon: "🏀",
    description: "Professional sports equipment and recreational gear",
  },
  {
    id: "tools-equipment",
    name: "Tools & Equipment",
    count: products.filter((p) => p.category === "tools-equipment").length,
    icon: "🔧",
    description:
      "Professional tools, measuring equipment, and precision instruments",
  },
  {
    id: "automotive",
    name: "Automotive",
    count: products.filter((p) => p.category === "automotive").length,
    icon: "🚗",
    description: "Auto parts, drive belts, and automotive accessories",
  },
];

// Get products by brand
export const getProductsByBrand = (brand: string): Product[] => {
  const cacheKey = `brand-${brand}`;
  if (!productCache.has(cacheKey)) {
    productCache.set(
      cacheKey,
      products.filter(
        (product) => product.brand.toLowerCase() === brand.toLowerCase()
      )
    );
  }
  return productCache.get(cacheKey);
};

// Get all brands
export const getAllBrands = (): string[] => {
  if (!productCache.has("allBrands")) {
    const brands = Array.from(
      new Set(products.map((product) => product.brand))
    ).sort();
    productCache.set("allBrands", brands);
  }
  return productCache.get("allBrands");
};

// Get price range
export const getPriceRange = () => {
  if (!productCache.has("priceRange")) {
    const prices = products.map((product) => product.price);
    const range = {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
    productCache.set("priceRange", range);
  }
  return productCache.get("priceRange");
};
