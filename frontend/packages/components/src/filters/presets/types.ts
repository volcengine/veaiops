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

/**
 * Preset configuration type definitions
 */
import type { FieldItem } from '../core/types';

/**
 * Preset configuration generator
 */
export type PresetGenerator = (
  params?: Record<string, unknown>,
) => Omit<FieldItem, 'preset'>;

/**
 * Preset configuration mapping
 */
export interface PresetRegistry {
  [presetName: string]: PresetGenerator;
}

/**
 * Preset configuration parameters
 */
export interface PresetParams {
  /** Field name */
  field?: string;
  /** Label text */
  label?: string;
  /** Placeholder */
  placeholder?: string;
  /** Whether required */
  required?: boolean;
  /** Maximum tag count */
  maxTagCount?: number;
  /** Selection mode */
  mode?: 'single' | 'multiple';
  /** Custom properties */
  [key: string]: unknown;
}
