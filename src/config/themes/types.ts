export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface SemanticTokens {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
  success: string;
  warning: string;
}

export interface Theme {
  name: string;
  displayName: string;
  description: string;

  colors: {
    primary: ColorScale;
    neutral: ColorScale;
    success: Partial<ColorScale>;
    warning: Partial<ColorScale>;
    destructive: Partial<ColorScale>;
    accent: Partial<ColorScale>;
  };

  light: SemanticTokens;
  dark: SemanticTokens;

  fonts: {
    sans: string;
    serif: string;
    mono: string;
  };

  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    full: string;
  };

  shadows: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };

  duration: {
    micro: string;
    fast: string;
    normal: string;
    slow: string;
    slower: string;
  };

  layout: {
    sidebarWidth: string;
    headerHeight: string;
    contentMaxWidth: string;
  };
}
