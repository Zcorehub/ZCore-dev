## What does this PR do?

<!-- One paragraph. What changed and why. -->

## Related issue

Closes #<!-- issue number -->

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor (no behavior change)
- [ ] Documentation
- [ ] Tests

## Checklist

- [ ] TypeScript builds without errors (`npm run build` in `Server/`)
- [ ] Swagger docs updated if I added or changed an endpoint
- [ ] `txHash` uniqueness is still enforced on `CreditEvent` (did not remove `@unique`)
- [ ] No secrets committed (credentials, API keys, `.env` files)
- [ ] If I changed scoring weights or tiers, I explained the reasoning in this PR description

## How to test

<!-- Step-by-step instructions to verify this change manually.
     Include curl examples or Swagger UI steps where helpful. -->

## Notes for reviewers

<!-- Anything the reviewer should pay special attention to, edge cases,
     or follow-up work that is intentionally out of scope. -->
