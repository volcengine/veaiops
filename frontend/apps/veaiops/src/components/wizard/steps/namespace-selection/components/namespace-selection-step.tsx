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

/**
 * Namespace selection step component
 * @description Used for selecting Aliyun namespaces
 * @author AI Assistant
 * @date 2025-01-16
 */

import { Alert, Empty, Input, Radio, Typography } from '@arco-design/web-react';
import { IconCloud, IconSearch } from '@arco-design/web-react/icon';
import { logger } from '@veaiops/utils';
import type { Connect } from 'api-generate';
import React, { useEffect, useMemo } from 'react';
import { SelectableItem } from '../../../components/selectable-item';
import styles from '../../../datasource-wizard.module.less';
import type { AliyunProject, WizardActions } from '../../../types';

const { Text } = Typography;

export interface NamespaceSelectionStepProps {
  connect: Connect;
  projects: AliyunProject[];
  selectNamespace: AliyunProject | null; // Renamed: selectedProject -> selectNamespace
  loading: boolean;
  hasAttemptedFetch: boolean;
  actions: WizardActions;
}

export const NamespaceSelectionStep: React.FC<NamespaceSelectionStepProps> = ({
  connect,
  projects,
  selectNamespace,
  loading,
  hasAttemptedFetch,
  actions,
}) => {
  const [searchText, setSearchText] = React.useState('');

  // Fetch namespace list when component mounts
  useEffect(() => {
    if (
      (connect?.id || connect?._id) &&
      projects.length === 0 &&
      !loading &&
      !hasAttemptedFetch
    ) {
      // ✅ Fixed: Remove unnecessary type assertion, use conditional check instead
      const connectId = connect.id || connect._id;
      if (connectId) {
        actions.fetchAliyunProjects(connectId);
      }
    }
  }, [
    connect?.name,
    projects.length,
    loading,
    hasAttemptedFetch,
    actions.fetchAliyunProjects,
  ]);

  // On first load, if no item selected and namespaces available, auto-select first one
  // Note: Only auto-select when no search text, avoid triggering auto-select during search causing loop
  useEffect(() => {
    const hasNoSearch = !searchText.trim();
    if (!selectNamespace && projects.length > 0 && !loading && hasNoSearch) {
      logger.info({
        message: '首次加载，自动选中第一个命名空间',
        data: {
          project: projects[0],
          totalCount: projects.length,
          searchText: searchText || undefined,
        },
        source: 'NamespaceSelectionStep',
        component: 'useEffect-auto-select-first',
      });
      actions.setSelectNamespace(projects[0]);
    }
  }, [
    projects.length,
    loading,
    selectNamespace,
    searchText,
    actions.setSelectNamespace,
  ]);

  // Filter namespaces (client-side filtering)
  const filteredProjects = useMemo(() => {
    const trimmedSearch = (searchText || '').trim();
    if (!trimmedSearch) {
      return projects;
    }

    const searchLower = trimmedSearch.toLowerCase();
    return projects.filter(
      (project) =>
        project.project?.toLowerCase().includes(searchLower) ||
        project.description?.toLowerCase().includes(searchLower) ||
        project.region?.toLowerCase().includes(searchLower),
    );
  }, [projects, searchText]);

  // Validate selected item validity: if search input exists and selected item not in search results, clear selection
  useEffect(() => {
    if (!selectNamespace || loading) {
      return;
    }

    const trimmedSearch = (searchText || '').trim();
    // Only validate when search text exists, avoid accidentally clearing when no search
    if (!trimmedSearch) {
      return;
    }

    const searchLower = trimmedSearch.toLowerCase();
    const isSelectedInFiltered =
      filteredProjects.some((p) => p.project === selectNamespace.project) &&
      (selectNamespace.project?.toLowerCase().includes(searchLower) ||
        selectNamespace.description?.toLowerCase().includes(searchLower) ||
        selectNamespace.region?.toLowerCase().includes(searchLower));

    if (!isSelectedInFiltered) {
      logger.info({
        message: '搜索时选中项不匹配搜索条件，清空选中状态',
        data: {
          searchText: trimmedSearch,
          selectedProject: selectNamespace.project,
          selectedDescription: selectNamespace.description,
          filteredCount: filteredProjects.length,
        },
        source: 'NamespaceSelectionStep',
        component: 'useEffect-validate-selection',
      });

      // setSelectNamespace supports null, can directly clear
      actions.setSelectNamespace(null);
    }
  }, [
    selectNamespace,
    filteredProjects,
    searchText,
    loading,
    actions.setSelectNamespace,
  ]);

  // Put selected item first for quick viewing during editing
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const aSelected = selectNamespace?.project === a.project;
    const bSelected = selectNamespace?.project === b.project;
    if (aSelected && !bSelected) {
      return -1;
    }
    if (!aSelected && bSelected) {
      return 1;
    }
    return 0;
  });

  if (loading) {
    return (
      <div className={styles.stepContent}>
        <div className={styles.stepTitle}>选择命名空间</div>
        <div className={styles.stepDescription}>
          正在从连接 {connect.name} 获取阿里云命名空间...
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className={styles.stepContent}>
        <div className={styles.stepTitle}>选择命名空间</div>
        <div className={styles.stepDescription}>
          从连接 {connect.name} 中选择一个阿里云命名空间
        </div>

        <Empty icon={<IconCloud />} description="暂无可用的命名空间" />
      </div>
    );
  }

  return (
    <div className={styles.stepContent}>
      <div className={styles.stepTitle}>命名空间</div>
      <div className={styles.stepDescription}>
        从连接 {connect.name}{' '}
        中选择一个阿里云命名空间，命名空间定义了监控数据的范围
      </div>

      {/* Search box */}
      <div className={styles.searchContainer}>
        <Input
          prefix={<IconSearch />}
          placeholder="搜索命名空间名称或描述..."
          value={searchText}
          onChange={setSearchText}
          allowClear
        />
      </div>

      <div className={styles.selectionList}>
        <Radio.Group
          className="w-full"
          value={selectNamespace?.project}
          onChange={(value) => {
            const project = projects.find((p) => p.project === value);
            if (project) {
              actions.setSelectNamespace(project);
            }
          }}
        >
          {sortedProjects.map((project) => (
            <SelectableItem
              key={project.project}
              selected={selectNamespace?.project === project.project}
              radioValue={project.project}
              onClick={() => actions.setSelectNamespace(project)}
              icon={<IconCloud />}
              title={project.project}
              description={project.description}
              extra={
                project.region && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    区域: {project.region}
                  </Text>
                )
              }
            />
          ))}
        </Radio.Group>
      </div>

      {sortedProjects.length === 0 && searchText && (
        <Empty
          icon={<IconSearch />}
          description={`未找到包含 "${searchText}" 的命名空间`}
        />
      )}

      {selectNamespace && (
        <Alert
          className={'mt-2'}
          type="success"
          content={`已选择命名空间: ${selectNamespace.project}`}
          showIcon
          closable={false}
        />
      )}
    </div>
  );
};

export default NamespaceSelectionStep;
