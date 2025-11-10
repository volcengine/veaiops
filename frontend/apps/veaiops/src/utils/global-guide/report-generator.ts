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
 * Generate recommendations
 */
export function generateRecommendations(): string[] {
  const recommendations: string[] = [];

  // Check localStorage issues
  const guideStore = localStorage.getItem('global-guide-store');
  if (guideStore) {
    try {
      const parsed = JSON.parse(guideStore);
      if ('state' in parsed && 'guideVisible' in parsed.state) {
        recommendations.push(
          'Immediately clear global-guide-store item in localStorage',
        );
        recommendations.push(
          'Check partialize configuration to ensure guideVisible is not persisted',
        );
      }
    } catch (error: unknown) {
      // ✅ Correct: Expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const errorMessage = errorObj.message || 'JSON format issue';
      recommendations.push(
        `Fix JSON format issue in global-guide-store: ${errorMessage}`,
      );
    }
  }

  // Check DOM issues
  const visibleElements = document.querySelectorAll(
    '[class*="global-guide"]:not([style*="display: none"])',
  );
  if (visibleElements.length > 0) {
    recommendations.push('Check conditional rendering logic of global guide component');
    recommendations.push('Ensure guideVisible state correctly controls component display');
  }

  // General recommendations
  recommendations.push('Use browser developer tools to check component state');
  recommendations.push('Check component props and state in React DevTools');
  recommendations.push('Clear browser cache and localStorage, then test again');

  return recommendations;
}
