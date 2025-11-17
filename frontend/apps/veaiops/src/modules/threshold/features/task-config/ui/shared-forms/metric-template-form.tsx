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

import { DocsDrawer } from '@/components/common/docs-drawer';
import { Button, Form, Slider } from '@arco-design/web-react';
import { FormItemWrapper, Input, WrapperWithTitle } from '@veaiops/components';
import type { FC } from 'react';
import { useCallback, useState } from 'react';

interface MetricTemplateFormProps {
  disabled?: boolean;
  prefixField?: string;
  operateType?: string;
}

/**
 * 指标模板表单组件
 * 基于参考项目的 MetricTemplateFormBase 组件实现
 */
const MetricTemplateForm: FC<MetricTemplateFormProps> = ({
  disabled = false,
  prefixField = '',
  operateType,
}) => {
  const [docsDrawerVisible, setDocsDrawerVisible] = useState(false);
  const getField = useCallback(
    (fieldName: string): string =>
      prefixField ? `${prefixField}.${fieldName}` : fieldName,
    [prefixField],
  );

  // 清洗任务中不展示最小步长和最小异常值、最小异常比例和填充值、展示系数和单异常剔除周期
  const isShow = operateType === 'ViewMetricTemplate' || disabled;
  const isCreate = operateType === 'create' || operateType === 'copy';

  const handleOpenDocs = () => {
    setDocsDrawerVisible(true);
  };

  return (
    <>
      <WrapperWithTitle
        title="指标详情"
        level={2}
        style={{ margin: '10px 0 0 0' }}
        actions={
          <Button
            type="text"
            size="small"
            onClick={handleOpenDocs}
            className="text-blue-600 hover:text-blue-700"
          >
            📖 查看文档
          </Button>
        }
      >
        <FormItemWrapper
          isControl
          formItemProps={{
            field: 'metric_template_value',
            noStyle: true,
          }}
        >
          <div
            className="flex justify-between flex-wrap bg-gray-50 p-4 border border-solid border-gray-200 rounded-md"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              backgroundColor: '#f9f9f9',
              padding: '16px',
              border: '1px solid #e5e5e5',
              borderRadius: '6px',
            }}
          >
            {isCreate ? (
              <>
                {/* 默认阈值下界 */}
                <Input.Number
                  isControl
                  required
                  inline
                  formItemProps={{
                    label: '默认阈值下界',
                    field: getField('normal_range_start'),
                    rules: [{ required: true, message: '请输入默认阈值下界' }],
                    extra: '阈值正常范围的下限值',
                  }}
                  controlProps={{
                    disabled: isShow,
                  }}
                />
                {/* 默认阈值上界 */}
                <Input.Number
                  isControl
                  required
                  inline
                  formItemProps={{
                    label: '默认阈值上界',
                    field: getField('normal_range_end'),
                    rules: [{ required: true, message: '请输入默认阈值上界' }],
                    extra: '阈值正常范围的上限值',
                  }}
                  controlProps={{
                    disabled: isShow,
                  }}
                />
              </>
            ) : (
              <>
                {/* 指标最小值 */}
                <Input.Number
                  isControl
                  required
                  inline
                  formItemProps={{
                    label: '指标最小值',
                    field: getField('min_value'),
                    rules: [{ required: true, message: '请输入指标最小值' }],
                    extra:
                      '指标数据的理论最小值，用于算法边界约束和异常值过滤（如：CPU使用率的最小值为0）',
                  }}
                  controlProps={{
                    disabled: isShow,
                  }}
                />

                {/* 指标最大值 */}
                <Input.Number
                  isControl
                  required
                  inline
                  formItemProps={{
                    label: '指标最大值',
                    field: getField('max_value'),
                    rules: [{ required: true, message: '请输入指标最大值' }],
                    extra:
                      '指标数据的理论最大值，用于算法边界约束和异常值过滤（如：CPU使用率的最大值为100）',
                  }}
                  controlProps={{
                    disabled: isShow,
                  }}
                />

                {/* 默认阈值下界 */}
                <Input.Number
                  isControl
                  inline
                  formItemProps={{
                    label: '默认阈值下界',
                    field: getField('normal_range_start'),
                    extra:
                      '正常范围的下限值，低于此值可能触发异常告警（如：CPU使用率正常起始值为20%）',
                  }}
                  controlProps={{
                    disabled: isShow,
                  }}
                />

                {/* 默认阈值上界 */}
                <Input.Number
                  isControl
                  inline
                  formItemProps={{
                    label: '默认阈值上界',
                    field: getField('normal_range_end'),
                    extra:
                      '正常范围的上限值，高于此值可能触发异常告警（如：CPU使用率正常终止值为80%）',
                  }}
                  controlProps={{
                    disabled: isShow,
                  }}
                />

                {/* 展示系数 */}
                <Input.Number
                  isControl
                  required
                  inline
                  formItemProps={{
                    label: '展示系数',
                    field: getField('linear_scale'),
                    rules: [{ required: true, message: '请输入展示系数' }],
                    extra:
                      '用于数据展示的缩放系数，影响阈值在界面上的显示数值（如：1.0表示不缩放，100表示放大100倍）',
                  }}
                  controlProps={{
                    disabled: isShow,
                  }}
                />

                {/* 最长无数据时间 */}
                <Input.Number
                  isControl
                  required
                  inline
                  formItemProps={{
                    label: '最长无数据时间',
                    field: getField('max_time_gap'),
                    rules: [
                      { required: true, message: '请输入最长无数据时间' },
                      {
                        type: 'number',
                        min: 1,
                        message: '最长无数据时间必须大于0',
                      },
                    ],
                    extra:
                      '允许数据源无数据的最长时间间隔，超过此时间将触发异常告警（建议：5-60分钟）',
                  }}
                  controlProps={{
                    suffix: '分钟',
                    disabled: isShow,
                  }}
                />

                {/* 最小数据时间 */}
                <Input.Number
                  isControl
                  required
                  inline
                  formItemProps={{
                    label: '最小数据时间',
                    field: getField('min_ts_length'),
                    rules: [{ required: true, message: '请输入最小数据时间' }],
                    extra:
                      '进行阈值计算所需的最小时序数据长度，确保算法有足够的数据进行分析（建议：2880分钟，即2天数据）',
                  }}
                  controlProps={{
                    suffix: '分钟',
                    disabled: isShow,
                  }}
                />
              </>
            )}
          </div>
        </FormItemWrapper>
      </WrapperWithTitle>
      {/* 文档抽屉 */}
      <DocsDrawer
        visible={docsDrawerVisible}
        onClose={() => setDocsDrawerVisible(false)}
        anchor="指标模板管理"
      />
    </>
  );
};

export default MetricTemplateForm;
