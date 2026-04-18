from typing import List
from fastapi import APIRouter, HTTPException, Response, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.contact import Contact, ContactCreate, ContactUpdate
from app.services import contact_service
from app.db import get_db

router = APIRouter(prefix="/contacts", tags=["contacts"])

@router.get("", response_model=List[Contact])
async def list_contacts(db: AsyncSession = Depends(get_db)) -> List[Contact]:
    return await contact_service.list_contacts(db)

@router.get("/{contact_id}", response_model=Contact)
async def get_contact(contact_id: int, db: AsyncSession = Depends(get_db)) -> Contact:
    contact = await contact_service.get_contact(db, contact_id)
    if contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact

@router.post("", response_model=Contact, status_code=201)
async def create_contact(body: ContactCreate, db: AsyncSession = Depends(get_db)) -> Contact:
    return await contact_service.create_contact(db, body)

@router.put("/{contact_id}", response_model=Contact)
async def update_contact(contact_id: int, body: ContactUpdate, db: AsyncSession = Depends(get_db)) -> Contact:
    contact = await contact_service.update_contact(db, contact_id, body)
    if contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact

@router.delete("/{contact_id}", status_code=204)
async def delete_contact(contact_id: int, db: AsyncSession = Depends(get_db)) -> Response:
    if not await contact_service.delete_contact(db, contact_id):
        raise HTTPException(status_code=404, detail="Contact not found")
    return Response(status_code=204)
