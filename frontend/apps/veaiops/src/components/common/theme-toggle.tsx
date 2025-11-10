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

import { useTheme } from '@/contexts/theme-context';
import type React from 'react';

// Theme toggle button component
export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="style-nav-actions-theme guide-theme-toggle inline-flex items-center h-6 px-3 py-0.5 font-medium text-sm whitespace-nowrap outline-none cursor-pointer leading-6 rounded-full font-sans"
      onClick={toggleTheme}
      aria-label={isDark ? '切换到亮色模式' : '切换到暗黑模式'}
      style={{
        color: 'var(--color-text-2)',
        backgroundColor: 'var(--color-fill-1)',
      }}
    >
      <svg
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        viewBox="0 0 48 48"
        aria-hidden="true"
        focusable="false"
        className="arco-icon w-4 h-4 mr-1"
      >
        {isDark ? (
          // Sun icon (switch to light mode)
          <>
            <circle cx="24" cy="24" r="9" fill="currentColor" stroke="none" />
            <path
              fill="currentColor"
              stroke="none"
              d="M21 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-5ZM21 37.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-5ZM42.5 21a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-5a.5.5 0 0 1 .5-.5h5ZM10.5 21a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-5a.5.5 0 0 1 .5-.5h5ZM39.203 34.96a.5.5 0 0 1 0 .707l-3.536 3.536a.5.5 0 0 1-.707 0l-3.535-3.536a.5.5 0 0 1 0-.707l3.535-3.535a.5.5 0 0 1 .707 0l3.536 3.535ZM16.575 12.333a.5.5 0 0 1 0 .707l-3.535 3.535a.5.5 0 0 1-.707 0L8.797 13.04a.5.5 0 0 1 0-.707l3.536-3.536a.5.5 0 0 1 .707 0l3.535 3.536ZM13.04 39.203a.5.5 0 0 1-.707 0l-3.536-3.536a.5.5 0 0 1 0-.707l3.536-3.535a.5.5 0 0 1 .707 0l3.536 3.535a.5.5 0 0 1 0 .707l-3.536 3.536ZM35.668 16.575a.5.5 0 0 1-.708 0l-3.535-3.535a.5.5 0 0 1 0-.707l3.535-3.536a.5.5 0 0 1 .708 0l3.535 3.536a.5.5 0 0 1 0 .707l-3.535 3.535Z"
            />
          </>
        ) : (
          // Moon icon (switch to dark mode)
          <path
            fill="currentColor"
            stroke="none"
            d="M42.108 29.769c.124-.387-.258-.736-.645-.613A17.99 17.99 0 0 1 36 30c-9.941 0-18-8.059-18-18 0-1.904.296-3.74.844-5.463.123-.387-.226-.768-.613-.645C10.558 8.334 5 15.518 5 24c0 10.493 8.507 19 19 19 8.482 0 15.666-5.558 18.108-13.231Z"
          />
        )}
      </svg>
      {isDark ? '切换亮色模式' : '切换暗黑模式'}
    </button>
  );
};
