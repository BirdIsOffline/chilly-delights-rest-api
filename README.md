# Chilly Delights REST API

A Node.js HTTP API for managing an ice-cream shop menu. The server supports creating, retrieving, updating, and deleting menu items, with data stored in a local JSON file.

Developed as part of IT-207 coursework.

## Technologies

JavaScript, Node.js, HTTP, JSON, and Node.js built-in `http`, `fs`, and `url` modules.

## Features

- GET, POST, PUT, and DELETE endpoints for menu management
- URL path and query-parameter parsing
- Asynchronous JSON file reads and writes
- File streaming for menu listings and the welcome page
- HTTP status responses for invalid requests, duplicate codes, and missing items
- Automated integration tests covering CRUD operations and file persistence

## Project Structure

```text
.
├── server.js
├── menu/
│   └── menu.json
├── welcome/
│   └── welcome.txt
├── tests/
│   └── api.test.mjs
└── .github/
    └── workflows/
        └── node-ci.yml
```

## Getting Started

Requires Node.js 18 or later; CI uses Node.js 22. No external dependencies are required.

From the project root, run:

```bash
node server.js
```

The server listens on port **3030**.

- Welcome page: `http://localhost:3030/`
- Menu listing: `http://localhost:3030/menu`

Stop the server with `Ctrl+C`.

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | Return the welcome message |
| GET | `/menu` | List menu items |
| GET | `/menu/10233` | Retrieve a menu item by code |
| POST | `/menu?code=45678&name=Mango&price=4.50` | Add a menu item |
| PUT | `/menu/45678?price=5.00` | Update a menu item |
| DELETE | `/menu/45678` | Delete a menu item |

Create and update operations accept values through **URL query parameters**, not a JSON request body. Changes are persisted to `menu/menu.json`.

## Example Requests

With the server running, use these commands from a second terminal:

```bash
curl http://localhost:3030/menu
curl http://localhost:3030/menu/10233
curl -X POST "http://localhost:3030/menu?code=45678&name=Mango&price=4.50"
curl http://localhost:3030/menu/45678
curl -X PUT "http://localhost:3030/menu/45678?price=5.00"
curl -X DELETE http://localhost:3030/menu/45678
```

On Windows, use `curl.exe` in PowerShell to avoid the `curl` alias. To reset local menu changes, restore `menu/menu.json` from Git.

## Tests

Run the automated integration test suite:

```bash
node --test tests/api.test.mjs
```

The suite launches a local test server in a temporary directory, validates API responses and persistence, and leaves the repository's menu data unchanged. GitHub Actions runs syntax checks and the tests on pushes and pull requests.

## Scope

This is a locally run coursework API. It uses JSON file storage rather than a database and is not configured for public deployment.
