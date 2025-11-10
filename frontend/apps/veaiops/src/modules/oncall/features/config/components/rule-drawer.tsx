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

import { Button, Drawer, Space } from '@arco-design/web-react';
import { useRuleDrawer } from '@oncall-config/hooks';
import type { RuleDrawerProps } from '@oncall-config/lib';
import { DetailView, EditForm } from '@oncall-config/ui';
import { DrawerFormContent } from '@veaiops/utils';

/**
 * Rule drawer component - detail view and editing
 *
 * Refactoring notes:
 * - Original branch (feat/web-v2): rule-details-drawer.tsx and rule-edit-drawer.tsx handled detail and edit separately
 * - Current branch: Refactored to unified rule-drawer.tsx, supports both detail view and edit modes
 * - Functional equivalence: ✅ All original branch functionality aligned
 *   - Alert level field (level) ✅
 *   - Conditional display logic (based on inspect_category) ✅
 *   - Time format support (silence_delta) ✅
 *   - Positive/negative example fields (SEMANTIC mode) ✅
 *
 * Split notes:
 * - lib/types.ts: Type definitions
 * - hooks/use-rule-drawer.ts: Business logic and state management
 * - ui/components/rule-detail-view.tsx: Detail view component
 * - ui/components/rule-edit-form.tsx: Edit form component
 */
export const RuleDrawer = ({
  visible,
  isEdit,
  rule,
  form,
  onCancel,
  onSubmit,
  loading = false,
}: RuleDrawerProps) => {
  const {
    inspectCategory,
    currentSilenceDelta,
    setCurrentSilenceDelta,
    handleSubmit,
  } = useRuleDrawer({
    visible,
    isEdit,
    rule,
    form,
  });

  // Detail view mode
  if (!isEdit && rule) {
    return (
      <Drawer
        title="内容识别规则详情"
        visible={visible}
        onCancel={onCancel}
        width={800}
        placement="right"
        maskClosable
        closable
        footer={null}
        focusLock={false}
      >
        <DetailView rule={rule} />
      </Drawer>
    );
  }

  // Edit mode
  return (
    <Drawer
      title={isEdit ? '编辑规则' : '新增规则'}
      visible={visible}
      onCancel={onCancel}
      width={800}
      focusLock={false}
      footer={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button
            type="primary"
            loading={loading}
            onClick={() => {
              handleSubmit(onSubmit);
            }}
          >
            {isEdit ? '保存' : '创建'}
          </Button>
        </Space>
      }
    >
      <DrawerFormContent loading={Boolean(loading)}>
        <EditForm
          form={form}
          inspectCategory={inspectCategory}
          currentSilenceDelta={currentSilenceDelta}
          rule={rule}
          onSilenceDeltaChange={setCurrentSilenceDelta}
        />
      </DrawerFormContent>
    </Drawer>
  );
};

export type { RuleDrawerProps, RuleFormData } from '@oncall-config/lib';
