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

/*
  Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. and/or its affiliates

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

       https://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * ClassValue type definition (compatible with clsx type)
 * clsx 2.x version does not export ClassValue type, need to define it ourselves
 */
export type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | Record<string, boolean | undefined | null>
  | ClassValue[];

/**
 * Utility function to merge Tailwind CSS classes with clsx and tailwind-merge
 * This helps avoid conflicts and ensures proper class precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

/**
 * Common style mappings from inline styles to Tailwind classes
 */
export const styleToTailwind = {
  // Spacing
  'margin: 0': 'm-0',
  'marginTop: 8': 'mt-2',
  'marginTop: 16': 'mt-4',
  'marginTop: 24': 'mt-6',
  'marginBottom: 8': 'mb-2',
  'marginBottom: 16': 'mb-4',
  'marginBottom: 24': 'mb-6',
  'marginLeft: 8': 'ml-2',
  'marginRight: 8': 'mr-2',
  'padding: 24': 'p-6',
  'padding: 16': 'p-4',
  'padding: 8': 'p-2',
  'paddingTop: 8': 'pt-2',
  'paddingBottom: 8': 'pb-2',

  // Layout
  'display: flex': 'flex',
  'flexDirection: column': 'flex-col',
  'alignItems: center': 'items-center',
  'justifyContent: center': 'justify-center',
  'justifyContent: space-between': 'justify-between',
  'width: 100%': 'w-full',
  'width: 80px': 'w-20',
  'width: 120px': 'w-30',
  'width: 200px': 'w-50',
  'width: 240px': 'w-60',
  'width: 300px': 'w-75',
  'width: 600px': 'w-150',
  'width: 800px': 'w-200',

  // Typography
  'fontSize: 12': 'text-xs',
  'fontSize: 14': 'text-sm',
  'fontSize: 16': 'text-base',
  'fontSize: 18': 'text-lg',
  'fontWeight: 500': 'font-medium',
  'fontWeight: bold': 'font-bold',
  'textAlign: center': 'text-center',
  'textAlign: right': 'text-right',

  // Colors
  'color: #666': 'text-gray-500',
  'color: #86909c': 'text-gray-400',
  'color: #999': 'text-gray-400',
  'color: #f53f3f': 'text-red-500',
  'color: #00b42a': 'text-green-500',
  'color: #165dff': 'text-blue-500',
  'color: #1890ff': 'text-blue-500',
  'color: #52c41a': 'text-green-500',
  'color: #ff4d4f': 'text-red-500',

  // Background colors
  'backgroundColor: #f9fafb': 'bg-gray-50',
  'backgroundColor: white': 'bg-white',

  // Borders
  'borderRadius: 12px': 'rounded-xl',
  'borderRadius: 8px': 'rounded-lg',
  'borderRadius: 4px': 'rounded',

  // Positioning
  'position: relative': 'relative',
  'position: absolute': 'absolute',
  'position: fixed': 'fixed',

  // Overflow
  'overflow: auto': 'overflow-auto',
  'overflow: hidden': 'overflow-hidden',
  'overflowY: auto': 'overflow-y-auto',

  // Cursor
  'cursor: pointer': 'cursor-pointer',
  'cursor: not-allowed': 'cursor-not-allowed',

  // Max width/height
  'maxWidth: 230px': 'max-w-58',
  'maxWidth: 180px': 'max-w-45',
  'maxHeight: 300px': 'max-h-75',
} as const;

/**
 * Convert common inline style objects to Tailwind classes
 */
export function convertStylesToTailwind(
  styles: Record<string, string | number>,
): string {
  const classes: string[] = [];

  for (const [property, value] of Object.entries(styles)) {
    const styleKey = `${property}: ${value}` as keyof typeof styleToTailwind;
    const tailwindClass = styleToTailwind[styleKey];

    if (tailwindClass) {
      classes.push(tailwindClass);
    }
  }

  return classes.join(' ');
}

/**
 * Common component style presets
 */
export const componentStyles = {
  // Card styles
  card: {
    base: 'card',
    header: 'card-header',
    content: 'card-content',
    footer: 'card-footer',
  },

  // Button styles
  button: {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    outline: 'btn btn-outline',
    ghost: 'btn btn-ghost',
    small: 'btn-sm',
    medium: 'btn-md',
    large: 'btn-lg',
  },

  // Input styles
  input: {
    base: 'input',
  },

  // Table styles
  table: {
    base: 'table',
    header: 'table-header',
    body: 'table-body',
    row: 'table-row',
    head: 'table-head',
    cell: 'table-cell',
  },

  // Layout styles
  layout: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    section: 'py-6 space-y-6',
    grid: 'grid grid-cols-1 gap-6',
    gridCols2: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    gridCols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    gridCols4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
  },

  // Text styles
  text: {
    title: 'text-2xl font-bold text-gray-900',
    subtitle: 'text-lg font-medium text-gray-700',
    body: 'text-sm text-gray-600',
    caption: 'text-xs text-gray-500',
    muted: 'text-xs text-gray-400',
  },

  // Status styles
  status: {
    success: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    error: 'text-red-600 bg-red-50 border-red-200',
    info: 'text-blue-600 bg-blue-50 border-blue-200',
  },
} as const;

/**
 * Responsive breakpoint helpers
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Animation helpers
 */
export const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  bounceSubtle: 'animate-bounce-subtle',
} as const;
