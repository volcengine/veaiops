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

import type { CustomFilterSettingProps } from '@/custom-table/types';
import { Alert, Divider, Drawer, Message } from '@arco-design/web-react';
import { IconDragDotVertical } from '@arco-design/web-react/icon';
import { uniqWith } from 'lodash-es';
/**
 * Draggable Filter Setting Component
 * Based on stability project implementation
 */
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type Layout, Responsive, WidthProvider } from 'react-grid-layout';
import styles from './draggable-filter-setting.module.less';

import 'react-grid-layout/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const dropItemStyle = { cursor: 'grab', minWidth: 420 };
const dropItemDraggingStyle = { cursor: 'grabbing', minWidth: 420 };
const dropTitleItemStyle = { fontWeight: 'bolder' };
const dividerStyle = {
  marginLeft: 0,
  marginRight: 8,
  borderLeft: '4px solid rgb(25 144 255)',
};

const multiSortFun = (first: keyof Layout) => (a: Layout, b: Layout) =>
  (a[first] as number) - (b[first] as number);

interface ElseArrayParams {
  selected: string[];
  all: string[];
}

const elseArray = ({ selected, all }: ElseArrayParams) => {
  const allData = [...all];
  selected.forEach((item) => {
    if (allData.indexOf(item) !== -1) {
      allData.splice(allData.indexOf(item), 1);
    }
  });
  return allData;
};

const DraggableFilterSetting: React.FC<CustomFilterSettingProps> = ({
  children,
  fixedOptions = [],
  allOptions: _allOptions = [],
  selectedOptions = [],
  hiddenOptions = [],
  onChange,
  title = 'Search Items Settings',
  saveFun,
  caseSelectText,
  mode = ['select'],
  ...restProps
}) => {
  const draggingRef = useRef(false);
  const [visible, setVisible] = useState(false);
  const selectOptionsRef = useRef(selectedOptions);
  const fixedOptionsRef = useRef(fixedOptions);
  const hiddenOptionsRef = useRef(hiddenOptions);
  const [popupContainerId, setPopupContainerId] = useState<
    string | undefined | null
  >();
  const [refresh, setRefresh] = useState(false);

  const onSort = useCallback(
    (newLayout: Layout[]) => {
      if (!draggingRef.current) {
        return;
      }
      const sortTypeList: string[] = Array.from(
        new Set(
          newLayout.sort(multiSortFun('y')).map((data: Layout) => {
            if (data.i.indexOf('_fixed_') === 4) {
              return data.i.slice(11);
            }
            if (data.i.indexOf('_selected_') === 4) {
              return data.i.slice(14);
            }
            if (data.i.indexOf('_else_') === 4) {
              return data.i.slice(10);
            }
            return data.i;
          }),
        ),
      );

      const loc_selected_divider = sortTypeList.indexOf('divider_selected');
      const loc_hidden_divider = sortTypeList.indexOf('divider_hidden');
      draggingRef.current = false;

      if (loc_selected_divider > loc_hidden_divider) {
        Message.error(
          'Displayed items cannot be hidden, please readjust the configuration',
        );
      } else {
        const fixed_fields = sortTypeList
          .slice(0, loc_selected_divider)
          .filter((item) => item !== 'divider_selected');
        const selected_fields = sortTypeList.slice(
          loc_selected_divider + 1,
          loc_hidden_divider,
        );
        const hidden_fields = sortTypeList
          .slice(loc_hidden_divider)
          .filter((item) => item !== 'divider_hidden');

        selectOptionsRef.current = selected_fields;
        fixedOptionsRef.current = fixed_fields;
        hiddenOptionsRef.current = hidden_fields;
        onChange?.({ fixed_fields, hidden_fields });
        setRefresh(!refresh);
      }
    },
    [onChange, refresh],
  );

  const allOptions = useMemo(() => uniqWith(_allOptions), [_allOptions]);

  // Ensure refs are correctly synchronized when props change
  useEffect(() => {
    selectOptionsRef.current = selectedOptions;
    fixedOptionsRef.current = fixedOptions;
    hiddenOptionsRef.current = hiddenOptions;
  }, [selectedOptions, fixedOptions, hiddenOptions]);

  const _hiddenOptions = useMemo(
    () =>
      hiddenOptionsRef.current?.length > 0
        ? hiddenOptionsRef.current
        : elseArray({
            selected: selectOptionsRef.current.concat(fixedOptionsRef.current),
            all: allOptions || [],
          }),
    [allOptions, refresh],
  );

  useEffect(() => {
    const action = (event: Event) => {
      if (document.fullscreenElement) {
        const target = event.target as HTMLElement | null;
        setPopupContainerId(target?.id);
      } else {
        setPopupContainerId(null);
      }
    };
    document.addEventListener('fullscreenchange', action);
    return () => document.removeEventListener('fullscreenchange', action);
  }, []);

  const handleSave = () => {
    try {
      const saveData = {
        fixed_fields: fixedOptionsRef.current,
        selected_fields: selectOptionsRef.current,
        hidden_fields: hiddenOptionsRef.current,
      };

      saveFun?.(saveData);
      setVisible(false);

      Message.success('Save successful');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Save failed, please try again';
      Message.error(`Save failed, reason: ${errorMessage}`);
    }
  };

  return (
    <>
      <div style={{ display: 'inline-block' }} onClick={() => setVisible(true)}>
        {children}
      </div>
      <Drawer
        key={
          popupContainerId ? `${title}_${popupContainerId}` : `${title}_body`
        }
        style={{ width: 500 }}
        className={styles.setting}
        title={title}
        visible={visible}
        maskClosable
        closable={false}
        okText="Save"
        onOk={handleSave}
        unmountOnExit
        onCancel={() => setVisible(false)}
        focusLock={false}
        getPopupContainer={
          popupContainerId
            ? () =>
                document.getElementById(popupContainerId) ||
                ((<div />) as unknown as HTMLElement)
            : () => document.body
        }
        {...restProps}
      >
        <Alert
          content="Please select and sort by dragging. If you want to use the adjusted configuration later, please click 'Save'"
          showIcon={false}
          banner
          style={{ width: 'auto', margin: '-12px -16px 8px -16px' }}
        />
        <div style={{ width: 420 }}>
          {mode.includes('fixed') ? (
            <>
              <div style={{ fontWeight: 'bolder', marginBottom: 8 }}>
                <Divider type="vertical" style={dividerStyle} />
                {`Fixed Items (${fixedOptionsRef.current?.length ?? 0})`}
              </div>
              <ResponsiveGridLayout
                data-id="ResponsiveGridLayoutWithFixed"
                className="layout"
                cols={{ lg: 1, md: 1, sm: 1, xs: 1, xxs: 1 }}
                isResizable={false}
                rowHeight={24}
                width={420}
                margin={[4, 4]}
                onLayoutChange={onSort}
                onDragStart={(_) => {
                  draggingRef.current = true;
                }}
              >
                {fixedOptionsRef?.current?.map(
                  (item: string, index: number) => (
                    <div
                      key={`drag_fixed_${item}`}
                      data-grid={{
                        y: index,
                        x: 0,
                        w: 1,
                        h: 1,
                        isDraggable: false,
                      }}
                      style={
                        draggingRef.current
                          ? dropItemDraggingStyle
                          : dropItemStyle
                      }
                      className={styles.disabledDragItem}
                    >
                      <p>
                        <IconDragDotVertical /> {caseSelectText(item)}
                      </p>
                    </div>
                  ),
                )}
                <div
                  key="divider_selected"
                  data-grid={{
                    y: fixedOptionsRef.current.length,
                    x: 0,
                    w: 1,
                    h: 2,
                    isDraggable: false,
                  }}
                  style={
                    draggingRef.current
                      ? { ...dropTitleItemStyle, ...dropItemDraggingStyle }
                      : { ...dropTitleItemStyle, ...dropItemStyle }
                  }
                >
                  <br />
                  <Divider type="vertical" style={dividerStyle} />
                  {`Display Items (${selectOptionsRef?.current?.length ?? 0})`}
                </div>
                {selectOptionsRef?.current
                  ?.filter((item: string) => !fixedOptions.includes(item))
                  ?.map((item: string, index: number) => (
                    <div
                      key={`drag_selected_${item}`}
                      data-grid={{
                        y: fixedOptionsRef.current.length + 1 + index,
                        x: 0,
                        w: 1,
                        h: 1,
                      }}
                      style={
                        draggingRef.current
                          ? dropItemDraggingStyle
                          : dropItemStyle
                      }
                    >
                      <p>
                        <IconDragDotVertical /> {caseSelectText(item)}
                      </p>
                    </div>
                  ))}
                <div
                  key="divider_hidden"
                  data-grid={{
                    y:
                      fixedOptionsRef.current.length +
                      1 +
                      selectOptionsRef.current.length,
                    x: 0,
                    w: 1,
                    h: 2,
                    isDraggable: false,
                  }}
                  style={
                    draggingRef.current
                      ? { ...dropTitleItemStyle, ...dropItemDraggingStyle }
                      : { ...dropTitleItemStyle, ...dropItemStyle }
                  }
                >
                  <br />
                  <Divider type="vertical" style={dividerStyle} />
                  {`Hidden Items (${_hiddenOptions?.length ?? 0})`}
                </div>
                {_hiddenOptions?.map((item: string, index: number) => (
                  <div
                    key={`drag_else_${item}`}
                    data-grid={{
                      y:
                        fixedOptionsRef.current.length +
                        selectOptionsRef.current.length +
                        2 +
                        index,
                      x: 0,
                      w: 1,
                      h: 1,
                      isDraggable: true,
                    }}
                    style={
                      draggingRef.current
                        ? dropItemDraggingStyle
                        : dropItemStyle
                    }
                  >
                    <p>
                      <IconDragDotVertical /> {caseSelectText(item)}
                    </p>
                  </div>
                ))}
              </ResponsiveGridLayout>
            </>
          ) : (
            <>
              <ResponsiveGridLayout
                className="layout"
                cols={{ lg: 1, md: 1, sm: 1, xs: 1, xxs: 1 }}
                width={420}
                margin={[4, 4]}
                isResizable={false}
                isDroppable
                rowHeight={24}
                onLayoutChange={onSort}
                onDragStart={() => {
                  draggingRef.current = true;
                }}
              >
                <div
                  key="divider_selected"
                  data-grid={{
                    y: 0,
                    x: 0,
                    w: 1,
                    h: 2,
                    isDraggable: false,
                  }}
                  style={
                    draggingRef.current
                      ? { ...dropTitleItemStyle, ...dropItemDraggingStyle }
                      : { ...dropTitleItemStyle, ...dropItemStyle }
                  }
                >
                  <br />
                  <Divider type="vertical" style={dividerStyle} />
                  {`Display Items (${selectOptionsRef.current?.length ?? 0})`}
                </div>
                {selectOptionsRef.current?.map(
                  (item: string, index: number) => (
                    <div
                      key={`drag_selected_${item}`}
                      data-grid={{ y: index, x: 0, w: 1, h: 1 }}
                      style={
                        draggingRef.current
                          ? dropItemDraggingStyle
                          : dropItemStyle
                      }
                    >
                      <p>
                        <IconDragDotVertical /> {caseSelectText(item)}
                      </p>
                    </div>
                  ),
                )}
                <div
                  key="divider_hidden"
                  data-grid={{
                    y: selectOptionsRef.current.length + 1,
                    x: 0,
                    w: 1,
                    h: 2,
                    isDraggable: false,
                  }}
                  style={
                    draggingRef.current
                      ? { ...dropTitleItemStyle, ...dropItemDraggingStyle }
                      : { ...dropTitleItemStyle, ...dropItemStyle }
                  }
                >
                  <br />
                  <Divider type="vertical" style={dividerStyle} />
                  {`Hidden Items (${_hiddenOptions?.length ?? 0})`}
                </div>
                {_hiddenOptions?.map((item: string, index: number) => (
                  <div
                    key={`drag_else_${item}`}
                    data-grid={{
                      y: selectOptionsRef.current.length + 2 + index,
                      x: 0,
                      w: 1,
                      h: 1,
                      isDraggable: true,
                    }}
                    style={
                      draggingRef.current
                        ? dropItemDraggingStyle
                        : dropItemStyle
                    }
                  >
                    <p>
                      <IconDragDotVertical /> {caseSelectText(item)}
                    </p>
                  </div>
                ))}
              </ResponsiveGridLayout>
            </>
          )}
        </div>
      </Drawer>
    </>
  );
};

export { DraggableFilterSetting };
