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

import type { FormInstance } from '@arco-design/web-react';
import type { BotFormData } from '@bot/lib';
import type React from 'react';

/**
 * Add knowledge base collection
 */
export const addKbCollection = (
  kbCollections: string[],
  setKbCollections: React.Dispatch<React.SetStateAction<string[]>>,
): void => {
  setKbCollections([...kbCollections, '']);
};

/**
 * Remove knowledge base collection
 */
export const removeKbCollection = ({
  index,
  kbCollections,
  form,
  setKbCollections,
}: {
  index: number;
  kbCollections: string[];
  form: FormInstance<BotFormData>;
  setKbCollections: React.Dispatch<React.SetStateAction<string[]>>;
}): void => {
  const newCollections = kbCollections.filter((_, i) => i !== index);
  setKbCollections(newCollections);
  const currentValues = form.getFieldsValue();
  form.setFieldsValue({
    ...currentValues,
    volc_cfg: {
      ...currentValues.volc_cfg,
      extra_kb_collections: newCollections,
    },
  });
};

/**
 * Update knowledge base collection
 */
export const updateKbCollection = ({
  index,
  value,
  kbCollections,
  form,
  setKbCollections,
}: {
  index: number;
  value: string;
  kbCollections: string[];
  form: FormInstance<BotFormData>;
  setKbCollections: React.Dispatch<React.SetStateAction<string[]>>;
}): void => {
  const newCollections = [...kbCollections];
  newCollections[index] = value;
  setKbCollections(newCollections);
  const currentValues = form.getFieldsValue();
  form.setFieldsValue({
    ...currentValues,
    volc_cfg: {
      ...currentValues.volc_cfg,
      extra_kb_collections: newCollections,
    },
  });
};
