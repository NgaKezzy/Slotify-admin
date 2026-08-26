# Generated API types

`api.d.ts` in this folder is **generated** from the Spring Boot OpenAPI document and
must not be edited by hand.

```bash
# Backend must be running on http://localhost:8080 (springdoc exposes /v3/api-docs)
pnpm gen:api
```

The file is consumed by `src/lib/api-client.ts` (openapi-fetch), which gives every
request fully typed paths, params and responses. Re-run the command whenever the
backend API changes and commit the result.

The placeholder `api.d.ts` shipped with the skeleton only declares the endpoints
that the Phase 0 code references; it is replaced entirely by the first generation.
