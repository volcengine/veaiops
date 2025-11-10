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
import { API_RESPONSE_CODE } from "@veaiops/constants";
import { logger } from "@veaiops/utils";
import type {
  IntelligentThresholdTask,
  IntelligentThresholdTaskCreateRequest,
  RerunIntelligentThresholdTaskRequest,
  UpdateTaskResultRequest,
} from "api-generate";
import type { TaskListResponse } from "../types";
import {
  transformApiResponseToTableData,
  transformQueryToApiRequest,
} from "./transformers";
import type { TaskQueryParams } from "./types";

/**
 * Real API request function
 */
export const realApiRequest = async (
  query: TaskQueryParams
): Promise<TaskListResponse> => {
  try {
    const apiRequest = transformQueryToApiRequest(query);
    const response =
      await apiClient.intelligentThresholdTask.getApisV1IntelligentThresholdTask(
        apiRequest
      );
    if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
      const tableData = Array.isArray(response.data)
        ? response.data.map(transformApiResponseToTableData)
        : [];

      return {
        data: tableData,
        total: response.total || tableData.length,
        skip: response.skip || 0,
        limit: response.limit || apiRequest.limit || 100,
      };
    } else {
      throw new Error(response.message || "Failed to fetch task list: Invalid response data format");
    }
  } catch (error) {
    // ✅ Correct: Use logger to record error and expose actual error information
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    logger.error({
      message: "Failed to fetch task list",
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
      },
      source: "TaskAPI",
      component: "realApiRequest",
    });
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch task list, please try again";
    Message.error(errorMessage);

    return {
      data: [],
      total: 0,
      skip: query.page_req.skip,
      limit: query.page_req.limit,
    };
  }
};

/**
 * Create task
 */
export const createTask = async (
  taskData: IntelligentThresholdTaskCreateRequest
): Promise<IntelligentThresholdTask & { key: string }> => {
  try {
    const response =
      await apiClient.intelligentThresholdTask.postApisV1IntelligentThresholdTask(
        {
          requestBody: taskData,
        }
      );

    if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
      return transformApiResponseToTableData(response.data);
    } else {
      throw new Error(response.message || "Failed to create task: Invalid response data format");
    }
  } catch (error) {
    // ✅ Correct: Use logger to record error and expose actual error information
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    logger.error({
      message: "Failed to create task",
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
      },
      source: "TaskAPI",
      component: "createTask",
    });
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to create task: Unknown error";
    Message.error(errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Rerun task
 */
export const rerunTask = async (
  taskData: RerunIntelligentThresholdTaskRequest
): Promise<boolean> => {
  try {
    const response =
      await apiClient.intelligentThresholdTask.postApisV1IntelligentThresholdTaskRerun(
        {
          requestBody: taskData,
        }
      );

    if (response.code === API_RESPONSE_CODE.SUCCESS) {
      Message.success("任务重新运行成功");
      return true;
    } else {
      throw new Error(response.message || "Failed to rerun task");
    }
  } catch (error) {
    // ✅ Correct: Use logger to record error and expose actual error information
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    logger.error({
      message: "Failed to rerun task",
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
      },
      source: "TaskAPI",
      component: "rerunTask",
    });
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to rerun task: Unknown error";
    Message.error(errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Update task result
 */
export const updateTaskResult = async (
  taskId: string,
  taskData: UpdateTaskResultRequest
): Promise<boolean> => {
  try {
    const response =
      await apiClient.intelligentThresholdTask.postApisV1IntelligentThresholdTaskUpdateResult(
        {
          taskId,
          requestBody: taskData,
        }
      );

    if (response.code === API_RESPONSE_CODE.SUCCESS) {
      Message.success("任务结果更新成功");
      return true;
    } else {
      throw new Error(response.message || "Failed to update task result: Invalid response data format");
    }
  } catch (error) {
    // ✅ Correct: Use logger to record error and expose actual error information
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    logger.error({
      message: "Failed to update task result",
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
      },
      source: "TaskAPI",
      component: "updateTaskResult",
    });
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to update task result: Unknown error";
    Message.error(errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Update auto refresh switch
 */
export const updateAutoRefreshSwitch = async (
  taskIds: string[],
  autoUpdate: boolean
): Promise<boolean> => {
  try {
    const response =
      await apiClient.intelligentThresholdTask.postApisV1IntelligentThresholdTaskAutoRefreshSwitch(
        {
          requestBody: {
            task_ids: taskIds,
            auto_update: autoUpdate,
          },
        }
      );

    if (response.code === API_RESPONSE_CODE.SUCCESS) {
      Message.success("自动刷新开关更新成功");
      return true;
    } else {
      throw new Error(response.message || "Failed to update auto refresh switch");
    }
  } catch (error) {
    // ✅ Correct: Use logger to record error and expose actual error information
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    logger.error({
      message: "Failed to update auto refresh switch",
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
      },
      source: "TaskAPI",
      component: "updateAutoRefreshSwitch",
    });
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to update auto refresh switch: Unknown error";
    Message.error(errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Delete task
 */
export const deleteTask = async (taskId: string): Promise<boolean> => {
  try {
    logger.info({
      message: '🗑️ [API] 开始调用删除任务 API',
      data: { taskId },
      source: 'TaskDataSource',
      component: 'deleteTask',
    });

    const response =
      await apiClient.intelligentThresholdTask.deleteApisV1IntelligentThresholdTask(
        {
          taskId,
        }
      );

    logger.info({
      message: '🗑️ [API] 删除任务 API 返回',
      data: {
        taskId,
        responseCode: response.code,
        success: response.code === API_RESPONSE_CODE.SUCCESS,
      },
      source: 'TaskDataSource',
      component: 'deleteTask',
    });

    if (response.code === API_RESPONSE_CODE.SUCCESS) {
      Message.success("任务删除成功");
      logger.info({
        message: '🗑️ [API] 任务删除成功，准备返回 true',
        data: { taskId },
        source: 'TaskDataSource',
        component: 'deleteTask',
      });
      return true;
    } else {
      throw new Error(response.message || "Failed to delete task");
    }
  } catch (error) {
    // ✅ Correct: Use logger to record error and expose actual error information
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    logger.error({
      message: "Failed to delete task",
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
      },
      source: "TaskAPI",
      component: "deleteTask",
    });
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete task: Unknown error";
    Message.error(errorMessage);
    return false;
  }
};
