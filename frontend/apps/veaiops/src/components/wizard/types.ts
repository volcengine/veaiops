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

import type {
  Connect,
  ZabbixHost,
  ZabbixItem,
  ZabbixTemplate,
  ZabbixTemplateMetric,
} from 'api-generate';

// Import generated DataSource.type enum from @veaiops/api-client (single source of truth principle)
import { DataSource } from '@veaiops/api-client';

/**
 * Extended ZabbixHost type that supports saving itemid (for edit mode)
 */
export interface ZabbixHostWithItem extends ZabbixHost {
  itemid?: string; // Optional itemid, pre-filled from targets in edit mode
}

/**
 * Data source type enum (wizard-specific)
 *
 * Why use DataSource.type instead of DataSourceType:
 * - DataSource.type uses lowercase values ('zabbix', 'aliyun', 'volcengine'), which matches wizard requirements
 * - DataSourceType uses capitalized values ('Zabbix', 'Aliyun', 'Volcengine'), used for Connect type
 * - Wizard needs to be consistent with the type field of DataSource objects
 *
 * Mapping relationships:
 * - DataSource.type.ZABBIX = 'zabbix' ↔ Python DataSourceType.Zabbix = "Zabbix"
 * - DataSource.type.ALIYUN = 'aliyun' ↔ Python DataSourceType.Aliyun = "Aliyun"
 * - DataSource.type.VOLCENGINE = 'volcengine' ↔ Python DataSourceType.Volcengine = "Volcengine"
 *
 * @see frontend/packages/api-client/src/models/data-source.ts
 * @see veaiops/schema/types.py (DataSourceType enum)
 */

/**
 * Data source type (type alias)
 * Used for type annotations, e.g.: function fn(type: DataSourceType) { ... }
 */
export type DataSourceType = DataSource.type;

/**
 * Data source type enum values (constants object)
 * Used for value access, e.g.: if (type === DataSourceType.ZABBIX) { ... }
 *
 * ✅ Fixed: Replaced namespace with constants object to avoid ESLint errors
 * - Removed namespace (violates @typescript-eslint/no-namespace)
 * - Used object destructuring to avoid prefer-destructuring error
 * - TypeScript allows type and value with same name in different contexts
 * - Maintains backward compatibility: can be used as DataSourceType.ZABBIX
 */
const { ZABBIX, ALIYUN, VOLCENGINE } = DataSource.type;

/**
 * Data source type constants
 * Export as const object for value access
 * Note: TypeScript allows type alias and const with same name
 */
export const DataSourceType = {
  ZABBIX,
  ALIYUN,
  VOLCENGINE,
} as const satisfies Record<string, DataSource.type>;

/**
 * Wizard step enum
 */
export enum WizardStep {
  TYPE_SELECTION = -1, // Type selection phase
  FIRST_STEP = 0, // First configuration step
}

/**
 * Data source type configuration
 */
export interface DataSourceTypeConfig {
  type: DataSourceType;
  name: string;
  description: string;
  icon: string;
  steps: StepConfig[];
}

/**
 * Step configuration
 */
export interface StepConfig {
  key: string;
  title: string;
  description: string;
  component: string;
}

// Use API-generated types, no longer define duplicate types

/**
 * Aliyun-related types
 */
export interface AliyunProject {
  project: string;
  description?: string;
  region?: string;
}

export interface AliyunMetric {
  metricName: string;
  namespace: string;
  description?: string;
  unit?: string;
  dimensions?: AliyunDimension[];
  // Dimension array parsed from backend Dimensions string
  dimensionKeys?: string[];
}

export interface AliyunDimension {
  key: string;
  value?: string;
}

export interface AliyunInstance {
  instanceId: string;
  instanceName?: string;
  region?: string;
  dimensions: Record<string, string>;
}

/**
 * Volcengine-related types
 */
export interface VolcengineProduct {
  namespace: string;
  name: string;
  description?: string;
}

export interface VolcengineMetric {
  metricName: string;
  namespace: string;
  subNamespace?: string;
  description?: string;
  unit?: string;
  dimensions?: VolcengineDimension[];
}

export interface VolcengineDimension {
  key: string;
  value?: string;
}

export interface VolcengineInstance {
  instanceId: string;
  instanceName?: string;
  region?: string;
  namespace: string;
  subNamespace?: string;
  dimensions: Record<string, string>;
}

/**
 * Wizard state
 */
export interface WizardState {
  // Common state
  currentStep: number;
  dataSourceType: DataSourceType | null;
  connects: Connect[];
  selectedConnect: Connect | null;
  dataSourceName: string;
  dataSourceDescription: string;
  editingDataSourceId?: string; // Data source ID being edited (edit mode)

  // Zabbix state
  zabbix: {
    templates: ZabbixTemplate[];
    selectedTemplate: ZabbixTemplate | null;
    metrics: ZabbixTemplateMetric[];
    selectedMetric: ZabbixTemplateMetric | null;
    hosts: ZabbixHost[];
    selectedHosts: ZabbixHostWithItem[]; // Use extended type to support itemid in edit mode
    items: ZabbixItem[];
    searchText: string;
  };

  // Aliyun state
  aliyun: {
    projects: AliyunProject[];
    selectNamespace: AliyunProject | null; // Renamed: selectedProject -> selectNamespace, more aligned with Aliyun concept
    metrics: AliyunMetric[];
    selectedMetric: AliyunMetric | null;
    instances: AliyunInstance[];
    selectedInstances: AliyunInstance[];
    selectedGroupBy: string[]; // Selected grouping dimensions
    hasAttemptedFetch: boolean;
    region: string | null; // Region ID (entered by user in connection selection step)
    searchText: string; // Search text (for filtering metrics)
  };

  // Volcengine state
  volcengine: {
    products: VolcengineProduct[];
    selectedProduct: VolcengineProduct | null;
    subNamespaces: string[];
    selectedSubNamespace: string | null;
    metrics: VolcengineMetric[];
    selectedMetric: VolcengineMetric | null;
    instances: VolcengineInstance[];
    selectedInstances: VolcengineInstance[];
    selectedGroupBy: string[]; // Selected grouping dimensions
    region: string | null; // Selected region (required, entered by user)
    searchText: string;
  };

  // Loading state
  loading: {
    connects: boolean;
    templates: boolean;
    metrics: boolean;
    hosts: boolean;
    items: boolean;
    projects: boolean;
    instances: boolean;
    products: boolean;
    subNamespaces: boolean;
    creating: boolean;
  };
}

/**
 * Wizard actions
 */
export interface WizardActions {
  // Common actions
  setCurrentStep: (step: number) => void;
  setDataSourceType: (type: DataSourceType) => void;
  setSelectedConnect: (connect: Connect | null) => void;
  setDataSourceName: (name: string) => void;
  setDataSourceDescription: (description: string) => void;
  setEditingDataSourceId: (id?: string) => void;
  resetWizard: () => void;

  // Connection actions
  fetchConnects: (dataSourceType?: DataSourceType) => Promise<void>;

  // Zabbix actions
  fetchZabbixTemplates: (connectName: string, name?: string) => Promise<void>;
  setSelectedTemplate: (template: ZabbixTemplate | null) => void;
  fetchZabbixMetrics: (
    connectName: string,
    templateId: string,
  ) => Promise<void>;
  setSelectedMetric: (metric: ZabbixTemplateMetric | null) => void;
  fetchZabbixHosts: (connectName: string, templateId: string) => Promise<void>;
  setSelectedHosts: (hosts: ZabbixHost[]) => void;
  fetchZabbixItems: (
    connectName: string,
    host: string,
    metricName: string,
  ) => Promise<void>;
  setZabbixSearchText: (text: string) => void;

  // Aliyun actions
  fetchAliyunProjects: (connectName: string) => Promise<void>;
  setSelectNamespace: (namespace: AliyunProject | null) => void; // Renamed: setSelectedProject -> setSelectNamespace
  fetchAliyunMetrics: (connectName: string) => Promise<void>;
  setSelectedAliyunMetric: (metric: AliyunMetric | null) => void;
  fetchAliyunInstances: (
    connectName: string,
    namespace: string,
    metricName: string,
  ) => Promise<void>;
  setSelectedAliyunInstances: (instances: AliyunInstance[]) => void;
  setSelectedGroupBy: (groupBy: string[]) => void;
  setAliyunRegion: (region: string) => void;
  setAliyunSearchText: (text: string) => void;

  // Volcengine actions
  fetchVolcengineProducts: () => Promise<void>;
  setSelectedProduct: (product: VolcengineProduct | null) => void;
  fetchVolcengineSubNamespaces: (namespace: string) => Promise<void>;
  setSelectedSubNamespace: (subNamespace: string | null) => void;
  fetchVolcengineMetrics: (
    namespace?: string,
    subNamespace?: string,
  ) => Promise<void>;
  setSelectedVolcengineMetric: (metric: VolcengineMetric | null) => void;
  fetchVolcengineInstances: (
    connectName: string,
    region: string,
    namespace: string,
    subNamespace: string,
    metricName: string,
  ) => Promise<void>;
  setVolcengineInstances: (instances: VolcengineInstance[]) => void;
  setSelectedVolcengineInstances: (instances: VolcengineInstance[]) => void;
  setSelectedVolcengineGroupBy: (groupBy: string[]) => void;
  setVolcengineRegion: (region: string) => void;
  setVolcengineSearchText: (text: string) => void;

  // Create data source
  createDataSource: () => Promise<unknown>;
}

/**
 * Data source creation request
 */
export interface DataSourceCreateRequest {
  name: string;
  description?: string;
  type: DataSourceType;
  config:
    | ZabbixDataSourceCreateRequest
    | AliyunDataSourceCreateRequest
    | VolcengineDataSourceCreateRequest;
}

export interface ZabbixDataSourceCreateRequest {
  connect_name: string;
  template_id: string;
  metric_name: string;
  hosts: string[];
  items: ZabbixItem[];
}

export interface AliyunDataSourceCreateRequest {
  connect_name: string;
  project: string;
  namespace: string;
  metric_name: string;
  instances: AliyunInstance[];
}

export interface VolcengineDataSourceCreateRequest {
  connect_name: string;
  region: string;
  namespace: string;
  sub_namespace?: string;
  metric_name: string;
  instances: VolcengineInstance[];
}
