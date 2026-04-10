# Shipment Tracking Web App Documentation

## 1. Project Overview

### What the app does

This application is a multi-tenant shipment tracking SaaS platform built for organizations that need to manage shipments, their internal tracking items, and team access in one place. The system supports shipment creation, tracking item management, shipment-level and item-level status updates, organization-based user management, invite-based onboarding, exports, dashboard analytics, and strict organization data isolation.

The current implementation is optimized around operational workflows rather than marketing pages. Authenticated users are routed directly into the dashboard experience. The product is designed to let a company create shipments, break each shipment into multiple tracking items, assign teams to work inside the same organization, and monitor progress from receipt to delivery.

### Target users

#### Admin

Admins are organization owners or managers. They create shipments, manage shipment and tracking progress, invite other users, assign roles, and remove users from the organization.

#### Agent

Agents are operational users inside the organization. They can view the dashboard, browse shipments, inspect shipment details, update tracking statuses, and confirm received tracking items. They do not create shipments or manage users.

### Core purpose

The core product goal is to provide a shared internal workspace for shipment operations with the following principles:

- Every authenticated user belongs to exactly one organization.
- Data is isolated by organization at both application and database policy levels.
- Shipments are the top-level business entity.
- Tracking items are child records within shipments and represent item-level operational handling.
- Admin workflows and agent workflows use the same data model but expose different controls.

## 2. User Roles & Permissions

There are two application roles stored in the `users.role` field:

- `admin`
- `agent`

### Admin capabilities

Admins can:

- Access all dashboard pages available to their organization
- View the dashboard
- View the shipments list
- Create shipments
- Open shipment detail pages
- Update shipment status
- Update tracking item status
- Confirm tracking items as received
- Edit tracking item details
- Invite users
- Change user roles
- Delete users other than themselves
- Export shipments and shipment details

### Agent capabilities

Agents can:

- Access the dashboard
- View the shipments list
- Open shipment detail pages
- Update tracking item status
- Confirm tracking items as received
- Edit tracking item details
- Export shipments and shipment details

Agents cannot:

- Create shipments
- Manage users
- Access the users page
- Update shipment-level status

### Permissions table

| Capability | Admin | Agent | Notes |
| --- | --- | --- | --- |
| View dashboard | Yes | Yes | Dashboard data is organization-scoped |
| View shipments list | Yes | Yes | Shared list view |
| Create shipment | Yes | No | Admin-only UI and route guard |
| View shipment details | Yes | Yes | Shared detail page |
| Update shipment status | Yes | No | Admin-only control on shipment details |
| Update tracking item status | Yes | Yes | Both roles can update item status |
| Confirm tracking item | Yes | Yes | Both roles can confirm received items |
| Edit tracking item details | Yes | Yes | Includes tracking ID, product, courier, weight, cost, status, comment |
| Export all shipments | Yes | Yes | Excel export from shipments page |
| Export single shipment | Yes | Yes | Excel and PDF from shipment details |
| Invite user | Yes | No | Admin-only users page |
| Update user role | Yes | No | Admin-only users page |
| Delete user | Yes | No | Admin cannot delete self |
| Access users page | Yes | No | Non-admins are redirected away |

## 3. System Architecture

### Frontend

The frontend is built with Next.js App Router. Most pages are implemented as server components that:

- Read the current user from Supabase-backed session state
- Query Supabase using server-side clients
- Redirect unauthenticated or unauthorized users before rendering

Interactive pieces such as forms, sidebar collapse state, invite acceptance, inline tracking editing, and loading states are implemented as client components.

The UI layer uses:

- React
- Tailwind CSS
- `lucide-react` for icons
- Small reusable UI components rather than a heavy component library

### Backend

The backend is Supabase. It provides:

- Authentication
- Database
- Role and organization-linked user records
- Row Level Security policies
- Admin Auth APIs used from server-side service-role code

There is no separate custom API server. Business operations are performed through:

- Next.js server actions
- Server component data fetching
- Supabase Auth admin methods
- Supabase database queries and updates

### Database structure

The database has four main tables:

- `organizations`
- `users`
- `shipments`
- `tracking_items`

Each business record that should be tenant-isolated carries an `organization_id`.

### Authentication flow

There are two auth entry paths:

1. Direct signup:
   An unauthenticated visitor can create a new admin account and starter organization.
2. Invite-based onboarding:
   An admin invites another user by email, Supabase sends an invite email, and the invited user lands on `/accept-invite` to set a password.

Current user resolution works like this:

1. Read Supabase auth session from cookies.
2. Resolve the auth user.
3. Look up the corresponding app-level user row in `public.users`.
4. Return an app user object containing `id`, `email`, `name`, `role`, and `organization_id`.

This separation matters because the app relies on the `users` table for organization membership and roles, not just on Supabase Auth identities.

## 4. Database Schema

This section is critical for any UI redesign because most screens are direct views over these four tables.

### `organizations`

#### Purpose

Represents a tenant organization. Every user belongs to one organization. Every shipment and tracking item is scoped to one organization.

#### Fields

| Field | Type | Purpose |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `name` | `text` | Organization display name |
| `created_at` | `timestamptz` | Creation timestamp |

#### Relationships

- One organization has many users
- One organization has many shipments
- One organization has many tracking items

### `users`

#### Purpose

Stores app-level user data, role, and organization membership. This table is the application’s authoritative role and tenancy layer.

#### Fields

| Field | Type | Purpose |
| --- | --- | --- |
| `id` | `uuid` | Primary key, also references `auth.users.id` |
| `email` | `text` | Unique email |
| `name` | `text` | Display name |
| `role` | `user_role` enum | `admin` or `agent` |
| `organization_id` | `uuid` | Tenant link to `organizations.id` |
| `created_at` | `timestamptz` | Creation timestamp |

#### Relationships

- `users.id` references `auth.users.id`
- `users.organization_id` references `organizations.id`
- A user may be the `created_by` value on shipments

### `shipments`

#### Purpose

Top-level business object representing a shipment. The shipment page, shipment table, dashboard metrics, and exports are all driven from this table.

#### Fields

| Field | Type | Purpose |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `organization_id` | `uuid` | Tenant ownership |
| `name` | `text` | Shipment name |
| `total_weight` | `numeric(12,2)` nullable | Overall shipment weight |
| `total_cost` | `numeric(12,2)` nullable | Overall shipment cost |
| `status` | `text` | Shipment lifecycle status |
| `created_by` | `uuid` nullable | User who created the shipment |
| `created_at` | `timestamptz` | Creation timestamp |

#### Relationships

- `shipments.organization_id` references `organizations.id`
- `shipments.created_by` references `users.id`
- One shipment has many tracking items

#### Shipment statuses currently used

- `Created`
- `In Transit`
- `At China Airport`
- `Dispatched`
- `Delivered`

### `tracking_items`

#### Purpose

Represents item-level tracking records within a shipment. This is the most operationally detailed table in the system.

#### Fields

| Field | Type | Purpose |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `shipment_id` | `uuid` | Parent shipment |
| `organization_id` | `uuid` | Tenant ownership |
| `tracking_id` | `text` | Unique tracking identifier within the organization |
| `product_name` | `text` nullable | Optional product/item label |
| `courier` | `text` | Courier/service name |
| `weight` | `numeric(12,2)` nullable | Item weight |
| `cost` | `numeric(12,2)` nullable | Item cost |
| `status` | `text` | Tracking lifecycle status |
| `comment` | `text` nullable | Free-text operational note |
| `is_confirmed_by_agent` | `boolean` | Whether an agent confirmed receipt |
| `confirmed_at` | `timestamptz` nullable | Confirmation timestamp |
| `created_at` | `timestamptz` | Creation timestamp |

#### Relationships

- `tracking_items.shipment_id` references `shipments.id`
- `tracking_items.organization_id` references `organizations.id`
- There is a uniqueness constraint on `(organization_id, tracking_id)`

#### Tracking statuses currently used

- `Received`
- `Processing`
- `Shipped`
- `Delivered`
- `Not Delivered`

### Data model summary

The data hierarchy is:

`Organization -> Users`

`Organization -> Shipments -> Tracking Items`

`Organization -> Tracking Items`

The direct `organization_id` on `tracking_items` is intentional. It makes RLS filtering simpler and avoids relying only on parent shipment joins for isolation.

## 5. Authentication & Onboarding Flow

This app currently supports both direct signup and invite-based onboarding. Invite flow is the more important operational path for growing a team.

### A. Signup flow for first admin

1. User opens `/signup`.
2. User enters name, email, and password.
3. Server action validates input with Zod.
4. App creates a Supabase Auth user via admin API.
5. App creates a new organization record.
6. App inserts a `users` row for that auth user with role `admin`.
7. App signs the user in with email/password.
8. User is redirected to `/dashboard`.

Result:

- A new organization exists.
- The signer becomes the first admin of that organization.

### B. Invite flow

1. Admin opens `/users`.
2. Admin fills in name, email, and role.
3. Server action validates the request.
4. App checks whether the email already exists in `users`.
5. If the user already exists in the same organization, their details are updated instead of creating a duplicate.
6. Otherwise, app calls `supabase.auth.admin.inviteUserByEmail`.
7. The redirect target is built from `NEXT_PUBLIC_APP_URL` and points to `/accept-invite`.
8. App also inserts a `users` row linked to the invited auth user.

### C. Invite acceptance flow

1. Invited user clicks the email link.
2. Supabase establishes a session for invite acceptance.
3. User lands on `/accept-invite`.
4. Client checks whether a valid session exists.
5. User enters a password.
6. App calls `supabase.auth.updateUser({ password })`.
7. On success, user is redirected to `/dashboard`.

### D. Login flow

1. User opens `/login`.
2. User enters email and password.
3. App validates inputs.
4. App signs in with Supabase email/password.
5. User is redirected to `/dashboard`.

### E. Logout flow

1. User clicks logout in the sidebar.
2. App signs out from Supabase.
3. User is redirected to `/login`.

## 6. Core Features

### Shipment Management

#### Create shipment

The create shipment screen is admin-only.

Flow:

1. Admin opens `/shipments/create`.
2. Admin enters shipment-level fields:
   - Shipment name
   - Total weight
   - Total cost
3. Admin adds one or more tracking rows inline.
4. Each tracking row includes:
   - Tracking ID
   - Product name
   - Courier
   - Weight
   - Cost
5. Submit triggers a server action.
6. App validates shipment data and tracking rows with Zod.
7. App creates the shipment first.
8. App inserts tracking items in bulk, inheriting `organization_id` and `shipment_id`.
9. Shipment starts with status `Created`.
10. New tracking items start with status `Received`.
11. User is redirected to the shipment detail page.

#### View shipments

The shipments list page is available to both roles.

It shows:

- Shipment name
- Shipment status badge
- Total weight
- Created date
- View action

Admins also see a create shipment shortcut.

#### Update shipment status

Shipment status is updated from the shipment detail page.

Important rule:

- Only admins see the shipment-level status control.

The update is performed by a server action and revalidates:

- `/shipments`
- `/dashboard`
- `/shipments/[id]`

### Tracking Items

Tracking items are the most detailed operational records in the product.

#### Add tracking items

Tracking items are created during shipment creation. There is currently no standalone “add tracking item later” screen. The existing flow is:

- Create shipment
- Add one or more tracking item rows within the same form

#### Product name support

`product_name` is optional and was added to support more descriptive item labeling. Existing rows may have `null` here. UI should always handle empty values gracefully.

#### Status updates

Each tracking item supports independent status changes from the shipment detail page.

This makes it possible for one shipment to contain items at different stages at the same time.

#### Comments

`comment` is an optional text note intended for operational context such as:

- Address issue
- Delivery failed
- Delay reason
- Courier exception

#### Edit tracking items

Tracking items can now be edited inline from the shipment detail page.

Editable fields are:

- `tracking_id`
- `product_name`
- `courier`
- `weight`
- `cost`
- `status`
- `comment`

The edit interaction is currently inline-expand, not modal-based. This matters for redesign:

- The existing UX assumes users edit one row at a time in context
- A redesign can improve presentation, but should preserve this low-friction workflow unless intentionally changed

### Status Workflow

#### Shipment statuses

Current shipment workflow:

- `Created`
- `In Transit`
- `At China Airport`
- `Dispatched`
- `Delivered`

Semantic intent:

- `Created`: Shipment was created in the system
- `In Transit`: Shipment is moving through logistics
- `At China Airport`: Shipment reached the airport checkpoint
- `Dispatched`: Shipment was sent onward for final handling
- `Delivered`: Shipment completed

Note for redesign:

The prompt says “Airport”, but the actual app status label is `At China Airport`. Any redesign must preserve the exact current value unless backend logic is intentionally updated.

#### Tracking item statuses

Current tracking workflow:

- `Received`
- `Processing`
- `Shipped`
- `Delivered`
- `Not Delivered`

Semantic intent:

- `Received`: Item has been logged or received into process
- `Processing`: Item is being handled internally
- `Shipped`: Item has left the current handling stage
- `Delivered`: Item was delivered successfully
- `Not Delivered`: Delivery attempt failed or could not complete

Important:

- Tracking item status is independent from shipment status
- A shipment can still contain mixed item statuses

## 7. User Management

The users page is admin-only.

### Invite users

Admins can invite users by:

- Name
- Email
- Role

The system sends an invite email using Supabase Auth and stores the invited person in the app’s `users` table.

### Assign roles

Admins can update another user’s role between:

- `admin`
- `agent`

This is done inline from the users table.

### Delete users

Admins can delete other users.

Delete behavior:

1. Remove the app-level `users` row.
2. Delete the Supabase Auth user.

Safety rule:

- Admins cannot delete their own account from the UI

### Organization sharing

All users inside the same organization share:

- Dashboard metrics
- Shipment list
- Shipment details
- Tracking items

No user can view data from another organization.

## 8. Dashboard

The dashboard is the main summary page for the organization.

### Metrics shown

The current dashboard displays:

- Total Shipments
- Active Shipments
- Delivered Shipments
- Total Tracking Items
- Total Weight
- Total Cost

### Additional insights

The dashboard also includes:

- Shipment status breakdown
- Recent shipments list

### Data sources

Dashboard data is derived from:

- `shipments` count queries
- `tracking_items` count query
- Shipment status summary
- Shipment numeric aggregation for weight and cost
- Last 5 shipments ordered by `created_at desc`

### UX implication for redesign

This page is currently very card-and-table based. A redesign can change the visual hierarchy significantly, but the information architecture should still expose:

- top-level metrics
- status distribution
- recent shipment activity

## 9. Filters & Search

### Shipment search

The shipments page supports text search on shipment name using `ilike`.

### Shipment status filter

The shipments page supports filtering by:

- All
- Created
- In Transit
- At China Airport
- Dispatched
- Delivered

### Shipment date filters

The shipments page supports:

- `from` date
- `to` date

This filters based on `created_at`.

### Tracking search

The shipment detail page supports tracking item search across:

- `tracking_id`
- `product_name`
- `courier`
- `comment`

This is important for UX redesign because the search is item-level and contextual to a single shipment.

## 10. Export Features

### Export all shipments

From the shipments list page, users can export all visible shipments to Excel.

Current export contents:

- Shipment name
- Status
- Total weight
- Total cost
- Created date

### Export single shipment to Excel

From the shipment detail page, users can export the current shipment to Excel.

The workbook contains:

- Shipment Info sheet
- Tracking Items sheet

Tracking item export includes:

- Tracking ID
- Product Name
- Courier
- Weight
- Cost
- Status
- Comment
- Confirmed

### Export single shipment to PDF

From the shipment detail page, users can export shipment details to PDF.

Current PDF output is functional and text-based. It includes:

- Shipment details
- Tracking item summaries

Known UX note:

- PDF styling is basic and utility-focused, not presentation-rich

## 11. UI Structure

This section is important for any redesign AI. The app is small enough that page-level understanding can directly map to a new IA or responsive design system.

### Pages

#### `/`

- Root route
- Redirects authenticated users to `/dashboard`
- Redirects unauthenticated users to `/login`

#### `/login`

- Public auth page
- Email/password login form
- Link to signup

#### `/signup`

- Public auth page
- Creates initial admin account and organization

#### `/accept-invite`

- Invite onboarding page
- Requires session established from Supabase invite email link
- Lets user set password

#### `/dashboard`

- Authenticated page
- Summary metrics
- Status breakdown
- Recent shipments

#### `/shipments`

- Authenticated page
- Filter/search form
- Export all shipments
- Shipment table
- Admin-only create shipment button

#### `/shipments/create`

- Authenticated admin-only page
- Shipment creation form with inline tracking items

#### `/shipments/[id]`

- Authenticated page
- Shipment summary card
- Shipment export actions
- Shipment status control for admins
- Tracking search
- Tracking items table
- Tracking item status controls
- Tracking confirmation
- Inline tracking edit form

#### `/users`

- Authenticated admin-only page
- Invite user form
- Users management table

### Layout

#### Sidebar

The dashboard area uses a persistent sidebar layout.

Sidebar features:

- Collapsible width
- Organization user identity block at bottom
- Dashboard nav item
- Shipments nav item
- Admin-only Create Shipment nav item
- Admin-only Users nav item
- Logout action

#### Header / content area

There is no global top header bar in the dashboard layout right now. Each page renders its own title and page-specific action row inside the main content area.

#### Content area

The main content area uses a padded column layout inside the dashboard shell.

### Components

#### Tables

Current table-heavy components:

- Shipment table
- Users table
- Tracking items table on shipment detail

Tables currently use:

- Light header background
- Rounded outer container
- Hover states
- Icon action cells

#### Forms

Current major forms:

- Login
- Signup
- Accept invite
- Add user
- Create shipment
- Tracking edit form
- Shipment filters
- Tracking search
- Status update forms

#### Buttons

Important current button patterns:

- Reusable loading submit button for form actions
- Primary buttons for key actions
- Secondary buttons for utility actions
- Destructive buttons for delete actions

#### Status badges

Status badges visually encode shipment and tracking statuses with different color mappings.

## 12. UX Behavior

### Role-based UI visibility

This is a major product rule and must remain intact in any redesign.

Examples:

- Only admins see “Create Shipment”
- Only admins see “Users”
- Only admins see shipment-level status update controls
- Agents are redirected away from admin-only routes

### Loading states

Recent UI improvements added loading/pending behavior to key forms:

- Create shipment
- Invite user
- Confirm tracking
- Save tracking edits
- Delete user
- Status updates

Loading behavior currently includes:

- Disabled buttons during submit
- Spinner icon
- Replacement loading text

### Action buttons

Action cells now use a mix of icon-based and compact action buttons, including:

- Eye icon for shipment view
- Pencil icon for edit tracking item
- Trash icon for delete user

### Inline editing

Tracking item editing is inline and row-contextual. The form expands within the current page context rather than navigating away.

Implications:

- Useful on desktop because context is preserved
- Potentially awkward on mobile without redesign
- Good candidate for responsive transformation into drawer, sheet, stacked card editor, or full-width inline panel

## 13. Security

Security is one of the strongest architectural foundations in this project.

### Organization-based access

Every core data record is linked to an `organization_id`.

Application logic always filters by the current user’s `organization_id`.

Examples:

- Dashboard queries filter by organization
- Shipments list filters by organization
- Shipment details require matching shipment and organization
- Tracking item updates require matching shipment, tracking item, and organization
- User management is organization-scoped

### Row Level Security

RLS is enabled for:

- `organizations`
- `users`
- `shipments`
- `tracking_items`

Policies ensure authenticated users can only:

- Select rows from their own organization
- Insert rows into their own organization
- Update rows in their own organization
- Delete rows in their own organization

The helper SQL function `current_user_organization_id()` returns the organization for `auth.uid()` and is used by policies.

### Data isolation

Isolation exists at two levels:

1. App-level query filtering
2. Database-level RLS policy enforcement

This is important for redesign work because the UI can be changed substantially without weakening the security model, as long as all existing data operations keep their current filters and server-side actions.

## 14. Known Limitations

Current limitations that matter for UI/UX planning:

- No dedicated mobile-first optimization yet
- Sidebar-based layout is desktop-oriented
- Tracking detail table is dense on small screens
- PDF export styling is basic
- No notifications or email activity center
- No delivery proof uploads or attachments
- No standalone page for editing or bulk-managing tracking items outside shipment detail
- No advanced analytics beyond current dashboard summary cards
- No explicit audit log/history UI

## 15. Future Scope

Suggested future directions that can influence UI architecture decisions:

- Mobile-first responsive redesign
- Better empty states and guided onboarding
- Notifications for shipment or tracking changes
- Billing/subscription system for SaaS expansion
- Multi-organization account switching
- File uploads for proof of delivery or item evidence
- Richer analytics and operational reporting
- Activity timeline per shipment
- Bulk actions for shipments and tracking items

## Additional Notes For A UI/UX Redesign AI

This final section is intentionally direct because the stated consumer is another AI responsible for redesigning the interface.

### Preserve these invariants

- Do not remove role-based restrictions
- Do not change status values silently
- Do not break organization-scoped data assumptions
- Do not assume tracking items are standalone global records; they belong to shipments
- Do not assume every tracking item has `product_name` or `comment`
- Do not assume only admins interact with tracking items; agents do too

### Safe redesign opportunities

- Rework all tables into responsive card/table hybrids
- Convert dense desktop tracking rows into stacked mobile cards
- Improve page action bars and visual hierarchy
- Introduce clearer status timelines
- Improve dashboard information density and scanability
- Improve invite and onboarding feedback
- Redesign sidebar and navigation for small screens
- Improve spacing, typography, and action grouping

### Potentially tricky redesign areas

- Shipment detail page:
  It mixes summary, exports, shipment status control, search, tracking table, item status updates, confirmation, and inline editing
- Users page:
  It combines an invite form with a management table
- Tracking item editing:
  The current inline editor is functional but can become cluttered when multiple rows are edited in a dense table layout

### Recommended redesign mindset

Treat the product as an internal operations dashboard with two priorities:

1. Fast scanning of shipment and tracking state
2. Low-friction updates by admins and agents

A successful redesign should improve:

- mobile usability
- action clarity
- layout responsiveness
- information grouping
- progressive disclosure for dense row actions

without changing:

- the role model
- the data model
- the status workflows
- the server-action-based update flow
