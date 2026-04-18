from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.db import ContactORM
from app.models.contact import Contact, ContactCreate, ContactUpdate

def _orm_to_model(contact: ContactORM) -> Contact:
    return Contact(
        id=contact.id,
        full_name=contact.full_name,
        phone=contact.phone,
        email=contact.email,
        notes=contact.notes,
        created_at=contact.created_at.isoformat() if hasattr(contact.created_at, "isoformat") else str(contact.created_at),
    )

async def list_contacts(session: AsyncSession) -> List[Contact]:
    result = await session.execute(select(ContactORM).order_by(ContactORM.id.desc()))
    contacts = result.scalars().all()
    return [_orm_to_model(c) for c in contacts]

async def get_contact(session: AsyncSession, contact_id: int) -> Optional[Contact]:
    result = await session.execute(select(ContactORM).where(ContactORM.id == contact_id))
    contact = result.scalar_one_or_none()
    return _orm_to_model(contact) if contact else None

async def create_contact(session: AsyncSession, data: ContactCreate) -> Contact:
    new_contact = ContactORM(
        full_name=data.full_name,
        phone=data.phone,
        email=data.email,
        notes=data.notes
    )
    session.add(new_contact)
    await session.commit()
    await session.refresh(new_contact)
    return _orm_to_model(new_contact)

async def update_contact(session: AsyncSession, contact_id: int, data: ContactUpdate) -> Optional[Contact]:
    result = await session.execute(select(ContactORM).where(ContactORM.id == contact_id))
    contact = result.scalar_one_or_none()
    
    if not contact:
        return None
    
    if data.full_name is not None:
        contact.full_name = data.full_name
    if data.phone is not None:
        contact.phone = data.phone
    if data.email is not None:
        contact.email = data.email
    if data.notes is not None:
        contact.notes = data.notes
        
    await session.commit()
    await session.refresh(contact)
    return _orm_to_model(contact)

async def delete_contact(session: AsyncSession, contact_id: int) -> bool:
    result = await session.execute(delete(ContactORM).where(ContactORM.id == contact_id))
    await session.commit()
    return result.rowcount > 0
