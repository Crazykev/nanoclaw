---
name: agent-mail
description: This skill should be used when the user asks to "send an email", "send email via AgentMail", "email someone", or needs to send simple emails through the AgentMail API.
allowed-tools: Bash(*)
---

# AgentMail Email Sender

## Overview

Send simple text and HTML emails using the AgentMail API with environment variable configuration.

## Configuration

Set these environment variables before using:

```bash
export AGENTMAIL_API_KEY="am_us_..."           # Your AgentMail API key
export AGENTMAIL_INBOX_ID="user@agentmail.to"  # Your inbox email address
```

## Basic Usage

### Send Text Email

```bash
curl -X POST "https://api.agentmail.to/v0/inboxes/${AGENTMAIL_INBOX_ID}/messages/send" \
  -H "Authorization: Bearer ${AGENTMAIL_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Email Subject",
    "text": "Plain text email body"
  }'
```

### Send HTML Email

```bash
curl -X POST "https://api.agentmail.to/v0/inboxes/${AGENTMAIL_INBOX_ID}/messages/send" \
  -H "Authorization: Bearer ${AGENTMAIL_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Email Subject",
    "html": "<h1>Hello</h1><p>This is HTML content</p>"
  }'
```

### Send to Multiple Recipients

```bash
curl -X POST "https://api.agentmail.to/v0/inboxes/${AGENTMAIL_INBOX_ID}/messages/send" \
  -H "Authorization: Bearer ${AGENTMAIL_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "to": ["user1@example.com", "user2@example.com"],
    "subject": "Email Subject",
    "text": "Email body"
  }'
```

## Response

Successful send returns:

```json
{
  "message_id": "<unique-message-id@amazonses.com>",
  "thread_id": "thread-uuid"
}
```

## Error Handling

- **400**: Invalid request (check email format, missing required fields)
- **403**: Invalid API key or insufficient permissions
- **404**: Invalid inbox ID

## Workflow

When sending an email:

1. Verify `AGENTMAIL_API_KEY` and `AGENTMAIL_INBOX_ID` are set
2. Collect recipient, subject, and body from user
3. Build JSON payload with required fields
4. Execute curl command
5. Verify response contains `message_id`
6. Show request and response to user

## Required Fields

- `to`: Recipient email address (string or array)
- `subject`: Email subject line (optional but recommended)
- Either `text` or `html`: Email body content

## Best Practices

- Always use environment variables for credentials
- Include both `text` and `html` for best compatibility
- Validate email addresses before sending
- Use meaningful subject lines
