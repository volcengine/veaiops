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

import { Message } from '@arco-design/web-react';
import { useCallback, useEffect, useState } from 'react';

/**
 * Configuration management options
 */
export interface UseConfigManagerOptions<T> {
  /** Configuration type identifier */
  configType: string;
  /** Load configuration function */
  loadConfig: () => Promise<T>;
  /** Save configuration function */
  saveConfig: (config: T) => Promise<void>;
  /** Reset configuration function */
  resetConfig?: () => Promise<T>;
  /** Validate configuration function */
  validateConfig?: (config: T) => Promise<boolean>;
  /** Export configuration function */
  exportConfig?: (config: T) => Promise<void>;
  /** Import configuration function */
  importConfig?: (file: File) => Promise<T>;
  /** Whether to enable auto-save */
  autoSave?: boolean;
  /** Auto-save interval (milliseconds) */
  autoSaveInterval?: number;
}

/**
 * Configuration management result
 */
export interface UseConfigManagerResult<T> {
  /** Current configuration */
  config: T | null;
  /** Loading state */
  loading: boolean;
  /** Saving state */
  saving: boolean;
  /** Error information */
  error: Error | null;
  /** Load configuration */
  loadConfig: () => Promise<void>;
  /** Save configuration */
  saveConfig: (config: T) => Promise<void>;
  /** Reset configuration */
  resetConfig: () => Promise<T>;
  /** Validate configuration */
  validateConfig: (config: T) => Promise<boolean>;
  /** Export configuration */
  exportConfig: (config: T) => Promise<void>;
  /** Import configuration */
  importConfig: (file: File) => Promise<T>;
  /** Refresh configuration */
  refresh: () => Promise<void>;
}

/**
 * Configuration change detection Hook
 */
export const useConfigChanges = <T>(
  originalConfig: T | null,
  currentConfig: T | null,
): boolean => {
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!originalConfig || !currentConfig) {
      setHasChanges(false);
      return;
    }

    // Deep compare configuration objects
    const isEqual =
      JSON.stringify(originalConfig) === JSON.stringify(currentConfig);
    setHasChanges(!isEqual);
  }, [originalConfig, currentConfig]);

  return hasChanges;
};

/**
 * Configuration management Hook
 * @description Provides CRUD operations, change detection, auto-save, and other features for configurations
 */
export const useConfigManager = <T>(
  options: UseConfigManagerOptions<T>,
): UseConfigManagerResult<T> => {
  const {
    configType,
    loadConfig: loadConfigFn,
    saveConfig: saveConfigFn,
    resetConfig: resetConfigFn,
    validateConfig: validateConfigFn,
    exportConfig: exportConfigFn,
    importConfig: importConfigFn,
    autoSave = false,
    autoSaveInterval = 30000, // 30 seconds
  } = options;

  const [config, setConfig] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load configuration
  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const loadedConfig = await loadConfigFn();
      setConfig(loadedConfig);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);

      Message.error(`加载${configType}配置失败`);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadConfigFn, configType]);

  // Save configuration
  const saveConfig = useCallback(
    async (configToSave: T) => {
      try {
        setSaving(true);
        setError(null);

        // Validate configuration
        if (validateConfigFn) {
          const isValid = await validateConfigFn(configToSave);
          if (!isValid) {
            throw new Error('配置验证失败');
          }
        }

        await saveConfigFn(configToSave);
        setConfig(configToSave);

        Message.success(`${configType}配置保存成功`);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);

        Message.error(`保存${configType}配置失败`);
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [saveConfigFn, validateConfigFn, configType],
  );

  // Reset configuration
  const resetConfig = useCallback(async (): Promise<T> => {
    if (!resetConfigFn) {
      throw new Error('重置配置功能未实现');
    }

    try {
      setLoading(true);
      setError(null);

      const defaultConfig = await resetConfigFn();
      setConfig(defaultConfig);

      Message.success(`${configType}配置已重置为默认值`);

      return defaultConfig;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);

      Message.error(`重置${configType}配置失败`);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [resetConfigFn, configType]);

  // Validate configuration
  const validateConfig = useCallback(
    async (configToValidate: T): Promise<boolean> => {
      if (!validateConfigFn) {
        return true;
      }

      try {
        return await validateConfigFn(configToValidate);
      } catch (error) {
        // Configuration validation failed, return false (silent handling)
        return false;
      }
    },
    [validateConfigFn, configType],
  );

  // Export configuration
  const exportConfig = useCallback(
    async (configToExport: T) => {
      if (!exportConfigFn) {
        throw new Error('导出配置功能未实现');
      }

      try {
        await exportConfigFn(configToExport);

        Message.success(`${configType}配置导出成功`);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        Message.error(`导出${configType}配置失败`);
        throw error;
      }
    },
    [exportConfigFn, configType],
  );

  // Import configuration
  const importConfig = useCallback(
    async (file: File): Promise<T> => {
      if (!importConfigFn) {
        throw new Error('导入配置功能未实现');
      }

      try {
        const importedConfig = await importConfigFn(file);
        setConfig(importedConfig);

        Message.success(`${configType}配置导入成功`);

        return importedConfig;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        Message.error(`导入${configType}配置失败`);
        throw error;
      }
    },
    [importConfigFn, configType],
  );

  // Refresh configuration
  const refresh = useCallback(async () => {
    await loadConfig();
  }, [loadConfig]);

  // Auto-save
  useEffect(() => {
    if (!autoSave || !config) {
      return undefined;
    }

    const timer = setInterval(() => {
      saveConfig(config);
    }, autoSaveInterval);

    return () => clearInterval(timer);
  }, [autoSave, config, saveConfig, autoSaveInterval]);

  // Initial load
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    loading,
    saving,
    error,
    loadConfig,
    saveConfig,
    resetConfig,
    validateConfig,
    exportConfig,
    importConfig,
    refresh,
  };
};

export default useConfigManager;
