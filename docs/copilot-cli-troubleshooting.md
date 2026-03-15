# Copilot CLI Template Troubleshooting

This guide covers common issues when using the `copilot-cli` template in Docker Compose Builder.

## 1. Release index metadata cannot be loaded

**Symptoms**
- Copilot template shows fallback warning
- Default `imageTag` is not the expected release tag

**Checks**
1. Verify the release index URL is reachable
2. If needed, override index URL with `VITE_RELEASE_INDEX_URL`
3. Confirm payload includes `copilot.provider = "copilot-cli"`

## 2. Image tag validation fails

**Symptoms**
- Validation error on `imageTag`
- YAML generation blocked

**Expected format**
- `<version>-copilot` (example: `1.2.3-copilot`)

**Fix**
1. Use a semantic version with `-copilot` suffix
2. Avoid non-version tags such as `latest` for copilot template

## 3. Missing `COPILOT_API_KEY`

**Symptoms**
- Validation error: `COPILOT_API_KEY is required`
- YAML generation blocked

**Fix**
1. Fill `COPILOT_API_KEY` in Copilot configuration section
2. Re-generate compose YAML after validation passes

## 4. Workspace mount issues

**Symptoms**
- Copilot container cannot access workspace files

**Fix**
1. Enable `Mount workspace volume to /workspace`
2. Set a valid host path in `Work Directory Path`
3. Verify path permissions on host system
