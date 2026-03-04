import { doculetTheme } from './doculet';
import type { Theme } from './types';

export const themes: Record<string, Theme> = {
  doculet: doculetTheme,
};

export function getTheme(name: string): Theme {
  return themes[name] ?? doculetTheme;
}

export const defaultTheme = doculetTheme;
