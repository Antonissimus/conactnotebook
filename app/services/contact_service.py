import sqlite3
from typing import List, Optional

from app.db import db_transaction, get_connection
from app.models.contact import Contact, ContactCreate, ContactUpdate


def _row_to_contact(row: sqlite3.Row) -> Contact:
    return Contact(
        id=row["id"],
        full_name=row["full_name"],
        phone=row["phone"],
        email=row["email"],
        notes=row["notes"],
        created_at=row["created_at"],
    )


def list_contacts() -> List[Contact]:
    conn = get_connection()
    try:
        cur = conn.execute(
            """
            SELECT id, full_name, phone, email, notes, created_at
            FROM contacts
            ORDER BY id DESC
            """
        )
        return [_row_to_contact(row) for row in cur.fetchall()]
    finally:
        conn.close()


def get_contact(contact_id: int) -> Optional[Contact]:
    conn = get_connection()
    try:
        cur = conn.execute(
            """
            SELECT id, full_name, phone, email, notes, created_at
            FROM contacts
            WHERE id = ?
            """,
            (contact_id,),
        )
        row = cur.fetchone()
        return _row_to_contact(row) if row else None
    finally:
        conn.close()


def create_contact(data: ContactCreate) -> Contact:
    with db_transaction() as conn:
        cur = conn.execute(
            """
            INSERT INTO contacts (full_name, phone, email, notes)
            VALUES (?, ?, ?, ?)
            """,
            (data.full_name, data.phone, data.email, data.notes),
        )
        cid = cur.lastrowid
        row = conn.execute(
            """
            SELECT id, full_name, phone, email, notes, created_at
            FROM contacts
            WHERE id = ?
            """,
            (cid,),
        ).fetchone()
    assert row is not None
    return _row_to_contact(row)


def update_contact(contact_id: int, data: ContactUpdate) -> Optional[Contact]:
    existing = get_contact(contact_id)
    if existing is None:
        return None
    merged = ContactCreate(
        full_name=data.full_name if data.full_name is not None else existing.full_name,
        phone=data.phone if data.phone is not None else existing.phone,
        email=data.email if data.email is not None else existing.email,
        notes=data.notes if data.notes is not None else existing.notes,
    )
    with db_transaction() as conn:
        conn.execute(
            """
            UPDATE contacts
            SET full_name = ?, phone = ?, email = ?, notes = ?
            WHERE id = ?
            """,
            (
                merged.full_name,
                merged.phone,
                merged.email,
                merged.notes,
                contact_id,
            ),
        )
    return get_contact(contact_id)


def delete_contact(contact_id: int) -> bool:
    with db_transaction() as conn:
        cur = conn.execute("DELETE FROM contacts WHERE id = ?", (contact_id,))
        return cur.rowcount > 0
