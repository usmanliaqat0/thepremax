/**
 * ThePreMax Color Utilities
 * Centralized color management for consistent styling
 */

export const colorMap: Record<string, string> = {
  // Basic Colors
  Black: "#000000",
  White: "#ffffff",
  Red: "#dc2626",
  Blue: "#2563eb",
  Navy: "#1e3a8a",
  Gray: "#6b7280",
  Brown: "#92400e",

  // Fashion Colors
  "Forest Green": "#166534",
  Charcoal: "#374151",
  "Deep Purple": "#581c87",
  "Midnight Blue": "#1e1b4b",
  "Sunset Orange": "#fb923c",
  "Ocean Blue": "#0ea5e9",
  Seafoam: "#6ee7b7",
  "Slate Gray": "#64748b",
  "Neon Green": "#22c55e",
  "Electric Blue": "#3b82f6",
  Cream: "#fef3c7",
  "Soft Pink": "#f9a8d4",
  "Light Gray": "#e5e7eb",
  "Sage Green": "#84cc16",
  Terracotta: "#ea580c",
  Khaki: "#a3a3a3",
  Orange: "#ea580c",
  Gold: "#f59e0b",
  Amber: "#f59e0b",
  "Dark Blue": "#1e40af",
};

/**
 * Get color hex value from color name
 */
export const getColorValue = (colorName: string): string => {
  return colorMap[colorName] || "#6b7280";
};

/**
 * Get contrasting text color (black or white) for background color
 */
export const getContrastColor = (backgroundColor: string): string => {
  // Convert hex to RGB
  const hex = backgroundColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? "#000000" : "#ffffff";
};

/**
 * Fashion-specific color categories
 */
export const colorCategories = {
  neutral: ["Black", "White", "Gray", "Charcoal", "Light Gray", "Slate Gray"],
  earth: ["Brown", "Khaki", "Terracotta", "Cream", "Sage Green"],
  bold: ["Red", "Deep Purple", "Neon Green", "Electric Blue", "Sunset Orange"],
  ocean: ["Navy", "Ocean Blue", "Midnight Blue", "Seafoam", "Dark Blue"],
  warm: ["Gold", "Amber", "Orange", "Soft Pink", "Sunset Orange"],
} as const;

/**
 * Get color category for a color name
 */
export const getColorCategory = (
  colorName: string
): keyof typeof colorCategories | "other" => {
  for (const [category, colors] of Object.entries(colorCategories)) {
    if ((colors as readonly string[]).includes(colorName)) {
      return category as keyof typeof colorCategories;
    }
  }
  return "other";
};
