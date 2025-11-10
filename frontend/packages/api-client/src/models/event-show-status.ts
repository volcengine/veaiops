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

/* generated using openapi-typescript-codegen -- do not edit */
/**
 * Event show status with display names. Corresponds to Python EventShowStatus(str, Enum): PENDING="Pending", SUCCESS="Success", NOT_SUBSCRIBED="Not Subscribed", NOT_MATCHED="Not Matched", FILTERED="Filtered", RESTRAINED="Restrained". PENDING="Pending" (status 0,1,2), SUCCESS="Success" (status 3), NOT_SUBSCRIBED="Not Subscribed" (status 4), NOT_MATCHED="Not Matched" (status 11), FILTERED="Filtered" (status 12), RESTRAINED="Restrained" (status 13)
 */
export enum EventShowStatus {
  PENDING = '等待发送',
  SUCCESS = '发送成功',
  NOT_SUBSCRIBED = '未订阅',
  NOT_MATCHED = '未命中规则',
  FILTERED = '命中过滤规则',
  RESTRAINED = '告警抑制',
}
