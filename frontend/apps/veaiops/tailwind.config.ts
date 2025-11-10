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

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', '../../packages/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#1890ff',
          700: '#096dd9',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: '#096dd9',
        accent: '#40a9ff',
        background: '#ffffff',
        foreground: '#0f1419',
        surface: '#1a1f2e',
        surfaceLight: '#252b3b',
        text: '#ffffff',
        textSecondary: '#94a3b8',
        border: '#e5e7eb',
        ring: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        muted: {
          DEFAULT: '#f9fafb',
          foreground: '#6b7280',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#0f1419',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#0f1419',
        },
        input: '#ffffff',
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
      },
      width: {
        // Percentage width classes
        p20: '24.00%',
        p21: '24.00%',
        p22: '24.2%',
        p23: '24.3%',
        p24: '24.4%',
        p25: '24.5%',
        p50: '50%',
        p90: '90%',
        // Fixed pixel width classes
        '30': '30px',
        '40': '40px',
        '650': '650px',
        // Special width classes
        'default-control': 'inherit',
        'min-content': 'min-content',
      },
      animation: {
        'sidebar-collapse': 'sidebarCollapse 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'sidebar-expand': 'sidebarExpand 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'menu-item-fade-in': 'menuItemFadeIn 0.2s ease-in-out 0.1s',
        'menu-item-fade-out': 'menuItemFadeOut 0.2s ease-in-out',
      },
      keyframes: {
        sidebarCollapse: {
          '0%': { width: '240px' },
          '100%': { width: '64px' },
        },
        sidebarExpand: {
          '0%': { width: '64px' },
          '100%': { width: '240px' },
        },
        menuItemFadeIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        menuItemFadeOut: {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(-10px)' },
        },
      },
      transitionTimingFunction: {
        sidebar: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
