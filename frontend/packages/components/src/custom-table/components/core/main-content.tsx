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

import type React from 'react';
import { CustomLoading, TableTitle } from '../index';

interface MainContentProps {
  title?: string;
  actions?: React.ReactNode[];
  titleClassName?: string;
  titleStyle?: React.CSSProperties;
  actionClassName?: string;
  AlertComponent?: React.ReactNode;
  TableFilterComponent?: React.ReactNode;
  useCustomLoading?: boolean;
  loading?: boolean;
  customLoading?: boolean;
  loadingTip?: string | React.ReactNode;
  renderTableContent: (tableComponent: React.ReactNode) => React.ReactNode;
  renderFooterContent: () => React.ReactNode;
  tableComponent: React.ReactNode;
}

export const MainContent: React.FC<MainContentProps> = ({
  title,
  actions,
  titleClassName,
  titleStyle,
  actionClassName,
  AlertComponent,
  TableFilterComponent,
  useCustomLoading,
  loading,
  customLoading,
  loadingTip,
  renderTableContent,
  renderFooterContent,
  tableComponent,
}) => {
  return (
    <div className="flex-1 flex flex-col gap-2">
      <TableTitle
        title={title}
        actions={actions as React.ReactNode[]}
        className={titleClassName as string}
        titleStyle={titleStyle as React.CSSProperties}
        actionClassName={actionClassName as string}
      />

      {AlertComponent}

      {TableFilterComponent as any}

      {useCustomLoading && (loading || customLoading) && (
        <CustomLoading
          tip={typeof loadingTip === 'string' ? loadingTip : 'Loading...'}
        />
      )}

      {renderTableContent(tableComponent)}

      {renderFooterContent()}
    </div>
  );
};
