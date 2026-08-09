# N-Body Gravitational Simulator

A full-stack simulator for exploring Newtonian N-body gravitational dynamics. Configure celestial bodies with mass, position, and velocity, then watch numerically-integrated trajectories animate in real time, with live energy and momentum diagnostics as a correctness check on the simulation.

## Features

- Vectorized RK4 integrator with a softening parameter, configurable gravitational constant, and collision merging
- Built-in presets: a stable figure-eight three-body orbit, a simplified solar system, and a random cluster generator
- Canvas-based trajectory playback with play/pause, speed control, and a scrub bar
- Energy, momentum, and per-body distance diagnostics charts
- Email/password auth with saved, per-user simulations (list, rename, delete)

## Tech stack

- **Backend**: Python 3.11+, Flask, NumPy, PyMongo, Flask-JWT-Extended
- **Frontend**: React (Vite), React Router, Axios, HTML5 Canvas, Recharts, Tailwind CSS
- **Database**: MongoDB

## Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB (via Docker or a local install)

## 1. Start MongoDB

Pick whichever is easier on your machine.

**Docker:**

```bash
docker run -d --name nbody-mongo -p 27017:27017 mongo:7
```

**Local install (macOS via Homebrew):**

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

Either way, MongoDB should end up listening on `mongodb://localhost:27017`.

## 2. Backend setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env         # edit if your Mongo URI/JWT secret differ from the defaults
python run.py
```

The API runs on `http://127.0.0.1:5000`.

> **macOS note:** macOS's AirPlay Receiver also listens on port 5000. If requests to `http://localhost:5000` get an unexpected 403, either disable AirPlay Receiver (System Settings → General → AirDrop & Handoff) or use `127.0.0.1` instead of `localhost` — the frontend's `.env.example` already defaults to `127.0.0.1` for this reason.

Run the backend test suite:

```bash
pytest
```

## 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env         # edit if your backend isn't on the default URL
npm run dev
```

The app runs on `http://localhost:5173`.

Run the frontend test suite:

```bash
npm test
```

## Project structure

```
backend/
  app/
    routes/       # Flask blueprints (auth, presets, simulations)
    services/      # business logic (validation, orchestration, persistence)
    physics/       # the N-body integrator -- isolated, no Flask dependency
    models/        # MongoDB document helpers
    utils/         # validators, serializers, error handlers
  tests/
frontend/
  src/
    pages/         # route-level components
    components/    # canvas renderer, builder forms, charts, layout
    hooks/         # useAuth, useSimulationPlayback
    context/       # AuthContext
    services/      # API client wrappers
    tests/
```

## API overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/presets` | List built-in preset configurations |
| POST | `/api/simulations` | Run a new simulation and save it |
| GET | `/api/simulations` | List the current user's saved simulations (metadata only) |
| GET | `/api/simulations/:id` | Fetch a simulation's full config and trajectory |
| PUT | `/api/simulations/:id` | Rename a saved simulation |
| DELETE | `/api/simulations/:id` | Delete a saved simulation |

All `/api/simulations` routes require a `Authorization: Bearer <token>` header from `/api/auth/login` or `/api/auth/register`.
