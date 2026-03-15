# zoned — Your UNSW Campus Companion

A React Native (Expo) social app built for UNSW students to stay connected with campus life in real time.

---

## Features

| Tab | Description |
|-----|-------------|
| **Home** | Personalised greeting and campus activity feed |
| **Map** | Interactive UNSW campus map with live event markers (next 3 days) and custom location icons |
| **Snaps** | TikTok-style vertical snap feed — take a photo or pick from gallery and post to the campus feed |
| **Evade** | Avoid crowded spots on campus |
| **Study** | Find study spaces and study buddies |
| **Profile** | View and manage your profile |

---

## Tech Stack

- **Framework:** [Expo](https://expo.dev) (React Native)
- **Backend / Auth / DB:** [Supabase](https://supabase.com)
- **Maps:** OpenStreetMap via `react-native-maps`
- **Navigation:** React Navigation (bottom tabs + native stack)
- **Storage:** AsyncStorage (session persistence)

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator / Android Emulator or Expo Go on a physical device

### Install

```bash
git clone <repo-url>
cd zoned
npm install
```

### Run

```bash
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS), or press `i` / `a` to open in a simulator.

---

## Authentication

### UNSW Students

Sign in with your **zID** (e.g. `z5312345`) and your password. Your account email is `<zid>@ad.unsw.edu.au`.

Register via the **Register** link on the login screen.

### Guest Access (UniHack 2026)

A shared guest account is available for non-UNSW attendees with full access including Snaps:

| Field | Value |
|-------|-------|
| Username | `unihack2026` |
| Password | `unihack123` |

---

## Project Structure

```
zoned/
├── screens/          # All screen components
│   ├── LoginScreen.js
│   ├── SignUpScreen.js
│   ├── HomeScreen.js
│   ├── MapScreen.js
│   ├── SnapsScreen.js
│   ├── PostScreen.js
│   ├── EvadeScreen.js
│   ├── StudyScreen.js
│   ├── ProfileScreen.js
│   └── ...
├── navigation/
│   └── AppNavigator.js   # Auth gate + tab/stack routing
├── supabase/
│   └── config.js         # Supabase client
├── constants/
│   └── buildings.js      # Campus building data
└── App.js
```

---

## Supabase Setup

The app connects to a hosted Supabase project. To run your own instance:

1. Create a project at [supabase.com](https://supabase.com)
2. Create the `snaps` table:
   ```sql
   create table snaps (
     id uuid primary key default gen_random_uuid(),
     zid text not null,
     image_url text not null,
     caption text,
     created_at timestamptz default now()
   );
   ```
3. Enable Storage and create a `snaps` bucket (public)
4. Update `supabase/config.js` with your project URL and anon key
5. Create the guest account in Supabase Auth with email `unihack2026@ad.unsw.edu.au` and password `unihack123`

---

## Built at UniHack 2026

Made with love by the **zoned** team.
