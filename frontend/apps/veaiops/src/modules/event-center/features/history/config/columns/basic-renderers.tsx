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

import { AGENT_TYPE_MAP } from '@/pages/event-center/card-template/types';
import { EVENT_LEVEL_MAP } from '@ec/subscription';
import { CellRender } from '@veaiops/components';
import { EMPTY_CONTENT_TEXT } from '@veaiops/constants';

// Destructure CellRender components to avoid repeated calls
const { CustomOutlineTag } = CellRender;

/**
 * Render event ID - Use CopyableText component for display, convenient for copying
 * When there is no event ID, directly display "-", do not show copy button
 */
export const renderEventId = (value: string) => {
  if (!value) {
    return EMPTY_CONTENT_TEXT;
  }
  return <CellRender.CopyableText text={value} />;
};

/**
 * Render event level - Use color tag for display
 */
export const renderEventLevel = (value: string) => {
  return (
    <CustomOutlineTag>
      {EVENT_LEVEL_MAP[value]?.label || value || '-'}
    </CustomOutlineTag>
  );
};

/**
 * Render feature module - Use tag for display
 */
export const renderAgentType = (value: string) => {
  return value ? (
    <CustomOutlineTag>{AGENT_TYPE_MAP[value]?.label || value}</CustomOutlineTag>
  ) : (
    EMPTY_CONTENT_TEXT
  );
};

/**
 * Project data type definition
 * Supports string or object containing project information
 */
interface ProjectItem {
  name?: string;
  project_name?: string;
}

/**
 * Render project list - Use TagEllipsis component
 */
export const renderProjectList = (projects: unknown) => {
  if (!Array.isArray(projects) || !projects.length) {
    return <CellRender.Ellipsis text="-" />;
  }

  const dataList = projects.map((item: unknown, index: number) => {
    let projectName = `项目${index + 1}`;

    if (typeof item === 'string') {
      projectName = item;
    } else if (item && typeof item === 'object') {
      const projectItem = item as ProjectItem;
      projectName = projectItem.name || projectItem.project_name || projectName;
    }

    return {
      name: projectName,
      key: `project-${index}`,
    };
  });

  return (
    <CellRender.TagEllipsis
      dataList={dataList}
      maxCount={2}
      tagProps={{ size: 'small' }}
    />
  );
};

/**
 * Render region list - Use TagEllipsis component
 */
export const renderRegionList = (value: string[]) => (
  <CellRender.TagEllipsis
    dataList={(value || []).map((item, index) => ({
      name: item,
      key: `region-${index}`,
    }))}
    maxCount={1}
    tagProps={{ size: 'small' }}
  />
);

/**
 * Render timestamp - Use StampTime component
 */
export const renderTimestamp = (value: string) => (
  <CellRender.StampTime time={value} template="YYYY-MM-DD HH:mm:ss" />
);
