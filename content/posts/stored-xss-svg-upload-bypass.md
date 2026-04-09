---
title: "Stored XSS via SVG Upload Bypass"
summary: "A report covering extension filter bypass, content-type spoofing, and the validation gap behind a stored XSS issue."
date: "2025-01-12"
category: "bug"
section: "security"
badge: "Bug Bounty"
badgeTone: "bug"
tags:
  - xss
  - upload
  - svg
statLabel: "platform"
statValue: "H1"
heroEyebrow: "$ cat content/posts/stored-xss-svg-upload-bypass.md"
heroAvatar: "BUG"
---

# Stored XSS through SVG upload

The issue came from an upload pipeline that trusted content type and did not sanitize active SVG payloads.

## Focus

- upload bypass path
- stored payload execution
- remediation ideas
