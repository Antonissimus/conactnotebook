from typing import List

from fastapi import APIRouter, HTTPException, Response

from app.models.contact import Contact, ContactCreate, ContactUpdate
from app.services import contact_service

router = APIRouter(prefix="/contacts", tags=["contacts"])


@router.get("", response_model=List[Contact])
def list_contacts() -> List[Contact]:
    return contact_service.list_contacts()


@router.get("/{contact_id}", response_model=Contact)
def get_contact(contact_id: int) -> Contact:
    contact = contact_service.get_contact(contact_id)
    if contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact


@router.post("", response_model=Contact, status_code=201)
def create_contact(body: ContactCreate) -> Contact:
    return contact_service.create_contact(body)


@router.put("/{contact_id}", response_model=Contact)
def update_contact(contact_id: int, body: ContactUpdate) -> Contact:
    contact = contact_service.update_contact(contact_id, body)
    if contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact


@router.delete("/{contact_id}", status_code=204)
def delete_contact(contact_id: int) -> Response:
    if not contact_service.delete_contact(contact_id):
        raise HTTPException(status_code=404, detail="Contact not found")
    return Response(status_code=204)
