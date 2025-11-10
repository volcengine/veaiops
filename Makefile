# Makefile for VeAIOps

# Define the default shell
SHELL := /bin/bash

# Define python interpreter from venv
PYTHON := .venv/bin/python

# Project Information
FRONTEND_DIR := frontend

.PHONY: help install sync lint format test clean run setup-frontend dev-frontend dev-frontend-only build-frontend build-frontend-with-docs lint-frontend format-frontend type-check-frontend clean-frontend nx-frontend affected-frontend graph-frontend generate-api-frontend check-deps-frontend tsc-frontend setup-docs dev-docs build-docs generate-docs integrate-docs build-all

help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Backend targets:"
	@echo "  install                	Install dependencies and the project in editable mode."
	@echo "  sync                   	Sync the environment with pyproject.toml."
	@echo "  lint                   	Lint the codebase with ruff."
	@echo "  format                 	Format the codebase with ruff."
	@echo "  test                   	Run tests with pytest."
	@echo "  clean                  	Clean up build artifacts and cache files."
	@echo "  run-backend            	Run the main backend application."
	@echo "  run-chatops            	Run the main chatops application."
	@echo "  run-intelligent-threshold  Run the main intelligent-threshold application."
	@echo ""
	@echo "Frontend targets:"
	@echo "  setup-frontend         	Setup frontend environment (Nx Workspace + pnpm monorepo)"
	@echo "  dev-frontend           	Start frontend + docs development servers"
	@echo "  dev-frontend-only      	Start frontend only (without docs)"
	@echo "  build-frontend         	Build frontend ONLY (不包含文档)"
	@echo "  build-frontend-with-docs  Build frontend + docs (推荐用于 Docker 镜像)"
	@echo "  build-frontend-production  Build frontend + docs (production)"
	@echo "  lint-frontend          	Run frontend ESLint checking"
	@echo "  format-frontend        	Format frontend code with Biome (⚠️ 使用 Biome，不是 Prettier)"
	@echo "  type-check-frontend    	Run frontend TypeScript type checking"
	@echo "  clean-frontend         	Clean frontend build artifacts"
	@echo "  nx-frontend            	Run frontend Nx commands"
	@echo ""
	@echo "Docs targets:"
	@echo "  setup-docs             	Setup docs environment (install & build)"
	@echo "  dev-docs               	Start documentation development server"
	@echo "  build-docs             	Build documentation"
	@echo "  generate-docs          	Generate documentation static files"
	@echo "  integrate-docs         	Integrate docs into frontend build (完整流程)"
	@echo "  build-all              	Build complete application with docs"
	@echo ""
	@echo "API Generation targets:"
	@echo "  generate-api-frontend  	Generate frontend API client code (使用 pnpm generate:api)"
	@echo "  generate-api-incremental  Incremental API generation (检测变更的 spec 文件)"
	@echo "  generate-api-python    	Analyze Python code and generate OpenAPI spec"
	@echo "  generate-api-complete  	Complete API generation workflow (recommended)"
	@echo "  build-openapi-spec     	Build OpenAPI spec from modular files"


# ==============================================================================
# Development Lifecycle
# ==============================================================================

install: .venv
	@echo "--> Installing dependencies and project in editable mode..."
	@uv pip install -e .

sync: .venv
	@echo "--> Syncing environment with pyproject.toml..."
	@uv sync

.venv: pyproject.toml
	@echo "--> Creating virtual environment..."
	@uv venv --verbose --clear

lint: .venv
	@echo "--> Linting codebase with ruff..."
	@uv run ruff check .

format: .venv
	@echo "--> Formatting codebase with ruff..."
	@uv run ruff format .

test: install
	@echo "--> Running tests with pytest..."
	@uv run --group test pytest --cov=veaiops --cov-report=html

run-backend: .venv
	@echo "--> Running the server backend application..."
	@uv run uvicorn veaiops.cmd.backend.main:app --host 0.0.0.0 --port 8000 --reload

run-chatops: .venv
	@echo "--> Running the chatops main application..."
	@uv run uvicorn veaiops.cmd.chatops.main:app --host 0.0.0.0 --port 6000 --reload

run-intelligent-threshold: .venv
	@echo "--> Running the intelligent-threshold main application..."
	@uv run uvicorn veaiops.cmd.intelligent_threshold.main:app --host 0.0.0.0 --port 6001 --reload


clean:
	@echo "--> Cleaning up..."
	@rm -rf .venv
	@rm -rf .pytest_cache
	@rm -rf .ruff_cache
	@rm -rf **/__pycache__
	@rm -rf *.egg-info
	@rm -rf build
	@rm -rf dist
# ==============================================================================
# Frontend Development
# ==============================================================================
setup-frontend: clean-frontend ## Initialize frontend project environment (supports NX + pnpm monorepo)
	@if [ -d "$(FRONTEND_DIR)" ] && command -v pnpm >/dev/null 2>&1; then \
			echo "--> Setting up frontend monorepo environment..."; \
			(cd $(FRONTEND_DIR) && { \
				if [ ! -f "pnpm-workspace.yaml" ]; then \
					echo "⚠️  pnpm-workspace.yaml not found, this may not be a valid monorepo"; \
				fi; \
				if [ ! -d "node_modules" ]; then \
					echo "--> Installing root dependencies..."; \
					pnpm install --frozen-lockfile || pnpm install; \
					echo "✓ Root dependencies installed"; \
				else \
					echo "✓ Root dependencies already exist"; \
				fi; \
				echo "--> Installing workspace dependencies..."; \
				pnpm install --recursive --frozen-lockfile || pnpm install --recursive; \
				echo "--> Ensuring all packages have their dependencies..."; \
				pnpm --filter '@veaiops/components' install; \
				pnpm --filter '@veaiops/constants' install; \
				pnpm --filter '@veaiops/types' install; \
				pnpm --filter '@veaiops/utils' install; \
				pnpm --filter '@veaiops/hooks' install; \
				pnpm --filter '@veaiops/theme-ve-o' install; \
				echo "✓ All workspace dependencies installed"; \
				if command -v nx >/dev/null 2>&1 || [ -f "node_modules/.bin/nx" ]; then \
					echo "--> Verifying NX workspace..."; \
					pnpm nx graph --dry-run >/dev/null 2>&1 && echo "✓ NX workspace verified" || echo "⚠️  NX workspace verification failed"; \
				fi; \
				echo "--> Building workspace packages..."; \
				echo "    🔍 Checking if @veaiops/api-client exists..."; \
				if [ -d "packages/api-client/src/models" ] && [ -d "packages/api-client/src/services" ]; then \
					API_CLIENT_FILES=$$(find packages/api-client/src -name '*.ts' -type f 2>/dev/null | wc -l | tr -d ' '); \
					echo "    📊 Found $$API_CLIENT_FILES TypeScript files in api-client"; \
					if [ "$$API_CLIENT_FILES" -gt 10 ]; then \
						echo "    ✓ @veaiops/api-client already exists ($$API_CLIENT_FILES files), skipping API generation"; \
						echo "    💡 To regenerate API client, run: make generate-api-complete"; \
						echo "    🔧 Building other packages (excluding openapi-specs)..."; \
						(pnpm --filter '@veaiops/components' build && \
						 pnpm --filter '@veaiops/constants' build && \
						 pnpm --filter '@veaiops/types' build && \
						 pnpm --filter '@veaiops/utils' build && \
						 pnpm --filter '@veaiops/hooks' build && \
						 pnpm --filter '@veaiops/theme-ve-o' build) 2>/dev/null && \
						echo "    ✓ Workspace packages built (api-client generation skipped)" || \
						echo "    ⚠️  Some packages may need manual build"; \
					else \
						echo "    ℹ️  @veaiops/api-client exists but seems incomplete (only $$API_CLIENT_FILES files)"; \
						echo "    🔧 Running full build including API generation..."; \
						pnpm run build:packages 2>/dev/null && echo "    ✓ Workspace packages built" || echo "    ⚠️  Some packages may need manual build"; \
					fi; \
				else \
					echo "    ℹ️  @veaiops/api-client not found or incomplete"; \
					echo "    🔧 Running full build including API generation..."; \
					pnpm run build:packages 2>/dev/null && echo "    ✓ Workspace packages built" || echo "    ⚠️  Some packages may need manual build"; \
				fi; \
			}); \
			if [ -d "docs" ]; then \
				echo "--> Installing documentation dependencies..."; \
				(cd docs && pnpm install --frozen-lockfile || pnpm install); \
				echo "✓ Documentation dependencies installed"; \
				SQLITE_DIR=$$(find docs/node_modules/.pnpm -maxdepth 1 -type d -name "better-sqlite3@*" 2>/dev/null | head -1); \
				SQLITE_BUILT=0; \
				if [ -n "$$SQLITE_DIR" ] && [ ! -f "$$SQLITE_DIR/node_modules/better-sqlite3/build/Release/better_sqlite3.node" ]; then \
					echo "--> Building better-sqlite3 (this may take 1-2 minutes, please wait)..."; \
					if (cd "$$SQLITE_DIR/node_modules/better-sqlite3" && npm run build-release > /tmp/better-sqlite3-build.log 2>&1); then \
						echo "✓ better-sqlite3 built successfully"; \
						SQLITE_BUILT=1; \
					else \
						echo "⚠️  better-sqlite3 build failed - documentation generation may not work"; \
						echo "Build log saved to: /tmp/better-sqlite3-build.log"; \
						echo "    Common causes:"; \
						echo "    - Missing Xcode Command Line Tools (run: xcode-select --install)"; \
						echo "    - Missing Python (install via: brew install python3)"; \
					fi; \
				elif [ -n "$$SQLITE_DIR" ]; then \
					echo "✓ better-sqlite3 already built"; \
					SQLITE_BUILT=1; \
				fi; \
				if [ $$SQLITE_BUILT -eq 1 ]; then \
					echo "--> Generating documentation (this may take a moment)..."; \
					if (cd docs && pnpm run generate > /tmp/docs-generate.log 2>&1); then \
						echo "✓ Documentation generated successfully"; \
						echo "    Output: docs/.output/public/"; \
					else \
						echo "⚠️  Documentation generation failed"; \
						echo "    Log saved to: /tmp/docs-generate.log"; \
					fi; \
				else \
					echo "⚠️  Skipping documentation generation (better-sqlite3 not available)"; \
				fi; \
			fi; \
		echo "🎉 Frontend monorepo setup completed!"; \
	else \
		echo "⚠️  Frontend environment not available (pnpm not found or frontend directory missing)"; \
	fi

dev-frontend: ## Start frontend development server (automatically starts documentation server)
	@if [ -d "$(FRONTEND_DIR)" ] && command -v pnpm >/dev/null 2>&1; then \
		echo "--> Checking documentation environment..."; \
		if [ -d "docs" ] && [ -f "docs/package.json" ] && [ "${SKIP_DOCS:-0}" != "1" ]; then \
			if lsof -i:4000 -sTCP:LISTEN -t >/dev/null 2>&1; then \
				echo "✓ Documentation server already running on port 4000"; \
				DOCS_RUNNING=1; \
			else \
				echo "--> Documentation server not running, preparing to start..."; \
				DOCS_RUNNING=0; \
			fi; \
			if [ $$DOCS_RUNNING -eq 0 ]; then \
				SQLITE_DIR=$$(find docs/node_modules/.pnpm -maxdepth 1 -type d -name "better-sqlite3@*" 2>/dev/null | head -1); \
				if [ -n "$$SQLITE_DIR" ] && [ ! -f "$$SQLITE_DIR/node_modules/better-sqlite3/build/Release/better_sqlite3.node" ]; then \
					echo "--> Building better-sqlite3 for documentation (this may take a moment)..."; \
					if (cd "$$SQLITE_DIR/node_modules/better-sqlite3" && npm run build-release >/dev/null 2>&1); then \
						echo "✓ better-sqlite3 built successfully"; \
					else \
						echo "⚠️  better-sqlite3 build failed, documentation may not work properly"; \
					fi; \
				elif [ -n "$$SQLITE_DIR" ]; then \
					echo "✓ better-sqlite3 already built"; \
				else \
					echo "⚠️  better-sqlite3 not found in node_modules"; \
				fi; \
				echo "--> Starting documentation server in background..."; \
				(cd docs && nohup pnpm run dev > /tmp/docs-server.log 2>&1 &); \
				DOCS_PID=$$!; \
				echo "    Documentation server started (PID: $$DOCS_PID, Port: 4000)"; \
				echo "    Logs: /tmp/docs-server.log"; \
				sleep 2; \
			fi; \
		else \
			if [ "${SKIP_DOCS:-0}" = "1" ]; then \
				echo "ℹ️  Documentation server skipped (SKIP_DOCS=1)"; \
			else \
				echo "ℹ️  Documentation server skipped (set SKIP_DOCS=1 to skip, or ensure docs/ exists)"; \
			fi; \
		fi; \
		echo "--> Starting frontend development server..."; \
		echo "    Frontend: http://localhost:8087"; \
		if [ "${SKIP_DOCS:-0}" != "1" ] && [ -d "docs" ]; then \
			echo "    Documentation: http://localhost:4000/"; \
		fi; \
		echo ""; \
		echo "📖 Press Ctrl+C to stop both servers"; \
		trap 'echo ""; echo "Stopping servers..."; pkill -f "nuxt.*docs" 2>/dev/null; exit 0' INT TERM; \
		(cd $(FRONTEND_DIR) && pnpm dev); \
	else \
		echo "⚠️  Frontend environment not available, skipping frontend dev server..."; \
	fi

dev-frontend-only: ## Start only frontend development server (without documentation)
	@if [ -d "$(FRONTEND_DIR)" ] && command -v pnpm >/dev/null 2>&1; then \
		echo "--> Starting frontend development server..."; \
		(cd $(FRONTEND_DIR) && pnpm dev); \
	else \
		echo "⚠️  Frontend environment not available, skipping frontend dev server..."; \
	fi

dev-frontend-fast: ## Start frontend development server quickly (skipping documentation server)
	@if [ -d "$(FRONTEND_DIR)" ] && command -v pnpm >/dev/null 2>&1; then \
		echo "--> Starting frontend development server (fast mode)..."; \
		echo "    Frontend: http://localhost:8087"; \
		echo "    Documentation: skipped"; \
		echo ""; \
		echo "💡 Use 'make dev-frontend' to include documentation server"; \
		(cd $(FRONTEND_DIR) && pnpm dev); \
	else \
		echo "⚠️  Frontend environment not available, skipping frontend dev server..."; \
	fi

build-frontend: ## Build frontend project (standard build, WITHOUT documentation)
	@if [ -d "$(FRONTEND_DIR)" ] && command -v pnpm >/dev/null 2>&1; then \
		echo "--> Building frontend project..."; \
		(cd $(FRONTEND_DIR) && { \
			echo "    🔍 Checking if @veaiops/api-client exists..."; \
			if [ -d "packages/api-client/src/models" ] && [ -d "packages/api-client/src/services" ]; then \
				API_CLIENT_FILES=$$(find packages/api-client/src -name '*.ts' -type f 2>/dev/null | wc -l | tr -d ' '); \
				echo "    📊 Found $$API_CLIENT_FILES TypeScript files in api-client"; \
				if [ "$$API_CLIENT_FILES" -gt 10 ]; then \
					echo "    ✓ @veaiops/api-client already exists ($$API_CLIENT_FILES files), skipping API generation"; \
					echo "    💡 To regenerate API client, run: make generate-api-complete"; \
					echo "    🔧 Building packages (excluding openapi-specs)..."; \
					(pnpm --filter '@veaiops/api-client' build && \
					 pnpm --filter '@veaiops/components' build && \
					 pnpm --filter '@veaiops/constants' build && \
					 pnpm --filter '@veaiops/types' build && \
					 pnpm --filter '@veaiops/utils' build) 2>/dev/null && \
					echo "    ✓ Packages built (api-client generation skipped)" || \
					echo "    ⚠️  Some packages may need manual build"; \
					echo "    🔧 Building apps..."; \
					pnpm run build:apps; \
				else \
					echo "    ℹ️  @veaiops/api-client exists but seems incomplete (only $$API_CLIENT_FILES files)"; \
					echo "    🔧 Running full build including API generation..."; \
					pnpm build; \
				fi; \
			else \
				echo "    ℹ️  @veaiops/api-client not found or incomplete"; \
				echo "    🔧 Running full build including API generation..."; \
				pnpm build; \
			fi; \
		}); \
		echo ""; \
		echo "⚠️  注意：此构建不包含文档！"; \
		echo "💡 要包含文档，请使用: make integrate-docs 或 make build-frontend-with-docs"; \
	else \
		echo "⚠️  Frontend environment not available, skipping frontend build..."; \
	fi

build-frontend-with-docs: ## Build frontend + docs (推荐用于 Docker 镜像构建)
	@echo "==> Building frontend with documentation..."
	@$(MAKE) integrate-docs
	@echo ""
	@echo "✅ Build complete!"
	@echo "📦 Output: $(FRONTEND_DIR)/apps/veaiops/output/"
	@echo "📍 Frontend: /"
	@echo "📍 Docs: /veaiops/"
	@echo ""
	@echo "💡 可以构建 Docker 镜像了："
	@echo "   docker buildx build -f ./docker/frontend/Dockerfile \\"
	@echo "     -t veaiops-registry-cn-beijing.cr.volces.com/veaiops/frontend:TAG \\"
	@echo "     --platform=linux/amd64 . --push"

build-frontend-production: ## Production build (includes frontend + documentation generation + integration)
	@if [ -d "$(FRONTEND_DIR)" ] && command -v pnpm >/dev/null 2>&1; then \
		echo "==> Building complete production application (frontend + docs)..."; \
		echo ""; \
		echo "📋 Step 1/3: Building frontend (production mode)..."; \
		echo "    NODE_ENV=production will be used for optimized build"; \
		$(MAKE) build-frontend; \
		echo ""; \
		echo "📋 Step 2/3: Generating documentation..."; \
		$(MAKE) integrate-docs SKIP_FRONTEND_BUILD=1; \
		echo ""; \
		echo "📋 Step 3/3: Verifying build output..."; \
		if [ -d "$(FRONTEND_DIR)/apps/veaiops/output" ]; then \
			echo "✅ Frontend build verified"; \
		else \
			echo "❌ Frontend build not found"; \
			exit 1; \
		fi; \
		if [ -d "$(FRONTEND_DIR)/apps/veaiops/output/veaiops" ]; then \
			echo "✅ Documentation integrated"; \
		else \
			echo "⚠️  Documentation not integrated (may be skipped due to platform limitations)"; \
		fi; \
		echo ""; \
		echo "✅ Production build complete!"; \
		echo "📦 Output: $(FRONTEND_DIR)/apps/veaiops/output/"; \
		echo "📍 Frontend: /"; \
		echo "📍 Docs: /veaiops/"; \
		echo "✅ 使用统一路径 /veaiops/"; \
	else \
		echo "⚠️  Frontend environment not available, cannot build production..."; \
	fi

lint-frontend: ## Run frontend code linting
	@if [ -d "$(FRONTEND_DIR)" ] && command -v pnpm >/dev/null 2>&1; then \
		echo "--> Running frontend linting..."; \
		(cd $(FRONTEND_DIR) && pnpm lint); \
	else \
		echo "⚠️  Frontend environment not available, skipping frontend linting..."; \
	fi

clean-frontend: ## Clean frontend project and documentation project
	@if [ -d "$(FRONTEND_DIR)" ] && command -v pnpm >/dev/null 2>&1; then \
		echo "--> Cleaning frontend project..."; \
		(cd $(FRONTEND_DIR) && pnpm clean:all 2>/dev/null || true); \
		find $(FRONTEND_DIR) -name 'node_modules' -type d -exec rm -rf {} + 2>/dev/null || true; \
		find $(FRONTEND_DIR) -name '.cache' -type d -exec rm -rf {} + 2>/dev/null || true; \
	else \
		echo "⚠️  Frontend environment not available, skipping frontend cleanup..."; \
	fi
	@if [ -d "docs" ]; then \
		echo "--> Cleaning documentation project..."; \
		find docs -name 'node_modules' -type d -exec rm -rf {} + 2>/dev/null || true; \
		find docs -name '.cache' -type d -exec rm -rf {} + 2>/dev/null || true; \
		find docs -name '.nuxt' -type d -exec rm -rf {} + 2>/dev/null || true; \
		find docs -name 'dist' -type d -exec rm -rf {} + 2>/dev/null || true; \
		find docs -name '.output' -type d -exec rm -rf {} + 2>/dev/null || true; \
		rm -f docs/.better-sqlite3-built 2>/dev/null || true; \
	fi

# Nx related commands (frontend)
nx-frontend: ## Run frontend Nx commands (usage: make nx-frontend ARGS="graph")
	@if [ -d "$(FRONTEND_DIR)" ] && command -v pnpm >/dev/null 2>&1; then \
		(cd $(FRONTEND_DIR) && pnpm nx $(ARGS)); \
	else \
		echo "⚠️  Frontend environment not available, cannot run Nx commands..."; \
	fi

affected-frontend: ## Run frontend Nx affected commands
	@if [ -d "$(FRONTEND_DIR)" ] && command -v pnpm >/dev/null 2>&1; then \
		(cd $(FRONTEND_DIR) && pnpm affected $(ARGS)); \
	else \
		echo "⚠️  Frontend environment not available, cannot run affected commands..."; \
	fi

graph-frontend: ## Show frontend project dependency graph
	@if [ -d "$(FRONTEND_DIR)" ] && command -v pnpm >/dev/null 2>&1; then \
		(cd $(FRONTEND_DIR) && pnpm nx graph); \
	else \
		echo "⚠️  Frontend environment not available, cannot show dependency graph..."; \
	fi

# API related
generate-api-complete: ## Complete API generation workflow (Python analysis + TypeScript generation + optimization)
	@if [ -d "$(FRONTEND_DIR)" ] && command -v pnpm >/dev/null 2>&1; then \
		echo "--> Running complete API generation workflow..."; \
		(cd $(FRONTEND_DIR)/packages/openapi-specs && node src/scripts/generate-api-complete.js); \
	else \
		echo "⚠️  Frontend environment not available, cannot run complete API generation..."; \
	fi

generate-api-incremental: ## Incremental API generation (detect changed spec files and generate code)
	@if [ -d "$(FRONTEND_DIR)" ] && command -v pnpm >/dev/null 2>&1; then \
		echo "--> Running incremental API generation..."; \
		(cd $(FRONTEND_DIR)/packages/openapi-specs && node src/scripts/generate-api-incremental.js); \
	else \
		echo "⚠️  Frontend environment not available, cannot run incremental API generation..."; \
	fi

generate-api-python: ## Generate OpenAPI specification from Python code
	@if [ -d "$(FRONTEND_DIR)" ] && command -v pnpm >/dev/null 2>&1; then \
		echo "--> Analyzing Python code and generating OpenAPI specification..."; \
		(cd $(FRONTEND_DIR)/packages/openapi-specs && node src/scripts/python-code-analyzer.js); \
	else \
		echo "⚠️  Frontend environment not available, cannot analyze Python code..."; \
	fi

build-openapi-spec: ## Build OpenAPI specification files
	@if [ -d "$(FRONTEND_DIR)" ] && command -v pnpm >/dev/null 2>&1; then \
		echo "--> Building OpenAPI specification from modular files..."; \
		(cd $(FRONTEND_DIR)/packages/openapi-specs && node src/scripts/build-openapi.js); \
	else \
		echo "⚠️  Frontend environment not available, cannot build OpenAPI spec..."; \
	fi

# Tool Commands
check-deps-frontend: ## Check frontend dependency version consistency
	@if [ -d "$(FRONTEND_DIR)" ] && command -v pnpm >/dev/null 2>&1; then \
		(cd $(FRONTEND_DIR) && pnpm check-dependency-version); \
	else \
		echo "⚠️  Frontend environment not available, cannot check dependency versions..."; \
	fi

prettier-frontend: ## Run frontend Prettier formatting
	@if [ -d "$(FRONTEND_DIR)" ] && command -v pnpm >/dev/null 2>&1; then \
		echo "--> Running Prettier formatting..."; \
		(cd $(FRONTEND_DIR) && pnpm prettier --write . --ignore-path .prettierignore); \
	else \
		echo "⚠️  Frontend environment not available, cannot run Prettier..."; \
	fi

# TypeScript compilation check
tsc-frontend: ## Run frontend TypeScript compilation check
	@if [ -d "$(FRONTEND_DIR)" ] && command -v pnpm >/dev/null 2>&1; then \
		echo "--> Running frontend TypeScript compilation check..."; \
		(cd $(FRONTEND_DIR) && pnpm type-check); \
	else \
		echo "⚠️  Frontend environment not available, skipping TypeScript compilation check..."; \
	fi

# ==============================================================================
# Docs Development
# ==============================================================================
setup-docs: ## Set up documentation environment (install dependencies and build native modules)
	@if [ -d "docs" ]; then \
		echo "--> Setting up documentation environment..."; \
		(cd docs && pnpm install && pnpm rebuild better-sqlite3); \
		echo "✓ Documentation environment ready"; \
	else \
		echo "⚠️  Docs directory not found..."; \
	fi

dev-docs: ## Start documentation development server
	@if [ -d "docs" ]; then \
		echo "--> Checking documentation environment..."; \
		if [ ! -d "docs/node_modules/.pnpm/better-sqlite3@12.4.1/node_modules/better-sqlite3/build" ]; then \
			echo "--> Rebuilding better-sqlite3..."; \
			(cd docs && pnpm rebuild better-sqlite3); \
		fi; \
		echo "--> Starting documentation development server..."; \
		(cd docs && pnpm run dev); \
	else \
		echo "⚠️  Docs directory not found..."; \
	fi

build-docs: ## Build documentation static files
	@if [ -d "docs" ]; then \
		echo "--> Building documentation..."; \
		(cd docs && pnpm run build); \
	else \
		echo "⚠️  Docs directory not found..."; \
	fi

generate-docs: ## Generate documentation static files
	@if [ -d "docs" ]; then \
		echo "--> Generating documentation static files..."; \
		(cd docs && pnpm run generate); \
	else \
		echo "⚠️  Docs directory not found..."; \
	fi

integrate-docs: ## Integrate documentation into frontend build artifacts
	@set -e; \
	echo "--> Checking dependencies before integration..."; \
	if [ ! -d "$(FRONTEND_DIR)/node_modules" ]; then \
		echo "⚠️  Frontend dependencies not found. Installing..."; \
		(cd $(FRONTEND_DIR) && pnpm install --frozen-lockfile || pnpm install); \
		echo "✓ Frontend dependencies installed"; \
	fi; \
	if [ ! -d "docs/node_modules" ]; then \
		echo "⚠️  Documentation dependencies not found. Installing..."; \
		(cd docs && pnpm install --frozen-lockfile || pnpm install); \
		echo "✓ Documentation dependencies installed"; \
	fi; \
	SQLITE_BUILT=0; \
	echo "--> Checking better-sqlite3 build status..."; \
	SQLITE_DIR=$$(find docs/node_modules/.pnpm -maxdepth 1 -type d -name "better-sqlite3@*" 2>/dev/null | head -1); \
	if [ -n "$$SQLITE_DIR" ] && [ -f "$$SQLITE_DIR/node_modules/better-sqlite3/build/Release/better_sqlite3.node" ]; then \
		echo "✓ better-sqlite3 already built"; \
		SQLITE_BUILT=1; \
	elif [ -n "$$SQLITE_DIR" ]; then \
		echo "--> Building better-sqlite3 (this may take 1-2 minutes, please wait)..."; \
		if (cd "$$SQLITE_DIR/node_modules/better-sqlite3" && npm run build-release > /tmp/better-sqlite3-build.log 2>&1); then \
			if [ -f "$$SQLITE_DIR/node_modules/better-sqlite3/build/Release/better_sqlite3.node" ]; then \
				echo "✓ better-sqlite3 built successfully"; \
				SQLITE_BUILT=1; \
			else \
				echo "⚠️  better-sqlite3 build completed but .node file not found"; \
			fi; \
		else \
			echo "⚠️  better-sqlite3 build failed"; \
			echo "Build log saved to: /tmp/better-sqlite3-build.log"; \
			tail -10 /tmp/better-sqlite3-build.log | grep -E "(error|ERR!)" || true; \
			echo "    Common causes:"; \
			echo "    - Missing Xcode Command Line Tools (run: xcode-select --install)"; \
			echo "    - Missing Python (install via: brew install python3)"; \
			echo "    Documentation generation will be skipped."; \
		fi; \
	else \
		echo "⚠️  better-sqlite3 not found in node_modules"; \
		echo "    Documentation generation will be skipped."; \
	fi; \
	if [ "$(SKIP_FRONTEND_BUILD)" != "1" ]; then \
		echo "--> Building frontend..."; \
		(cd $(FRONTEND_DIR) && pnpm build); \
	else \
		echo "--> Skipping frontend build (SKIP_FRONTEND_BUILD=1)..."; \
		if [ ! -d "$(FRONTEND_DIR)/apps/veaiops/output" ]; then \
			echo "❌ Error: Frontend build not found, but SKIP_FRONTEND_BUILD=1"; \
			echo "    Please build frontend first: make build-frontend"; \
			exit 1; \
		fi; \
		echo "✓ Using existing frontend build"; \
	fi; \
	echo "--> Preparing documentation build (SQLITE_BUILT=$$SQLITE_BUILT)..."; \
	if [ ! -d "docs/.output/public" ]; then \
		if [ $$SQLITE_BUILT -eq 1 ]; then \
			echo "--> Generating documentation..."; \
			if (cd docs && pnpm run generate >/dev/null 2>&1); then \
				echo "✓ Documentation generated successfully"; \
			else \
				echo "⚠️  Documentation generation failed"; \
			fi; \
		else \
			echo "⚠️  Skipping documentation generation (better-sqlite3 not available)"; \
		fi; \
	else \
		echo "✓ Using existing documentation build"; \
	fi; \
	if [ -d "$(FRONTEND_DIR)/apps/veaiops/output" ]; then \
		if [ -d "docs/.output/public" ]; then \
			echo "--> Integrating documentation into frontend build..."; \
			rm -rf $(FRONTEND_DIR)/apps/veaiops/output/veaiops; \
			mkdir -p $(FRONTEND_DIR)/apps/veaiops/output/veaiops; \
			cp -r docs/.output/public/* $(FRONTEND_DIR)/apps/veaiops/output/veaiops/; \
			echo "✓ Documentation integrated at: $(FRONTEND_DIR)/apps/veaiops/output/veaiops/"; \
			echo "✓ Access at: /veaiops/ (统一路径)"; \
			echo "✓ Integration complete!"; \
		else \
			echo "⚠️  Documentation build not available (likely due to better-sqlite3 compilation issues on this platform)."; \
			echo "    Frontend build completed successfully."; \
			echo "    Documentation can be built separately when needed."; \
			echo "✓ Integration process completed (frontend only)."; \
		fi; \
	else \
		echo "⚠️  Frontend build not found."; \
		echo "    Please run: make build-frontend"; \
	fi

build-all: ## Build complete application (including documentation)
	@echo "==> Building complete application with documentation..."
	@echo "--> Step 1: Building frontend..."
	@if [ -d "$(FRONTEND_DIR)" ] && command -v pnpm >/dev/null 2>&1; then \
		(cd $(FRONTEND_DIR) && { \
			echo "    🔍 Checking if @veaiops/api-client exists..."; \
			if [ -d "packages/api-client/src/models" ] && [ -d "packages/api-client/src/services" ]; then \
				API_CLIENT_FILES=$$(find packages/api-client/src -name '*.ts' -type f 2>/dev/null | wc -l | tr -d ' '); \
				echo "    📊 Found $$API_CLIENT_FILES TypeScript files in api-client"; \
				if [ "$$API_CLIENT_FILES" -gt 10 ]; then \
					echo "    ✓ @veaiops/api-client already exists ($$API_CLIENT_FILES files), skipping API generation"; \
					echo "    💡 To regenerate API client, run: make generate-api-complete"; \
					echo "    🔧 Building packages (excluding openapi-specs)..."; \
					(pnpm --filter '@veaiops/api-client' build && \
					 pnpm --filter '@veaiops/components' build && \
					 pnpm --filter '@veaiops/constants' build && \
					 pnpm --filter '@veaiops/types' build && \
					 pnpm --filter '@veaiops/utils' build) 2>/dev/null && \
					echo "    ✓ Packages built (api-client generation skipped)" || \
					echo "    ⚠️  Some packages may need manual build"; \
					echo "    🔧 Building apps..."; \
					pnpm run build:apps; \
				else \
					echo "    ℹ️  @veaiops/api-client exists but seems incomplete (only $$API_CLIENT_FILES files)"; \
					echo "    🔧 Running full build including API generation..."; \
					pnpm build; \
				fi; \
			else \
				echo "    ℹ️  @veaiops/api-client not found or incomplete"; \
				echo "    🔧 Running full build including API generation..."; \
				pnpm build; \
			fi; \
		}); \
	else \
		echo "⚠️  Frontend environment not available, skipping frontend build..."; \
		exit 1; \
	fi
	@echo ""
	@echo "--> Step 2: Generating documentation..."
	@(cd docs && pnpm run generate)
	@echo ""
	@echo "--> Step 3: Integrating documentation..."
	@rm -rf $(FRONTEND_DIR)/apps/veaiops/output/veaiops
	@mkdir -p $(FRONTEND_DIR)/apps/veaiops/output/veaiops
	@cp -r docs/.output/public/* $(FRONTEND_DIR)/apps/veaiops/output/veaiops/
	@echo ""
	@echo "==> Build complete! Output at: $(FRONTEND_DIR)/apps/veaiops/output/"
	@echo "    Frontend: /"
	@echo "    Docs: /veaiops/"
