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

import {
  type FormItemControlProps,
  SelectBlockComponent,
  WrappedSelectBlock,
} from '@/form-control';
import { WrapperWithTitle } from '@/wrapper-with-title';
import { Button, Form, Input } from '@arco-design/web-react';
import type { FormListProps } from '@arco-design/web-react/es/Form/interface';
import { IconDelete, IconPlus } from '@arco-design/web-react/icon';
import type { FC } from 'react';
import styles from './index.module.less';

const TagKvsInput: FC<FormItemControlProps<FormListProps>> = (props) => {
  const { payload = {} } = props;
  return (
    <WrapperWithTitle
      title={'TagKvs'}
      level={2}
      style={{ margin: '10px 0 0 0' }}
    >
      <Form.List field="tagKvs">
        {(fields, { add, remove }) => {
          return (
            <div className={styles.tagKv}>
              {fields.map((item, index) => {
                return (
                  <div key={item.key || index} className={'flex gap-[5px]'}>
                    <Form.Item
                      field={`${item.field}.key`}
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    >
                      <Input placeholder={'Key'} style={{ width: 150 }} />
                    </Form.Item>
                    <Form.Item
                      field={`${item.field}.operator`}
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    >
                      <SelectBlockComponent
                        style={{ width: 150 }}
                        placeholder="Operator"
                        enumOptionConfig={{
                          key: payload?.operatorKey,
                          // isValueToNumber: true,
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      field={`${item.field}.value`}
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    >
                      <Input placeholder={'Value'} style={{ width: 150 }} />
                    </Form.Item>
                    <WrappedSelectBlock
                      isControl
                      required
                      inline
                      formItemProps={{ field: `${item.field}.groupBy` }}
                      controlProps={{
                        addBefore: 'Group by?',
                        style: { width: 200 },
                        enumOptionConfig: {
                          key: 'Boolean',
                          isValueToBoolean: true,
                        },
                      }}
                    />
                    <Button
                      icon={<IconDelete />}
                      shape="circle"
                      status="danger"
                      onClick={() => remove(index)}
                    />
                  </div>
                );
              })}
              <div>
                <Button
                  type={'text'}
                  icon={<IconPlus />}
                  onClick={() => {
                    add({ operator: '=', groupBy: true });
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          );
        }}
      </Form.List>
    </WrapperWithTitle>
  );
};

export { TagKvsInput };
