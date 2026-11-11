# Security Policy

## Supported versions

Security fixes target the latest maintained default branch until formal releases are established.

## Reporting a vulnerability

Do not publish exploitable vulnerabilities, credentials, or private data in public issues. Contact the repository owner privately through GitHub's available security reporting channel.

## Secret handling

- Never commit API keys, access tokens, passwords, private keys, or production environment files.
- Rotate any credential accidentally exposed; deleting it from the latest commit is not sufficient if it remains in Git history.
- Use server-side secret storage for provider credentials.
- Do not request exchange withdrawal or trading permissions for market-data integrations.
- Apply least privilege, input validation, rate limiting, and dependency updates.

## Trading safety

The initial product is analysis-only. Broker execution or custody features require a separate security review and appropriate legal/compliance assessment.
