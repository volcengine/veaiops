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

from typing import Dict

from veaiops.schema.models.chatops import AgentDespInst


def load_text2query_instruction(schemas: Dict[str, str], user_query: str) -> AgentDespInst:
    """Load the instruction for the text to query agent."""
    description = "Convert natural language to structured query with filters."

    schemas_str = ""
    for name, schema in schemas.items():
        schemas_str += f"Collection: {name}\nSchema:\n{schema}\n\n"

    instruction = r"""
Your goal is to select the most relevant collection and structure the user's query to match the request schema provided below.

<< Structured Request Schema >>
When responding use a markdown code snippet with a JSON object formatted in the following schema:

```json
{
    "collection": string \ name of the collection to query
    "query": string \ text string to compare to document contents
    "filter": string \ logical condition statement for filtering documents
}
```

The query string should contain only text that is expected to match the contents of documents.
Any conditions in the filter should not be mentioned in the query as well.

A logical condition statement is composed of one or more comparison and logical operation statements.

A comparison statement takes the form: `comp(attr, val)`:
- `comp` (eq | ne | gt | gte | lt | lte | in | nin): comparator
- `attr` (string):  name of attribute to apply the comparison to
- `val` (string): is the comparison value

A logical operation statement takes the form `op(statement1, statement2, ...)`:
- `op` (and | or): logical operator
- `statement1`, `statement2`, ... (comparison statements or logical operation statements):
  one or more statements to apply the operation to

Make sure that you only use the comparators and logical operators listed above and no others.
Make sure that filters only refer to attributes that exist in the data source.
Make sure that filters only use the attributed names with its function names if there are functions applied on them.
Make sure that filters only use format `YYYY-MM-DD` when handling date data typed values.
Make sure that filters take into account the descriptions of attributes and only make comparisons that are feasible
given the type of data being stored.
Make sure that filters are only used as needed. If there are no filters that should be applied return "NO_FILTER"
for the filter value.

<< Example 1. >>
Data Sources:
Collection: Songs
Schema:
```json
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
```

User Query:
What are songs by Taylor Swift or Katy Perry about teenage romance under 3 minutes long in the dance pop genre

Structured Request:
```json
{
    "collection": "Songs",
    "query": "teenager love",
    "filter": "and(or(eq(\"artist\", \"Taylor Swift\"), eq(\"artist\", \"Katy Perry\")), lt(\"length\", 180),
    eq(\"genre\", \"pop\"))"
}
```


<< Example 2. >>
Data Sources:
Collection: Songs
Schema:
```json
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
```

User Query:
What are songs that were not published on Spotify

Structured Request:
```json
{
    "collection": "Songs",
    "query": "",
    "filter": "NO_FILTER"
}
```


<< Example 3. >>
Data Sources:
"""  # noqa: E501
    instruction += f"""
{schemas_str}
User Query:
{user_query}

Structured Request:
"""
    return AgentDespInst(description=description, instruction=instruction)
