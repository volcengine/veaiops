# Contributing to VeAIOps

First off, thank you for considering contributing to VeAIOps! It's people like you that make VeAIOps such a great tool.

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open source project. In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests.

You can find more information at [development documentation](https://volcengine.github.io/veaiops/development/development).

## Prerequisites

Before you start, ensure you have the following installed on your machine:

- **Python**: 3.12+
- **Node.js**: 18+
- **pnpm**: 8+
- **uv**: Python package manager (Install via `pip install uv` or see [uv docs](https://github.com/astral-sh/uv))
- **MongoDB**: 5+ (Required for backend services, Recommended to MongoDB 7+)
- **Helm**: 3+ (Optional, for Kubernetes deployment testing)

## Getting Started

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/<your-username>/veaiops.git
    cd veaiops
    ```

### Backend Development

We use `uv` for Python dependency management and `Makefile` for common tasks.

1.  **Setup environment variables**:
    ```bash
    cp .env_template .env
    ```
    Edit `.env` to configure your local environment.

2.  **Install dependencies**:
    ```bash
    make install
    # Or sync environment from pyproject.toml
    make sync
    ```

3.  **Run the backend service**:
    ```bash
    make run-backend
    ```
    The API will be available at `http://localhost:8000`.

4.  **Run other services** (optional):
    -   ChatOps: `make run-chatops` (Port 6000)
    -   Intelligent Threshold: `make run-intelligent-threshold` (Port 6001)

### Frontend Development

The frontend is a monorepo managed by Nx and pnpm.

1.  **Setup frontend environment**:
    ```bash
    make setup-frontend
    ```

2.  **Start the development server**:
    ```bash
    make dev-frontend
    ```
    This will start the frontend application and documentation. Check the terminal output for the local URL (typically `http://localhost:8080`).

    To run **only** the frontend without docs:
    ```bash
    make dev-frontend-only
    ```

### Documentation

Documentation is built with Nuxt.js.

1.  **Setup docs**:
    ```bash
    make setup-docs
    ```

2.  **Run docs development server**:
    ```bash
    make dev-docs
    ```

## Project Structure

-   `veaiops/`: Python backend source code.
    -   `cmd/`: Entry points for different services (backend, chatops, etc.).
    -   `handler/`: API handlers and services.
    -   `agents/`: AI agents logic.
-   `frontend/`: Frontend monorepo.
    -   `apps/veaiops/`: Main React application.
    -   `packages/`: Shared libraries and components.
-   `charts/`: Helm charts for Kubernetes deployment.
-   `docs/`: Documentation source code.
-   `tests/`: Python tests.
-   `docker/`: Dockerfiles for various services.

## Development Workflow

### Checking and Formatting

We use [pre-commit](https://pre-commit.com/) to automatically check and format code.

1.  **Run against all files** (optional, but recommended for first time):
    ```bash
    pre-commit run --all-files
    ```

### Testing

**Backend:**
Run unit tests with pytest:
```bash
make test
```

## Pull Request Process

1.  Create a new branch for your feature or fix:
    ```bash
    git checkout -b feature/amazing-feature
    # or
    git checkout -b fix/annoying-bug
    ```
2.  Make your changes.
3.  Run linting and tests to ensure everything is correct.
4.  Commit your changes. We encourage using [Conventional Commits](https://www.conventionalcommits.org/) for your commit messages.
    -   Example: `feat: add new chatops agent`
    -   Example: `fix: resolve issue with login`
5.  Push your branch to your fork.
6.  Open a Pull Request against the `main` branch of the upstream repository.
7.  Describe your changes in detail in the PR description. Link to any relevant issues.

## Reporting Issues

If you find a bug or have a feature request, please open an issue on GitHub.

-   **Bug Reports**: Please include a clear description of the bug, steps to reproduce, and expected behavior.
-   **Feature Requests**: Describe the feature you would like to see and why it would be useful.

Thank you for contributing!
