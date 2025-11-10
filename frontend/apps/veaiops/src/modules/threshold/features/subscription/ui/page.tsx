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

import {
  type ModuleType,
  detectModuleTypeFromPath,
  getModuleConfig,
} from '@/types/module';
import { useLocation } from '@modern-js/runtime/router';
import type React from 'react';
import { useMemo } from 'react';
import { SubscribeRelationTable } from './table';

interface SubscribeRelationPageProps {
  /** Module type, used to filter subscription relations */
  moduleType?: ModuleType;
  /** Page title */
  title?: string;
}

/**
 * Subscribe relation management page
 * @description Provides subscription relation management functionality, supports filtering by module type
 *
 * Optimization notes:
 * - Co-locates business logic into SubscribeRelationTable component
 * - Utilizes CustomTable's auto-refresh capability, no longer need to manually manage refresh
 * - Simplifies page component, only responsible for route parameter parsing and page-level logic
 */
const SubscribeRelationPage: React.FC<SubscribeRelationPageProps> = ({
  moduleType,
  title,
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

  return (
    <SubscribeRelationTable
      moduleType={detectedModuleType}
      title={pageTitle}
      showModuleTypeColumn
    />
  );
};

export default SubscribeRelationPage;
