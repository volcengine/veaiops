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
 * Data source configuration renderer - Main business logic
 * Responsibility: Provide rendering entry function for data source configuration
 */

import { EMPTY_CONTENT } from '@veaiops/constants';
import { extractAllConfigItems } from '../../utils/config-extractor';
import { CollapsibleConfigItems } from './components';
import { renderAllConfigItems } from './core';

/**
 * Render data source configuration
 */
export const renderDataSourceConfig = (record: Record<string, unknown>) => {
  const allConfigItems = extractAllConfigItems(record);

  if (allConfigItems.length === 0) {
    return EMPTY_CONTENT;
  }

  // If config items are 3 or less, display all directly
  if (allConfigItems.length <= 3) {
    return (
      <div className="flex flex-col gap-1">
        {renderAllConfigItems(allConfigItems)}
      </div>
    );
  }

  // When config items exceed 3, use collapsible component
  return <CollapsibleConfigItems items={allConfigItems} />;
};
