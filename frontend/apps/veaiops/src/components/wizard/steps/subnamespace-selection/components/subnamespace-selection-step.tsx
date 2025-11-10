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
 * Volcengine sub-namespace selection step component
 * @description Provides sub-namespace selection functionality for Volcengine
 * @author AI Assistant
 * @date 2025-01-16
 */

import { Alert, Empty, Input, Radio, Typography } from '@arco-design/web-react';
import { IconCloud, IconSearch } from '@arco-design/web-react/icon';
import { logger } from '@veaiops/utils';

import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SelectableItem } from '../../../components/selectable-item';
import type { VolcengineProduct } from '../../../types';

const { Title, Text } = Typography;

export interface SubnamespaceSelectionStepProps {
  selectedProduct: VolcengineProduct | null;
  subNamespaces: string[];
  selectedSubnamespace: string | null;
  loading: boolean;
  onSubNamespacesFetch: (namespace: string) => void;
  onSubnamespaceSelect: (subnamespace: string | null) => void;
}

export const SubnamespaceSelectionStep: React.FC<
  SubnamespaceSelectionStepProps
> = ({
  selectedProduct,
  subNamespaces,
  selectedSubnamespace,
  loading,
  onSubNamespacesFetch,
  onSubnamespaceSelect,
}) => {
  // Use useRef to synchronously track fetched namespace, avoiding duplicate requests caused by useState async updates
  const fetchedNamespaceRef = useRef<string | null>(null);

  // Search text state
  const [searchText, setSearchText] = useState<string>('');

  // Automatically fetch sub-namespaces and clear search text when selected product changes
  useEffect(() => {
    if (
      selectedProduct?.namespace &&
      selectedProduct.namespace !== fetchedNamespaceRef.current &&
      !loading
    ) {
      const previousNamespace = fetchedNamespaceRef.current;
      const currentNamespace = selectedProduct.namespace;

      logger.info({
        message: 'Product switched, starting to fetch sub-namespaces',
        data: {
          previousNamespace,
          currentNamespace,
          productDescription: selectedProduct.description,
        },
        source: 'SubnamespaceSelectionStep',
        component: 'useEffect-product-change',
      });

      // Use ref for synchronous update to prevent duplicate calls in React Strict Mode
      fetchedNamespaceRef.current = currentNamespace;
      onSubNamespacesFetch(currentNamespace);
      // Clear search text when switching products
      setSearchText('');

      logger.info({
        message: 'Product switch completed, search text cleared',
        data: {
          namespace: currentNamespace,
        },
        source: 'SubnamespaceSelectionStep',
        component: 'useEffect-product-change',
      });
    }
  }, [selectedProduct?.namespace, loading, onSubNamespacesFetch]);

  // On first load, if no item is selected and sub-namespaces are available, automatically select the first one
  // Note: Only auto-select when there is no search text to avoid triggering auto-selection loop during search
  useEffect(() => {
    const hasNoSearch = !searchText.trim();
    if (
      !selectedSubnamespace &&
      subNamespaces.length > 0 &&
      !loading &&
      hasNoSearch
    ) {
      const firstSubNamespace = subNamespaces[0];

      logger.info({
        message: 'First load, automatically selecting first sub-namespace',
        data: {
          subNamespace: firstSubNamespace,
          totalCount: subNamespaces.length,
          allSubNamespaces: subNamespaces,
          searchText: searchText || undefined,
        },
        source: 'SubnamespaceSelectionStep',
        component: 'useEffect-auto-select-first',
      });

      onSubnamespaceSelect(firstSubNamespace);
    }
  }, [
    subNamespaces.length,
    loading,
    selectedSubnamespace,
    searchText,
    onSubnamespaceSelect,
  ]);

  // Validate selected item validity:
  // 1. If selected sub-namespace is not in current list, clear selection
  // 2. If there is search input and selected item is not in search results, clear selection
  useEffect(() => {
    if (!selectedSubnamespace || loading) {
      return;
    }

    // Case 1: Selected sub-namespace is not in original list (check regardless of search)
    if (
      subNamespaces.length > 0 &&
      !subNamespaces.includes(selectedSubnamespace)
    ) {
      logger.warn({
        message: 'Selected sub-namespace is not in current list, clearing selection',
        data: {
          selectedSubNamespace: selectedSubnamespace,
          availableSubNamespaces: subNamespaces,
          totalCount: subNamespaces.length,
        },
        source: 'SubnamespaceSelectionStep',
        component: 'useEffect-validate-selection',
      });

      onSubnamespaceSelect(null);
      return;
    }

    // Case 2: There is search input and selected item is not in search results
    // Note: Only validate when there is search text to avoid mistakenly clearing when no search
    const trimmedSearch = searchText.trim();
    if (!trimmedSearch) {
      return;
    }

    const searchLower = trimmedSearch.toLowerCase();
    const isSelectedInFiltered = subNamespaces
      .filter((ns) => {
        if (!ns || typeof ns !== 'string') {
          return false;
        }
        return ns.toLowerCase().includes(searchLower);
      })
      .includes(selectedSubnamespace);

    if (!isSelectedInFiltered) {
      logger.info({
        message: 'Selected item does not match search criteria, clearing selection',
        data: {
          searchText: trimmedSearch,
          selectedSubNamespace: selectedSubnamespace,
          availableSubNamespaces: subNamespaces,
          totalCount: subNamespaces.length,
        },
        source: 'SubnamespaceSelectionStep',
        component: 'useEffect-validate-selection',
      });

      onSubnamespaceSelect(null);
    }
  }, [
    selectedSubnamespace,
    subNamespaces,
    searchText,
    loading,
    onSubnamespaceSelect,
  ]);

  const handleSubNamespaceSelect = (subNamespace: string) => {
    logger.info({
      message: 'User selected sub-namespace',
      data: {
        subNamespace,
        previousSelection: selectedSubnamespace,
        isSearching: Boolean(searchText.trim()),
        searchText: searchText.trim() || undefined,
      },
      source: 'SubnamespaceSelectionStep',
      component: 'handleSubNamespaceSelect',
    });

    onSubnamespaceSelect(subNamespace);
  };

  // Frontend filtering: Filter sub-namespace list based on search text
  // Edge case handling:
  // 1. Empty array or undefined/null handling
  // 2. Return all when search text is empty or only whitespace
  // 3. Include selected item even if not in search results (to ensure selected state is visible)
  const filteredSubNamespaces = useMemo(() => {
    // Edge case 1: Empty array or invalid data
    if (!Array.isArray(subNamespaces) || subNamespaces.length === 0) {
      logger.debug({
        message: 'Sub-namespace list is empty, returning empty array',
        data: {
          subNamespacesType: typeof subNamespaces,
          isArray: Array.isArray(subNamespaces),
          length: Array.isArray(subNamespaces) ? subNamespaces.length : 0,
        },
        source: 'SubnamespaceSelectionStep',
        component: 'filteredSubNamespaces',
      });
      return [];
    }

    // Edge case 2: Search text is empty or only whitespace
    const trimmedSearch = searchText.trim();
    if (!trimmedSearch) {
      logger.debug({
        message: 'Search text is empty, returning all sub-namespaces',
        data: {
          totalCount: subNamespaces.length,
          subNamespaces,
        },
        source: 'SubnamespaceSelectionStep',
        component: 'filteredSubNamespaces',
      });
      return subNamespaces;
    }

    // Edge case 3: Search filtering (case-insensitive)
    const searchLower = trimmedSearch.toLowerCase();
    const filtered = subNamespaces.filter((subNamespace) => {
      // Edge case 4: Handle null/undefined sub-namespace
      if (!subNamespace || typeof subNamespace !== 'string') {
        return false;
      }
      return subNamespace.toLowerCase().includes(searchLower);
    });

    // Edge case 5: When there is search input, if selected item is not in search results, should clear selection
    // This ensures only matching results are shown during search, avoiding display of irrelevant selected items
    if (
      selectedSubnamespace &&
      subNamespaces.includes(selectedSubnamespace) &&
      !filtered.includes(selectedSubnamespace)
    ) {
      logger.debug({
        message: 'Selected item is not in search results, will clear selection during render',
        data: {
          searchText: trimmedSearch,
          selectedSubNamespace: selectedSubnamespace,
          filteredCount: filtered.length,
          filteredSubNamespaces: filtered,
        },
        source: 'SubnamespaceSelectionStep',
        component: 'filteredSubNamespaces',
      });
      // Note: Do not clear selection here, handle it in useEffect to avoid modifying state during render
    }

    logger.debug({
      message: 'Search filtering completed',
      data: {
        searchText: trimmedSearch,
        originalCount: subNamespaces.length,
        filteredCount: filtered.length,
        filteredSubNamespaces: filtered,
        selectedSubNamespace: selectedSubnamespace,
        isSelectedInFiltered: filtered.includes(selectedSubnamespace || ''),
      },
      source: 'SubnamespaceSelectionStep',
      component: 'filteredSubNamespaces',
    });

    return filtered;
  }, [subNamespaces, searchText, selectedSubnamespace]);

  // Put selected item first for quick viewing during editing
  // Edge case handling: Ensure array is not empty to avoid sorting errors
  const sortedSubNamespaces = useMemo(() => {
    if (
      !Array.isArray(filteredSubNamespaces) ||
      filteredSubNamespaces.length === 0
    ) {
      return [];
    }

    return [...filteredSubNamespaces].sort((a, b) => {
      // Edge case: Handle null/undefined values
      if (!a || !b) {
        return 0;
      }

      const aSelected = selectedSubnamespace === a;
      const bSelected = selectedSubnamespace === b;
      if (aSelected && !bSelected) {
        return -1;
      }
      if (!aSelected && bSelected) {
        return 1;
      }
      // If neither is selected or both are selected, sort alphabetically
      return a.localeCompare(b, undefined, { sensitivity: 'base' });
    });
  }, [filteredSubNamespaces, selectedSubnamespace]);

  if (!selectedProduct) {
    return (
      <div>
        <Empty icon={<IconCloud />} description="Please select a Volcengine product first" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title heading={6}>Select Sub-namespace</Title>
        <Text type="secondary">
          Select a sub-namespace for product "{selectedProduct.description}"
          for metric monitoring configuration
        </Text>
      </div>

      {/* Search input */}
      {/* Edge case: Only show search box when there is data and not in loading state */}
      {Array.isArray(subNamespaces) && subNamespaces.length > 0 && !loading && (
        <div style={{ marginBottom: 16 }}>
          <Input
            prefix={<IconSearch />}
            placeholder="Search sub-namespace"
            value={searchText || ''}
            onChange={(value) => {
              // Edge case: Ensure value is string type
              const newSearchText = typeof value === 'string' ? value : '';
              const previousSearchText = searchText;

              logger.debug({
                message: 'Search text changed',
                data: {
                  previousSearchText,
                  newSearchText,
                  isClearing: newSearchText === '',
                  originalValueType: typeof value,
                },
                source: 'SubnamespaceSelectionStep',
                component: 'search-input-onChange',
              });

              setSearchText(newSearchText);
            }}
            allowClear
            onClear={() => {
              logger.info({
                message: 'User cleared search text',
                data: {
                  previousSearchText: searchText,
                  totalSubNamespaces: subNamespaces.length,
                },
                source: 'SubnamespaceSelectionStep',
                component: 'search-input-onClear',
              });

              // Edge case: Ensure set to empty string when clearing
              setSearchText('');
            }}
          />
        </div>
      )}

      {/* Edge case handling: Empty array, null, undefined */}
      {(!Array.isArray(subNamespaces) || subNamespaces.length === 0) &&
      !loading ? (
        <Empty
          icon={<IconCloud />}
          description="No available sub-namespaces for this product"
        />
      ) : (
        <div>
          {/* No results after search prompt */}
          {/* Edge case: Search text is not empty and filtered results are empty */}
          {sortedSubNamespaces.length === 0 && searchText.trim() ? (
            <Empty
              icon={<IconSearch />}
              description={`No sub-namespaces found containing "${searchText.trim()}"`}
            />
          ) : (
            <Radio.Group
              className="w-full"
              value={selectedSubnamespace || undefined}
              onChange={(value) => {
                // Edge case: Ensure value is string type
                const validValue =
                  typeof value === 'string' && value.trim()
                    ? value.trim()
                    : null;

                logger.info({
                  message: 'Radio.Group selection changed',
                  data: {
                    rawValue: value,
                    validValue,
                    previousSelection: selectedSubnamespace,
                    valueType: typeof value,
                    isSearching: Boolean(searchText.trim()),
                    searchText: searchText.trim() || undefined,
                  },
                  source: 'SubnamespaceSelectionStep',
                  component: 'radio-group-onChange',
                });

                onSubnamespaceSelect(validValue);
              }}
            >
              {sortedSubNamespaces.map((subNamespace) => {
                // Edge case: Ensure subNamespace is a valid string
                if (!subNamespace || typeof subNamespace !== 'string') {
                  return null;
                }

                return (
                  <SelectableItem
                    key={subNamespace}
                    selected={selectedSubnamespace === subNamespace}
                    radioValue={subNamespace}
                    onClick={() => handleSubNamespaceSelect(subNamespace)}
                    icon={<IconCloud />}
                    title={subNamespace}
                    description={`Product: ${selectedProduct.description} (${selectedProduct.namespace})`}
                  />
                );
              })}
            </Radio.Group>
          )}
        </div>
      )}

      {/* Edge case: Only show when selected sub-namespace is in current list */}
      {selectedSubnamespace &&
        Array.isArray(subNamespaces) &&
        subNamespaces.includes(selectedSubnamespace) && (
          <Alert
            className={'mt-2'}
            type="success"
            content={`Selected sub-namespace: ${selectedSubnamespace}`}
            showIcon
            closable={false}
          />
        )}
    </div>
  );
};

export default SubnamespaceSelectionStep;
