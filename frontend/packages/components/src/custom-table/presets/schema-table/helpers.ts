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

import { EMPTY_CONTENT_TEXT } from '@veaiops/constants';
import type React from 'react';

/**
 * Safely convert value to string
 */
export const safeToString = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return EMPTY_CONTENT_TEXT;
  }
  // Primitive types directly convert
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  // Object types try to stringify
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (error: unknown) {
      // ✅ Silently handle JSON.stringify errors (avoid blocking rendering), use placeholder
      // No need to log warning, as this is normal error tolerance handling
      return EMPTY_CONTENT_TEXT;
    }
  }
  return EMPTY_CONTENT_TEXT;
};

/**
 * Safely convert value to ReactNode
 */
export const safeToReactNode = (value: unknown): React.ReactNode => {
  if (value === null || value === undefined || value === '') {
    return EMPTY_CONTENT_TEXT;
  }
  // Primitive types directly convert
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }
  // Object types try to stringify
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (error: unknown) {
      // ✅ Silently handle JSON.stringify errors (avoid blocking rendering), use placeholder
      // No need to log warning, as this is normal error tolerance handling
      return EMPTY_CONTENT_TEXT;
    }
  }
  return EMPTY_CONTENT_TEXT;
};
