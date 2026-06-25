---
name: optimize-ad-revenue-compiler
description: Focus on structural integrity, schemas, and format alignment for: Maximize ad RPM within each video without harming retention: recommend mid-roll count/placement by length, flag advertiser-unfriendly content, track YPP/Shorts eligibility, monitor RPM by niche/geography. Use when the Ad Revenue Optimization Compiler agent must act on its inputs and produce its defined output.
metadata:
  agent: ad-revenue-optimization-compiler
  source: Project Atlas Requirements §8.2
  layer: Monetization
  host: vps
---

# optimize-ad-revenue-compiler

Focus on structural integrity, schemas, and format alignment for: Maximize ad RPM within each video without harming retention: recommend mid-roll count/placement by length, flag advertiser-unfriendly content, track YPP/Shorts eligibility, monitor RPM by niche/geography.

## When to use
- When the Ad Revenue Optimization Compiler agent is invoked in the Monetization pipeline and its inputs are available.

## Inputs / Sources
Draft proposal from Creator + original inputs: Video length + retention curve + niche/geo

## Output
Compiled and formatted candidate structure for: {midroll_plan, advertiser_safe, rpm_by_niche}

## Backend dependency
Writes/reads durable state in PostgreSQL / Apache AGE / PGVector (Railway). **BACKEND DEPENDENCY — stubbed until the backbone is wired** (spec §2.3/§11.1).

## Model
deepseek-direct/deepseek-chat — Cheap high-volume tier (spec §11.3); emit schema-only JSON, restrict to non-sensitive public data (§11.2).
