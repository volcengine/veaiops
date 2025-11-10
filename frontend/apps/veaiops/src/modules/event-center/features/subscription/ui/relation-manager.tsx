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

import { useSubscribeRelation } from '@/hooks/use-subscribe-relation';
import {
  ModuleType,
  detectModuleTypeFromPath,
  getModuleConfig,
} from '@/types/module';
import { Card, Table, Typography } from '@arco-design/web-react';
import { useLocation } from '@modern-js/runtime/router';
import type { SubscribeRelationWithAttributes } from 'api-generate';
import type React from 'react';
import { useEffect, useMemo } from 'react';

const { Title } = Typography;

interface SubscribeRelationManagerProps {
  /** Module type, used to filter subscription relations */
  moduleType?: ModuleType;
  /** Page title */
  title?: string;
  /** Whether to show module type column */
  showModuleTypeColumn?: boolean;
  /** Custom action buttons */
  customActions?: (record: SubscribeRelationWithAttributes) => React.ReactNode;
  /** Callback for creating subscription relation */
  onCreateSubscription?: (moduleType: ModuleType) => void;
  /** Callback for editing subscription relation */
  onEditSubscription?: (record: SubscribeRelationWithAttributes) => void;
}

/**
 * Generic subscription relation management component
 * @description Provides subscription relation management functionality, supports filtering by module type
 */
export const SubscribeRelationManager: React.FC<
  SubscribeRelationManagerProps
> = ({
  moduleType,
  title,
  showModuleTypeColumn = true,
  // Note: These properties have been removed, using default behavior
  // _customActions,
  // _onCreateSubscription,
  // _onEditSubscription,
}) => {
  const location = useLocation();

  // Automatically determine module type based on route
  const detectedModuleType = useMemo(() => {
    if (moduleType) {
      return moduleType;
    }

    return detectModuleTypeFromPath(location.pathname);
  }, [moduleType, location.pathname]);

  // Set page title based on module type
  const pageTitle = useMemo(() => {
    if (title) {
      return title;
    }

    const config = getModuleConfig(detectedModuleType);
    return config.pageTitle;
  }, [title, detectedModuleType]);

  // Use subscription relation management hook
  const { subscribeRelations, loading, fetchSubscribeRelations } =
    useSubscribeRelation(detectedModuleType);

  // Filter subscription relations by module type
  const filteredSubscribeRelations = useMemo(() => {
    if (!subscribeRelations) {
      return [];
    }

    return subscribeRelations.filter((relation) => {
      // If no attributes, default to show in event center
      if (!relation.attributes || relation.attributes.length === 0) {
        return detectedModuleType === ModuleType.EVENT_CENTER;
      }

      // Check if there is a module type attribute
      const moduleAttr = relation.attributes.find(
        (attr) => attr.key === 'module_type',
      );

      if (moduleAttr) {
        return moduleAttr.value === detectedModuleType;
      }

      // If no module type attribute, default to show in event center
      return detectedModuleType === ModuleType.EVENT_CENTER;
    });
  }, [subscribeRelations, detectedModuleType]);

  // Table column configuration
  const columns = useMemo(() => {
    const baseColumns: any[] = [
      // ... existing code ...
    ];

    return baseColumns;
  }, []); // Remove unnecessary dependencies

  // Fetch subscription relation data when page loads
  useEffect(() => {
    fetchSubscribeRelations();
  }, [fetchSubscribeRelations, detectedModuleType]);

  return (
    <div>
      <Card>
        <div className="mb-4 flex justify-between items-center">
          <Title heading={5} className="m-0">
            {pageTitle}
          </Title>
        </div>

        <Table
          columns={columns}
          data={filteredSubscribeRelations}
          loading={loading}
          // Use backend _id to ensure unique keys for each row
          rowKey="_id"
          scroll={{ x: showModuleTypeColumn ? 1600 : 1480 }}
          pagination={{
            showTotal: true,
            sizeOptions: [10, 20, 50],
          }}
        />
      </Card>
    </div>
  );
};

export default SubscribeRelationManager;
