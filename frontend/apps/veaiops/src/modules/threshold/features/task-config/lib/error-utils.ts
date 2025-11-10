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
 * Error information utility functions
 */

export interface ErrorSummary {
  /** Error summary (brief key information) */
  summary: string;
  /** Complete error information (for detailed display) */
  details: string;
}

/**
 * Extract error summary and detailed information
 *
 * Optimization strategy:
 * 1. Extract first line of error as summary (usually error type and brief message)
 * 2. Identify common error formats (Error:, Exception:, etc.)
 * 3. If error message is short (<=100 characters), display all directly
 * 4. If error message is long, summary shows key information, details used for scrollable area
 *
 * @param error - Complete error information (may contain traceback)
 * @returns Object containing summary and detailed information
 */
export const extractErrorSummary = (error: string): ErrorSummary => {
  if (!error) {
    return { summary: '', details: '' };
  }

  // Extract first line as summary (usually error type and brief message)
  const lines = error.split('\n');
  const firstLine = lines[0]?.trim() || '';

  // If first line contains "Error:" or "Exception:", extract this part as summary
  let summary = firstLine;
  if (firstLine.includes('Error:')) {
    const errorMatch = firstLine.match(/Error:\s*(.+?)(?:\n|$)/);
    if (errorMatch) {
      summary = `Error: ${errorMatch[1].trim()}`;
    }
  } else if (firstLine.includes('Exception:')) {
    const exceptionMatch = firstLine.match(/(\w+Exception):\s*(.+?)(?:\n|$)/);
    if (exceptionMatch) {
      summary = `${exceptionMatch[1]}: ${exceptionMatch[2]?.trim() || ''}`;
    }
  } else if (firstLine.includes(':')) {
    // If first line contains colon, extract part before colon (usually exception type)
    const colonIndex = firstLine.indexOf(':');
    if (colonIndex > 0 && colonIndex < firstLine.length - 1) {
      summary = `${firstLine.substring(0, colonIndex + 1)} ${firstLine.substring(colonIndex + 1).trim()}`;
    }
  }

  // If error message is short (less than 100 characters), display all directly
  if (error.length <= 100) {
    return { summary: error, details: '' };
  }

  // Detailed information is complete content (for scrollable area)
  return {
    summary: summary || `${error.substring(0, 100)}...`,
    details: error,
  };
};
