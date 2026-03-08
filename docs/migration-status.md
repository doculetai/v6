# Migration Status

As of 2026-03-08, Doculet V6 database migrations.

## Applied Migrations

All migrations through **0019** (nifty_runaways) are tracked in Drizzle and available.

### Migration Timeline

| Idx | Name | Description |
|-----|------|-------------|
| 0000 | clear_living_tribunal | Initial schema setup |
| 0001 | sleepy_mimic | Core tables |
| 0002 | wakeful_stark_industries | Schema enhancements |
| 0003 | military_marten_broadcloak | Additional tables |
| 0004 | boring_maginty | Data structure updates |
| 0004 | webhook_payload_and_signing | Webhook infrastructure |
| 0005 | youthful_chamber | Schema refinement |
| 0006 | unusual_hemingway | Table modifications |
| 0007 | white_metal_master | Field additions |
| 0008 | neat_nebula | Data model updates |
| 0009 | big_spectrum | Schema expansion |
| 0010 | cultured_jetstream | Core functionality |
| 0010 | platform_fee_config_seed | Platform fee configuration |
| 0011 | pretty_swarm | Schema consolidation |
| 0012 | glamorous_gladiator | Performance optimizations |
| 0013 | glamorous_warlock | Advanced features |
| 0014 | elite_stryfe | Feature additions |
| 0015 | add_programs_status | Program status tracking |
| 0016 | sticky_jubilee | Data consistency |
| 0017 | abnormal_bedlam | Risk management features |
| 0018 | wooden_night_nurse | System enhancements |
| 0019 | nifty_runaways | Pending role assignments table |

## Latest Migration: 0019 (nifty_runaways)

Creates `pending_role_assignments` table for invite token tracking:

```sql
CREATE TABLE "pending_role_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pending_role_assignments_email_unique" UNIQUE("email")
);
```

This table supports the invite link feature for adding users to roles without requiring email confirmation upfront.

## Applying to Production

To apply pending migrations to production:

```bash
DATABASE_URL=<production-db-url> npm run db:migrate
```

Verify migration state in production:

```bash
# Check applied migrations
DATABASE_URL=<production-db-url> npm run db:studio
```

## Notes

- Migration 0019 (`pending_role_assignments`) should be applied before enabling the invite link feature (role assignment via token).
- All 20 migrations are generated and ready for production deployment.
- Database schema is fully documented in `src/db/schema/` with Drizzle ORM definitions.
- Snapshots for each migration are tracked in `drizzle/meta/`.
