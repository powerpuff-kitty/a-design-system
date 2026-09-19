# Security

ADS is experimental and has no stable maintenance line. Security fixes currently target the development branch; maintained version ranges must be listed here when releases begin.

## Reporting a vulnerability

Do not post exploit details, credentials, personal data, or private reproduction data in a public issue.

GitHub private vulnerability reporting is not currently enabled for this repository. Until maintainers enable it, open a minimal issue requesting a private security contact without technical details. A maintainer must establish a private channel before you send a sensitive report. No private email address or response-time commitment is currently designated.

Once a private channel is available, include affected versions or commits, a minimal reproduction, expected impact, and any mitigation. Coordinate disclosure with maintainers so a fix and advisory can be prepared. If GitHub private reporting is enabled later, update this document to link the working reporting route.

## Review boundaries

Treat imported token data, registry source, custom SVG, Markdown/HTML, and generated AI content as untrusted inputs. Future features handling those inputs need explicit validation, sanitization, and execution boundaries. Do not infer safety from a design-system component's appearance.

Dependency changes include the lockfile and pass the repository checks. See the [release guide](docs/releases.md#publication-and-supply-chain-strategy) for the planned provenance, SBOM, and attestation controls. Those publication controls are not implemented yet.
