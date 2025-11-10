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
 * Data source connection management type definitions
 */

import { FormInstance } from "@arco-design/web-react";
import type { Connect, DataSourceType } from "api-generate";

// Data source connection panel Props
export interface DataSourceConnectionPanelProps {
  type: DataSourceType;
}

// Data source connection table Props
export interface DataSourceConnectionTableProps {
  type: DataSourceType;
  connects: Connect[];
  loading: boolean;
  selectedRowKeys?: string[];
  onSelectionChange?: (selectedRowKeys: string[]) => void;
  onRefresh: () => void;
  onEdit?: (connect: Connect) => void;
  onDelete?: (connect: Connect) => void;
  onTest?: (connect: Connect) => void;
  onCreateMonitor?: (connect: Connect) => void;
}

// Connection form Props
export interface ConnectFormProps {
  type: DataSourceType;
  initialValues?: Partial<Connect>;
  onSubmit: (values: any) => Promise<boolean>;
  onCancel: () => void;
  form: FormInstance;
}

// Connection test modal Props
export interface ConnectTestModalProps {
  visible: boolean;
  connect: Connect | null;
  onClose: () => void;
  externalTestResult?: TestResult;
  externalTesting?: boolean;
}

// Connection statistics
export interface ConnectionStats {
  total: number;
  active: number;
  inactive: number;
}

// Global connection statistics
export interface GlobalConnectionStats {
  zabbix: ConnectionStats;
  aliyun: ConnectionStats;
  volcengine: ConnectionStats;
}

// Connection test result
export interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

// Connection create request
export interface ConnectCreateRequest {
  name: string;
  type: DataSourceType;
  is_active?: boolean;
  // Zabbix fields
  zabbix_api_url?: string;
  zabbix_api_user?: string;
  zabbix_api_password?: string;
  // Aliyun fields
  aliyun_access_key_id?: string;
  aliyun_access_key_secret?: string;
  // Volcengine fields
  volcengine_access_key_id?: string;
  volcengine_access_key_secret?: string;
}

// Connection update request
export interface ConnectUpdateRequest {
  name?: string;
  is_active?: boolean;
  // Zabbix fields
  zabbix_api_url?: string;
  zabbix_api_user?: string;
  zabbix_api_password?: string;
  // Aliyun fields
  aliyun_access_key_id?: string;
  aliyun_access_key_secret?: string;
  // Volcengine fields
  volcengine_access_key_id?: string;
  volcengine_access_key_secret?: string;
}

// Page component Props
export interface ConnectionPageProps {
  className?: string;
}

// Table column configuration Props
export interface TableColumnsProps {
  type: DataSourceType;
  onEdit?: (connect: Connect) => void;
  onDelete?: (connect: Connect) => void;
  onTest?: (connect: Connect) => void;
  onCreateMonitor?: (connect: Connect) => void;
}

// Table filter Props
export interface TableFiltersProps {
  type: DataSourceType;
  onFilter?: (filters: Record<string, any>) => void;
}
