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
 * Suggestions list component
 */

import { Typography } from '@arco-design/web-react';
import { IconInfoCircle } from '@arco-design/web-react/icon';
import type React from 'react';

const { Text } = Typography;

export interface SuggestionsListProps {
  suggestions: string[];
}

export const SuggestionsList: React.FC<SuggestionsListProps> = ({
  suggestions,
}) => (
  <div
    className="rounded-lg p-4 border border-[#ffd591]"
    style={{
      background: 'linear-gradient(135deg, #fff7e6 0%, #f6ffed 100%)',
    }}
  >
    <div className="flex items-center mb-3">
      <IconInfoCircle style={{ color: '#ff7d00', marginRight: 8 }} />
      <Text style={{ color: '#ff7d00', fontWeight: 500 }}>
        请检查以下配置后重试：
      </Text>
    </div>
    <ul className="m-0 pl-5">
      {suggestions.map((suggestion, index) => (
        <li key={index} className="mb-2 leading-[1.5]">
          <Text style={{ color: 'var(--color-text-2)' }}>{suggestion}</Text>
        </li>
      ))}
    </ul>
  </div>
);
