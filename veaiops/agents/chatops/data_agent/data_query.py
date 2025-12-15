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

import json
import re
from datetime import datetime
from typing import Any, Dict, Literal, Optional

from veadk import Agent

from veaiops.agents.chatops.instructions.data_query import load_data_query_instruction
from veaiops.schema.documents import (
    Bot,
    Chat,
    Interest,
    Message,
)
from veaiops.utils.crypto import decrypt_secret_value

COLLECTIONS = {"Interest": Interest, "Message": Message, "Chat": Chat}


async def init_data_query_agent(bot: Bot, schemas: Dict[str, str]) -> Agent:
    """Initialize the text to query agent.

    Args:
        bot (Bot): The bot instance.
        schemas (Dict[str, str]): The schemas of the data sources.


    Returns:
        Agent: The initialized data query agent.
    """

    def parse_filter(filter_str: str, doc_cls: Any) -> Dict[str, Any]:
        if not filter_str or filter_str == "NO_FILTER":
            return {}

        # Replace logical operators to avoid syntax errors in python
        # and( -> and_op(
        # or( -> or_op(
        filter_str = re.sub(r"\band\(", "and_op(", filter_str)
        filter_str = re.sub(r"\bor\(", "or_op(", filter_str)

        def convert_val(val: Any) -> Any:
            if isinstance(val, str) and re.match(r"^\d{4}-\d{2}-\d{2}$", val):
                try:
                    return datetime.strptime(val, "%Y-%m-%d")
                except ValueError:
                    pass
            return val

        def validate_field(key: str) -> Optional[str]:
            root_key = key.split(".")[0]
            if root_key not in doc_cls.model_fields and root_key != "_id":
                return None
            return key

        ops = {
            "eq": lambda k, v: {validate_field(k): {"$eq": convert_val(v)}} if validate_field(k) else {},
            "ne": lambda k, v: {validate_field(k): {"$ne": convert_val(v)}} if validate_field(k) else {},
            "gt": lambda k, v: {validate_field(k): {"$gt": convert_val(v)}} if validate_field(k) else {},
            "gte": lambda k, v: {validate_field(k): {"$gte": convert_val(v)}} if validate_field(k) else {},
            "lt": lambda k, v: {validate_field(k): {"$lt": convert_val(v)}} if validate_field(k) else {},
            "lte": lambda k, v: {validate_field(k): {"$lte": convert_val(v)}} if validate_field(k) else {},
            "in": lambda k, v: (
                {validate_field(k): {"$in": [convert_val(i) for i in v] if isinstance(v, list) else convert_val(v)}}
                if validate_field(k)
                else {}
            ),
            "nin": lambda k, v: (
                {validate_field(k): {"$nin": [convert_val(i) for i in v] if isinstance(v, list) else convert_val(v)}}
                if validate_field(k)
                else {}
            ),
            "and_op": lambda *args: {"$and": [a for a in args if a]},
            "or_op": lambda *args: {"$or": [a for a in args if a]},
        }

        return eval(filter_str, {"__builtins__": {}}, ops)

    async def query_database(
        collection: str,
        filter: str,
        operation: Literal["find", "count"] = "find",
    ) -> str:
        """Query the database for a specific collection with a MongoDB-style query.

        Args:
            collection: The name of the collection to query.
            filter: logical condition statement for filtering documents.
            operation: The operation to perform. Supported: "find", "count". Default is "find".
        """
        try:
            if collection not in COLLECTIONS:
                return json.dumps({"error": f"Collection {collection} not found"})

            doc_cls = COLLECTIONS[collection]

            mongo_query = parse_filter(filter, doc_cls)

            # Remove empty keys from query
            def clean_query(q: Dict[str, Any]) -> Dict[str, Any]:
                if not isinstance(q, dict):
                    return q
                cleaned = {}
                for k, v in q.items():
                    if k == "$and" or k == "$or":
                        # Filter out empty dictionaries from list
                        cleaned_list = [clean_query(item) for item in v if item]
                        if cleaned_list:
                            cleaned[k] = cleaned_list
                    elif k:  # Only keep non-empty keys
                        cleaned[k] = v
                return cleaned

            mongo_query = clean_query(mongo_query)

            if operation == "count":
                count = await doc_cls.find(mongo_query).count()
                return json.dumps({"count": count})

            # Build query

            results = await doc_cls.find(mongo_query).to_list()
            result_data = [doc.model_dump(mode="json") for doc in results]

            return json.dumps(result_data, indent=2)

        except Exception as e:
            return json.dumps({"error": str(e)})

    instruction = load_data_query_instruction(schemas)

    return Agent(
        name="DataQueryAgent",
        description=instruction.description,
        instruction=instruction.instruction,
        tools=[query_database],
        model_name=bot.agent_cfg.name,
        model_provider=bot.agent_cfg.provider,
        model_api_base=bot.agent_cfg.api_base,
        model_api_key=decrypt_secret_value(bot.agent_cfg.api_key),
    )
