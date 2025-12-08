# Volcengine AIOps (VeAIOps) Suite

An open-source AIOps suite from Volcengine that unifies ChatOps Agent, intelligent alerting, and observability, featuring a developer-friendly UI and comprehensive APIs.

## Key Features

- [ChatOps](https://volcengine.github.io/veaiops/chatops/overview): Adds a 24/7 on-call copilot to group chat—one that filters, responds, retains and self-upgrades information.

- [Intelligent Threshold](https://volcengine.github.io/veaiops/intelligent-threshold/overview): Integrates ML-powered detectors with any metric data source to automatically recommend and continuously recalibrate alert thresholds.

- [Configuration & Management](https://volcengine.github.io/veaiops/configurations/bot-management): A unified console manages projects, roles, secrets, and rich message card templates to support secure, scalable lifecycle management for multi-tenant bots.

For more features, please refer to the [documentation](https://volcengine.github.io/veaiops/).

## Quick Start

VeAIOps supports two deployment methods: local development setup and Kubernetes deployment via Helm.

### 1) Local development

Requirements
- Python 3.12+
- Node.js 18+
- MongoDB 5+
- pnpm 8+
- uv (Python package manager)

General help
```bash
# List available targets
make help
```

Backend (FastAPI)
```bash
# Install project dependencies (editable mode)
make install

# Or sync environment from pyproject.toml
make sync

# Run backend on http://localhost:8000
make run-backend
```

Frontend (Modern.js React)
```bash
# Setup frontend monorepo (will prompt for confirmation)
make setup-frontend

# Start the UI dev server (check terminal for URL, typically http://localhost:8080)
make dev-frontend
```

Optional services (run separately if needed)
```bash
# ChatOps webhook service (dev, port 6000)
make run-chatops

# Intelligent Threshold service (dev, port 6001)
make run-intelligent-threshold
```

### 2) [Kubernetes install](https://volcengine.github.io/veaiops/introduction/quickstart)

Requirements
- Helm 3+
- Kubernetes cluster (e.g., [Volcengine VKE](https://www.volcengine.com/product/vke))

A Helm chart is provided under charts/veaiops.
```bash
# From repo root
cd charts/veaiops

# Install VeAIOps (replace <path-to-kubeconfig>)
helm --kubeconfig <path-to-kubeconfig> install veaiops \
  -n veaiops-system --create-namespace --dependency-update .

# Upgrade
helm upgrade veaiops . \
  --namespace veaiops-system --dependency-update

# Uninstall
helm uninstall veaiops -n veaiops-system
```

## Technology Stack

- Backend: FastAPI, Beanie (MongoDB ODM), Pydantic Settings, OpenTelemetry
- Agents: veadk-python, LLM providers (e.g., Volcengine Ark), optional long-term memory integration
- Frontend: Modern.js + React, TypeScript, Nx monorepo
- Data sources: Volcengine, Aliyun, Zabbix (pluggable via factory)


## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute to this project.

## Citation

If you use VeAIOps in your research, please cite the following paper:

* [Interest Detection Agent](https://volcengine.github.io/veaiops/chatops/interest-agent): please cite [TickIt: Leveraging Large Language Models for Automated Ticket Escalation](./veaiops/agents/README.md).

## License

This project is licensed under the [Apache 2.0 License](./LICENSE).
