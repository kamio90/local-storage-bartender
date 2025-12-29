import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#D4AF37',
    secondary: '#8B4513',
    background: '#F5F5F5',
    surface: '#FFFFFF',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#D4AF37',
    secondary: '#A0522D',
    background: '#121212',
    surface: '#1E1E1E',
  },
};
