# Aikido Security setup

This repository includes a GitHub Actions workflow at `.github/workflows/aikido-security.yml`.

## Enable scans

1. Create or sign in to an Aikido Security account at https://www.aikido.dev/.
2. Connect the GitHub repository `mazinmind-digital/Mazinmind-ai-receptionist-demo` in Aikido. Grant access only to the repository or repositories intended for scanning.
3. In Aikido, open the Continuous Integration settings and generate a CI API token.
4. In GitHub, open repository **Settings → Secrets and variables → Actions**, create a repository secret named `AIKIDO_CLIENT_API_KEY`, and paste the token value. Never commit the token to the repository or put it in a workflow file.
5. Run **Actions → Aikido Security Scan → Run workflow**, or push a commit to `main`.
6. Review the first scan results in Aikido before deciding whether findings should fail the build. The initial workflow reports scan results but does not yet gate releases on findings.

## What it does

- Runs on pushes to `main` and can be started manually.
- Uses Aikido's official `@aikidosec/ci-api-client` to submit a scan for the repository and commit.
- Keeps the API token in GitHub Actions secrets.
- Emits a visible warning and skips the scan if the secret is not configured.
- Does not automatically change code or block deployments based on findings.

## Current status

The workflow is committed as configuration, but scans are **not active until the Aikido account is connected and `AIKIDO_CLIENT_API_KEY` is added as a GitHub Actions secret**. After the first successful scan, document findings and remediation status in the project's security report.
