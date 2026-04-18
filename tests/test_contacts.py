import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_contact(client: AsyncClient):
    payload = {
        "full_name": "Test User",
        "phone": "+7 (999) 111-22-33",
        "email": "test@example.com",
        "notes": "Testing notes"
    }
    response = await client.post("/api/contacts", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["full_name"] == "Test User"
    assert "id" in data

@pytest.mark.asyncio
async def test_list_contacts(client: AsyncClient):
    # Create one first
    await client.post("/api/contacts", json={"full_name": "User 1"})
    await client.post("/api/contacts", json={"full_name": "User 2"})
    
    response = await client.get("/api/contacts")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2

@pytest.mark.asyncio
async def test_get_contact(client: AsyncClient):
    create_res = await client.post("/api/contacts", json={"full_name": "Single User"})
    contact_id = create_res.json()["id"]
    
    response = await client.get(f"/api/contacts/{contact_id}")
    assert response.status_code == 200
    assert response.json()["full_name"] == "Single User"

@pytest.mark.asyncio
async def test_update_contact(client: AsyncClient):
    create_res = await client.post("/api/contacts", json={"full_name": "Old Name"})
    contact_id = create_res.json()["id"]
    
    response = await client.put(f"/api/contacts/{contact_id}", json={"full_name": "New Name"})
    assert response.status_code == 200
    assert response.json()["full_name"] == "New Name"

@pytest.mark.asyncio
async def test_delete_contact(client: AsyncClient):
    create_res = await client.post("/api/contacts", json={"full_name": "To Delete"})
    contact_id = create_res.json()["id"]
    
    response = await client.delete(f"/api/contacts/{contact_id}")
    assert response.status_code == 204
    
    get_res = await client.get(f"/api/contacts/{contact_id}")
    assert get_res.status_code == 404

@pytest.mark.asyncio
async def test_validation_error(client: AsyncClient):
    # Invalid email
    payload = {
        "full_name": "Bad Email",
        "email": "not-an-email"
    }
    response = await client.post("/api/contacts", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error"]["code"] == "validation_error"
