export type Menu = {
  id: number;
  title?: string; // Optional for backward compatibility
  titleKey?: string; // For translation keys
  path?: string;
  newTab: boolean;
  submenu?: Menu[];
};
