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
 * Generic instance selection component
 * @description Supports instance selection for different data sources through configuration parameters
 * @author AI Assistant
 * @date 2025-01-18
 */

import { IconSearch } from '@arco-design/web-react/icon';
import { logger } from '@veaiops/utils';
import styles from '@wizard/datasource-wizard.module.less';
import type { ZabbixHost } from 'api-generate/index';
import type React from 'react';
import { useMemo } from 'react';
import {
  EmptyState,
  InstanceList,
  LoadingState,
  SearchBox,
  SelectionAlert,
  ZabbixHostList,
} from './index';
import {
  type InstanceData,
  areInstancesEqual,
  getInstanceUniqueId,
} from './instance-list-item';
import type {
  DataTransformer,
  InstanceSelectionConfig,
  SelectionAction,
} from './instance-selection-config';

export interface GenericInstanceSelectionProps<T> {
  /** Original data list */
  items: T[];
  /** Selected original data list */
  selectedItems: T[];
  /** Loading state */
  loading: boolean;
  /** Search text */
  searchText: string;
  /** Search text change callback */
  onSearchChange: (value: string) => void;
  /** Configuration */
  config: InstanceSelectionConfig<T>;
}

export function GenericInstanceSelection<T>({
  items,
  selectedItems,
  loading,
  searchText,
  onSearchChange,
  config,
}: GenericInstanceSelectionProps<T>) {
  // Use useMemo to optimize sorting performance, only recalculate when items or selectedItems change
  const sortedItems = useMemo(() => {
    // Edge case: If items is empty or selectedItems is empty, return original array
    if (!items || items.length === 0) {
      return items || [];
    }

    // ✅ Fix: Add deduplication logic to avoid duplicate instances causing selection errors
    // Use Map for deduplication, key is the unique identifier of the instance (generated from transformed instance data)
    const uniqueItemsMap = new Map<string, T>();
    let duplicateCount = 0;

    for (const item of items) {
      const transformedItem = config.dataTransformer(item);
      const uniqueKey = getInstanceUniqueId(transformedItem);

      // If the same key already exists in Map, keep the first occurrence
      if (!uniqueItemsMap.has(uniqueKey)) {
        uniqueItemsMap.set(uniqueKey, item);
      } else {
        duplicateCount++;
        // Output warning in development environment for debugging
        if (process.env.NODE_ENV === 'development') {
          logger.warn({
            message:
              '[GenericInstanceSelection] Duplicate instance found, deduplicated',
            data: {
              uniqueKey,
              transformedItem,
              duplicateCount,
            },
            source: 'GenericInstanceSelection',
            component: 'sortedItems',
          });
        }
      }
    }

    // Output deduplication statistics in development environment
    if (process.env.NODE_ENV === 'development' && duplicateCount > 0) {
      logger.info({
        message: '[GenericInstanceSelection] Deduplication completed',
        data: {
          originalCount: items.length,
          deduplicatedCount: uniqueItemsMap.size,
          removedDuplicates: duplicateCount,
        },
        source: 'GenericInstanceSelection',
        component: 'sortedItems',
      });
    }

    // Convert Map to array
    const uniqueItems = Array.from(uniqueItemsMap.values());

    if (!selectedItems || selectedItems.length === 0) {
      return uniqueItems;
    }

    // Create a Set of selected IDs to improve lookup performance (O(1) vs O(n))
    const selectedIdSet = new Set(
      selectedItems.map((item) => config.getId(item)),
    );

    // Sort original items: put selected items first
    return uniqueItems.sort((a, b) => {
      const aIsSelected = selectedIdSet.has(config.getId(a));
      const bIsSelected = selectedIdSet.has(config.getId(b));

      if (aIsSelected && !bIsSelected) {
        return -1;
      }
      if (!aIsSelected && bIsSelected) {
        return 1;
      }
      return 0;
    });
  }, [items, selectedItems, config]);

  // Transform data format to adapt to generic component
  const transformedItems: InstanceData[] = useMemo(() => {
    return sortedItems
      .map((item) => {
        try {
          // Edge case: Data transformation function may throw exceptions, need to catch
          return config.dataTransformer(item);
        } catch (error) {
          // When data transformation fails, log error and skip this item
          if (process.env.NODE_ENV === 'development') {
            logger.warn({
              message:
                '[GenericInstanceSelection] Data transformation function error, skipping item',
              data: {
                item,
                error:
                  error instanceof Error ? error : new Error(String(error)),
              },
              source: 'GenericInstanceSelection',
              component: 'transformedItems',
            });
          }
          return null;
        }
      })
      .filter((item): item is InstanceData => item !== null); // Filter out items that failed transformation
  }, [sortedItems, config.dataTransformer]);

  const transformedSelectedItems: InstanceData[] = useMemo(() => {
    return (selectedItems || [])
      .map((item) => {
        try {
          // Edge case: Data transformation function may throw exceptions, need to catch
          return config.dataTransformer(item);
        } catch (error) {
          // When data transformation fails, log error and skip this item
          if (process.env.NODE_ENV === 'development') {
            logger.warn({
              message:
                '[GenericInstanceSelection] Selected item data transformation function error, skipping item',
              data: {
                item,
                error:
                  error instanceof Error ? error : new Error(String(error)),
              },
              source: 'GenericInstanceSelection',
              component: 'transformedSelectedItems',
            });
          }
          return null;
        }
      })
      .filter((item): item is InstanceData => item !== null); // Filter out items that failed transformation
  }, [selectedItems, config.dataTransformer]);

  // Filter instances
  const filteredItems = useMemo(() => {
    const searchValue = (searchText || '').toLowerCase().trim();

    // Edge case: If there is no search text, return all transformed items
    if (!searchValue) {
      return transformedItems;
    }

    return transformedItems.filter((instance) => {
      try {
        const originalItem = sortedItems.find(
          (item) => config.getId(item) === instance.id,
        );
        // Edge case: If original item not found, skip this item
        if (!originalItem) {
          return false;
        }
        // Edge case: Search filter function may throw exceptions, need to catch
        return config.searchFilter(originalItem, searchValue);
      } catch (error) {
        // When search filter fails, skip this item (conservative strategy: don't show erroneous items)
        if (process.env.NODE_ENV === 'development') {
          logger.warn({
            message:
              '[GenericInstanceSelection] Search filter function error, skipping item',
            data: {
              instance,
              error: error instanceof Error ? error : new Error(String(error)),
            },
            source: 'GenericInstanceSelection',
            component: 'filteredItems',
          });
        }
        return false;
      }
    });
  }, [transformedItems, sortedItems, searchText, config]);

  // Filter Zabbix hosts (for useHostList case)
  const filteredHosts = useMemo(() => {
    const searchValue = (searchText || '').toLowerCase().trim();

    // Edge case: If there is no search text, return all hosts
    if (!searchValue) {
      return sortedItems;
    }

    return sortedItems.filter((item) => {
      try {
        // Edge case: Search filter function may throw exceptions, need to catch
        return config.searchFilter(item, searchValue);
      } catch (error) {
        // When search filter fails, skip this item (conservative strategy: don't show erroneous items)
        if (process.env.NODE_ENV === 'development') {
          logger.warn({
            message:
              '[GenericInstanceSelection] Search filter function error, skipping item',
            data: {
              item,
              error: error instanceof Error ? error : new Error(String(error)),
            },
            source: 'GenericInstanceSelection',
            component: 'filteredHosts',
          });
        }
        return false;
      }
    });
  }, [sortedItems, searchText, config]);

  // Handle instance selection
  const handleInstanceToggle = (instance: InstanceData, checked: boolean) => {
    try {
      // Find matching original item by comparing transformed instances
      // Because the same ResourceID may correspond to multiple DiskNames, precise matching is required
      const originalItem = sortedItems.find((item) => {
        try {
          const transformedItem = config.dataTransformer(item);
          return areInstancesEqual(transformedItem, instance);
        } catch (error) {
          // Edge case: When data transformation fails, skip this item
          if (process.env.NODE_ENV === 'development') {
            logger.warn({
              message:
                '[GenericInstanceSelection] Data transformation error during instance selection',
              data: {
                item,
                error:
                  error instanceof Error ? error : new Error(String(error)),
              },
              source: 'GenericInstanceSelection',
              component: 'handleInstanceToggle',
            });
          }
          return false;
        }
      });

      // Edge case: If original item not found, do nothing
      if (!originalItem) {
        return;
      }

      if (checked) {
        // Edge case: Check if already selected to avoid duplicate addition
        // Use transformed instances for comparison to ensure precise matching (including DiskName)
        const isAlreadySelected = selectedItems.some((item) => {
          try {
            const transformedSelectedItem = config.dataTransformer(item);
            return areInstancesEqual(transformedSelectedItem, instance);
          } catch (error) {
            // Edge case: When data transformation fails, skip this item
            return false;
          }
        });
        if (isAlreadySelected) {
          return;
        }
        config.selectionAction([...selectedItems, originalItem]);
      } else {
        // Deselect: Use transformed instances for comparison to ensure only matching items are deselected
        config.selectionAction(
          selectedItems.filter((item) => {
            try {
              const transformedSelectedItem = config.dataTransformer(item);
              return !areInstancesEqual(transformedSelectedItem, instance);
            } catch (error) {
              // Edge case: When data transformation fails, keep this item (conservative strategy)
              return true;
            }
          }),
        );
      }
    } catch (error) {
      // Edge case: When the entire selection operation fails, log error but don't affect other functionality
      if (process.env.NODE_ENV === 'development') {
        logger.error({
          message:
            '[GenericInstanceSelection] Instance selection operation error',
          data: {
            instance,
            checked,
            error: error instanceof Error ? error : new Error(String(error)),
          },
          source: 'GenericInstanceSelection',
          component: 'handleInstanceToggle',
        });
      }
    }
  };

  // Handle Zabbix host selection (use original type directly)
  const handleHostToggle = (host: T, checked: boolean) => {
    if (checked) {
      // Edge case: Check if already selected to avoid duplicate addition
      const isAlreadySelected = selectedItems.some(
        (item) => config.getId(item) === config.getId(host),
      );
      if (isAlreadySelected) {
        return;
      }
      config.selectionAction([...selectedItems, host]);
    } else {
      config.selectionAction(
        selectedItems.filter(
          (item) => config.getId(item) !== config.getId(host),
        ),
      );
    }
  };

  // Select all / Deselect all
  const handleSelectAll = (checked: boolean) => {
    try {
      if (checked) {
        // Select different filter lists based on whether host list is used
        const itemsToSelect = config.useHostList
          ? filteredHosts
          : filteredItems
              .map((instance) => {
                try {
                  return sortedItems.find(
                    (item) => config.getId(item) === instance.id,
                  );
                } catch (error) {
                  // Edge case: When getting ID fails, skip this item
                  if (process.env.NODE_ENV === 'development') {
                    logger.warn({
                      message:
                        '[GenericInstanceSelection] Error getting ID during select all',
                      data: {
                        instance,
                        error:
                          error instanceof Error
                            ? error
                            : new Error(String(error)),
                      },
                      source: 'GenericInstanceSelection',
                      component: 'handleSelectAll',
                    });
                  }
                  return undefined;
                }
              })
              .filter((item): item is T => item !== undefined); // Type guard, filter out undefined

        // Edge case: If there are no selectable items, do nothing
        if (itemsToSelect.length === 0) {
          return;
        }

        config.selectionAction(itemsToSelect);
      } else {
        config.selectionAction([]);
      }
    } catch (error) {
      // Edge case: When select all operation fails, log error but don't affect other functionality
      if (process.env.NODE_ENV === 'development') {
        logger.error({
          message: '[GenericInstanceSelection] Select all operation error',
          data: {
            checked,
            error: error instanceof Error ? error : new Error(String(error)),
          },
          source: 'GenericInstanceSelection',
          component: 'handleSelectAll',
        });
      }
    }
  };

  if (loading) {
    return <LoadingState title={config.title} />;
  }

  // Edge case: items is empty or undefined
  if (!items || items.length === 0) {
    return (
      <EmptyState
        title={config.title}
        stepDescription={`Select ${config.itemType} to monitor`}
        icon={config.icon as React.ReactElement}
        description={config.emptyDescription}
      />
    );
  }

  return (
    <div className={styles.stepContent}>
      <div className={styles.stepTitle}>{config.title}</div>
      <div className={styles.stepDescription}>{config.description}</div>

      {/* Search box */}
      <SearchBox
        placeholder={config.searchPlaceholder}
        value={searchText}
        onChange={onSearchChange}
      />

      {/* No data prompt after search */}
      {(() => {
        const hasSearchText = Boolean(searchText.trim());
        const hasNoFilteredData = config.useHostList
          ? filteredHosts.length === 0
          : filteredItems.length === 0;

        // Edge case 1: Has search text but no matching results -> Show no search results prompt
        if (hasSearchText && hasNoFilteredData) {
          return (
            <EmptyState
              icon={<IconSearch />}
              description={`No ${config.itemType} found containing "${searchText.trim()}"`}
            />
          );
        }

        // Edge case 2: No search text but no filtered data -> May be data transformation failure, show initial empty state
        if (!hasSearchText && hasNoFilteredData) {
          return (
            <EmptyState
              icon={config.icon as React.ReactElement}
              description={config.emptyDescription}
            />
          );
        }

        // Normal case: Has data, show list
        return (
          <>
            {config.useHostList ? (
              <ZabbixHostList
                hosts={filteredHosts as ZabbixHost[]}
                selectedHosts={selectedItems as ZabbixHost[]}
                onHostToggle={
                  handleHostToggle as (
                    host: ZabbixHost,
                    checked: boolean,
                  ) => void
                }
                onSelectAll={handleSelectAll}
              />
            ) : (
              <InstanceList
                instances={filteredItems}
                selectedInstances={transformedSelectedItems}
                iconType={config.itemType === 'host' ? 'desktop' : 'cloud'}
                onInstanceToggle={handleInstanceToggle}
                onSelectAll={handleSelectAll}
              />
            )}
          </>
        );
      })()}

      {/* Selection alert - Only show when there is data and no empty prompt is displayed */}
      {((config.useHostList && filteredHosts.length > 0) ||
        (!config.useHostList && filteredItems.length > 0)) && (
        <SelectionAlert
          selectedCount={selectedItems.length}
          totalCount={items.length}
          itemType={config.itemType}
        />
      )}
    </div>
  );
}

export default GenericInstanceSelection;
