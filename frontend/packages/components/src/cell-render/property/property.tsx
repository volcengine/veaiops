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

import { EMPTY_CONTENT } from '@veaiops/constants';
import { BooleanRender } from '../boolean/boolean';
import { CustomBatchRender } from '../custom-array/custom-array';
import { EllipsisRender } from '../ellipsis/ellipsis';
import { CellInfoWithCode } from '../info-with-code/info-with-code';
import { JsonParseRender } from '../json-parse/array/array';
import { LinkRender } from '../link/link';
import { StampTimeRender } from '../time/time';

export enum RenderPropertyType {
  // Text ellipsis
  ELLIPSIS = 'ellipsis',
  BOOLEAN = 'boolean', // Boolean value
  TIME = 'time', // Time rendering
  LINK = 'link', // Link rendering
  JSON_PARSE = 'json_parse', // JSON rendering
  EMPLOYEE = 'employee', // Employee rendering
  EMPLOYEE_GROUP = 'employee_group', // Employee group rendering
  INFO_WITH_CODE = 'info_with_code', // Name + code combination
  FRONT_ENUMS = 'front_enums', // Frontend enum values
  CUSTOM_ARRAY = 'custom_array', // Batch rendering
  PRODUCT_LINE = 'product_line', // Product line rendering
  PRODUCT_LINES = 'product_lines', // Product line group rendering
}

interface RenderPropertyProps {
  renderType: RenderPropertyType;
  renderProps?: any;
}
export const RenderPropertyKeyMap = {
  [RenderPropertyType.ELLIPSIS]: 'text',
  [RenderPropertyType.BOOLEAN]: 'data',
  [RenderPropertyType.TIME]: 'time',
  [RenderPropertyType.LINK]: 'link',
  [RenderPropertyType.JSON_PARSE]: 'jsonStr',
  [RenderPropertyType.EMPLOYEE]: 'email',
  [RenderPropertyType.EMPLOYEE_GROUP]: 'emailData',
  [RenderPropertyType.FRONT_ENUMS]: 'code',
  [RenderPropertyType.PRODUCT_LINE]: 'productLine',
};
const PropertyRender = ({ renderType, renderProps }: RenderPropertyProps) => {
  const render = () => {
    switch (renderType) {
      case RenderPropertyType.ELLIPSIS:
        return <EllipsisRender {...renderProps} />;
      case RenderPropertyType.BOOLEAN:
        return <BooleanRender {...renderProps} />;
      case RenderPropertyType.TIME:
        return <StampTimeRender {...renderProps} />;
      case RenderPropertyType.LINK:
        return <LinkRender {...renderProps} />;
      case RenderPropertyType.JSON_PARSE:
        return <JsonParseRender {...renderProps} />;
      case RenderPropertyType.INFO_WITH_CODE:
        return <CellInfoWithCode {...renderProps} />;
      case RenderPropertyType.CUSTOM_ARRAY:
        return <CustomBatchRender {...renderProps} />;
      default:
        return renderProps?.value || EMPTY_CONTENT;
    }
  };
  return render();
};

export { PropertyRender };
