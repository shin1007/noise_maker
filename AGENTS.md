# Copilot Instructions for this repository

## Project summary
This repository is a simple, maintainable Progressive Web App for generating and playing colored noise and binaural beats.
The app is optimized for mobile use and deploys on Vercel.
The product must prioritize simplicity, stable playback UX, and cautious presentation of scientific claims.

## Core product goals
- Play white, pink, brown, blue, and violet noise
- Support optional binaural beats
- Work well on smartphones
- Be installable as a PWA
- Preserve playback as well as possible in background conditions
- Explain evidence carefully without making medical claims

## Non-goals
Do not add:
- login
- subscription
- billing
- ads
- account systems
- unnecessary backend complexity

## Engineering principles
- Keep architecture minimal
- Favor maintainability over feature count
- Minimize dependencies
- Prefer simple browser-native APIs
- Avoid premature abstraction
- If a feature increases complexity too much, propose dropping it from MVP

## Scientific content rules
- Never state medical or therapeutic effects as facts
- Do not claim improvement for ADHD, anxiety, insomnia, depression, or other conditions
- Use cautious wording such as:
  - may help
  - limited evidence
  - mixed findings
  - some studies suggest
- Prefer meta-analyses, systematic reviews, and peer-reviewed papers when summarizing evidence
- Keep in-app explanations short and easy to understand
- Put detailed evidence in a separate details layer

## UX principles
- Mobile-first
- Calm, minimal UI
- Fast access to play/stop, volume, noise type, timer, and binaural beat controls
- Avoid clutter
- Do not overload the first screen with too many controls
- Keep “Add to Home Screen” guidance subtle and helpful
- Explanations should have two layers:
  1. simple explanation
  2. evidence summary with links

## Technical preferences
- Vercel-compatible frontend-first architecture
- Prefer simple PWA structure
- Explicitly document platform limitations for iOS, Android, and desktop
- Consider Media Session API when useful
- Prefer implementation choices that are realistic for PWAs, not theoretical ideals

## Internationalization
- Design for i18n
- Prioritize Japanese and English first
- RTL support is optional and may be deferred
- Keep translation structure simple and maintainable

## Security requirements
Always review for:
- XSS
- unsafe HTML injection
- URL parameter pollution
- translation string injection risks
- invalid frequency or timer input
- unsafe state mutation
- data flow from external input to UI or audio engine

When implementing features, identify:
- main state variables
- core functions
- input boundaries
- validation points
- render/update flow

Use Mermaid diagrams when helpful for architecture or data flow explanations.

## Implementation workflow
When asked to build features:
1. Clarify assumptions
2. Propose MVP scope
3. Implement the smallest viable version
4. Review complexity
5. Refactor only if it clearly improves maintainability

## Output style
When responding in chat:
- be concise
- explain trade-offs clearly
- separate MVP vs future enhancements
- call out risky assumptions
- mention platform limitations explicitly
