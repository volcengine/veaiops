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

import {} from "@arco-design/web-react";
import { CellRender } from "@veaiops/components";
import React from "react";
import type { ChannelType } from "api-generate";
import { getChannelTypeTranslation } from "./translations";

// Destructure CellRender component to avoid repeated calls
const { CustomOutlineTag } = CellRender;

/**
 * Render channel type tag
 */
export const renderChannelTag = (channel: ChannelType) => {
  // CustomOutlineTag does not support color prop, but supports style
  // Use style to set color, or remove color prop
  return (
    <CustomOutlineTag>
      {getChannelTypeTranslation(channel)}
    </CustomOutlineTag>
  );
};
