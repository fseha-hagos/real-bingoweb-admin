# Tournament Management - Admin Guide

This guide explains how to manage tournaments through the admin API. Tournaments allow you to create special events with custom titles, prize pools, and time windows that users can participate in.

## Table of Contents
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [List All Tournaments](#list-all-tournaments)
  - [Create Tournament](#create-tournament)
  - [Update Tournament](#update-tournament)
  - [Activate Tournament](#activate-tournament)
- [Field Descriptions](#field-descriptions)
- [Example Workflows](#example-workflows)
- [Frontend Integration](#frontend-integration)

---

## Authentication

All tournament endpoints require admin authentication. Include your JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

To get a token, login via `/admin/auth/login` first.

---

## API Endpoints

### List All Tournaments

**GET** `/admin/tournaments`

Returns a list of all tournaments (sorted by start date, newest first).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Weekly Tournament",
      "subtitle": "Win Big This Week!",
      "description": "Join our weekly tournament and compete for amazing prizes",
      "bannerUrl": "https://example.com/banner.jpg",
      "betAmount": 100,
      "prizePool": 5000,
      "status": "scheduled",
      "startAt": "2025-11-04T10:00:00.000Z",
      "endAt": "2025-11-11T10:00:00.000Z",
      "gameId": null,
      "createdAt": "2025-11-04T09:00:00.000Z",
      "updatedAt": "2025-11-04T09:00:00.000Z"
    }
  ]
}
```

---

### Create Tournament

**POST** `/admin/tournaments`

Creates a new tournament.

**Request Body:**
```json
{
  "title": "Weekly Tournament",           // Required
  "subtitle": "Win Big This Week!",       // Optional
  "description": "Join and compete!",     // Optional
  "bannerUrl": "https://example.com/banner.jpg", // Optional
  "betAmount": 100,                       // Required (decimal)
  "prizePool": 5000,                      // Optional (default: 0)
  "startAt": "2025-11-04T10:00:00.000Z", // Required (ISO date string)
  "endAt": "2025-11-11T10:00:00.000Z",   // Required (ISO date string)
  "status": "scheduled",                  // Optional (default: "scheduled")
  "gameId": null                          // Optional (link to specific game)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-of-created-tournament"
  }
}
```

**Example cURL:**
```bash
curl -X POST https://your-domain.com/admin/tournaments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Weekly Tournament",
    "subtitle": "Win Big This Week!",
    "betAmount": 100,
    "prizePool": 5000,
    "startAt": "2025-11-04T10:00:00.000Z",
    "endAt": "2025-11-11T10:00:00.000Z"
  }'
```

---

### Update Tournament

**PUT** `/admin/tournaments/:id`

Updates an existing tournament. Only include fields you want to change.

**Request Body (all fields optional):**
```json
{
  "title": "Updated Tournament Title",
  "subtitle": "New subtitle",
  "description": "Updated description",
  "bannerUrl": "https://example.com/new-banner.jpg",
  "betAmount": 150,
  "prizePool": 7500,
  "startAt": "2025-11-05T10:00:00.000Z",
  "endAt": "2025-11-12T10:00:00.000Z",
  "status": "active",
  "gameId": "game-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-of-updated-tournament"
  }
}
```

**Example cURL:**
```bash
curl -X PUT https://your-domain.com/admin/tournaments/TOURNAMENT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prizePool": 10000,
    "status": "active"
  }'
```

---

### Activate Tournament

**POST** `/admin/tournaments/:id/activate`

Activates a tournament and automatically ends any currently active tournaments. This is the recommended way to make a tournament visible to users.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "active"
  }
}
```

**Example cURL:**
```bash
curl -X POST https://your-domain.com/admin/tournaments/TOURNAMENT_ID/activate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Important Notes:**
- Only one tournament can be active at a time
- Activating a tournament will automatically set all other active tournaments to "ended"
- Users will see the active tournament in the frontend via `/api/tournament/current`

---

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Tournament title (e.g., "Weekly Tournament") |
| `subtitle` | string | No | Optional subtitle displayed below title |
| `description` | string | No | Detailed description of the tournament |
| `bannerUrl` | string | No | URL to tournament banner image |
| `betAmount` | decimal | Yes | Entry fee/bet amount in ETB |
| `prizePool` | decimal | No | Total prize pool (default: 0) |
| `status` | string | No | One of: `scheduled`, `active`, `ended` (default: `scheduled`) |
| `startAt` | ISO date | Yes | Tournament start date/time |
| `endAt` | ISO date | Yes | Tournament end date/time |
| `gameId` | string | No | Link to a specific game (optional) |

### Status Values

- **`scheduled`**: Tournament is created but not yet active
- **`active`**: Tournament is currently active and visible to users
- **`ended`**: Tournament has ended

---

## Example Workflows

### Workflow 1: Create and Activate Weekly Tournament

1. **Create the tournament:**
```bash
POST /admin/tournaments
{
  "title": "Weekly Tournament",
  "subtitle": "Win Big This Week!",
  "betAmount": 100,
  "prizePool": 5000,
  "startAt": "2025-11-04T10:00:00.000Z",
  "endAt": "2025-11-11T10:00:00.000Z",
  "status": "scheduled"
}
```

2. **Activate it when ready:**
```bash
POST /admin/tournaments/{id}/activate
```

3. **Users will now see it** in the frontend via `/api/tournament/current`

### Workflow 2: Update Prize Pool During Tournament

If you want to increase the prize pool while a tournament is running:

```bash
PUT /admin/tournaments/{id}
{
  "prizePool": 10000
}
```

### Workflow 3: Schedule Multiple Tournaments

You can create multiple tournaments in advance:

1. Create Tournament A (scheduled for next week)
2. Create Tournament B (scheduled for the week after)
3. When ready, activate Tournament A
4. When Tournament A ends, activate Tournament B

Only one tournament can be active at a time, but you can schedule multiple in advance.

---

## Frontend Integration

Once a tournament is **active** or **scheduled** (and `endAt` is in the future), users can see it via:

**GET** `/api/tournament/current` (public endpoint, no auth required)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Weekly Tournament",
    "subtitle": "Win Big This Week!",
    "betAmount": 100,
    "prizePool": 5000,
    "status": "active",
    "startAt": "2025-11-04T10:00:00.000Z",
    "endAt": "2025-11-11T10:00:00.000Z",
    "timeLeftMs": 604799000
  }
}
```

If no active/scheduled tournament exists, returns:
```json
{
  "success": true,
  "data": null
}
```

---

## Best Practices

1. **Create tournaments in advance**: Schedule tournaments before they need to go live
2. **Use activate endpoint**: Use `/activate` instead of manually setting `status: "active"` to ensure only one tournament is active
3. **Set realistic end dates**: Ensure `endAt` is in the future for users to see the tournament
4. **Update prize pools**: You can update the prize pool at any time, even during an active tournament
5. **Monitor active tournaments**: Check which tournament is active before creating a new one

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common errors:
- **401**: Missing or invalid authentication token
- **403**: User is not an admin
- **400**: Missing required fields or invalid data
- **404**: Tournament not found (for update/activate)
- **500**: Server error

---

## JavaScript/TypeScript Example

```typescript
const API_BASE = 'https://your-domain.com/admin';
const TOKEN = 'your-jwt-token';

// Create tournament
async function createTournament(data: {
  title: string;
  betAmount: number;
  startAt: string;
  endAt: string;
  prizePool?: number;
}) {
  const response = await fetch(`${API_BASE}/tournaments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  return response.json();
}

// Activate tournament
async function activateTournament(tournamentId: string) {
  const response = await fetch(`${API_BASE}/tournaments/${tournamentId}/activate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
    },
  });
  
  return response.json();
}

// List all tournaments
async function listTournaments() {
  const response = await fetch(`${API_BASE}/tournaments`, {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
    },
  });
  
  return response.json();
}

// Example usage
const tournament = await createTournament({
  title: 'Weekly Tournament',
  betAmount: 100,
  prizePool: 5000,
  startAt: new Date('2025-11-04T10:00:00Z').toISOString(),
  endAt: new Date('2025-11-11T10:00:00Z').toISOString(),
});

await activateTournament(tournament.data.id);
```

---

## Questions?

For issues or questions about tournament management, check:
- Server logs for detailed error messages
- Database to verify tournament records
- Frontend `/api/tournament/current` endpoint to see what users see

