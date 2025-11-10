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
 * Separator utility class - provides common separator presets
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class TokenSeparatorUtils {
  /**
   * Common separator presets
   */
  static presets: Record<string, string[]> = {
    // Basic separators
    basic: [',', '\n', ';', '\t'],
    // Extended separators (includes Chinese)
    extended: [',', '\n', ';', '\t', ' ', '|', '，', '；'],
    // Only comma and newline
    simple: [',', '\n'],
    // Excel style (tab and newline)
    excel: ['\t', '\n'],
    // Chinese friendly
    chinese: [',', '\n', ';', '，', '；'],
    // Space separated
    space: [' ', '\n', '\t'],
  };

  /**
   * Custom separator builder
   */
  static custom(...separators: string[]): string[] {
    return separators;
  }

  /**
   * Merge multiple separator presets
   */
  static merge(
    ...presetNames: (keyof typeof TokenSeparatorUtils.presets)[]
  ): string[] {
    const allSeparators = presetNames.flatMap(
      (name) => TokenSeparatorUtils.presets[name],
    );
    return Array.from(new Set(allSeparators)); // Deduplicate
  }

  /**
   * Validate if separators are valid
   */
  static validate(separators: string[]): boolean {
    return (
      Array.isArray(separators) &&
      separators.every((sep) => typeof sep === 'string' && sep.length > 0)
    );
  }

  /**
   * Enhanced text splitting method, supports multiple separators
   */
  static splitTextByMultipleSeparators(
    text: string,
    separators: string[],
  ): string[] {
    if (!text || !separators || separators.length === 0) {
      return [text].filter(Boolean);
    }

    // Create regex, supports multiple separators
    const escapedSeparators = separators.map((sep) =>
      sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    );
    const regex = new RegExp(`[${escapedSeparators.join('')}]+`, 'g');

    // Split text and filter empty strings
    const result = text
      .split(regex)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    return result;
  }

  /**
   * Get default separators
   */
  static getDefaultSeparators(): string[] {
    return ['\n', ',', ';', '\t', ' ', '|', '，', '；'];
  }
}
