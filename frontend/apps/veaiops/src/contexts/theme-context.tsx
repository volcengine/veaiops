// Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. and/or its affiliates
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import type { ThemeConfig } from '@arco-design/web-react/es/ConfigProvider/interface';
import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

// Theme type definition
export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  themeConfig: ThemeConfig;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

// VE-O Design dark theme configuration
const darkThemeConfig: ThemeConfig = {
  token: {
    // VE-O Design base colors - dark theme
    colorBgBase: '#1a1a1a',
    colorTextBase: '#ffffff',
    colorBorder: '#3a3a3a',
    colorBgContainer: '#262626',
    colorPrimary: '#3370ff', // VE-O Design primary color

    // Table related colors
    colorBgElevated: '#262626',
    colorBorderSecondary: '#3a3a3a',
    colorFillSecondary: '#333333',
    colorFillTertiary: '#262626',
    colorFillQuaternary: '#1a1a1a',

    // Text colors
    colorTextSecondary: '#bfbfbf',
    colorTextTertiary: '#8c8c8c',
    colorTextQuaternary: '#595959',

    // VE-O Design status colors
    colorSuccess: '#00b42a',
    colorWarning: '#ff7d00',
    colorError: '#f53f3f',
    colorInfo: '#3370ff',

    // Hover and active states
    colorBgTextHover: '#333333',
    colorBgTextActive: '#3a3a3a',

    // VE-O Design specific colors
    colorLink: '#3370ff',
    colorLinkHover: '#4080ff',
    colorLinkActive: '#2c5aa0',
  },
};

// VE-O Design light theme configuration
const lightThemeConfig: ThemeConfig = {
  token: {
    // VE-O Design base colors - light theme
    colorBgBase: '#ffffff',
    colorTextBase: '#1d2129',
    colorBorder: '#e5e6eb',
    colorBgContainer: '#ffffff',
    colorPrimary: '#3370ff', // VE-O Design primary color

    // Table related colors
    colorBgElevated: '#ffffff',
    colorBorderSecondary: '#e5e6eb',
    colorFillSecondary: '#f7f8fa',
    colorFillTertiary: '#ffffff',
    colorFillQuaternary: '#f2f3f5',

    // Text colors
    colorTextSecondary: '#4e5969',
    colorTextTertiary: '#86909c',
    colorTextQuaternary: '#c9cdd4',

    // VE-O Design status colors
    colorSuccess: '#00b42a',
    colorWarning: '#ff7d00',
    colorError: '#f53f3f',
    colorInfo: '#3370ff',

    // Hover and active states
    colorBgTextHover: '#f7f8fa',
    colorBgTextActive: '#f2f3f5',

    // VE-O Design specific colors
    colorLink: '#3370ff',
    colorLinkHover: '#4080ff',
    colorLinkActive: '#2c5aa0',
  },
};

// Create theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    // Read saved theme from sessionStorage, default to light theme
    const savedTheme = sessionStorage.getItem('theme') as ThemeMode;
    return savedTheme || 'light';
  });

  // Get current theme configuration
  const themeConfig = theme === 'dark' ? darkThemeConfig : lightThemeConfig;

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Set theme
  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    sessionStorage.setItem('theme', newTheme);

    // Update HTML root element's data-theme attribute for CSS variable switching
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Set theme on initialization
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    themeConfig,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// Hook for using theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
