# Copilot CLI Runtime Troubleshooting

This guide covers common issues when enabling the `copilot-cli` executor in Docker Compose Builder.

## 1. Release index metadata cannot be loaded

**Symptoms**
- Copilot metadata warning is shown
- You want to confirm whether metadata changes the standard `imageTag`

**Checks**
1. Verify the release index URL is reachable
2. If needed, override index URL with `VITE_RELEASE_INDEX_URL`
3. Confirm payload includes `copilot.provider = "copilot-cli"`
4. Standard builder flows should still keep `imageTag = 0`; metadata is informational unless an explicit template flow opts in

## 2. Standard image tag unexpectedly changes

**Symptoms**
- `imageTag` is no longer `0` in a standard builder flow
- Generated standard image reference does not end with `:0`

**Expected format**
- Standard builder flows keep `imageTag` fixed at `0`

**Fix**
1. Reset the builder or switch profiles once to re-normalize older saved state
2. Refresh the page after upgrading to a build that includes the tag fix
3. If the problem persists, clear the stored builder config from localStorage and reload

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
