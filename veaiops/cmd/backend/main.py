# Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. and/or its affiliates
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from veaiops.settings import (
    AgentSettings,
    BotSettings,
    EncryptionSettings,
    LogSettings,
    MongoSettings,
    O11ySettings,
    VolcEngineSettings,
    WebhookSettings,
    get_settings,
    init_settings,
)

# Initialize settings at the module level before any other operations
init_settings(
    MongoSettings,
    LogSettings,
    WebhookSettings,
    BotSettings,
    O11ySettings,
    VolcEngineSettings,
    AgentSettings,
    EncryptionSettings,
)


def get_app():
    """Create and configure the FastAPI application.

    Imports are placed inside this function to ensure settings are initialized first.
    """
    from fastapi.middleware.cors import CORSMiddleware
    from opentelemetry.instrumentation.asgi import OpenTelemetryMiddleware
    from starlette.middleware import Middleware
    from starlette_context import plugins
    from starlette_context.middleware import RawContextMiddleware

    from veaiops.handler.middlewares.auth import AuthMiddleware
    from veaiops.handler.routers.apis.v1.backend import backend_router
    from veaiops.lifespan import cache_lifespan, db_lifespan, otel_lifespan
    from veaiops.utils.app import create_fastapi_app

    o11y_settings = get_settings(O11ySettings)

    middlewares = [
        Middleware(
            RawContextMiddleware,  # type: ignore
            plugins=(plugins.RequestIdPlugin(validate=False), plugins.CorrelationIdPlugin(validate=False)),
        ),
        Middleware(
            CORSMiddleware,  # type: ignore
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        ),
        Middleware(
            AuthMiddleware,
            protected_paths=["/apis/v1/manager", "/apis/v1/datasource", "/apis/v1/intelligent-threshold"],
            whitelist_paths=[
                "/apis/v1/manager/event-center/event/chatops",
                "/apis/v1/manager/event-center/event/intelligent_threshold",
                "/apis/v1/intelligent-threshold/task/auto-refresh/initialize",
                "/apis/v1/intelligent-threshold/task/auto-refresh/process",
            ],
        ),  # type: ignore
    ]

    if o11y_settings.enabled:
        middlewares.insert(2, Middleware(OpenTelemetryMiddleware))  # type: ignore

    fastapi_app = create_fastapi_app(
        title="VeAIOps-Backend",
        lifespans=[otel_lifespan, db_lifespan, cache_lifespan],
        middlewares=middlewares,
        routers=[backend_router],
    )
    return fastapi_app


app = get_app()

if __name__ == "__main__":
    """Run the application for local debug."""
    # allow running with `python -m veaiops.cmd.backend.main` for local debug
    import uvicorn

    uvicorn.run("veaiops.cmd.backend.main:app", host="0.0.0.0", port=8000, reload=True)
