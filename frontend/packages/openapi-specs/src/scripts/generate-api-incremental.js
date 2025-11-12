#!/usr/bin/env node

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
 * Incremental API generation script (Two-Phase Detection)
 *
 * Features:
 * Phase 1: Detect changed spec files against upstream/main
 *   - Use git diff to compare spec files with upstream/main
 *   - Fallback to file modification time if git detection fails
 *
 * Phase 2: Detect api-client changes against upstream/main
 *   - Check if api-client has changes not caused by spec changes
 *   - If api-client has diff but not caused by spec changes, regenerate
 *   - This handles cases where:
 *     - Manual modifications to generated code
 *     - Generation script changes affecting output
 *     - Other non-spec-related changes
 *
 * Generation Strategy:
 *   - If only spec files changed: Analyze impact scope, regenerate affected modules
 *   - If api-client has uncovered changes: Full regeneration to ensure consistency
 *   - If shared schemas (common.json) changed: Full regeneration
 *
 * Note:
 * - openapi-typescript-codegen does not support true incremental generation
 * - This script decides whether full generation is needed by detecting changes
 * - Two-phase detection ensures api-client stays in sync with specs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Incremental generator class
 */
class IncrementalAPIGenerator {
  constructor() {
    this.rootDir = path.resolve(__dirname, '../..');
    this.specsDir = path.join(this.rootDir, 'src/specs');
    this.modulesDir = path.join(this.specsDir, 'modules');
    this.configPath = path.join(this.specsDir, 'api-config.json');
    // Git repository root (4 levels up from scripts/)
    this.gitRoot = path.resolve(__dirname, '../../../../..');
  }

  /**
   * Detect changed spec files (via git diff against upstream/main)
   * Phase 1: Check changed spec files
   * @returns {Array<string>} List of changed file paths (relative to git root)
   */
  detectChangedFiles() {
    console.log(
      '🔍 Phase 1: Detecting changed spec files against upstream/main...',
    );

    try {
      // Use git diff to detect changed files (compare with upstream/main)
      // Execute git command in git root to get correct relative paths
      const upstreamBranch = this.getUpstreamBranch();

      const gitDiff = execSync(`git diff --name-only ${upstreamBranch}`, {
        encoding: 'utf8',
        cwd: this.gitRoot, // ✅ Execute in git root
      }).trim();

      const gitDiffStaged = execSync('git diff --cached --name-only', {
        encoding: 'utf8',
        cwd: this.gitRoot, // ✅ Execute in git root
      }).trim();

      const allChangedFiles = [
        ...gitDiff.split('\n').filter(Boolean),
        ...gitDiffStaged.split('\n').filter(Boolean),
      ];

      // Calculate relative path from git root to specs directory
      const specsRelativePath = path.relative(this.gitRoot, this.specsDir);

      // Filter out spec files
      const specFiles = allChangedFiles.filter((file) => {
        // file is relative to git root (e.g., "frontend/packages/openapi-specs/src/specs/modules/oncall.json")
        return (
          file.startsWith(specsRelativePath) &&
          (file.endsWith('.json') ||
            file.endsWith('.yaml') ||
            file.endsWith('.yml'))
        );
      });

      if (specFiles.length > 0) {
        console.log(`📝 Found ${specFiles.length} changed spec files:`);
        specFiles.forEach((file) => console.log(`   - ${file}`));
      } else {
        console.log('✅ No changed spec files found in Phase 1');
      }

      return specFiles;
    } catch (error) {
      console.warn(
        '⚠️  Git detection failed (Phase 1), using file modification time detection:',
        error.message,
      );
      return this.detectChangedFilesByTime();
    }
  }

  /**
   * Get upstream branch name (try upstream/main or origin/main)
   * @returns {string} Upstream branch name
   */
  getUpstreamBranch() {
    try {
      // Try upstream/main first
      execSync('git rev-parse --verify upstream/main', {
        encoding: 'utf8',
        cwd: this.gitRoot, // ✅ Execute in git root
        stdio: 'ignore',
      });
      return 'upstream/main';
    } catch {
      try {
        // Fallback to origin/main
        execSync('git rev-parse --verify origin/main', {
          encoding: 'utf8',
          cwd: this.gitRoot, // ✅ Execute in git root
          stdio: 'ignore',
        });
        return 'origin/main';
      } catch {
        // Fallback to HEAD if no upstream found
        console.warn('⚠️  No upstream/main or origin/main found, using HEAD');
        return 'HEAD';
      }
    }
  }

  /**
   * Check if changes are only formatting changes (copyright, comments, whitespace)
   * Or minor expected changes (like index.ts export additions from spec changes)
   * @param {string} file - File path relative to git root
   * @returns {boolean} True if only formatting or expected minor changes
   */
  isFormattingChangeOnly(file) {
    try {
      const upstreamBranch = this.getUpstreamBranch();

      // Use --numstat to get statistics: added_lines deleted_lines filename
      const numstat = execSync(
        `git diff ${upstreamBranch} --numstat -- ${file}`,
        {
          encoding: 'utf8',
          cwd: this.gitRoot,
        },
      ).trim();

      if (!numstat) {
        return false;
      }

      const [added, deleted] = numstat.split('\t').map((n) => parseInt(n, 10));

      // If only deletions (no additions), likely just removing copyright headers
      if (added === 0 && deleted > 0) {
        return true;
      }

      // If additions are minimal (1-3 lines) and deletions are significant (>= 10),
      // likely copyright removal + minor changes (trailing newline, export additions)
      if (added <= 3 && deleted >= 10) {
        // Special handling for index.ts: export additions are expected from spec changes
        if (file.includes('/index.ts')) {
          // Check if added lines are only export statements
          const diff = execSync(`git diff ${upstreamBranch} -- ${file}`, {
            encoding: 'utf8',
            cwd: this.gitRoot,
          }).trim();

          const addedLines = diff
            .split('\n')
            .filter((line) => line.startsWith('+') && !line.startsWith('+++'))
            .map((line) => line.substring(1).trim());

          // If all added lines are either:
          // - Empty
          // - Comments
          // - Export statements
          // Then it's expected minor change
          const allExpectedChanges = addedLines.every(
            (line) =>
              line === '' ||
              line.startsWith('//') ||
              line.startsWith('export '),
          );

          if (allExpectedChanges) {
            return true; // ✅ Treat index.ts export additions as minor changes
          }
        }

        // For other files, check if added lines are only comments/whitespace
        const diff = execSync(`git diff ${upstreamBranch} -- ${file}`, {
          encoding: 'utf8',
          cwd: this.gitRoot,
        }).trim();

        const diffLines = diff.split('\n');
        let hasCodeChange = false;

        for (const line of diffLines) {
          // Skip diff metadata
          if (
            line.startsWith('diff --git') ||
            line.startsWith('index ') ||
            line.startsWith('---') ||
            line.startsWith('+++') ||
            line.startsWith('@@')
          ) {
            continue;
          }

          // Check added lines
          if (line.startsWith('+')) {
            const content = line.substring(1).trim();
            // If it's not empty or comment, it's code change
            if (
              content !== '' &&
              !content.startsWith('//') &&
              !content.startsWith('/*')
            ) {
              hasCodeChange = true;
              break;
            }
          }
        }

        return !hasCodeChange;
      }

      // Otherwise, assume it's substantive
      return false;
    } catch (error) {
      // If we can't determine, assume it's substantive
      return false;
    }
  }

  /**
   * Detect changed api-client files (Phase 2)
   * Check if api-client has changes not caused by spec changes
   * @param {Array<string>} changedSpecFiles Spec files that changed in Phase 1
   * @returns {Object} Detection result
   */
  detectApiClientChanges(changedSpecFiles = []) {
    console.log(
      '\n🔍 Phase 2: Detecting api-client changes against upstream/main...',
    );

    try {
      const upstreamBranch = this.getUpstreamBranch();
      const apiClientDir = path.join(this.rootDir, '../api-client/src');

      // Calculate relative path from git root to api-client
      const apiClientRelativePath = path.relative(this.gitRoot, apiClientDir);

      // Get api-client diff against upstream/main
      // Execute in git root to get correct relative paths
      const apiClientDiff = execSync(
        `git diff --name-only ${upstreamBranch} -- ${apiClientRelativePath}`,
        {
          encoding: 'utf8',
          cwd: this.gitRoot, // ✅ Execute in git root
        },
      ).trim();

      const changedApiClientFiles = apiClientDiff
        .split('\n')
        .filter(Boolean)
        .filter(
          (file) =>
            file.endsWith('.ts') &&
            !file.endsWith('.d.ts') &&
            !file.includes('node_modules'),
        );

      if (changedApiClientFiles.length > 0) {
        console.log(
          `📝 Found ${changedApiClientFiles.length} changed api-client files`,
        );

        // Get spec-changed modules for analysis
        const impact = this.analyzeImpact(changedSpecFiles);
        const specModules = new Set(impact.changedModules);

        // Check if changes are only formatting
        console.log('🔬 Analyzing change types...');
        let formattingOnlyCount = 0;
        let substantiveChangeCount = 0;

        // Sample files to check if they're formatting only
        const sampleSize = Math.min(10, changedApiClientFiles.length);
        for (let i = 0; i < sampleSize; i++) {
          if (this.isFormattingChangeOnly(changedApiClientFiles[i])) {
            formattingOnlyCount++;
          } else {
            substantiveChangeCount++;
          }
        }

        // If all sampled files are formatting only, assume all are
        const isAllFormattingOnly = substantiveChangeCount === 0;

        if (isAllFormattingOnly) {
          console.log(
            `   ✅ All sampled files (${sampleSize}/${changedApiClientFiles.length}) contain only formatting changes`,
          );
          console.log('   💡 Formatting changes do not trigger regeneration');
          return {
            hasChanges: false, // ✅ Treat as no changes
            changedFiles: [],
            moduleAnalysis: {
              coveredModules: [],
              uncoveredModules: [],
              allAffectedModules: [],
            },
            isFormattingOnly: true,
          };
        }

        console.log(
          `   Formatting-only: ${formattingOnlyCount}/${sampleSize}, Substantive: ${substantiveChangeCount}/${sampleSize}`,
        );

        // Analyze which modules are affected and whether they're covered
        const moduleAnalysis = this.analyzeAffectedModulesFromApiClient(
          changedApiClientFiles,
          specModules,
        );

        console.log(
          `   Modules with spec changes (covered): ${moduleAnalysis.coveredModules.length > 0 ? moduleAnalysis.coveredModules.join(', ') : 'none'}`,
        );
        console.log(
          `   Modules without spec changes (uncovered): ${moduleAnalysis.uncoveredModules.length > 0 ? moduleAnalysis.uncoveredModules.join(', ') : 'none'}`,
        );
        if (moduleAnalysis.unidentifiedFiles.length > 0) {
          console.log(
            `   Unidentified files: ${moduleAnalysis.unidentifiedFiles.length} (index.ts, core/*, etc.)`,
          );
        }

        return {
          hasChanges: true,
          changedFiles: changedApiClientFiles,
          moduleAnalysis,
          isFormattingOnly: false,
        };
      }

      console.log('✅ No api-client changes found in Phase 2');
      return {
        hasChanges: false,
        changedFiles: [],
        moduleAnalysis: {
          coveredModules: [],
          uncoveredModules: [],
          allAffectedModules: [],
        },
        isFormattingOnly: false,
      };
    } catch (error) {
      console.warn('⚠️  Phase 2 detection failed:', error.message);
      return {
        hasChanges: false,
        changedFiles: [],
        moduleAnalysis: {
          coveredModules: [],
          uncoveredModules: [],
          allAffectedModules: [],
        },
        isFormattingOnly: false,
      };
    }
  }

  /**
   * Analyze affected modules from api-client changes
   * @param {Array<string>} changedFiles List of changed api-client files
   * @param {Set<string>} changedSpecModules Set of modules with spec changes (for filtering)
   * @returns {Object} Analysis result with covered and uncovered modules
   */
  analyzeAffectedModulesFromApiClient(
    changedFiles,
    changedSpecModules = new Set(),
  ) {
    const config = this.loadConfig();
    const coveredModules = new Set(); // Modules that have spec changes
    const uncoveredModules = new Set(); // Modules that don't have spec changes
    const unidentifiedFiles = []; // Files that can't be mapped to modules

    // Map api-client files to modules based on file names
    for (const file of changedFiles) {
      const fileName = path.basename(file, '.ts');
      let matched = false;

      // Try to match with module names
      for (const module of config.modules) {
        const moduleName = module.name.toLowerCase();
        const fileNameLower = fileName.toLowerCase();

        if (
          fileNameLower.includes(moduleName) ||
          fileNameLower.includes(moduleName.replace(/-/g, ''))
        ) {
          matched = true;
          // Check if this module has spec changes
          if (changedSpecModules.has(module.name)) {
            coveredModules.add(module.name);
          } else {
            uncoveredModules.add(module.name);
          }
          break;
        }
      }

      if (!matched) {
        // Special handling for core files (index.ts, core/*)
        if (file.includes('/index.ts') || file.includes('/core/')) {
          // These files might be affected by any spec change
          // Don't count as uncovered unless they have substantive changes
          unidentifiedFiles.push(file);
        } else {
          unidentifiedFiles.push(file);
        }
      }
    }

    return {
      coveredModules: Array.from(coveredModules),
      uncoveredModules: Array.from(uncoveredModules),
      unidentifiedFiles,
      allAffectedModules: Array.from(
        new Set([...coveredModules, ...uncoveredModules]),
      ),
    };
  }

  /**
   * Detect changed files by modification time
   * @returns {Array<string>} List of changed file paths
   */
  detectChangedFilesByTime() {
    const lastGenTimePath = path.join(
      this.rootDir,
      'temp',
      '.last-generation-time',
    );
    let lastGenTime = 0;

    if (fs.existsSync(lastGenTimePath)) {
      lastGenTime = parseInt(fs.readFileSync(lastGenTimePath, 'utf8'), 10);
    }

    const changedFiles = [];
    const config = this.loadConfig();

    // Check main configuration file
    const { configPath } = this;
    if (fs.existsSync(configPath)) {
      const stats = fs.statSync(configPath);
      if (stats.mtimeMs > lastGenTime) {
        changedFiles.push(path.relative(this.rootDir, configPath));
      }
    }

    // Check all module files
    for (const module of config.modules) {
      const modulePath = path.join(this.specsDir, module.file);
      if (fs.existsSync(modulePath)) {
        const stats = fs.statSync(modulePath);
        if (stats.mtimeMs > lastGenTime) {
          changedFiles.push(path.relative(this.rootDir, modulePath));
        }
      }
    }

    if (changedFiles.length > 0) {
      console.log(`📝 Found ${changedFiles.length} changed spec files:`);
      changedFiles.forEach((file) => console.log(`   - ${file}`));
    } else {
      console.log('✅ No changed spec files found');
    }

    return changedFiles;
  }

  /**
   * Load configuration file
   */
  loadConfig() {
    if (!fs.existsSync(this.configPath)) {
      throw new Error(`Configuration file does not exist: ${this.configPath}`);
    }
    return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
  }

  /**
   * Analyze change impact scope
   * @param {Array<string>} changedFiles List of changed files (relative to git root)
   * @returns {Object} Analysis result
   */
  analyzeImpact(changedFiles) {
    console.log('🔬 Analyzing change impact scope...');

    const config = this.loadConfig();
    const changedModules = new Set();
    let affectsCommon = false;
    let affectsConfig = false;

    for (const file of changedFiles) {
      // file is relative to git root (e.g., "frontend/packages/openapi-specs/src/specs/modules/oncall.json")
      // Convert to absolute path
      const fullPath = path.resolve(this.gitRoot, file);

      // Check if it's the main configuration file
      if (fullPath === this.configPath) {
        affectsConfig = true;
        console.log(
          '   ⚠️  Main configuration file changed, full generation required',
        );
        continue;
      }

      // Check if it's common.json (shared schemas)
      if (file.includes('common.json')) {
        affectsCommon = true;
        console.log(
          '   ⚠️  Shared schemas (common.json) changed, full generation required',
        );
        continue;
      }

      // Find corresponding module
      for (const module of config.modules) {
        const modulePath = path.join(this.specsDir, module.file);
        if (path.resolve(modulePath) === fullPath) {
          changedModules.add(module.name);
          console.log(`   📦 Module changed: ${module.name}`);
          break;
        }
      }
    }

    return {
      changedModules: Array.from(changedModules),
      affectsCommon,
      affectsConfig,
      needsFullGeneration:
        affectsCommon || affectsConfig || changedModules.size === 0,
    };
  }

  /**
   * Execute full generation (all modules)
   */
  async executeFullGeneration() {
    const APIGenerator = require('./generate-api-complete.js');
    const generator = new APIGenerator();
    await generator.run();
  }

  /**
   * Get schema names from a module spec file
   * @param {string} moduleFile Module spec file path (e.g., "modules/oncall.json")
   * @returns {Array<string>} List of schema names (lowercase)
   */
  getSchemaNamesFromModule(moduleFile) {
    try {
      const specPath = path.join(this.specsDir, moduleFile);
      if (!fs.existsSync(specPath)) {
        return [];
      }

      const specContent = JSON.parse(fs.readFileSync(specPath, 'utf8'));
      const schemas = specContent.components?.schemas || {};

      return Object.keys(schemas).map((name) =>
        name.toLowerCase().replace(/_/g, '-'),
      );
    } catch (error) {
      console.warn(
        `⚠️  Failed to read schemas from ${moduleFile}:`,
        error.message,
      );
      return [];
    }
  }

  /**
   * Execute selective generation using git-based approach
   * Strategy: Generate all files, then use git to revert unchanged modules
   * @param {Array<string>} changedModules List of changed module names
   */
  async executeSelectiveGeneration(changedModules) {
    console.log(
      '\n💡 Selective generation strategy: Generate all + revert unchanged using git',
    );
    console.log(
      '   Benefit: Only files that actually changed will show in git diff\n',
    );

    try {
      // Step 1: Get schema list for changed modules
      console.log('📦 Step 1: Analyzing changed modules schemas...');
      const config = this.loadConfig();
      const changedSchemas = new Set();

      for (const moduleName of changedModules) {
        const module = config.modules.find((m) => m.name === moduleName);
        if (module) {
          const schemas = this.getSchemaNamesFromModule(module.file);
          schemas.forEach((s) => changedSchemas.add(s));
          console.log(`   Module "${moduleName}": ${schemas.length} schemas`);
          if (schemas.length > 0 && schemas.length <= 10) {
            console.log(`     Schemas: ${schemas.slice(0, 10).join(', ')}`);
          }
        }
      }

      console.log(
        `   ✅ Total ${changedSchemas.size} schemas in changed modules`,
      );

      // Step 2: Execute full generation
      console.log('\n🚀 Step 2: Executing full generation (all modules)...');
      await this.executeFullGeneration();

      // Step 3: Use git to revert unchanged files
      console.log('\n🔄 Step 3: Using git to revert unchanged module files...');

      const apiClientRelativePath = 'frontend/packages/api-client/src';

      // Get list of changed files from git
      const changedFiles = execSync(
        `git diff --name-only HEAD -- ${apiClientRelativePath}`,
        {
          encoding: 'utf8',
          cwd: this.gitRoot,
        },
      )
        .trim()
        .split('\n')
        .filter(Boolean);

      console.log(
        `   Found ${changedFiles.length} files changed by generation`,
      );

      // Analyze which files should be reverted
      let revertedCount = 0;
      let keptCount = 0;

      for (const file of changedFiles) {
        const fileName = path.basename(file, '.ts').toLowerCase();
        const relativeFile = file.replace(`${apiClientRelativePath}/`, '');

        // Check if file has substantive changes (not just formatting)
        const isFormattingOnly = this.isFormattingChangeOnly(file);

        // Special handling for different file types
        let shouldKeep = false;

        // 1. Always check if formatting only first
        if (isFormattingOnly) {
          // Formatting-only changes should be reverted
          shouldKeep = false;
        }
        // 2. Check core files
        else if (relativeFile.startsWith('core/')) {
          // Core files: only keep if has substantive changes AND affects changed modules
          // Since core files are shared, revert unless there's module-specific logic change
          shouldKeep = false;
        }
        // 3. Check index.ts and volc-ai-ops-api.ts
        else if (
          relativeFile === 'index.ts' ||
          relativeFile.startsWith('volc-')
        ) {
          // index.ts: check if adds exports for changed schemas
          // volc-ai-ops-api.ts: check if references changed schemas/services
          const diff = execSync(`git diff HEAD -- "${file}"`, {
            encoding: 'utf8',
            cwd: this.gitRoot,
          });

          // Get added lines only
          const addedLines = diff
            .split('\n')
            .filter((line) => line.startsWith('+') && !line.startsWith('+++'))
            .map((line) => line.substring(1));

          // Check if any added line references changed schemas
          const hasChangedSchemaReference = addedLines.some((line) =>
            Array.from(changedSchemas).some((schema) =>
              line.toLowerCase().includes(schema),
            ),
          );

          // Also check if references changed modules (for volc-ai-ops-api.ts)
          const hasChangedModuleReference = addedLines.some((line) =>
            changedModules.some((moduleName) => {
              const patterns = [
                moduleName.toLowerCase(),
                moduleName.toLowerCase().replace(/ /g, '-'),
                moduleName.toLowerCase().replace(/-/g, ''),
              ];
              return patterns.some((pattern) =>
                line.toLowerCase().includes(pattern),
              );
            }),
          );

          shouldKeep = hasChangedSchemaReference || hasChangedModuleReference;
        }
        // 4. Check models
        else if (relativeFile.startsWith('models/')) {
          shouldKeep = Array.from(changedSchemas).some((schema) =>
            fileName.includes(schema),
          );
        }
        // 5. Check services
        else if (relativeFile.startsWith('services/')) {
          shouldKeep = changedModules.some((moduleName) => {
            const patterns = [
              moduleName.toLowerCase(),
              moduleName.toLowerCase().replace(/-/g, ''),
              moduleName.toLowerCase().replace(/ /g, '-'),
            ];
            return patterns.some((pattern) => fileName.includes(pattern));
          });
        }

        if (!shouldKeep) {
          // Revert this file
          try {
            execSync(`git checkout HEAD -- "${file}"`, {
              cwd: this.gitRoot,
              stdio: 'ignore',
            });
            revertedCount++;
          } catch (revertError) {
            // File might be new or other issue, skip
          }
        } else {
          keptCount++;
        }
      }

      console.log(
        `   ✅ Kept ${keptCount} files from changed modules, Reverted ${revertedCount} files`,
      );

      // Step 4: Show final git status
      console.log('\n📊 Final changes:');
      try {
        const finalChanges = execSync(
          `git diff --name-only HEAD -- ${apiClientRelativePath} | wc -l`,
          {
            encoding: 'utf8',
            cwd: this.gitRoot,
          },
        ).trim();
        console.log(`   ${finalChanges} files actually changed`);
      } catch (e) {
        // Ignore
      }

      console.log('\n🎉 Selective generation completed!');
      console.log(
        `   Only files from changed modules (${changedModules.join(', ')}) were updated`,
      );
    } catch (error) {
      console.error('\n❌ Selective generation failed:', error.message);
      console.log(
        '\n⚠️  Tip: Use "make generate-api-complete" if selective generation fails',
      );
      throw error;
    }
  }

  /**
   * Save generation timestamp
   */
  saveGenerationTime() {
    const tempDir = path.join(this.rootDir, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const timePath = path.join(tempDir, '.last-generation-time');
    fs.writeFileSync(timePath, Date.now().toString());
  }

  /**
   * Run incremental generation process (with two-phase detection)
   * @param {Object} options - Generation options
   * @param {boolean} options.ignoreApiClient - Whether to ignore api-client changes (Phase 2)
   */
  async run(options = {}) {
    const { ignoreApiClient = false } = options;

    console.log(
      '🚀 Starting two-phase incremental API generation process...\n',
    );

    try {
      // Phase 1: Detect changed spec files
      const changedSpecFiles = this.detectChangedFiles();

      // Phase 2: Detect api-client changes (unless explicitly ignored)
      let apiClientChanges = {
        hasChanges: false,
        changedFiles: [],
        moduleAnalysis: {
          coveredModules: [],
          uncoveredModules: [],
          allAffectedModules: [],
        },
        isFormattingOnly: false,
      };
      if (!ignoreApiClient) {
        apiClientChanges = this.detectApiClientChanges(changedSpecFiles);
      } else {
        console.log('\n⚠️  Phase 2 skipped (--ignore-api-client flag set)');
      }

      // Combine results from both phases
      const hasSpecChanges = changedSpecFiles.length > 0;
      const hasApiClientChanges = apiClientChanges.hasChanges;

      if (!hasSpecChanges && !hasApiClientChanges) {
        console.log(
          '\n✅ No changes detected in both phases, skipping generation',
        );
        console.log(
          '💡 Tip: If you need to force full generation, run: pnpm generate:api',
        );
        return;
      }

      // Determine if generation is needed
      let needsGeneration = false;
      let reason = '';
      let useFullGeneration = false;

      if (hasSpecChanges) {
        needsGeneration = true;
        reason = 'Spec files changed (Phase 1)';
        console.log(`\n📝 Generation triggered: ${reason}`);
      }

      if (hasApiClientChanges && !ignoreApiClient) {
        const { moduleAnalysis, isFormattingOnly } = apiClientChanges;
        const { coveredModules, uncoveredModules, unidentifiedFiles } =
          moduleAnalysis;

        // Decision Strategy:
        // Case 1: Only uncovered modules, but all are formatting changes → Safe, skip full generation
        // Case 2: Only covered modules (or unidentified) → Safe, changes expected from spec
        // Case 3: Has uncovered modules + substantive changes → Unsafe, need full generation

        if (uncoveredModules.length === 0 && unidentifiedFiles.length > 0) {
          // Case 2.1: Only unidentified files (index.ts, core/*), likely from spec changes
          console.log(
            '\n✅ Only unidentified files changed (index.ts, core/*), likely from spec changes',
          );
        } else if (uncoveredModules.length === 0) {
          // Case 2.2: Only covered modules
          console.log(
            '\n✅ All api-client module changes are covered by spec changes',
          );
        } else if (isFormattingOnly) {
          // Case 1: Uncovered modules exist, but all formatting
          console.log(
            `\n✅ Found ${uncoveredModules.length} uncovered modules, but all changes are formatting only`,
          );
          console.log(`   Modules: ${uncoveredModules.join(', ')}`);
          console.log(
            '   💡 Formatting changes do not trigger full regeneration',
          );
        } else {
          // Case 3: Has substantive changes in uncovered modules
          needsGeneration = true;
          useFullGeneration = true;
          reason =
            'api-client has substantive changes in modules without spec changes (Phase 2)';
          console.log(`\n⚠️  Potential drift detected: ${reason}`);
          console.log(
            `   Covered modules (have spec changes): ${coveredModules.length > 0 ? coveredModules.join(', ') : 'none'}`,
          );
          console.log(
            `   Uncovered modules (no spec changes): ${uncoveredModules.join(', ')}`,
          );
          console.log(
            '\n⚠️  This indicates manual modifications or unexpected changes',
          );
          console.log('   → Full regeneration will ensure consistency');
          console.log('\n💡 Options:');
          console.log(
            '   - Review changes: git diff upstream/main -- frontend/packages/api-client/src',
          );
          console.log(
            '   - Skip Phase 2: make generate-api-incremental-spec-only',
          );
        }
      }

      if (!needsGeneration) {
        console.log('\n✅ No generation needed');
        return;
      }

      // Analyze impact scope
      const impact = this.analyzeImpact(changedSpecFiles);

      // Decide generation strategy
      if (impact.needsFullGeneration || useFullGeneration) {
        console.log(
          '\n⚠️  Large impact scope detected, executing full generation...\n',
        );
        await this.executeFullGeneration();
      } else {
        console.log(
          '\n📦 Small change scope, executing selective generation...',
        );
        console.log(`   Changed modules: ${impact.changedModules.join(', ')}`);
        console.log(
          '\n💡 Strategy: Generate all files, but only update changed modules',
        );
        console.log(
          '   Benefit: Unchanged modules keep their timestamps and git status\n',
        );

        await this.executeSelectiveGeneration(impact.changedModules);
      }

      // Save generation timestamp
      this.saveGenerationTime();

      console.log('\n✅ Two-phase incremental generation completed!');
    } catch (error) {
      console.error('\n❌ Incremental generation failed:', error.message);
      throw error;
    }
  }
}

// Run incremental generator
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const options = {
    ignoreApiClient:
      args.includes('--ignore-api-client') || args.includes('--spec-only'),
  };

  if (options.ignoreApiClient) {
    console.log(
      '📌 Running with --ignore-api-client: Only checking spec changes (Phase 1)\n',
    );
  }

  const generator = new IncrementalAPIGenerator();
  generator.run(options).catch((error) => {
    console.error('Fatal error:', error);
    throw error;
  });
}

module.exports = IncrementalAPIGenerator;
