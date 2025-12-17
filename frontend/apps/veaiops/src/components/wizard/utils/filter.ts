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

/**
 * 检查字符串是否匹配搜索值（支持模糊匹配和正则表达式）
 * @param text 要检查的文本
 * @param searchValue 搜索值（普通字符串或正则表达式字符串）
 * @returns 是否匹配
 */
export const isMatch = (
  text: string | undefined | null,
  searchValue: string,
): boolean => {
  if (!text) {
    return false;
  }

  const safeText = text.toLowerCase();
  const safeSearch = searchValue.toLowerCase().trim();

  if (!safeSearch) {
    return true;
  }

  try {
    // 优先尝试作为正则表达式匹配
    // 用户可能会输入 AA-\d+-BB 这样的正则
    // 也可能输入 AA-* 这样的通配符
    // 或者只是简单的子串 AA

    // 策略：
    // 1. 如果包含正则元字符（除了 *），尝试作为正则解析
    // 2. 如果只包含 *，作为通配符处理
    // 3. 否则作为普通字符串包含匹配

    // 检查是否包含除了 * 以外的正则元字符
    // const hasRegexMeta = /[.+?^${}()|[\]\\]/.test(safeSearch);

    // 直接尝试构建正则
    // 为了支持通配符 *，我们可以先尝试将通配符转换为正则
    // 但这会与用户输入的 \d+ 冲突
    // 考虑到需求明确提到 "AA-数字-BB 格式正则匹配"，即用户会输入正则语法
    // 所以优先支持标准正则语法

    const regex = new RegExp(safeSearch, 'i');
    if (regex.test(text)) {
      return true;
    }
  } catch (e) {
    // 如果标准正则解析失败（例如语法错误），则尝试作为通配符处理
    // 这种情况可能发生在用户输入了不完整的正则，或者意图是使用通配符但包含了一些会被正则引擎误判的字符
  }

  // 通配符处理逻辑 (简单的 * 转换)
  // 仅当包含 * 且不是有效的正则时尝试（或者作为备选策略）
  if (safeSearch.includes('*')) {
    try {
      // 转义除了 * 以外的所有正则元字符
      const pattern = safeSearch
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');
      const wildcardRegex = new RegExp(`^${pattern}$`, 'i'); // 通配符通常意味着全匹配模式，或者用户习惯
      if (wildcardRegex.test(text)) {
        return true;
      }
    } catch (e) {
      // 忽略
    }
  }

  // 最后回退到普通包含匹配
  return safeText.includes(safeSearch);
};

/**
 * 专门针对 AA-数字-BB 格式优化的匹配逻辑
 * 以及支持普通的正则匹配
 */
/**
 * 专门针对 AA-数字-BB 格式优化的匹配逻辑
 * 以及支持普通的正则匹配
 */
export const checkMatch = (
  text: string | undefined | null,
  searchValue: string,
): boolean => {
  if (!text) {
    return false;
  }

  const safeText = text.trim();
  const query = searchValue.trim();

  if (!query) {
    return true;
  }

  // 1. 尝试作为正则表达式匹配
  // 优化：只有当查询字符串包含正则元字符时才尝试正则匹配
  // 这可以避免将普通字符串 "server" 作为正则处理的开销（虽然微乎其微），
  // 但更重要的是明确了匹配意图。
  // 不过，需求要求 "AA-数字-BB" 这种格式，其中包含 \d 这样的元字符序列，
  // 或者用户可能直接输入 ^server.* 这样的正则。
  // 所以直接尝试 RegExp 是最稳妥的。

  try {
    // 使用 'i' 标志忽略大小写
    const regex = new RegExp(query, 'i');
    if (regex.test(safeText)) {
      return true;
    }
  } catch (e) {
    // 正则解析失败（例如输入了未闭合的括号），忽略错误，降级到通配符或普通字符串匹配
  }

  // 2. 尝试通配符 * 匹配
  // 仅当包含 * 且之前不是有效的正则时尝试（或者作为备选策略）
  if (query.includes('*')) {
    try {
      // 转义除了 * 以外的所有正则元字符
      const pattern = query
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');
      const wildcardRegex = new RegExp(`^${pattern}$`, 'i'); // 通配符通常意味着全匹配模式
      if (wildcardRegex.test(safeText)) {
        return true;
      }
    } catch (e) {
      // 忽略
    }
  }

  // 3. 普通字符串包含匹配 (忽略大小写)
  // 这是为了兜底，比如用户输入了 "server(" 这种在正则中非法但在普通文本中可能存在的字符串
  return safeText.toLowerCase().includes(query.toLowerCase());
};
