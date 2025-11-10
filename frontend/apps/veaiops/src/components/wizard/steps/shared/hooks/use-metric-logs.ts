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
 * Metric selection step log management Hook
 * @description Handles log collection, export, and other functionality
 * @author AI Assistant
 * @date 2025-01-16
 */

import {
  exportLogsToFile,
  startLogCollection,
  stopLogCollection,
} from '@veaiops/utils';
import type { Connect, ZabbixTemplate } from 'api-generate';
import { useEffect } from 'react';
import type { DataSourceType } from '../../../types';

export interface UseMetricLogsProps {
  dataSourceType: DataSourceType;
  connect: Connect;
  selectedTemplate?: ZabbixTemplate | null;
  metricsCount: number;
}

export const useMetricLogs = ({
  dataSourceType,
  connect,
  selectedTemplate,
  metricsCount,
}: UseMetricLogsProps) => {
  // Log export functionality
  const handleExportLogs = () => {
    try {
      // Record export operation

      // Export log file
      exportLogsToFile(
        `datasource-wizard-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.log`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
    }
  };

  const handleStartLogCollection = () => {
    startLogCollection();
  };

  const handleStopLogCollection = () => {
    stopLogCollection();
  };

  // Start log collection when component mounts
  useEffect(() => {
    handleStartLogCollection();

    // Stop log collection when component unmounts
    return () => {
      handleStopLogCollection();
    };
  }, []);

  return {
    handleExportLogs,
    handleStartLogCollection,
    handleStopLogCollection,
  };
};
