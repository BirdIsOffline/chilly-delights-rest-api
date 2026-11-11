# Chilly Delights — Node.js Menu REST API

An IT-207 course project implementing a small local HTTP server for a fictional ice-cream shop. The server provides endpoints to list menu items, retrieve an item by code, create entries, update entries, and delete entries. Menu data is stored in a local JSON file.

**Technologies:** JavaScript · Node.js built-in `http`, `fs`, and `url` modules · HTTP · JSON · file streams

> **Scope:** Educational assignment, not a production-ready service. It does not use a database, authentication, or production deployment. This repository presents the student's completed **Part 2** implementation and separately added automated contract tests; it is not a claim that multiple lab assignments constituted a single independent product.

## What I built

- Routes HTTP `GET`, `POST`, `PUT`, and `DELETE` requests using `http.createServer()` and a method switch.
- Parses paths and query parameters with `URL` to select an operation and menu item.
- Reads and updates a JSON menu file using Node's asynchronous filesystem APIs.
- Streams the menu listing and welcome message with `fs.createReadStream()`.
- Returns HTTP error statuses for missing entries, duplicate codes, and invalid item codes.

## Run locally

Requires **Node.js 18+** (tested with Node.js 22). No external packages or installation required.

```bash
node server.js
```

The server listens on **port 3030**. Open `http://localhost:3030/` for the welcome text or `http://localhost:3030/menu` for the menu JSON. Stop with **Ctrl+C**.

> Run from the project **root directory**. The original course implementation uses relative paths `./menu/menu.json` and `./welcome/welcome.txt`.

## API reference

| HTTP method | Endpoint | Behavior | Common status |
|---|---|---|---|
| GET | `/` | Stream welcome text | 200 |
| GET | `/menu` | Stream entire JSON menu | 200, 404 |
| GET | `/menu/10233` | Retrieve item by five-character code | 200, 404 |
| POST | `/menu?code=45678&name=Mango&price=4.50` | Add an item using URL query parameters | 200, 400 |
| PUT | `/menu/45678?price=5.00` | Update an item using URL query parameters | 200, 404 |
| DELETE | `/menu/45678` | Remove an item | 200, 404 |

> **Important:** This coursework API accepts form-like values in the **URL query string**, *not* a JSON request body. It uses a `200 OK` response for successful creates/updates/deletes rather than a strict production REST convention.

### Try a safe example (Windows PowerShell / Command Prompt)

Start `node server.js` in one terminal, then run these in a **second** terminal:

```bash
curl.exe http://localhost:3030/menu
curl.exe "http://localhost:3030/menu/10233"
curl.exe -X POST "http://localhost:3030/menu?code=45678&name=Mango&price=4.50"
curl.exe "http://localhost:3030/menu/45678"
curl.exe -X PUT "http://localhost:3030/menu/45678?price=5.00"
curl.exe -X DELETE "http://localhost:3030/menu/45678"
```

These operations change `menu/menu.json` locally. To reset the data, restore its original contents from Git. Use `curl.exe` instead of PowerShell's `curl` alias to use the same syntax as above.

## Automated tests

```bash
node --test tests/api.test.mjs
```

The automated tests create a **temporary copy** of the server and menu data, then exercise a local HTTP service on port 3030. They do not call any external endpoint or edit the source project's menu file. The included GitHub Actions workflow runs the same test suite on each push or pull request.

## Design notes and limitations

- The original Part 2 implementation is retained for transparency. Some basic HTTP routes are permissive (for example, unknown GET paths serve the welcome text).
- The server is bound to a fixed port and uses **relative local file paths**; it should be run locally only, not exposed directly on the public internet.
- Concurrent file edits are not serialized, and the response may be sent before the asynchronous write is completed. The test suite waits for persistence when verifying state. A production implementation should await writes and use atomic, validated storage.
- The code does not fully validate item properties, handle corrupt JSON gracefully, or implement authentication. Those are natural next improvements, not features claimed as complete here.
- For a deeper cloud automation and database project, see [GMU Seat Monitor](https://github.com/BirdIsOffline/gmu-seat-monitor).

## Interview explanation

> "I used Node.js's built-in HTTP server to build a menu API for a fictional ice-cream shop. I parse the URL path to identify the requested item and the query parameters to create or update entries. The API uses asynchronous filesystem operations to store a menu as JSON and streams files for GET requests. I tested create, read, update, delete, and error cases. It's a coursework project; its limitations include file-write races and basic input validation."
