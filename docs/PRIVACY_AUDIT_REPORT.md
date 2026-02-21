# Data Protection & Privacy Audit Report (GDPR/CCPA)

Date: February 2026
Role: Lead Privacy Engineer & Data Protection Officer (DPO)

## Executive Summary

A comprehensive privacy audit was conducted across the SpellcastersDB codebase to ensure compliance with global privacy standards, including GDPR and CCPA. The architecture is inherently privacy-friendly, utilizing local storage for state management and avoiding tracking cookies entirely. However, minor transparency gaps regarding third-party services were identified.

## 1. PII & Data Mapping (The "What are we storing?" Check)

**Findings:**

- **Database/Storage:** No Personally Identifiable Information (PII) is stored in a centralized database. The application operates without user accounts.
- **Local Storage:** Used exclusively on the client-side for themes, drafts, and preferences. This data never leaves the user's device.
- **External Integrations:**
  - `Vercel Analytics` & `Speed Insights`: Used for aggregated, cookie-less performance and traffic monitoring.
  - `Sentry`: Configured for error tracking. Review of `active_state.md` confirms PII (IPs, emails, tokens) is aggressively stripped prior to sending.
  - `Tally.so`: Embedded widget used for user feedback collection.

## 2. Consent & Transparency (The "Opt-In" Check)

**Findings:**

- **Forms:** The only active data collection form is the Tally feedback widget. No pre-ticked marketing forms exist.
- **Cookies:** Vercel Analytics is strictly cookie-less, negating the need for a persistent cookie consent banner under current ePrivacy Directive interpretations for purely aggregated, non-fingerprinting analytics.
- **Visibility:** The Privacy Policy is accessible and clearly outlines Local Storage and Vercel Analytics usage.

**Gaps Identified:**

- The Privacy Policy does not currently disclose the use of **Sentry** (for error tracking) or **Tally.so** (for feedback processing).

## 3. Data Lifecycle & Deletion (The "Right to be Forgotten")

**Findings:**

- **Erasure:** Since no central user data is kept, right-to-be-forgotten requests apply only to potential PII submitted voluntarily via the Tally feedback form. Users can achieve complete client-side "erasure" by clearing their browser's Local Storage.
- **Retention:** The `Upstash Redis` rate-limiter retains IP proxy data for a maximum sliding window of 10 seconds before automatic flushing. Sentry logs omit PII.

---

## The Compliance Report (Action Items)

### 🔴 CRITICAL (Legal Risk & Fines)

_None identified._ The architecture aggressively minimizes data collection, preventing critical exposure.

### 🟡 MEDIUM (Compliance Gaps)

- **Gap:** Incomplete Third-Party Disclosures.
- **Definition:** Under GDPR, all third-party sub-processors must be disclosed in the Privacy Policy, even if they process anonymized data or are opt-in (like feedback forms).
- **Recommendation:** Update `src/app/privacy/page.tsx` to explicitly list **Sentry** (noting that PII is stripped) and **Tally** (for feedback form data processing).
- **Status:** ✅ **RESOLVED** (Updated `src/app/privacy/page.tsx` to include Sentry & Tally disclosures as of 2026-02-20).

### 🟢 LOW (Transparency Polish)

- **Gap:** Undefined Local Erasure Mechanics.
- **Definition:** The Privacy Policy explains Local Storage but doesn't explicitly tell users _how_ to delete it.
- **Recommendation:** Add a sentence to the Privacy Policy instructing users that they can permanently delete all their saved data by clearing their browser's local application data.
