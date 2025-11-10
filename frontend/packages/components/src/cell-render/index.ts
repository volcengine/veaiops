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

// Export all subdirectory contents
// Re-export CellRender object for backward compatibility
import { BooleanRender } from './boolean/boolean';
import { CopyableTextRender } from './copy-text/copy-text';
import { CustomBatchRender } from './custom-array/custom-array';
import {
  CustomOutlineTagList,
  CustomOutlineTagRender,
} from './custom-outline-tag/custom-outline-tag';
import { DurationRender } from './duration/duration';
import { EllipsisRender } from './ellipsis/ellipsis';
import { CellInfoWithCode } from './info-with-code/info-with-code';
import { CellInfoWithTags } from './info-with-tags/info-with-tags';
import { IpsCellInfo } from './ip/ip';
import { LinkRender } from './link/link';
import { PropertyRender, RenderPropertyType } from './property/property';
import { RowSpanCellRender } from './row-span/row-span';
import { TagEllipsis as TagEllipsisRender } from './tag-ellipsis/tag-ellipsis';
import { StampTimeRender } from './time/time';

export * from './boolean';
export * from './copy-text';
export * from './custom-array';
export * from './custom-outline-tag';
export * from './duration';
export * from './ellipsis';
export * from './info-with-code';
export * from './info-with-tags';
export * from './ip';
export * from './link';
export * from './property';
export * from './row-span';
export * from './tag-ellipsis';
export * from './time';
export * from './types';

export type CellRenderComponentProps = {
  Batch: typeof CustomBatchRender;
  Ellipsis: typeof EllipsisRender;
  InfoWithCode: typeof CellInfoWithCode;
  InfoWithTags: typeof CellInfoWithTags;
  Ips: typeof IpsCellInfo;
  Link: typeof LinkRender;
  Boolean: typeof BooleanRender;
  StampTime: typeof StampTimeRender;
  Property: typeof PropertyRender;
  CopyableText: typeof CopyableTextRender;
  RowSpan: typeof RowSpanCellRender;
  TagEllipsis: typeof TagEllipsisRender;
  Duration: typeof DurationRender;
  CustomOutlineTag: typeof CustomOutlineTagRender;
  CustomOutlineTagList: typeof CustomOutlineTagList;
  RenderPropertyType: typeof RenderPropertyType;
};

export const CellRender: CellRenderComponentProps = {
  Batch: CustomBatchRender,
  Ellipsis: EllipsisRender,
  InfoWithCode: CellInfoWithCode,
  InfoWithTags: CellInfoWithTags,
  Ips: IpsCellInfo,
  Link: LinkRender,
  Boolean: BooleanRender,
  StampTime: StampTimeRender,
  Duration: DurationRender,
  Property: PropertyRender,
  CopyableText: CopyableTextRender,
  RowSpan: RowSpanCellRender,
  TagEllipsis: TagEllipsisRender,
  CustomOutlineTag: CustomOutlineTagRender,
  CustomOutlineTagList,
  // 🎯 Property type enumeration
  RenderPropertyType,
};
