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

import { CONFIG_FIELD_TRANSLATIONS } from './constants';

/**
 * Get translated text for a field
 * @param key Field name
 * @returns Translated text, or null if no translation is available
 */
export const getFieldTranslation = (key: string): string | null => {
  return CONFIG_FIELD_TRANSLATIONS[key] || null;
};

/**
 * Safely convert value to string
 */
export const safeStringify = (value: unknown): string => {
  if (value == null) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object' || typeof value === 'function') {
    return '[Object]';
  }
  // At this point, value is guaranteed to be a primitive (number, boolean, symbol, bigint)
  return String(value as number | boolean | symbol | bigint);
};
