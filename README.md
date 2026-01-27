# regimen

A simple, opinionated training regimen tracker to make sure you **do stuff**, do it **evenly**, and **not too often**.

`regimen` is a combined **frontend + backend** Node/TypeScript/React application packaged as a **single Docker image** and automatically published to **GitHub Container Registry (ghcr)** on every push to `main`.

---

## What is this?

`regimen` helps you track a predefined set of exercises and decide *what to train today* without overthinking:

* You only see exercises that are **eligible** (you didn’t do them yesterday)
* You’re nudged toward **even proportions** (push / pull / legs)
* Exercises you’ve skipped recently bubble to the top

No programs. No percentages. Just consistency.

---

## Core Concepts

### Exercises

Exercises are defined from a fixed list (see below) and grouped into the classic:

* **Push** (Bröst, Axlar och Triceps)
* **Pull** (Rygg och Biceps)
* **Legs** (Ben)

You may claim **any eligible exercise in any order**, regardless of group.

---

### Eligibility Rules

An exercise is **eligible** if:

* You did **not** perform it **yesterday**

That’s it. Every exercise requires at least **one full rest day** between sessions.

---

### Sorting Logic

The main view is sorted in the following order:

1. **Category**: Push → Pull → Legs
2. **14‑day frequency**: Exercises you’ve done *less* in the last 14 days appear first
3. **Recency**: Exercises done the *longest time ago* appear higher

This naturally prioritizes:

* Neglected movements
* Long‑ignored exercises
* Balanced weekly volume

---

## Exercise Display

Each exercise row shows:

* **Last performed date** (format: `ddd dd/mm`)
* **Last three sessions** (weight + reps, read‑only)
* **Input cell (eligible only)**:

  * Weight input
  * Reps input
  * Prefilled with your previous values
  * A green **“Did it today”** button

Once claimed, the exercise becomes ineligible until the next day.

---

## Weight Handling

* Weight can be entered in **kg or lbs**
* The other unit is **automatically calculated**
* Both units are always displayed

Conversion is handled client‑side for immediate feedback.

---

## Authentication & Storage

### Authentication

* Google OAuth is used for sign‑in (frontend)
* Each user is identified by their **Google ID**

### Storage

* Backend stores a **simple file‑based datastore**
* Data is saved **per Google ID**
* Files are written directly to the **Docker host filesystem** (mounted volume)

This keeps the system intentionally lightweight and transparent.

---

## Architecture

* **Frontend**: React + TypeScript
* **Backend**: Node.js + TypeScript
* **Deployment**: Single Docker image (frontend + backend)
* **CI/CD**: Built and pushed to **ghcr.io** on every push to `main`

The container is fully self‑contained except for:

* Google OAuth credentials
* A mounted data directory on the host

---

## Exercises

### Bröst, Axlar och Triceps (Push)

* Dips (triceps)
* Bröst Press
* Axel Press (overhead)
* Sidolyft
* Plankan

### Rygg och Biceps (Pull)

* Back extensions
* Reverse Flye (Peck deck / rear delts)
* Latsdrag (lat pulldown)
* Rodd
* Bicep curls

### Ben (Legs)

* Ben Press
* Leg Curls
* Leg extensions (benspark)
* Calf raises
* Dead Bugs

---

## Philosophy

This app intentionally avoids:

* Complex programming logic
* Periodization
* Fatigue modeling
* PR chasing

Instead, it optimizes for:

* Showing up
* Even distribution
* Not doing the same thing too often

If you train consistently, the app is doing its job.

---

## License

Personal project. Use, fork, and adapt as you like.
