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
export type VolcCfgPayload = {
  /**
   * Volcano Engine Access Key
   */
  ak?: string;
  /**
   * Volcano Engine Secret Key
   */
  sk?: string;
  /**
   * TOS region
   */
  tos_region: VolcCfgPayload.tos_region;
  /**
   * Network type
   */
  network_type: VolcCfgPayload.network_type;
  /**
   * Additional knowledge base collections
   */
  extra_kb_collections?: Array<string>;
};
export namespace VolcCfgPayload {
  /**
   * TOS region
   */
  export enum tos_region {
    CN_BEIJING = 'cn-beijing',
    CN_SHANGHAI = 'cn-shanghai',
    CN_GUANGZHOU = 'cn-guangzhou',
    CN_HONGKONG = 'cn-hongkong',
    AP_SOUTHEAST_1 = 'ap-southeast-1',
    AP_SOUTHEAST_3 = 'ap-southeast-3',
  }
  /**
   * Network type
   */
  export enum network_type {
    PUBLIC = 'public',
    INTERNAL = 'internal',
  }
}
