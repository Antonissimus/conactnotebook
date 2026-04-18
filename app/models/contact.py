from typing import Optional
from pydantic import BaseModel, Field, EmailStr, field_validator
import re

class ContactCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=200)
    phone: str = Field(default="", max_length=50)
    email: Optional[EmailStr] = None
    notes: str = Field(default="", max_length=2000)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if not v:
            return ""
        # Allow +7, 8, and various separators, but must have enough digits
        digits = re.sub(r"\D", "", v)
        if len(digits) < 10:
            raise ValueError("Phone number must have at least 10 digits")
        return v

class ContactUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=200)
    phone: Optional[str] = Field(None, max_length=50)
    email: Optional[EmailStr] = None
    notes: Optional[str] = Field(None, max_length=2000)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        if v == "":
            return ""
        digits = re.sub(r"\D", "", v)
        if len(digits) < 10:
            raise ValueError("Phone number must have at least 10 digits")
        return v

class Contact(BaseModel):
    id: int
    full_name: str
    phone: str
    email: Optional[str]
    notes: str
    created_at: str
