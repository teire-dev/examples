"""Ticket models and service settings on pydantic."""

from pydantic import BaseModel, BaseSettings, validator


class Settings(BaseSettings):
    api_url: str = "http://localhost:8000"
    timeout: float = 5.0

    class Config:
        env_prefix = "DESK_"


class Ticket(BaseModel):
    id: int
    subject: str
    tags: list[str] = []
    priority: int = 3

    @validator("subject")
    def strip_subject(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("subject must not be empty")
        return value

    @validator("priority")
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
