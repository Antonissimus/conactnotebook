# Contact Notebook

A modern, lightweight contact management web application built with FastAPI and Vanilla JavaScript.

## Features

- **FastAPI Backend**: High-performance, async-first Python API.
- **SQLAlchemy ORM**: Type-safe database operations with async support.
- **SQLite Database**: Lightweight and portable local storage.
- **Vanilla JS Frontend**: Clean, modular ES modules with no heavy frameworks.
- **Responsive UI**: Modern design with dark/light mode support and Lucide icons.
- **Validation**: Robust data validation using Pydantic.
- **Docker Ready**: Multi-container setup with Nginx and multi-stage builds.
- **Automated Tests**: Integration tests with Pytest and HTTPX.

## Tech Stack

- **Backend**: Python 3.12, FastAPI, SQLAlchemy 2.0, Pydantic v2, aiosqlite.
- **Frontend**: HTML5, CSS3 (Custom Properties, Flexbox, Grid), Vanilla JS (ES Modules).
- **Icons**: Lucide Icons.
- **Infrastructure**: Nginx, Docker, Docker Compose.
- **Testing**: Pytest, HTTPX.
- **Tooling**: Ruff (Linting & Formatting), Prettier.

## Getting Started

### Prerequisites

- Python 3.12+
- Docker & Docker Compose (optional)

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Antonissimus/conactnotebook.git
   cd conactnotebook
   ```

2. **Set up a virtual environment**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**:
   ```bash
   uvicorn app.main:app --reload
   ```
   The app will be available at `http://localhost:8000`.

5. **Run tests**:
   ```bash
   pytest
   ```

### Docker Deployment

To run the full stack (Nginx + Backend) using Docker:

```bash
docker-compose up --build
```

The application will be available at `http://localhost:8080`.

## Project Structure

- `app/`: Backend source code.
  - `api/`: REST API routes.
  - `models/`: Pydantic and SQLAlchemy models.
  - `services/`: Business logic.
  - `db.py`: Database configuration and session management.
  - `main.py`: Application entry point and global error handling.
- `static/`: Frontend source code.
  - `js/`: Modular JavaScript files (`app.js`, `api.js`, `utils.js`).
  - `css/`: Modern CSS styling.
  - `index.html`: Main UI template.
- `tests/`: Integration and unit tests.
- `docker-compose.yml`: Docker orchestration.
- `Dockerfile.backend`: Backend container definition.

## API Documentation

Interactive API documentation (Swagger UI) is available at `/docs` when running the server.

### Endpoints

- `GET /api/contacts`: List all contacts.
- `GET /api/contacts/{id}`: Get a specific contact.
- `POST /api/contacts`: Create a new contact.
- `PUT /api/contacts/{id}`: Update an existing contact.
- `DELETE /api/contacts/{id}`: Delete a contact.

## License

MIT
