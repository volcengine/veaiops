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

// Import React related modules and components

// Import components from arco-design/web-react module for creating tooltips and typography elements
import {
  type LinkProps as ArcoLinkProps,
  Typography,
} from '@arco-design/web-react';

import type {
  OperationsProps,
  TypographyEllipsisProps,
} from '@arco-design/web-react/es/Typography/interface';

// hooks
import { entries, isEmpty } from 'lodash-es';
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useMemo,
} from 'react';

import { EMPTY_CONTENT } from '@veaiops/constants';

type RoutePathCfg = {
  path?: string;
  id?: string | number;
  isLinkOutside?: boolean;
  filter?: Record<string, string | number | boolean>;
};

export type RoutePathType = string | RoutePathCfg;

export type CellInfoWithCodeProps = {
  name?: string | number;
  copyable?: boolean;
  code?: string | number;
  isNameEmptyLabelShow?: boolean;
  isCodeShow?: boolean;
  isCodeUndefinedShow?: boolean;
  direction?: 'vertical' | 'horizontal';
  nameLabel?: string;
  codeLabel?: string;
  nameLabelClassName?: string;
  codeLabelClassName?: string;
  routePath?: RoutePathType;
  state?: Record<string, unknown>;
  style?: CSSProperties;
  codeProps?: Partial<OperationsProps>;
  codeEmpty?: ReactNode;
  cellInfoNameProps?: Partial<OperationsProps>;
  cellInfoNameEllipsisProps?: TypographyEllipsisProps;
  linkProps?: ArcoLinkProps & {
    target: string;
    rel: string;
  };
  center?: boolean;
  navigate?: (url: string, state?: Record<string, unknown>) => void;
};

const isRoutePath = (
  routePath: RoutePathType | undefined,
): routePath is RoutePathCfg => typeof routePath === 'object';

const getHref = (
  routePath: RoutePathType | undefined,
  code: string | number | undefined,
): string => {
  if (isRoutePath(routePath)) {
    if (routePath.filter && !isEmpty(routePath.filter)) {
      return entries(routePath.filter).reduce((link, cur, idx) => {
        if (idx === 0) {
          return `${link}${cur?.[0]}=${cur?.[1]}`;
        }
        return `${link}&${cur?.[0]}=${cur?.[1]}`;
      }, `${routePath.path}?`);
    } else {
      return `${routePath.path}/${routePath.id}/info`;
    }
  } else if (
    routePath &&
    (routePath as unknown as RoutePathCfg)?.isLinkOutside
  ) {
    return (routePath as unknown as RoutePathCfg).path as string;
  } else if (routePath) {
    return `${routePath}/${code}/info`;
  } else {
    return '';
  }
};

// Extract constants
const DEFAULT_STYLES = {
  container: {
    width: '100%',
  },
  nameText: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 0,
  },
  codeLabel: {
    color: 'rgb(115, 122, 135)',
    fontSize: 12,
  },
} as const;

const DEFAULT_LABELS = {
  name: 'Name',
  code: 'ID',
} as const;

// Extract reusable components
const Label = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <Typography.Ellipsis className={`text-black-6 inline-block ${className}`}>
    {children}：
  </Typography.Ellipsis>
);

const NameContent = ({
  name,
  href,
  style,
  center,
  copyable,
  cellInfoNameProps,
  cellInfoNameEllipsisProps,
  handleClick,
}: {
  name: string | number;
  href: string;
  style?: CSSProperties;
  center?: boolean;
  copyable?: boolean;
  cellInfoNameProps?: Partial<OperationsProps>;
  cellInfoNameEllipsisProps?: TypographyEllipsisProps;
  handleClick: (e: React.MouseEvent<HTMLSpanElement>) => void;
}) => (
  <Typography.Text
    style={{
      ...DEFAULT_STYLES.nameText,
      color: href ? 'rgb(var(--link-6))' : 'inherit',
      cursor: href ? 'pointer' : 'href',
      width: '100%',
      justifyContent: center ? 'center' : style?.justifyContent,
      ...style,
    }}
    ellipsis={false}
    onClick={handleClick}
    {...cellInfoNameProps}
    copyable={copyable}
  >
    <Typography.Ellipsis
      style={{ maxWidth: copyable ? '90%' : '100%' }}
      showTooltip
      {...cellInfoNameEllipsisProps}
    >
      {name}
    </Typography.Ellipsis>
  </Typography.Text>
);

const CodeContent = ({
  code,
  codeLabel,
  codeLabelClassName,
  codeProps,
  codeEmpty,
  isCodeUndefinedShow,
}: {
  code?: string | number;
  codeLabel?: string;
  codeLabelClassName?: string;
  codeProps?: Partial<OperationsProps>;
  codeEmpty?: ReactNode;
  isCodeUndefinedShow?: boolean;
}) => {
  if (!code) {
    return (
      <div className="text-left">
        {isCodeUndefinedShow && (
          <span
            className={`inline-block ${codeLabelClassName}`}
            style={DEFAULT_STYLES.codeLabel}
          >
            {codeLabel || DEFAULT_LABELS.code}：
          </span>
        )}
        <span className="text-gray-default">{codeEmpty}</span>
      </div>
    );
  }

  return (
    <Typography.Text
      copyable={Boolean(code)}
      type="secondary"
      style={{ marginBottom: 0, ...DEFAULT_STYLES.codeLabel }}
      {...codeProps}
    >
      {isCodeUndefinedShow && codeLabel && `${codeLabel}：`}
      {code}
    </Typography.Text>
  );
};

const CellInfoWithCode = ({
  name,
  code,
  routePath,
  state = {},
  nameLabel = DEFAULT_LABELS.name,
  codeLabel = DEFAULT_LABELS.code,
  nameLabelClassName,
  codeLabelClassName,
  copyable = false,
  codeEmpty = EMPTY_CONTENT,
  isCodeShow = true,
  isCodeUndefinedShow = false,
  isNameEmptyLabelShow = false,
  center = false,
  direction = 'vertical',
  style = DEFAULT_STYLES.container,
  codeProps = {},
  cellInfoNameProps = {},
  cellInfoNameEllipsisProps = {},
  linkProps,
  navigate,
}: CellInfoWithCodeProps) => {
  // Cache href calculation result
  const href = useMemo(() => getHref(routePath, code), [routePath, code]);

  // Cache click handler function
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      if (!routePath || !navigate) {
        e.preventDefault();
        return;
      }

      const target = e.target as HTMLElement;
      if (
        target.classList?.length === 0 ||
        target.classList.contains('arco-icon-copy') ||
        target.classList.contains('arco-typography-operation-copy')
      ) {
        e.preventDefault();
        return;
      }

      if (isRoutePath(routePath) && routePath.isLinkOutside) {
        window.open(routePath.path, linkProps?.target || '_blank');
      } else {
        const url = getHref(routePath, code);
        if (url) {
          navigate(url, { state });
        }
      }
    },
    [routePath, code, state, navigate, linkProps?.target],
  );

  // Cache name content
  const nameContent = useMemo(() => {
    if (!name) {
      if (!isNameEmptyLabelShow && !isCodeShow) {
        return EMPTY_CONTENT;
      }
      return (
        <div>
          {isNameEmptyLabelShow && (
            <Label className={nameLabelClassName}>{nameLabel}</Label>
          )}
          {EMPTY_CONTENT}
        </div>
      );
    }

    return (
      <NameContent
        name={name}
        href={href}
        style={style}
        center={center}
        copyable={copyable}
        cellInfoNameProps={cellInfoNameProps}
        cellInfoNameEllipsisProps={cellInfoNameEllipsisProps}
        handleClick={handleClick}
      />
    );
  }, [
    name,
    href,
    style,
    center,
    copyable,
    cellInfoNameProps,
    cellInfoNameEllipsisProps,
    handleClick,
    isNameEmptyLabelShow,
    isCodeShow,
    nameLabelClassName,
    nameLabel,
  ]);

  // Cache code content
  const codeContent = useMemo(() => {
    if (!isCodeShow || (isCodeUndefinedShow && !code)) {
      return null;
    }

    return (
      <CodeContent
        code={code}
        codeLabel={codeLabel}
        codeLabelClassName={codeLabelClassName}
        codeProps={codeProps}
        codeEmpty={codeEmpty}
        isCodeUndefinedShow={isCodeUndefinedShow}
      />
    );
  }, [
    isCodeShow,
    isCodeUndefinedShow,
    code,
    codeLabel,
    codeLabelClassName,
    codeProps,
    codeEmpty,
  ]);

  // Cache whether to show empty content
  const shouldShowEmpty = useMemo(
    () =>
      !name &&
      !code &&
      !isNameEmptyLabelShow &&
      !isCodeUndefinedShow &&
      !isCodeShow,
    [name, code, isNameEmptyLabelShow, isCodeUndefinedShow, isCodeShow],
  );

  // Cache container class name
  const containerClassName = useMemo(
    () => `flex ${direction === 'vertical' ? 'flex-col' : 'flex-row gap-2'}`,
    [direction],
  );

  // Cache final rendered content - moved before conditional statements
  const finalContent = useMemo(
    () => (
      <div className={containerClassName}>
        {isNameEmptyLabelShow ? (
          <div className="flex">
            <Label className={nameLabelClassName}>{nameLabel}</Label>
            {nameContent}
          </div>
        ) : (
          nameContent
        )}
        {codeContent}
      </div>
    ),
    [
      containerClassName,
      isNameEmptyLabelShow,
      nameLabelClassName,
      nameLabel,
      nameContent,
      codeContent,
    ],
  );

  if (shouldShowEmpty) {
    return EMPTY_CONTENT;
  }

  return finalContent;
};

export { CellInfoWithCode };
