"""Ticket models and service settings on pydantic."""

import os
from pydantic import BaseModel, field_validator, model_validator


class Settings(BaseModel):
    api_url: str = "http://localhost:8000"
    timeout: float = 5.0

    @model_validator(mode="before")
    @classmethod
    def read_env(cls, data: dict) -> dict:
        data = dict(data)
        if "timeout" not in data:
            env_timeout = os.environ.get("DESK_TIMEOUT")
            if env_timeout is not None:
                data["timeout"] = float(env_timeout)
        if "api_url" not in data:
            env_api_url = os.environ.get("DESK_API_URL")
            if env_api_url is not None:
                data["api_url"] = env_api_url
        return data


class Ticket(BaseModel):
    id: int
    subject: str
    tags: list[str] = []
    priority: int = 3

    @field_validator("subject")
    @classmethod
    def strip_subject(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("subject must not be empty")
        return value

    @field_validator("priority")
    @classmethod
    def priority_range(cls, value: int) -> int:
        if not 1 <= value <= 5:
            raise ValueError("priority must be between 1 and 5")
        return value


def parse_ticket(data: dict) -> Ticket:
    return Ticket.parse_obj(data)


def to_payload(ticket: Ticket) -> dict:
    return ticket.dict(exclude_defaults=True)


def load_settings() -> Settings:
    return Settings()
