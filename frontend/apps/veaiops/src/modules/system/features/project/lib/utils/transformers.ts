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

import type { Project, ProjectFormData } from '@project/types';

/**
 * Transform form data to project data
 */
export const transformFormDataToProject = (
  formData: ProjectFormData,
  existingProject?: Project,
): Project => {
  const now = new Date().toISOString();

  return {
    _id: existingProject?._id,
    project_id: formData.project_id,
    name: formData.name,
    is_active: formData.is_active,
    created_at: existingProject?.created_at || now,
    updated_at: now,
  };
};

/**
 * Transform project data to form data
 */
export const transformProjectToFormData = (
  project: Project,
): ProjectFormData => {
  return {
    project_id: project.project_id,
    name: project.name,
    is_active: project.is_active,
  };
};
