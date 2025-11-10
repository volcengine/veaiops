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

import apiClient from "@/utils/api-client";
import { Message } from "@arco-design/web-react";
import type { Project as ApiProject } from 'api-generate';
import type { Project, ProjectFormData } from '@project/types';
import { API_RESPONSE_CODE } from "@veaiops/constants";

/**
 * Project list query parameters
 */
export interface ProjectListParams {
  skip?: number;
  limit?: number;
  name?: string;
  status?: string;
  priority?: string;
  owner?: string;
}

/**
 * Project list response
 */
export interface ProjectListResponse {
  data: Project[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Import log
 */
export interface ImportLog {
  level: "info" | "warning" | "error";
  message: string;
  timestamp: string;
}

/**
 * Import result
 */
export interface ImportResult {
  success: boolean;
  message: string;
  imported_count: number;
  failed_count: number;
  logs: ImportLog[];
}

/**
 * Get project list
 */
export const getProjectList = async (
  params: ProjectListParams = {}
): Promise<ProjectListResponse> => {
  try {
    // Note: Empty strings should be filtered out, only pass valid name values
    const nameParam =
      params.name && params.name.trim() !== ''
        ? params.name.trim()
        : undefined;
    const response =
      await apiClient.projects.getApisV1ManagerSystemConfigProjects({
        skip: params.skip || 0,
        limit: params.limit || 10,
        name: nameParam,
      });

    if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
      const projects = Array.isArray(response.data) ? response.data : [];

      // Convert backend data format to frontend format
      // Note: API returns Project type from api-generate (contains _id)
      // Project type only has _id and project_id fields, no id field
      const formattedProjects: Project[] = projects.map((item: ApiProject) => ({
        _id: item._id,
        project_id: item.project_id,
        name: item.name || "",
        is_active: item.is_active ?? true,
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
      }));

      return {
        data: formattedProjects,
        total: response.total || formattedProjects.length,
        skip: response.skip || 0,
        limit: response.limit || 10,
      };
    }

    throw new Error(response.message || "获取项目列表失败");
  } catch (error) {
    // ✅ Correct: expose actual error information
    const errorMessage =
      error instanceof Error
        ? error.message
        : "获取项目列表失败，请重试";
    Message.error(errorMessage);
    // ✅ Correct: convert error to Error object before throwing (complies with @typescript-eslint/only-throw-error rule)
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    throw errorObj;
  }
};

/**
 * Create project
 */
export const createProject = async (
  data: Pick<ProjectFormData, "project_id" | "name">
): Promise<boolean> => {
  try {
    const response =
      await apiClient.projects.postApisV1ManagerSystemConfigProjects({
        requestBody: {
          project_id: data.project_id,
          name: data.name,
        },
      });

    if (response.code === API_RESPONSE_CODE.SUCCESS) {
      return true;
    }

    throw new Error(response.message || "创建项目失败");
  } catch (error) {
    // ✅ Correct: expose actual error information
    const errorMessage =
      error instanceof Error ? error.message : "创建项目失败";
    Message.error(errorMessage);
    return false;
  }
};

/**
 * Delete project
 */
export const deleteProject = async (
  id: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response =
      await apiClient.projects.deleteApisV1ManagerSystemConfigProjects({
        projectId: id,
      });

    if (response.code === API_RESPONSE_CODE.SUCCESS) {
      Message.success("项目删除成功");
      return {
        success: true,
        message: "项目删除成功",
      };
    }

    throw new Error(response.message || "删除项目失败");
  } catch (error) {
    // ✅ Correct: expose actual error information
    const errorMessage =
      error instanceof Error ? error.message : "删除项目失败";
    Message.error(errorMessage);
    // ✅ Correct: convert error to Error object before throwing (complies with @typescript-eslint/only-throw-error rule)
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    throw errorObj;
  }
};

/**
 * Import project data
 * Uses Python backend's dedicated import interface, supports detailed logs
 */
export const importProjects = async (
  file: File,
  _onProgress?: (logs: ImportLog[]) => void
): Promise<ImportResult> => {
  try {
    // Check file type
    if (!file.name.endsWith(".csv")) {
      throw new Error("只支持CSV文件格式");
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("文件大小不能超过10MB");
    }

    const response =
      await apiClient.projects.postApisV1ManagerSystemConfigProjectsImport({
        formData: { file },
      });

    if (response.code === API_RESPONSE_CODE.SUCCESS) {
      const result: ImportResult = {
        success: true,
        message: response.message || "导入成功",
        imported_count: 0, // Get actual count from response
        failed_count: 0,
        logs: [
          {
            level: "info",
            message: response.message || "导入完成",
            timestamp: new Date().toISOString(),
          },
        ],
      };

      return result;
    }

    throw new Error(response.message || "导入项目失败");
  } catch (error) {
    // ✅ Correct: expose actual error information
    const errorMessage =
      error instanceof Error ? error.message : "导入项目失败";
    Message.error(errorMessage);

    return {
      success: false,
      message: errorMessage,
      imported_count: 0,
      failed_count: 1,
      logs: [
        {
          level: "error",
          message: errorMessage,
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }
};

/**
 * Query sync state interface
 *
 * Used for debug log export functionality, contains table query state information
 */
export interface QuerySyncState {
  /** Current page number */
  current?: number;
  /** Items per page */
  pageSize?: number;
  /** Filter conditions */
  filters?: Record<string, unknown>;
  /** Sort information */
  sorter?: Record<string, unknown>;
  /** URL search parameters */
  searchParams?: Record<string, unknown>;
}

/**
 * Export debug logs
 *
 * @param querySync - Query sync state object, contains table's current query state
 */
export const exportDebugLogs = (querySync: QuerySyncState) => {
  try {
    const debugData = {
      timestamp: new Date().toISOString(),
      module: "project-management",
      querySync: {
        current: querySync?.current,
        pageSize: querySync?.pageSize,
        filters: querySync?.filters,
        sorter: querySync?.sorter,
        searchParams: querySync?.searchParams,
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    const dataStr = JSON.stringify(debugData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `project-management-debug-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    Message.success("调试日志已导出");
  } catch (error) {
    // ✅ Correct: expose actual error information
    const errorMessage =
      error instanceof Error
        ? error.message
        : "导出调试日志失败";
    Message.error(errorMessage);
  }
};
