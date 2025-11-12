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

import { Button, Drawer, Space, Tag } from '@arco-design/web-react';
import { useRuleDrawer } from '@oncall-config/hooks';
import type { RuleDrawerProps } from '@oncall-config/lib';
import { DetailView, EditForm } from '@oncall-config/ui';
import { DrawerFormContent } from '@veaiops/utils';

/**
 * Rule Drawer Component - View details and edit
 *
 * Refactoring Notes:
 * - Current branch: Refactored as unified rule-drawer.tsx, supports both view and edit modes
 * - Feature parity: ✅ Aligned with all features from original branch
 *   - Alert level field (level) ✅
 *   - Conditional display logic (based on inspect_category) ✅
 *   - Time format support (silence_delta) ✅
 *   - Positive/negative examples fields (SEMANTIC mode) ✅
 *
 * Component Breakdown:
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

  // View mode - Display rule details
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

  // Edit mode - Create or update rule
  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-1 h-5 rounded ${
              isEdit
                ? 'bg-[rgb(var(--blue-6))]'
                : 'bg-gradient-to-br from-[#667eea] to-[#764ba2]'
            }`}
          />
          <span className="text-base font-semibold">
            {isEdit ? '编辑规则' : '创建新规则'}
          </span>
        </div>
      }
      visible={visible}
      onCancel={onCancel}
      width={800}
      focusLock={false}
      footer={
        <div className="flex justify-between items-center">
          <div className="text-xs text-[var(--color-text-3)]">
            {!isEdit && <span>💡 提示：创建后行为类别和检测类别不可修改</span>}
          </div>
          <Space>
            <Button onClick={onCancel} size="large">
              取消
            </Button>
            <Button
              type="primary"
              loading={loading}
              size="large"
              onClick={() => {
                handleSubmit(onSubmit);
              }}
              className={`min-w-[100px] border-none ${
                !isEdit ? 'bg-gradient-to-br from-[#667eea] to-[#764ba2]' : ''
              }`}
            >
              {isEdit ? '保存修改' : '立即创建'}
            </Button>
          </Space>
        </div>
      }
    >
      <DrawerFormContent loading={loading}>
        <EditForm
          form={form}
          inspectCategory={inspectCategory}
          currentSilenceDelta={currentSilenceDelta}
          rule={rule}
          isEdit={isEdit}
          onSilenceDeltaChange={setCurrentSilenceDelta}
        />
      </DrawerFormContent>
    </Drawer>
  );
};
