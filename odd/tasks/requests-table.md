# Requests Table

## Objective
Render authenticated user requests in the portal with cached server pagination.

## Scope
- Add a stable TanStack Query provider to authenticated shell content.
- Add typed request pagination data access with cached page queries.
- Add an accessible responsive requests table with loading, error, empty, and pagination states.
- Render the table on the portal page.

## Constraints
- Preserve existing user changes and styling conventions.
- Keep the portal page free of `useEffect` data fetching.
- Use the existing Axios instance, shadcn table primitives, and installed TanStack packages.

## Tasks
- [ ] RT-1 Add QueryClient provider and typed paginated request hook.
- [ ] RT-2 Implement RequestsTable with TanStack Table v9 and server pagination.
- [ ] RT-3 Mount the table and validate with focused checks plus `npm run build`.

## Checks
- `npm run lint`
- `npm run build`

## Progress
Implementation not started.

## Next step
Implement RT-1 and RT-2 in the frontend source files.
