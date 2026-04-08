# Security

We take security seriously and appreciate help keeping FolioMint and its users safe. If you believe you have found a security issue, please report it privately so we can address it before details are public.

## How to report

**Preferred:** Use [GitHub Security Advisories](https://docs.github.com/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability) for this repository. Open the **Security** tab on the repo, then **Report a vulnerability**. That keeps the thread private between you and the maintainers.

If private reporting is not available for any reason, contact the maintainers through a channel they publish for this project (for example an email listed on the organization profile). Please do **not** open a public issue for unfixed vulnerabilities that could be exploited.

## What to include

- A clear description of the issue and where it lives (route, feature, dependency if relevant).
- Steps to reproduce, or a proof of concept, if you can share them safely.
- The impact you think it has (data exposure, account takeover, denial of service, and so on).
- Versions or commit you tested, if known.

## What to expect

- We will acknowledge receipt when we can and use good faith effort to triage and fix valid reports.
- We may ask follow-up questions. Please allow time for coordination, especially for complex issues.
- We credit reporters in release notes or advisories when they want to be named, unless the report is anonymous.

## Scope

In scope for this policy:

- The FolioMint application code in this repository and its documented deployment surface (for example API routes, auth flows, file upload and parsing, and data handling in this app).

Generally out of scope (report upstream or to the relevant vendor instead):

- Issues in dependencies or infrastructure you do not control here, unless FolioMint uses them in an unsafe way that we can fix in this repo.
- Social engineering or physical attacks.
- Spam, rate limits as a product feature, or theoretical issues with no practical impact.

If you are unsure whether something is in scope, you can still report it privately and we will triage it.

## Safe harbor

We support responsible disclosure. We will not take legal action against good-faith security research that follows this policy, avoids harm to users or data, and gives us a reasonable chance to fix issues before public disclosure.

Thank you for helping protect everyone who uses FolioMint.
