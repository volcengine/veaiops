# Table Pagination Plugin Core Module

This directory contains the core implementation of the table pagination plugin, split by functionality into modular components.

## File Structure

```
core/
├── types.ts          # Type definitions
├── utils.ts          # Utility functions (type guards)
├── helpers.ts        # Helper method factory
├── lifecycle.ts      # Lifecycle methods
├── hooks.ts          # Hook functions
├── render.tsx        # Render methods
└── index.ts          # Unified exports
```

## Module Description

### types.ts

- `ExtendedPaginationConfig`: Extended pagination configuration type

### utils.ts

- `getStateNumber()`: Type guard to ensure state value is number type
- `isCallableFunction()`: Type guard to ensure method is callable

### helpers.ts

- `createPaginationHelpers()`: Create pagination helper method collection
  - `goToFirst`: Go to first page
  - `goToLast`: Go to last page
  - `goToNext`: Go to next page
  - `goToPrevious`: Go to previous page
  - `resetPagination`: Reset pagination

### lifecycle.ts

- `install()`: Plugin installation
- `setup()`: Plugin setup (initialize state and methods)
- `afterUpdate()`: After plugin update
- `uninstall()`: Plugin uninstallation (cleanup state and methods)

### hooks.ts

- `getPaginationInfo()`: Get current pagination information
- `getPaginationConfig()`: Get pagination configuration
- `resetPagination()`: Reset pagination state

### render.tsx

- `renderPagination()`: Render pagination component

## Usage

Import and combine these modules in `plugin.tsx`:

```typescript
import {
  install,
  setup,
  afterUpdate,
  uninstall,
  getPaginationInfo,
  getPaginationConfig,
  resetPagination,
  renderPagination,
} from './core';
```

## Advantages

1. **Separation of Concerns**: Each file is responsible for a specific functionality
2. **Easy Maintenance**: Code is clearer, modifying a feature only requires modifying the corresponding file
3. **Testability**: Each module can be tested independently
4. **Code Reusability**: Utility functions and helper methods can be used in multiple places
5. **Readability**: Smaller files are easier to understand and navigate

## Code Statistics

- Original file: 345 lines
- Main file after split: 76 lines
- Core module total: 421 lines (including comments and copyright information)
