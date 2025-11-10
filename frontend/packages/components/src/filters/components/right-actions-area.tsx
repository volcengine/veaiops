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

import type { FC, ReactNode } from 'react';
import { renderActions } from '../core/renderer';

interface RightActionsAreaProps {
  /** Action button list */
  actions: ReactNode[];
}

/**
 * Right actions area component
 * Responsible for rendering right-side action buttons
 */
const RightActionsArea: FC<RightActionsAreaProps> = ({ actions }) => {
  // If there are no action buttons, don't render
  if (!actions || actions.length === 0) {
    return null;
  }

  return renderActions(actions);
};

export { RightActionsArea };
export default RightActionsArea;
