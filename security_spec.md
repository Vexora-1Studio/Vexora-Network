# Security and Data Invariance Specification (TDD)

## 1. Zero-Trust Data Invariants
To ensure mathematical boundaries and prevent unauthorized injection ("Update-Gaps", "Resource Poisoning", or "Orphaned Writes"):
- **Authenticated Access Only**: Read and write operations to standard collections require the request to contain a non-null `request.auth` object.
- **Identity Invariance**: The user identity UID must match the document path ID or owner identifier in the document payload. Setting `id` or `ownerId` to a different user's UID is prohibited.
- **Input Bounded Sizes**: All text messages, bios, community names, and story payloads must be string types of bounded maximum size (`.size() < N`) to prevent "Denial of Wallet" resource leakage.
- **Verification Strictness**: Any user write action (exclusive of raw setup) must verify that the user's email has been verified (`request.auth.token.email_verified == true`).
- **Temporal Strictness**: Timestamps like `createdAt` and `updatedAt` must be set using the server-controlled `request.time` directly, preventing client clock tampering.

---

## 2. The "Dirty Dozen" Adversarial Payloads
Below are 12 specific payloads representing exploits, privilege escalations, PII leaks, and denial-of-wallet vectors that must yield a `PERMISSION_DENIED` status.

### Case 1: Identity Spoofing (UserProfile)
Attempts of user node `attacker_uid` to update or define user profile `victim_uid` with hijacked data.
```json
{
  "path": "/users/victim_uid",
  "auth": { "uid": "attacker_uid", "token": { "email_verified": true } },
  "payload": {
    "id": "victim_uid",
    "name": "Attacker Impersonator",
    "handle": "@impostor"
  }
}
```

### Case 2: Ghost Role Promotion
Enforcing self-privilege escalation by writing `"isVerified": true` or `"isAdmin": true` inside user profiles directly.
```json
{
  "path": "/users/attacker_uid",
  "auth": { "uid": "attacker_uid", "token": { "email_verified": true } },
  "payload": {
    "id": "attacker_uid",
    "name": "Attacker",
    "handle": "@attacker",
    "isVerified": true
  }
}
```

### Case 3: Denial of Wallet (Gigantic Bio Payload)
Injecting a 5MB payload into the `bio` property of a user profile.
```json
{
  "path": "/users/attacker_uid",
  "auth": { "uid": "attacker_uid", "token": { "email_verified": true } },
  "payload": {
    "id": "attacker_uid",
    "bio": "<gigantic 5MB padding text sequence here...>"
  }
}
```

### Case 4: Rogue Pulse Ownership
Attacker creating a Post claiming another node's name as author or owner ID.
```json
{
  "path": "/posts/some_post_id",
  "auth": { "uid": "attacker_uid", "token": { "email_verified": true } },
  "payload": {
    "id": "some_post_id",
    "author": "victim_uid",
    "content": "Malicious Spoofed Message"
  }
}
```

### Case 5: Path Variable ID Poisoning (Resource Exhaustion)
Executing a document write with a 2KB garbage-characters document ID (e.g., `!!!###$$$---` etc) to saturate database indexing limits.
```json
{
  "path": "/posts/garbageID_with_1024_symbols_repeating_here_etc",
  "auth": { "uid": "attacker_uid", "token": { "email_verified": true } },
  "payload": {
    "id": "garbageID_...",
    "content": "Valid text shape"
  }
}
```

### Case 6: Fake Timestamp Clock Tampering
Inserting a future timestamp or year 2099 instead of letting the server bind `request.time`.
```json
{
  "path": "/posts/post_123",
  "auth": { "uid": "attacker_uid", "token": { "email_verified": true } },
  "payload": {
    "id": "post_123",
    "author": "attacker_uid",
    "content": "Tampered Clock",
    "timestamp": "2099-01-01T00:00:00Z"
  }
}
```

### Case 7: Unauthorized Community Modification
Non-owner attempting to alter description or details of another operator's community cluster.
```json
{
  "path": "/communities/community_of_victim",
  "auth": { "uid": "attacker_uid", "token": { "email_verified": true } },
  "payload": {
    "id": "community_of_victim",
    "name": "Hijacked Community Label"
  }
}
```

### Case 8: Shadow Field Injection (Ghost Fields)
Editing a post and trying to slip in custom unvalidated helper flags (e.g., `isLegendary: true` or `likes: 99999`).
```json
{
  "path": "/posts/post_123",
  "auth": { "uid": "attacker_uid", "token": { "email_verified": true } },
  "payload": {
    "id": "post_123",
    "author": "attacker_uid",
    "content": "Modified state",
    "isLegendary": true
  }
}
```

### Case 9: Unverified User Bypass
User with `email_verified: false` attempting to publish stories or write to network feed.
```json
{
  "path": "/posts/post_456",
  "auth": { "uid": "unverified_user_uid", "token": { "email_verified": false } },
  "payload": {
    "id": "post_456",
    "content": "Draft from unverified"
  }
}
```

### Case 10: Terminal State Modification
Attempting to modify details of a completed, finalized, or archived Story post.
```json
{
  "path": "/stories/story_completed_123",
  "auth": { "uid": "user_uid", "token": { "email_verified": true } },
  "payload": {
    "id": "story_completed_123",
    "content": "Attempting to change persistent content"
  }
}
```

### Case 11: PII Isolation Escape
Attempting a blanket read of all user profiles emails or private contact details by a stranger.
```json
{
  "path": "/users/some_other_uid",
  "auth": { "uid": "stranger_uid", "token": { "email_verified": true } },
  "method": "get"
}
```

### Case 12: Orphaned Community Creation
Creating a community group referencing a nonexistent owner or invalid ID pattern.
```json
{
  "path": "/communities/invalid_uid_format_here_$$$",
  "auth": { "uid": "attacker_uid", "token": { "email_verified": true } },
  "payload": {
    "id": "invalid_uid_format_here_$$$",
    "name": "Invalid Node Group"
  }
}
```

---

## 3. Test Runner Schema (Verification Protocol)
Our test framework (mock implementation or standard logic checking) evaluates `firestore.rules` on build time to ensure that:
1. Every rule matches its target collection context.
2. The first catch-all block evaluates to `false`.
3. All write operations enforce schema correctness and identity verification.
