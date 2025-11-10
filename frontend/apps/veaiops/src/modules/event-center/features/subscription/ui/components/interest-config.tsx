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

import apiClient from '@/utils/api-client';
import { Button, Card } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { SelectBlock } from '@veaiops/components';
import type React from 'react';
import { UpdateTooltip } from '../update-tooltip';

/**
 * Interest attribute configuration component props interface
 */
interface InterestConfigProps {
  projectRefreshTrigger: number;
  onOpenProjectImport: () => void;
  showProjectTooltip?: boolean;
  hideProjectTooltip?: () => void;
}

/**
 * Interest attribute configuration component
 * Contains interest project configuration
 */
export const InterestConfig: React.FC<InterestConfigProps> = ({
  projectRefreshTrigger,
  onOpenProjectImport,
  showProjectTooltip = false,
  hideProjectTooltip,
}) => {
  return (
    <Card title="关注属性配置" className="mb-4">
      <UpdateTooltip
        show={showProjectTooltip}
        message="项目数据已更新"
        onHide={hideProjectTooltip || (() => {})}
      >
        <SelectBlock
          isControl
          formItemProps={{
            label: '关注项目',
            field: 'interest_projects',
            extra: (
              <Button
                type="text"
                size="small"
                icon={<IconPlus />}
                onClick={onOpenProjectImport}
              >
                添加项目
              </Button>
            ),
          }}
          controlProps={{
            mode: 'multiple',
            placeholder: '请选择关注项目（不选择表示关注全部）',
            dependency: projectRefreshTrigger,
            maxTagCount: 3,
            dataSource: {
              serviceInstance: apiClient.projects,
              api: 'getApisV1ManagerSystemConfigProjects',
              payload: {},
              responseEntityKey: 'data',
              optionCfg: {
                labelKey: 'name',
                valueKey: 'name',
              },
            },
          }}
        />
      </UpdateTooltip>
    </Card>
  );
};

export default InterestConfig;
