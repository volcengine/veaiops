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
 * Selection statistics component
 * Displays statistical information about current selection state
 */
import type {
  BaseRecord,
  RowSelectionState,
  SelectionStatConfig,
} from '@/custom-table/types';
import { Progress } from '@arco-design/web-react';
import type React from 'react';
import styles from './selection-stat.module.less';

interface SelectionStatProps<RecordType extends BaseRecord = BaseRecord> {
  /** Selection state */
  selectionState: RowSelectionState<RecordType>;
  /** Statistics configuration */
  config: SelectionStatConfig;
  /** Style class name */
  className?: string;
}

export const SelectionStat = <RecordType extends BaseRecord = BaseRecord>({
  selectionState,
  config,
  className,
}: SelectionStatProps<RecordType>): React.ReactElement | null => {
  const { selectionStat } = selectionState;
  const { selectedCount, totalCount, currentPageCount, selectedPercent } =
    selectionStat;

  // Don't show statistics
  if (!config.show) {
    return null;
  }

  // Custom render
  if (config.render) {
    return (
      <div className={`${styles.selectionStat} ${className || ''}`}>
        {config.render(selectedCount, totalCount)}
      </div>
    );
  }

  // Default render
  return (
    <div className={`${styles.selectionStat} ${className || ''}`}>
      <div className={styles.statContent}>
        <div className={styles.statText}>
          <span className={styles.selected}>Selected {selectedCount}</span>
          <span className={styles.separator}>/</span>
          <span className={styles.total}>Total {totalCount} items</span>
          {currentPageCount !== totalCount && (
            <span className={styles.pageInfo}>
              (Current page {currentPageCount} items)
            </span>
          )}
        </div>

        <div className={styles.statProgress}>
          <Progress
            percent={selectedPercent}
            size="small"
            showText={false}
            status={selectedPercent === 100 ? 'success' : 'normal'}
          />
        </div>
      </div>
    </div>
  );
};
