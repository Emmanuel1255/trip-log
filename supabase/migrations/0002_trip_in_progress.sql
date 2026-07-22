-- Allow a trip to be saved "in progress" (started but not yet ended) and completed later.
-- The existing closing_gte_opening CHECK constraint already tolerates NULL under standard
-- SQL three-valued logic, so it does not need to change.

alter table public.trips alter column time_in drop not null;
alter table public.trips alter column closing_odometer drop not null;
