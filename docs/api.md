---
layout: default
title: API Reference - TechBadges
description: TechBadges API endpoints and parameters
---

# API Reference

Base URL: `https://techbadges.santosr.xyz`

## Endpoints

### GET /icons

Generates an SVG image containing the requested icons.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `i` or `icons` | string | Yes | Comma-separated list of icon names |
| `t` or `theme` | string | No | Theme: `dark` (default) or `light` |
| `perline` | number | No | Icons per row: 1-50 (default: 15) |

**Example:**

```
GET /icons?i=js,ts,react&theme=dark&perline=10
```

**Response:**

- Content-Type: `image/svg+xml`
- Cache-Control: `public, max-age=86400`
- Supports ETag for conditional requests

**Error Responses:**

| Status | Description |
|--------|-------------|
| 400 | Missing icons parameter or invalid values |
| 400 | All requested icons are invalid |
| 400 | Invalid theme value |
| 400 | Invalid perline value (must be 1-50) |

---

### GET /api/icons

Returns a list of all available icon names.

**Example:**

```
GET /api/icons
```

**Response:**

```json
[
  "ableton",
  "activitypub",
  "actix",
  "adonis",
  ...
]
```

---

### GET /api/svgs

Returns all icon SVGs as a JSON object.

**Example:**

```
GET /api/svgs
```

**Response:**

```json
{
  "javascript": "<svg>...</svg>",
  "typescript": "<svg>...</svg>",
  "react-dark": "<svg>...</svg>",
  "react-light": "<svg>...</svg>",
  ...
}
```

---

### GET /health

Health check endpoint.

**Example:**

```
GET /health
```

**Response:**

```json
{
  "status": "ok",
  "version": "2.0.0",
  "icons": 290,
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

### GET /

Returns API information and available endpoints.

**Example:**

```
GET /
```

**Response:**

```json
{
  "name": "TechBadges",
  "version": "2.0.0",
  "description": "Showcase your tech stack on your GitHub or resume",
  "documentation": "https://github.com/santosr2/techbadges",
  "attribution": {
    "original": "skill-icons",
    "author": "tandpfun",
    "url": "https://github.com/tandpfun/skill-icons"
  },
  "endpoints": {
    "icons": "/icons?i=js,ts,react",
    "apiIcons": "/api/icons",
    "apiSvgs": "/api/svgs",
    "health": "/health"
  }
}
```

## Caching

All responses include appropriate cache headers:

- **SVG responses**: Cached for 24 hours with ETag support
- **API responses**: Cached for 1 hour
- **Health endpoint**: No caching

### Conditional Requests

The `/icons` endpoint supports conditional requests using ETags:

```bash
# First request
curl -I "https://techbadges.santosr.xyz/icons?i=js"
# Returns: ETag: "abc123"

# Subsequent request
curl -H "If-None-Match: \"abc123\"" "https://techbadges.santosr.xyz/icons?i=js"
# Returns: 304 Not Modified (if unchanged)
```

## CORS

All endpoints support CORS with the following headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## Rate Limits

- Maximum 100 icons per request
- No rate limiting on requests (subject to Cloudflare's policies)

## Error Format

All errors return JSON:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "You didn't specify any icons!"
}
```

Error types:
- `VALIDATION_ERROR` - Invalid parameters
- `NOT_FOUND` - Endpoint not found
