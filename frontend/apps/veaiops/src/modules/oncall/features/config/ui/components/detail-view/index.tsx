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

import { Interest } from 'api-generate';
import type React from 'react';

import { BasicInfo, Examples, RegexDisplay } from './components';
import { useCopy } from './hooks';
import type { DetailViewProps } from './types';

/**
 * Detail view component
 *
 * Refactoring notes:
 * - Original branch (feat/web-v2): Used rule-details-drawer.tsx, contained RuleBasicInfo, RuleExamples, RuleRegexDisplay
 * - Current branch: Refactored to unified detail-view directory structure, integrates all detail display functionality
 * - Functional equivalence: ✅ All original branch functionality aligned
 *   - Basic information display (UUID, version, creation time, update time) ✅
 *   - Positive/negative examples Collapse expand/collapse ✅
 *   - Regular expression Card display ✅
 *   - Copy functionality ✅ (unified use of safeCopyToClipboard)
 */
export const DetailView: React.FC<DetailViewProps> = ({ rule }) => {
  // Use unified copy functionality Hook
  const copyHook = useCopy();

  // Handle null values, ensure array
  const positiveExamples = rule.examples_positive ?? [];
  const negativeExamples = rule.examples_negative ?? [];

  return (
    <div className="rule-detail-view py-2">
      {/* Basic information */}
      <BasicInfo rule={rule} copyHook={copyHook} />

      {/* Regular expression */}
      {rule.inspect_category === Interest.inspect_category.RE &&
        rule.regular_expression && (
          <RegexDisplay
            regularExpression={rule.regular_expression}
            copyHook={copyHook}
          />
        )}

      {/* Example display */}
      <Examples
        positiveExamples={positiveExamples}
        negativeExamples={negativeExamples}
        copyHook={copyHook}
      />
    </div>
  );
};

export type { DetailViewProps } from './types';
