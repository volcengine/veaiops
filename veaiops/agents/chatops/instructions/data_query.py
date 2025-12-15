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

from datetime import datetime
from typing import Dict

from veaiops.schema.models.chatops import AgentDespInst


def load_data_query_instruction(schemas: Dict[str, str]) -> AgentDespInst:
    """Load the instruction for the text to query agent."""
    description = "Query database using structured filters."

    schemas_str = ""
    curr_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    for name, schema in schemas.items():
        schemas_str += f"Collection: {name}\nSchema:\n{schema}\n\n"

    instruction = r"""您的目标是选择最相关的集合，并使用 `query_database` 工具来查询数据库以回答用户的问题。

您需要确定合适的 `collection`，根据用户的查询构建 `filter` 字符串，并选择合适的 `operation`。

<< 操作类型 >>
`operation` 参数支持以下值：
* "find": 查询符合条件的文档（默认）。返回最多 10 条记录。
* "count": 统计符合条件的文档数量。
* "latest": 查询符合条件的最新文档。返回最多 10 条记录。

<< 过滤条件语法 >>
`filter` 参数支持由一个或多个比较语句和逻辑运算语句组成的逻辑条件语句。

比较语句的形式：comp(attr, val):
* comp (eq | ne | gt | gte | lt | lte | in | nin): 比较运算符 (等于 | 不等于 | 大于 | 大于等于 | 小于 | 小于等于 | 在...中 | 不在...中)
* attr (string): 要应用比较的属性名称
* val (string | number): 比较值

逻辑运算语句的形式：op(statement1, statement2, ...):
* op (and | or): 逻辑运算符 (与 | 或)
* statement1, statement2, ... (比较语句或逻辑运算语句): 要应用运算的一个或多个语句

规则：
* 请确保只使用上面列出的比较运算符和逻辑运算符，不使用其他。
* 请确保过滤条件只引用对应collection中存在的属性，不要混用不同collection中的属性。
* 请确保在处理日期类型数据值时，过滤条件只使用 YYYY-MM-DD 格式。
* 请确保过滤条件考虑到属性的描述，并且只进行根据存储数据类型可行的比较。
* 请确保过滤条件仅在需要时使用。
* 如果没有应应用的过滤条件，但必须执行数据库相关操作时，你可以对用户进行追问、澄清或拒绝回答。

<< Example 1. >>
Data Sources:
Collection: Songs
Schema:
{
    "content": "Lyrics of a song",
    "attributes": {
        "artist": {
            "type": "string",
            "description": "Name of the song artist"
        },
        "length": {
            "type": "integer",
            "description": "Length of the song in seconds"
        },
        "genre": {
            "type": "string",
            "description": "The song genre, one of 'pop', 'rock' or 'rap'"
        }
    }
}

User Query:
泰勒·斯威夫特 (Taylor Swift) 或凯蒂·佩里 (Katy Perry) 创作的、关于青少年恋情、长度在 3 分钟以内、且属于舞曲流行 (dance pop) 流派的歌曲有哪些？

Tool Call:
query_database(collection="Songs", filter="and(or(eq('artist', 'Taylor Swift'), eq('artist', 'Katy Perry')), lt('length', 180), eq('genre', 'pop'))")


<< Example 2. >>
Data Sources:
Collection: Songs
Schema:
{
    "content": "Lyrics of a song",
    "attributes": {
        "artist": {
            "type": "string",
            "description": "Name of the song artist"
        },
        "length": {
            "type": "integer",
            "description": "Length of the song in seconds"
        },
        "genre": {
            "type": "string",
            "description": "The song genre, one of 'pop', 'rock' or 'rap'"
        }
    }
}

User Query:
未在 Spotify 上发布的歌曲有哪些？

Response:
抱歉，我不了解与音乐平台有关的问题。

<< Example 3. >>
User Query:
有多少首 Taylor Swift 的歌？

Tool Call:
query_database(collection="Songs", filter="eq('artist', 'Taylor Swift')", operation="count")

<< Example 4. >>
User Query:
列出最近发布的 5 首流行歌曲。

Tool Call:
query_database(collection="Songs", filter="eq('genre', 'pop')", operation="latest")

<< Example 5. >>
Data Sources:
"""  # noqa: E501
    instruction += f"""
{schemas_str}

注意，当前时间为 {curr_time}。
"""
    return AgentDespInst(description=description, instruction=instruction)
