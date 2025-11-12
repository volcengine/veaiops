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
 * Convert human-readable duration to ISO 8601 duration format
 *
 * Supported input formats:
 * - 6h → PT6H
 * - 30m → PT30M
 * - 1d → P1D
 * - 1w → P7D
 * - 60s → PT60S
 * - 1d12h → P1DT12H
 * - PT6H (already ISO 8601) → PT6H
 *
 * @param duration - Human-readable duration string
 * @returns ISO 8601 duration format string or undefined if invalid
 */
export const convertToISO8601Duration = (duration: string | undefined): string | undefined => {
  if (!duration) {
    return undefined;
  }

  const trimmed = duration.trim();

  // If already ISO 8601 format, return as is
  if (trimmed.startsWith('P')) {
    return trimmed;
  }

  // Parse compound format: 1d12h → P1DT12H
  const compoundMatch = trimmed.match(/^(\d+)d(\d+)h$/i);
  if (compoundMatch) {
    const [, days, hours] = compoundMatch;
    return `P${days}DT${hours}H`;
  }

  // Parse single unit format
  const singleMatch = trimmed.match(/^(\d+)([dhmsw])$/i);
  if (singleMatch) {
    const [, number, unit] = singleMatch;
    const num = parseInt(number, 10);

    switch (unit.toLowerCase()) {
      case 'w': // weeks → days
        return `P${num * 7}D`;
      case 'd': // days
        return `P${num}D`;
      case 'h': // hours
        return `PT${num}H`;
      case 'm': // minutes
        return `PT${num}M`;
      case 's': // seconds
        return `PT${num}S`;
      default:
        return undefined;
    }
  }

  // Invalid format
  return undefined;
};

/**
 * Convert ISO 8601 duration to human-readable format
 *
 * @param iso8601Duration - ISO 8601 duration string (e.g., "PT6H", "P1D")
 * @returns Human-readable duration string (e.g., "6h", "1d") or original if invalid
 */
export const convertFromISO8601Duration = (iso8601Duration: string | undefined): string | undefined => {
  if (!iso8601Duration) {
    return undefined;
  }

  const trimmed = iso8601Duration.trim();

  // If not ISO 8601 format, return as is
  if (!trimmed.startsWith('P')) {
    return trimmed;
  }

  // Parse ISO 8601 duration
  const match = trimmed.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);

  if (!match) {
    return trimmed; // Invalid format, return original
  }

  const [, days, hours, minutes, seconds] = match;

  // Convert to simplest form
  if (days && hours) {
    return `${days}d${hours}h`;
  }
  if (days) {
    // Check if it's a multiple of 7 (weeks)
    const numDays = parseInt(days, 10);
    if (numDays % 7 === 0) {
      return `${numDays / 7}w`;
    }
    return `${days}d`;
  }
  if (hours) {
    return `${hours}h`;
  }
  if (minutes) {
    return `${minutes}m`;
  }
  if (seconds) {
    return `${seconds}s`;
  }

  return trimmed;
};
