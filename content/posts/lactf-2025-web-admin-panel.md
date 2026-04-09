---
title: "LACTF 2025 Web - admin-panel Writeup"
summary: "A writeup focused on JWT confusion and SSRF chaining that led to admin panel access."
date: "2025-01-28"
category: "ctf"
section: "security"
badge: "CTF / Wargame"
badgeTone: "ctf"
tags:
  - jwt
  - ssrf
  - web
statLabel: "difficulty"
statValue: "medium"
heroEyebrow: "$ cat content/posts/lactf-2025-web-admin-panel.md"
heroAvatar: "CTF"
---

# LACTF 2025 Web

This post documents the exploit chain that combined a JWT handling issue with internal request abuse.

## Notes

- token parsing behavior
- SSRF pivot point
- privilege escalation sequence
