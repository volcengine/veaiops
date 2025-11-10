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
 * File download utility functions
 */
import { logger } from '@veaiops/utils';

/**
 * Generic method to download files
 * @param url File URL
 * @param filename Downloaded filename
 * @returns Promise<boolean> Whether download was successful
 */
export const downloadFile = async (
  url: string,
  filename: string,
): Promise<boolean> => {
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error: unknown) {
    // ✅ Correct: Record error and return failure result
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error({
      message: `File download failed: ${errorObj.message}`,
      data: {
        url,
        filename,
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
      },
      source: 'FileDownload',
      component: 'downloadFile',
    });
    return false;
  }
};

/**
 * Download card template file
 * @returns Promise<boolean> Whether download was successful
 */
export const downloadCardTemplate = async (): Promise<boolean> => {
  const filename = 'VeAIOps.card';
  const url =
    process.env.NODE_ENV === 'development' ? '/VeAIOps.card' : './VeAIOps.card';

  return downloadFile(url, filename);
};

/**
 * Download file and show success/failure notification
 * @param url File URL
 * @param filename Downloaded filename
 * @param onSuccess Success callback
 * @param onError Error callback
 */
export const downloadFileWithCallback = async (
  url: string,
  filename: string,
  onSuccess?: () => void,
  onError?: (error: Error) => void,
): Promise<boolean> => {
  const success = await downloadFile(url, filename);

  if (success) {
    onSuccess?.();
  } else {
    onError?.(new Error('File download failed'));
  }
  return success;
};

/**
 * Download card template and show notification
 * @param onSuccess Success callback
 * @param onError Error callback
 */
export const downloadCardTemplateWithCallback = async (
  onSuccess?: () => void,
  onError?: (error: Error) => void,
): Promise<boolean> => {
  return downloadFileWithCallback(
    process.env.NODE_ENV === 'development' ? '/VeAIOps.card' : './VeAIOps.card',
    'VeAIOps.card',
    onSuccess,
    onError,
  );
};
