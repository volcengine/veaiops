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

import { debounce } from 'lodash-es';

/**
 * Get the window object using this function rather then simply use `window` because
 * there are cases where the window object we are seeking to reference is not in
 * the same window scope as the code we are running. (https://stackoverflow.com/a/37638629)
 */
export const getWindow = (
  node: Element,
): Element | (Window & typeof globalThis) => {
  // if node is not the window object
  if (Object.prototype.toString.call(node) !== '[object Window]') {
    // get the top-level document object of the node, or null if node is a document.
    const { ownerDocument } = node;
    // get the window object associated with the document, or null if none is available.
    return ownerDocument ? ownerDocument.defaultView || window : window;
  }

  return node;
};

export const getDocument = (node: Node | Window | Element): Document =>
  (isElement(node as Element)
    ? (node as Node).ownerDocument
    : (node as Window).document) || window.document;

/* Get the Element that is the root element of the document which contains the node
 * (for example, the <html> element for HTML documents).
 */
export const getDocumentElement = (node: Element): HTMLElement =>
  getDocument(node).documentElement;

/* Get node's style info */
export const getComputedStyle = (node: Element): CSSStyleDeclaration =>
  (getWindow(node) as Window & typeof globalThis).getComputedStyle(node);

/* Get node's node name */
export const getNodeName = (node: Element | null): string =>
  node ? (node.nodeName || '').toLowerCase() : '';

export const getParentNode = (node: Element | any) => {
  if (!node || getNodeName(node) === 'html') {
    return node;
  }

  return (
    // If node is rooted at a custom element, meaning the node is part of a shadow DOM
    node.assignedSlot || // step into the shadow DOM of the parent of a slotted node
    node.parentNode || // DOM Element detected
    node.host || // ShadowRoot detected
    getDocumentElement(node) // fallback
  );
};

/* Check if node is an Element or a customized Element */
export const isElement = (node: Element): boolean => {
  const OwnElement = (getWindow(node) as Window & typeof globalThis).Element;
  return node instanceof OwnElement || (node as unknown) instanceof Element;
};

/* Check if node is an HTMLElement or a customized HTMLElement */
export const isHTMLElement = (node: Element): boolean => {
  const OwnElement = (getWindow(node) as Window & typeof globalThis)
    .HTMLElement;
  return node instanceof OwnElement || node instanceof HTMLElement;
};

// Check if node is an HTMLElement or a customized HTMLElement
export const isTableElement = (node: Element): boolean =>
  ['table', 'td', 'th'].indexOf(getNodeName(node)) >= 0;

/** Within error range */
export const withErrorRange = (
  val: number,
  target: number,
  errorRange: number,
) => {
  return val <= target + errorRange && val >= target - errorRange;
};

/** List scroll wrapper */
export const listScroll = (
  element: HTMLElement,
  targetPos: number,
  callback?: () => void,
): void => {
  // Whether successfully unmounted
  let unMountFlag = false;
  const { scrollHeight: listHeight } = element; // Avoid some edge cases

  if (targetPos < 0 || targetPos > listHeight) {
    callback?.();
    return;
  } // Call scroll method

  element.scrollTo({
    top: targetPos,
    left: 0,
    behavior: 'smooth',
  }); // Return directly if no callback

  if (!callback) {
    // If already reached target position, return early
    return;
  }
  if (withErrorRange(targetPos, element.scrollTop, 10)) {
    // Debounce handling
    callback();
    return;
  }
  const cb = debounce(() => {
    // Reached target position, can return
    if (withErrorRange(targetPos, element.scrollTop, 10)) {
      element.removeEventListener('scroll', cb);
      unMountFlag = true;
      callback();
    }
  }, 100);

  (getNodeName(element) === 'html' ? document : element).addEventListener(
    'scroll',
    cb,
    false,
  );
  // Fallback: unmount scroll callback to avoid affecting subsequent operations

  setTimeout(() => {
    if (!unMountFlag) {
      element.removeEventListener('scroll', cb);
      callback();
    }
  }, 1000);
};
