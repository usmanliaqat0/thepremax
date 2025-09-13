// Product data with real shirts and perfumes

// Cache for memoized results
const productCache = new Map();

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  featured: boolean;
  topRated: boolean;
  sale: boolean;
}

export const products: Product[] = [
  // Shirts - Prices converted to Pakistani Rupees (PKR)
  {
    id: "1",
    name: "Secret Wars",
    price: 8400,
    originalPrice: 9800,
    image: "/assets/secret-garden-tee.jpg",
    category: "shirts",
    description:
      "Epic superhero design featuring iconic characters from the Secret Wars storyline. Premium cotton blend for ultimate comfort.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Navy", "White"],
    inStock: true,
    featured: true,
    topRated: true,
    sale: true,
  },
  {
    id: "2",
    name: "Kakashi V",
    price: 8400,
    image: "/assets/urban-warrior-tee.jpg",
    category: "shirts",
    description:
      "Naruto's legendary Copy Ninja in an stunning artistic design. Perfect for anime enthusiasts and collectors.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Charcoal", "Navy"],
    inStock: true,
    featured: true,
    topRated: true,
    sale: false,
  },
  {
    id: "3",
    name: "Vegito",
    price: 8400,
    image: "/assets/cosmic-dreams-tee.jpg",
    category: "shirts",
    description:
      "Dragon Ball Z's ultimate fusion warrior in an epic artistic representation. High-quality print on premium fabric.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Orange", "Blue", "Black"],
    inStock: true,
    featured: false,
    topRated: true,
    sale: false,
  },
  {
    id: "4",
    name: "One Piece III",
    price: 8400,
    image: "/assets/one-piece-tee.jpg",
    category: "shirts",
    description:
      "Adventure awaits with this One Piece inspired design featuring Luffy and the Straw Hat crew.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Red", "Blue", "Black"],
    inStock: true,
    featured: true,
    topRated: false,
    sale: false,
  },
  {
    id: "5",
    name: "Transformers",
    price: 8400,
    image: "/assets/transformers-tee.jpg",
    category: "shirts",
    description:
      "Autobots roll out! Classic Transformers design with Optimus Prime and Bumblebee.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Blue", "Red", "Black"],
    inStock: true,
    featured: false,
    topRated: false,
    sale: false,
  },
  {
    id: "6",
    name: "Need For Speed",
    price: 8400,
    image: "/assets/nfs-tee.jpg",
    category: "shirts",
    description:
      "For speed enthusiasts! Need for Speed inspired design with racing elements.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "White", "Red"],
    inStock: true,
    featured: false,
    topRated: true,
    sale: false,
  },
  {
    id: "7",
    name: "Superman",
    price: 8400,
    image: "/assets/superman-tee.jpg",
    category: "shirts",
    description:
      "Man of Steel design featuring the iconic Superman logo in a modern artistic style.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Blue", "Red", "Black"],
    inStock: true,
    featured: true,
    topRated: false,
    sale: false,
  },
  {
    id: "8",
    name: "Assassin's Creed",
    price: 8400,
    image: "/assets/assassins-creed-tee.jpg",
    category: "shirts",
    description:
      "Nothing is true, everything is permitted. Assassin's Creed eagle symbol design.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "White", "Charcoal"],
    inStock: true,
    featured: false,
    topRated: true,
    sale: false,
  },

  // Perfumes - Luxury fragrances
  {
    id: "9",
    name: "Flames & Passion",
    price: 4200,
    originalPrice: 4900,
    image: "/assets/flames-passion-perfume.jpg",
    category: "perfumes",
    description:
      "A fiery and passionate fragrance with notes of amber, musk, and exotic spices. Perfect for evening wear.",
    sizes: ["50ml", "100ml"],
    colors: ["Amber"],
    inStock: true,
    featured: true,
    topRated: true,
    sale: true,
  },
  {
    id: "10",
    name: "Janan Vanilla",
    price: 3500,
    image: "/assets/janan-vanilla-perfume.jpg",
    category: "perfumes",
    description:
      "Sweet and sophisticated vanilla-based fragrance with hints of caramel and sandalwood.",
    sizes: ["50ml", "100ml"],
    colors: ["Gold"],
    inStock: true,
    featured: true,
    topRated: false,
    sale: false,
  },
  {
    id: "11",
    name: "Black Musk",
    price: 4900,
    image: "/assets/black-musk-perfume.jpg",
    category: "perfumes",
    description:
      "Deep and mysterious black musk fragrance with notes of oud and cedar. A signature scent for confident individuals.",
    sizes: ["50ml", "100ml"],
    colors: ["Black"],
    inStock: true,
    featured: false,
    topRated: true,
    sale: false,
  },
  {
    id: "12",
    name: "Janan Tobacco",
    price: 4200,
    image: "/assets/janan-tobacco-perfume.jpg",
    category: "perfumes",
    description:
      "Rich tobacco fragrance blended with vanilla and spices. A warm and inviting scent for cooler days.",
    sizes: ["50ml", "100ml"],
    colors: ["Brown"],
    inStock: true,
    featured: true,
    topRated: false,
    sale: false,
  },
  {
    id: "13",
    name: "Dark Star",
    price: 5600,
    image: "/assets/dark-star-perfume.jpg",
    category: "perfumes",
    description:
      "Celestial-inspired fragrance with notes of bergamot, jasmine, and midnight flowers. Mysterious and alluring.",
    sizes: ["50ml", "100ml"],
    colors: ["Dark Blue"],
    inStock: true,
    featured: false,
    topRated: true,
    sale: false,
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
      product.category.toLowerCase().includes(lowercaseQuery)
  );
};

export const categories = [
  {
    id: "shirts",
    name: "Shirts",
    count: products.filter((p) => p.category === "shirts").length,
  },
  {
    id: "perfumes",
    name: "Perfumes",
    count: products.filter((p) => p.category === "perfumes").length,
  },
];
