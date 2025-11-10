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
 * Browser autofill blocker utility function
 *
 * @description
 * Modern browsers (Chrome/Edge/Firefox/Safari) actively try to autofill forms,
 * even autocomplete="off" is ignored.
 * This utility function provides multi-layer protection strategies to truly disable autofill.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion
 * @see https://bugs.chromium.org/p/chromium/issues/detail?id=468153
 *
 * @author VeAIOps Team
 */

/**
 * Autofill blocker attribute collection
 * Only includes safe attributes that won't conflict with component libraries
 *
 * Note: InputHTMLAttributes is not used here because:
 * 1. Arco Design's InputProps redefines certain attributes (e.g., defaultValue)
 * 2. We only need specific attributes to block autofill
 * 3. Using precise type definitions can avoid type conflicts
 */
export interface AutofillBlockerAttributes {
  /** HTML autocomplete attribute */
  autoComplete: string;
  /** HTML name attribute */
  name: string;
  /** Form type marker */
  'data-form-type'?: string;
  /** Autofill disable marker */
  'data-autofill'?: string;
  /** LastPass ignore marker */
  'data-lpignore'?: string;
  /** 1Password ignore marker */
  'data-1p-ignore'?: string;
  /** Bitwarden ignore marker */
  'data-bwignore'?: string;
  /** Dashlane ignore marker */
  'data-dashlane-ignore'?: string;
}

/**
 * Field type enumeration
 */
export type SecureFieldType =
  | 'text'
  | 'password'
  | 'email'
  | 'api-key'
  | 'custom';

/**
 * Autofill blocker configuration options
 */
export interface AutofillBlockerOptions {
  /**
   * Field type, affects autocomplete and name attribute generation strategy
   * @default 'text'
   */
  fieldType?: SecureFieldType;

  /**
   * Custom field name (optional)
   * If not provided, a random name will be automatically generated to avoid browser recognition
   */
  customName?: string;

  /**
   * Whether to add random suffix to name attribute
   * When enabled, can further obfuscate browser field recognition
   * @default true
   */
  useRandomSuffix?: boolean;

  /**
   * Whether to include third-party password manager ignore markers
   * Including LastPass, 1Password, Dashlane, etc.
   * @default true
   */
  blockPasswordManagers?: boolean;
}

/**
 * Generate random string (for name attribute suffix)
 */
function generateRandomSuffix(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Get autocomplete attribute value based on field type
 */
function getAutocompleteValue(fieldType: SecureFieldType): string {
  switch (fieldType) {
    case 'password':
    case 'api-key':
      // For password type, using "new-password" is most effective
      // Browser will think this is a new password setting scenario and won't autofill
      return 'new-password';
    case 'email':
      // Email field also uses off to avoid autofilling historical emails
      return 'off';
    default:
      return 'off';
  }
}

/**
 * Generate field name
 */
function generateFieldName(
  fieldType: SecureFieldType,
  customName?: string,
  useRandomSuffix = true,
): string {
  if (customName) {
    return useRandomSuffix
      ? `${customName}-${generateRandomSuffix()}`
      : customName;
  }

  // Use uncommon prefix to avoid being recognized as standard field
  const prefix = 'secure-field';
  const typeSegment = fieldType === 'custom' ? 'input' : fieldType;
  const suffix = useRandomSuffix ? `-${generateRandomSuffix()}` : '';

  return `${prefix}-${typeSegment}${suffix}`;
}

/**
 * Generate HTML attributes to block autofill
 *
 * @description
 * Returns an attribute object containing multiple protection strategies that can be directly spread onto Input component
 *
 * @example
 * ```tsx
 * // Basic usage
 * const props = getAutofillBlockerProps({ fieldType: 'text' });
 * <Input {...props} placeholder="App ID" />
 *
 * // Password field
 * const secretProps = getAutofillBlockerProps({ fieldType: 'password' });
 * <Input {...secretProps} placeholder="Secret" />
 *
 * // Custom name
 * const customProps = getAutofillBlockerProps({
 *   fieldType: 'text',
 *   customName: 'bot-app-id',
 * });
 * <Input {...customProps} />
 * ```
 *
 * @param options Configuration options
 * @returns Autofill blocker attribute object
 */
export function getAutofillBlockerProps(
  options: AutofillBlockerOptions = {},
): AutofillBlockerAttributes {
  const {
    fieldType = 'text',
    customName,
    useRandomSuffix = true,
    blockPasswordManagers = true,
  } = options;

  const props: AutofillBlockerAttributes = {
    // 1. Core attribute: autocomplete
    // Select the most appropriate value based on field type
    autoComplete: getAutocompleteValue(fieldType),

    // 2. name attribute: use non-standard name
    // Browser identifies fields based on name attribute (e.g., "username", "password", "email")
    // Using custom names can avoid recognition
    name: generateFieldName(fieldType, customName, useRandomSuffix),

    // 3. Form type marker
    // Tell browser this is not a standard login/registration form
    'data-form-type': 'other',

    // 4. Autofill disable marker
    'data-autofill': 'false',
  };

  // 5. Third-party password manager ignore markers
  if (blockPasswordManagers) {
    Object.assign(props, {
      'data-lpignore': 'true', // LastPass
      'data-1p-ignore': 'true', // 1Password
      'data-bwignore': 'true', // Bitwarden
      'data-dashlane-ignore': 'true', // Dashlane
    });
  }

  return props;
}

/**
 * Form-level autofill blocker attribute collection
 */
export interface FormAutofillBlockerAttributes {
  /** HTML autocomplete attribute */
  autoComplete: 'off';
  /** Autofill disable marker */
  'data-no-autofill'?: string;
}

/**
 * Form-level autofill blocker attributes
 *
 * @description
 * Set these attributes on Form component to disable autofill at form level
 *
 * @example
 * ```tsx
 * const formProps = getFormAutofillBlockerProps();
 * <Form {...formProps}>
 *   <Form.Item>
 *     <Input {...getAutofillBlockerProps({ fieldType: 'text' })} />
 *   </Form.Item>
 * </Form>
 * ```
 *
 * @returns Form autofill blocker attribute object
 */
export function getFormAutofillBlockerProps(): FormAutofillBlockerAttributes {
  return {
    // Form-level autocomplete
    autoComplete: 'off',

    // Additional marker attribute
    'data-no-autofill': 'true',

    // Note: Some browsers require at least one input with name attribute in the form
    // Otherwise autocomplete="off" will be ignored
    // The input props generated by this utility function already include name attribute
  };
}

/**
 * Preset configurations: shortcuts for common scenarios
 */
export const AutofillBlockerPresets = {
  /** App ID */
  appId: (): AutofillBlockerAttributes =>
    getAutofillBlockerProps({ fieldType: 'text', customName: 'app-id' }),

  /** App Secret */
  appSecret: (): AutofillBlockerAttributes =>
    getAutofillBlockerProps({
      fieldType: 'password',
      customName: 'app-secret',
    }),

  /** API Key */
  apiKey: (): AutofillBlockerAttributes =>
    getAutofillBlockerProps({ fieldType: 'api-key', customName: 'api-key' }),

  /** Access Key */
  accessKey: (): AutofillBlockerAttributes =>
    getAutofillBlockerProps({
      fieldType: 'password',
      customName: 'access-key',
    }),

  /** Secret Key */
  secretKey: (): AutofillBlockerAttributes =>
    getAutofillBlockerProps({
      fieldType: 'password',
      customName: 'secret-key',
    }),

  /** Token */
  token: (): AutofillBlockerAttributes =>
    getAutofillBlockerProps({ fieldType: 'password', customName: 'token' }),

  /** Email (when autofill is not desired) */
  secureEmail: (): AutofillBlockerAttributes =>
    getAutofillBlockerProps({ fieldType: 'email', customName: 'secure-email' }),
} as const;

/**
 * Utility function: merge autofill blocker attributes with other attributes
 *
 * @example
 * ```tsx
 * const inputProps = mergeAutofillBlockerProps(
 *   { fieldType: 'password' },
 *   { placeholder: 'Please enter password', maxLength: 100 }
 * );
 * <Input {...inputProps} />
 * ```
 */
export function mergeAutofillBlockerProps<T extends Record<string, unknown>>(
  blockerOptions: AutofillBlockerOptions,
  otherProps: T,
): T & AutofillBlockerAttributes {
  const blockerProps = getAutofillBlockerProps(blockerOptions);
  return {
    ...otherProps,
    ...blockerProps,
  };
}
