from enum import Enum


class Tags(Enum):
    api_keys = "Api Keys"
    auth = "Auth"
    entries = "Entries"
    share_links = "Share Links"

    def __str__(self):
        return super().value.lower()


v1_api_tags_metadata = [
    {
        "name": Tags.api_keys,
        "description": "Create, rotate, revoke, and manage API keys used to authenticate requests.",
    },
    {
        "name": Tags.auth,
        "description": "User authentication and authorization endpoints.",
    },
    {
        "name": Tags.entries,
        "description": "Create, read, update, and delete entries and related data.",
    },
    {
        "name": Tags.share_links,
        "description": "Generate and manage shareable links for controlled access to entries.",
    },
]
