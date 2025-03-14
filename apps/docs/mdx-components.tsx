import { useMDXComponents as getThemeComponents } from "nextra-theme-docs"; // nextra-theme-blog or your custom theme

const themeComponents = getThemeComponents();

// Merge components
export function useMDXComponents(components: Record<string, unknown>) {
  return {
    ...themeComponents,
    ...components,
  };
}
