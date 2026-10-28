# npm-zod

Ticket intake validation on zod 3.24: `ZodError.errors`, `z.nativeEnum`, single-argument `z.record` and `.strict()`. zod 4 removed `ZodError.errors` (use `.issues`), so the upgrade stops this code compiling.

Teire demo repository: Teire should find the affected sites, upgrade zod, fix the code, prove it with the repo's own typecheck and tests before and after in a sandbox, and open a verified pull request.

```bash
npm ci
npm run typecheck && npm test
```
