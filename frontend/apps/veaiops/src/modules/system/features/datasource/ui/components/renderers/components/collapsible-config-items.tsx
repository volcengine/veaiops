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

import { Button } from '@arco-design/web-react';
import { IconDown, IconUp } from '@arco-design/web-react/icon';
import type { ConfigItem } from '@datasource/types';
import { useState } from 'react';
import type React from 'react';
import { renderAllConfigItems } from '../core';

interface CollapsibleConfigItemsProps {
  items: ConfigItem[];
}

/**
 * Collapsible config items component
 * Used to display config items exceeding 3
 */
export const CollapsibleConfigItems: React.FC<CollapsibleConfigItemsProps> = ({
  items,
}) => {
  const [expanded, setExpanded] = useState(false);

  // Display first 3, rest collapsed
  const displayItems = expanded ? items : items.slice(0, 3);
  const remainingCount = items.length - 3;

  return (
    <div className="flex flex-col gap-1">
      {renderAllConfigItems(displayItems)}
      {remainingCount > 0 && (
        <Button
          type="text"
          size="mini"
          icon={expanded ? <IconUp /> : <IconDown />}
          onClick={() => setExpanded(!expanded)}
          style={{
            height: 'auto',
            fontSize: '12px',
            color: '#86909c',
            alignSelf: 'flex-start',
          }}
        >
          {expanded ? '收起' : `+${remainingCount} 更多配置`}
        </Button>
      )}
    </div>
  );
};
