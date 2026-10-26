# Browser QA

The suite uses the actual frontend and backend, with synthetic data in a dedicated
local PostgreSQL/Redis stack. Only Razorpay's external order creation and checkout
SDK are simulated; the app's authorization, cookies, persistence and HMAC checks
run normally.

See [`school-manage/qa/README.md`](../../../school-manage/qa/README.md) for setup,
execution, isolation boundaries and verified results. From this app directory:

```sh
npm --prefix qa/browser ci
npm --prefix qa/browser run install:browsers
pnpm test:e2e
```

The browser suite runs against the development server. Run `pnpm typecheck` and
`pnpm build` separately. Test discovery is `npm --prefix qa/browser run test:list`.
