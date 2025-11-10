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

import apiClient from '@/utils/api-client';
import { Message } from '@arco-design/web-react';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import type {
    SubscribeRelationCreate,
    SubscribeRelationUpdate,
} from 'api-generate';

/**
 * Create subscription relation
 */
export const createSubscription = async (
  subscriptionData: SubscribeRelationCreate,
): Promise<boolean> => {
  try {
    const response =
      await apiClient.subscribe.postApisV1ManagerEventCenterSubscribe({
        requestBody: subscriptionData,
      });

    if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
      Message.success('事件订阅创建成功');
      return true;
    } else {
      throw new Error(response.message || 'Failed to create subscription relation');
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create subscription relation';
    Message.error(errorMessage);
    return false;
  }
};

/**
 * Update subscription relation
 */
export const updateSubscription = async (
  subscriptionId: string,
  updateData: SubscribeRelationUpdate,
): Promise<boolean> => {
  try {
    const response =
      await apiClient.subscribe.putApisV1ManagerEventCenterSubscribe({
        uid: subscriptionId,
        requestBody: updateData,
      });

    if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
      Message.success('订阅更新成功');
      return true;
    }

    throw new Error(response.message || 'Failed to update subscription relation');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update subscription relation';
    Message.error(errorMessage);
    return false;
  }
};

/**
 * Delete subscription relation
 */
export const deleteSubscription = async (
  subscriptionId: string,
): Promise<boolean> => {
  try {
    const response =
      await apiClient.subscribe.deleteApisV1ManagerEventCenterSubscribe({
        uid: subscriptionId,
      });

    if (response.code === API_RESPONSE_CODE.SUCCESS) {
      Message.success('订阅关系删除成功');
      return true;
    }

    throw new Error(response.message || 'Failed to delete subscription relation');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to delete subscription relation';
    Message.error(errorMessage);
    return false;
  }
};
