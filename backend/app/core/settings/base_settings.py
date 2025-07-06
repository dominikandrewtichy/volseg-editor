from enum import Enum

from pydantic_settings import BaseSettings, SettingsConfigDict


class ModeEnum(str, Enum):
    development = "development"
    production = "production"
    testing = "testing"


class BaseAppSettings(BaseSettings):
    MODE: ModeEnum = ModeEnum.development

    model_config = SettingsConfigDict(
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )
