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

export interface WaitForNextElementParams {
  selector: string;
}

/**
 * Helper function to wait for next element to appear
 */
export const waitForNextElement = async ({
  selector,
}: WaitForNextElementParams): Promise<boolean> => {
  // Actively wait for next element to appear, maximum wait 5 seconds
  const nextElementWaitStart = Date.now();

  while (Date.now() - nextElementWaitStart < 5000) {
    const nextElements = document.querySelectorAll(selector);

    if (nextElements.length > 0) {
      return true;
    }

    // Check every 100ms
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return false;
};

export interface WaitForPageReadyParams {
  maxWaitTime?: number;
}

/**
 * Intelligently wait for page to finish loading
 */
export const waitForPageReady = ({
  maxWaitTime = 2000,
}: WaitForPageReadyParams = {}): Promise<boolean> => {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const checkReady = () => {
      // Check if page has finished loading
      if (document.readyState === 'complete') {
        resolve(true);
        return;
      }

      // Check if timeout
      if (Date.now() - startTime >= maxWaitTime) {
        resolve(false); // Return false on timeout
        return;
      }

      // Continue checking
      setTimeout(checkReady, 100);
    };

    checkReady();
  });
};
