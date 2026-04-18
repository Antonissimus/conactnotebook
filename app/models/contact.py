from typing import Optional

from pydantic import BaseModel, Field


class ContactCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=200)
    phone: str = Field(default="", max_length=200)
    email: str = Field(default="", max_length=200)
    notes: str = Field(default="", max_length=2000)


class ContactUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=200)
    phone: Optional[str] = Field(None, max_length=200)
    email: Optional[str] = Field(None, max_length=200)
    notes: Optional[str] = Field(None, max_length=2000)


class Contact(BaseModel):
    id: int
    full_name: str
    phone: str
    email: str
    notes: str
    created_at: str
