export interface Category {
  value: string;
  displayName: string;
}

export const categories: Category[] = [
  { value: "all", displayName: "All Services" },
  { value: "cleaning", displayName: "Home Cleaning" },
  { value: "repairs", displayName: "Handyman Services" },
  { value: "moving", displayName: "Moving & Hauling" },
  { value: "delivery", displayName: "Delivery & Errands" },
  { value: "painting", displayName: "Painting Services" },
  { value: "assembly", displayName: "Assembly Services" },
  { value: "marketing", displayName: "Marketing Services" },
  { value: "other", displayName: "Other" },
];

export const getCategoryDisplayName = (value: string): string => {
  const category = categories.find(cat => cat.value === value);
  return category ? category.displayName : value;
};