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

import { Typography } from "@arco-design/web-react";
import type { TableProps } from "@arco-design/web-react/es/Table";
import type { Project } from 'api-generate';
import React from "react";

const { Text } = Typography;

/**
 * Get project table configuration
 */
export const getProjectTableConfig = (): Partial<
  TableProps<Project>
> => ({
  pagination: {
    showTotal: true,
    showJumper: true,
    sizeCanChange: true,
    sizeOptions: [10, 20, 50, 100],
    defaultPageSize: 20,
  },
  scroll: { x: 1200 },
  stripe: true,
  hover: true,
  size: "default",
  noDataElement: (
    <div className="text-center py-10">
      <Text type="secondary">No project data available</Text>
    </div>
  ),
});
