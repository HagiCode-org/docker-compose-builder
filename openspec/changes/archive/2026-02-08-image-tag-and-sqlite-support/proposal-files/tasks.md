# Implementation Tasks

## 1. Type System Updates

- [ ] 1.1 Update `DatabaseType` in `src/lib/docker-compose/types.ts` to include `'sqlite'`
- [ ] 1.2 Verify type compatibility across all files using `DatabaseType`

## 2. Default Configuration Updates

- [ ] 2.1 Update `imageTag` from `'latest'` to `'0'` in `src/lib/docker-compose/defaultConfig.ts`
- [ ] 2.2 Update quick-start profile `databaseType` from `'internal'` to `'sqlite'` in `src/lib/docker-compose/defaultConfig.ts`

## 3. Generator Logic - Application Service

- [ ] 3.1 Add SQLite connection string handling in `buildAppService()` function
- [ ] 3.2 Implement conditional logic: when `databaseType === 'sqlite'`, set SQLite-specific environment variable
- [ ] 3.3 **CRITICAL**: Set `Database__Provider` environment variable based on database type:
  - SQLite: `Database__Provider=sqlite`
  - PostgreSQL (internal/external): `Database__Provider=postgresql`
- [ ] 3.4 Ensure SQLite connection string format: `Data Source=/app/data/hagicode.db` (container path)
- [ ] 3.5 Ensure PostgreSQL connection string format: `Host=postgres;Port=5432;Database=hagicode;Username=postgres;Password=postgres`
- [ ] 3.6 Remove PostgreSQL `depends_on` dependency when SQLite is selected
- [ ] 3.7 Reference pcode implementation: appsettings.yml shows `Database: Provider: "sqlite"` default
- [ ] 3.8 **IMPORTANT**: `hagicode_data:/app/data` volume mount is ALWAYS added (for ALL database types) - contains Orleans grain storage, logs, etc.

## 4. Generator Logic - SQLite Volumes

- [ ] 4.1 **Note**: No separate `buildSqliteVolumes()` function needed
- [ ] 4.2 The `hagicode_data:/app/data` volume is part of the standard app service configuration (not database-specific)
- [ ] 4.3 Ensure app service ALWAYS includes `- hagicode_data:/app/data` volume mount
- [ ] 4.4 Reference pcode docker-compose.yml: `hagicode_data:/app/data` volume pattern
- [ ] 4.5 **IMPORTANT**: The `/app/data` volume is NOT user-configurable and is ALWAYS present

## 5. Generator Logic - Services Section

- [ ] 5.1 Modify `buildServicesSection()` to conditionally include PostgreSQL service
- [ ] 5.2 Skip `buildPostgresService()` call when `databaseType === 'sqlite'`
- [ ] 5.3 **Note**: The `hagicode_data:/app/data` volume is added in `buildAppService()`, not here

## 6. Generator Logic - Volumes Section

- [ ] 6.1 Modify `buildVolumesSection()` to **ALWAYS** include `hagicode_data:` volume definition
- [ ] 6.2 Add `postgres-data:` volume definition ONLY when `databaseType === 'internal'`
- [ ] 6.3 Ensure: SQLite config has only `hagicode_data:`, PostgreSQL config has both `hagicode_data:` + `postgres-data:`

## 7. Testing

- [ ] 7.1 Test quick-start mode generates correct YAML with SQLite and image tag `0`
- [ ] 7.2 Test full-custom mode with SQLite option generates correct YAML
- [ ] 7.3 Test full-custom mode with internal PostgreSQL still works correctly
- [ ] 7.4 Test full-custom mode with external PostgreSQL still works correctly
- [ ] 7.5 **CRITICAL**: Verify `hagicode_data:/app/data` is present in ALL configurations (SQLite, internal PostgreSQL, external PostgreSQL)
- [ ] 7.6 Verify SQLite uses `hagicode_data:/app/data` for database file (no user path configuration)
- [ ] 7.7 Verify no PostgreSQL service is generated when SQLite is selected
- [ ] 7.8 Validate image tag `0` appears in all generated configurations
- [ ] 7.9 Verify SQLite connection string format: `Data Source=/app/data/hagicode.db`
- [ ] 7.10 Verify PostgreSQL config has BOTH `hagicode_data:` (app data) and `postgres-data:` (database)
- [ ] 7.11 Verify SQLite config has ONLY `hagicode_data:` (contains both database and other app data)

## 8. YAML Output Verification

Use this checklist to verify the generated Docker Compose YAML matches the expected format in proposal.md:

### SQLite Configuration (Quick-Start / SQLite selected)
- [ ] Image tag is `:0` not `:latest`
- [ ] `Database__Provider=sqlite` environment variable is set
- [ ] Connection string: `ConnectionStrings__Default=Data Source=/app/data/hagicode.db`
- [ ] Volume mount: `- hagicode_data:/app/data` present in hagicode service
- [ ] NO `depends_on` section for database
- [ ] NO `postgres` service in output
- [ ] `volumes:` section includes `hagicode_data:` ONLY (no `postgres-data:`)

### PostgreSQL Configuration (Internal)
- [ ] Image tag is `:0` not `:latest`
- [ ] `Database__Provider=postgresql` (or `PostgreSQL`) environment variable is set
- [ ] Connection string: `ConnectionStrings__Default=Host=postgres;Port=5432;...`
- [ ] Volume mount: `- hagicode_data:/app/data` present in hagicode service (for Orleans, logs, etc.)
- [ ] `depends_on: postgres:` with healthcheck condition present
- [ ] `postgres` service included with correct configuration
- [ ] `volumes:` section includes BOTH `hagicode_data:` AND `postgres-data:` (or custom name)

### External PostgreSQL Configuration
- [ ] Image tag is `:0` not `:latest`
- [ ] Connection string uses external host:port
- [ ] Volume mount: `- hagicode_data:/app/data` present in hagicode service (for Orleans, logs, etc.)
- [ ] NO `depends_on` section (no postgres service to wait for)
- [ ] NO `postgres` service in output
- [ ] `volumes:` section includes `hagicode_data:` ONLY

### All Configurations (Common)
- [ ] `hagicode_data:/app/data` is ALWAYS present (contains app data regardless of database type)
- [ ] Image tag is `:0` not `:latest`
- [ ] Workdir mount is present
- [ ] Network and restart policies unchanged

### Comparison with pcode Reference
- [ ] SQLite config matches pcode pattern: `hagicode_data:/app/data`
- [ ] `Database__Provider` environment variable follows pcode naming convention (`Database: Provider` in appsettings.yml)
- [ ] Environment variables use double underscore format: `Database__Provider` (Docker Compose standard)
- [ ] Network and restart policies unchanged

## 9. Validation

- [ ] 9.1 Run `openspec validate image-tag-and-sqlite-support --strict` and fix any issues
