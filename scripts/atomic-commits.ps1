# Atomic commits for ZCore quality contributions
$ErrorActionPreference = "Stop"
Set-Location "C:\Users\Sebastián Ceciliano\Documents\GitHub\ZCore-dev"

function Commit-File($path, $message) {
    git add $path
    git commit -m $message
}

$commits = @(
    @("Server/vitest.config.ts", "test(server): add Vitest configuration"),
    @("Server/src/constants/scoring.constants.ts", "refactor(server): extract scoring constants to dedicated module"),
    @("Server/src/constants/auth.constants.ts", "refactor(server): extract auth challenge constants"),
    @("Server/src/utils/stellar-wallet.util.ts", "feat(server): add shared Stellar wallet validation utilities"),
    @("Server/src/utils/date.util.ts", "feat(server): add date helper utilities"),
    @("Server/src/utils/__tests__/date.util.test.ts", "test(server): add unit tests for date utilities"),
    @("Server/src/types/soroban/score-types.ts", "feat(server): add IZCoreScore TypeScript types (#32)"),
    @("Server/src/types/soroban/__tests__/score-types.test.ts", "test(server): add unit tests for Soroban score types"),
    @("Server/src/services/scoring.service.ts", "refactor(server): use centralized scoring constants"),
    @("Server/src/services/__tests__/assignProfileTier.test.ts", "test(server): add assignProfileTier unit tests"),
    @("Server/src/services/__tests__/applyCounterpartyDecay.test.ts", "test(server): add counterparty decay unit tests"),
    @("Server/src/services/__tests__/calculateEventImpact.test.ts", "test(server): add event impact calculation tests"),
    @("Server/src/services/__tests__/updateScoreFromPayment.test.ts", "test(server): add payment score update tests"),
    @("Server/src/services/__tests__/auth-challenge.test.ts", "test(server): add auth challenge validation tests (#21)"),
    @("Server/src/services/__tests__/verifyWalletSignature.test.ts", "test(server): add SEP-53 signature verification tests (#11)"),
    @("Server/src/middleware/__tests__/schemas.test.ts", "test(server): add Zod schema validation tests"),
    @("Server/src/utils/__tests__/stellar-wallet.util.test.ts", "test(server): add Stellar wallet util tests"),
    @("Server/src/services/auth-challenge.service.ts", "refactor(server): use auth constants in challenge service"),
    @("Server/src/services/health.service.ts", "feat(server): add database health check service"),
    @("Server/src/controllers/health.controller.ts", "feat(server): add deep health, liveness and readiness probes"),
    @("Server/src/app.ts", "feat(server): register /health/live and /health/ready routes"),
    @("Server/src/services/soroban.service.ts", "feat(server): add TTL attestation, batch writes and interface version"),
    @("Server/src/controllers/contracts.controller.ts", "feat(server): expose validUntil in on-chain score response (#24)"),
    @("Contracts/score-registry/src/lib.rs", "feat(contracts): add events, batch, freshness, pause and IZCoreScore (#24-27,32)"),
    @("Contracts/interfaces/README.md", "docs(contracts): add IZCoreScore interface integration guide (#32)"),
    @("Contracts/README.md", "docs(contracts): document v2 score-registry functions and events"),
    @(".github/workflows/ci.yml", "ci: add Server tests and Front next build on every PR (#19)"),
    @("Server/package.json", "chore(server): add Vitest test scripts and devDependencies"),
    @("Server/package-lock.json", "chore(server): update lockfile for Vitest dependencies"),
    @("package.json", "chore: add root test script for Server unit tests"),
    @("CONTRIBUTING.md", "docs: document CI and npm test expectations (#19)"),
    @("README.md", "docs: add CI status badge to README"),
    @("Docs/vercel-deploy.md", "docs: add Vercel monorepo deployment guide (#20)"),
    @("Front/lib/tier-utils.ts", "feat(front): add tier helper utilities aligned with server thresholds"),
    @("Front/lib/format-score.ts", "feat(front): add score formatting helpers"),
    @("Front/lib/constants.ts", "feat(front): add shared dapp constants module"),
    @("Front/package.json", "chore(front): rename package to zcore-dapp")
)

foreach ($c in $commits) {
    Commit-File $c[0] $c[1]
}

# Commit issue bodies individually
Get-ChildItem ".github/issue-bodies/*.md" | Sort-Object Name | ForEach-Object {
    $num = $_.BaseName
    Commit-File $_.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/") "docs(issues): add issue body template #$num"
}

Write-Host "Total commits:" (git rev-list --count HEAD)
