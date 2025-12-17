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
 * Check whether the given text matches the search value.
 * Supports both fuzzy substring matching and regular expressions.
 * @param text Text to check
 * @param searchValue Search value (plain string or regex pattern string)
 * @returns Whether the text matches the search condition
 */
export const isMatch = (
  text: string | undefined | null,
  searchValue: string,
): boolean => {
  if (!text) {
    return false;
  }

  const safeText = text.toLowerCase();
  const safeSearch = searchValue.toLowerCase().trim();

  if (!safeSearch) {
    return true;
  }

  try {
    // Try regex matching first
    // Typical user inputs:
    // - AA-\d+-BB style regex
    // - AA-* style wildcard
    // - Simple substring like AA

    // Strategy:
    // 1. Try to interpret the query as regex
    // 2. If it fails and contains *, treat it as a wildcard
    // 3. Otherwise fallback to plain substring match

    // We directly build RegExp here to fully support regex syntax

    const regex = new RegExp(safeSearch, 'i');
    if (regex.test(text)) {
      return true;
    }
  } catch (e) {
    // If regex parsing fails (e.g. syntax error), try wildcard handling instead
  }

  // Wildcard handling (simple * to .*)
  // Only used when query contains * and regex parsing failed
  if (safeSearch.includes('*')) {
    try {
      // Escape all regex metacharacters except *
      const pattern = safeSearch
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');
      const wildcardRegex = new RegExp(`^${pattern}$`, 'i'); // Wildcard usually implies full match
      if (wildcardRegex.test(text)) {
        return true;
      }
    } catch (e) {
      // Ignore and continue to substring fallback
    }
  }

  // Final fallback: plain substring match
  return safeText.includes(safeSearch);
};

/**
 * Matching helper optimized for AA-number-BB style patterns
 * while still supporting generic regex and wildcard queries.
 */
export const checkMatch = (
  text: string | undefined | null,
  searchValue: string,
): boolean => {
  if (!text) {
    return false;
  }

  const safeText = text.trim();
  const query = searchValue.trim();

  if (!query) {
    return true;
  }

  // 1. Try regex match first
  // Typical usage:
  // - AA-\d+-BB style patterns with \d for digits
  // - ^server.* for prefix matching
  // Using RegExp directly gives maximum flexibility for power users.

  try {
    // 使用 'i' 标志忽略大小写
    const regex = new RegExp(query, 'i');
    if (regex.test(safeText)) {
      return true;
    }
  } catch (e) {
    // If regex parsing fails (e.g. unclosed parenthesis), fall through to wildcard or substring
  }

  // 2. Try wildcard * match
  // Only used when query contains * and regex parsing did not succeed
  if (query.includes('*')) {
    try {
      // Escape all regex metacharacters except *
      const pattern = query
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');
      const wildcardRegex = new RegExp(`^${pattern}$`, 'i'); // Wildcard usually implies full match
      if (wildcardRegex.test(safeText)) {
        return true;
      }
    } catch (e) {
      // Ignore and fallback to plain substring match
    }
  }

  // 3. Plain substring match (case-insensitive)
  // Fallback for queries like "server(" which are invalid regex but valid text
  return safeText.toLowerCase().includes(query.toLowerCase());
};
