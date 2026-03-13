# Requirements Document

## Introduction

The Drops page is a public-facing marketing page at the /drops route that showcases limited product releases ("drops") for the Charmed & Dark brand. The page follows the established Sanctuary design system (Cormorant Garamond serif headings, Inter body text, #08080f background, #c9a96e gold accents, star field backgrounds) and provides information about upcoming drops, membership benefits, and a locked archive section for past drops. The page integrates with Sanity CMS for drop scheduling data and supports email capture for drop alerts via Mailchimp or Supabase.

## Glossary

- **Drops_Page**: The public marketing page at /drops route
- **Drop**: A limited-time product release with preview, release, and early access windows
- **Sanctuary_Member**: An authenticated user with an active membership in the memberships table
- **Drop_Alert**: An email subscription for notifications about upcoming drops
- **Archive**: A collection of past drops visible only to Sanctuary members
- **Sanity_CMS**: The content management system storing drop scheduling data
- **Mailchimp**: Optional third-party email marketing service for drop alerts
- **Supabase**: Database and authentication service
- **Design_System**: The visual design language (fonts, colors, spacing, components) shared with Sanctuary

## Requirements

### Requirement 1: Drops Page Route and Layout

**User Story:** As a visitor, I want to access the Drops page at /drops, so that I can learn about limited product releases.

#### Acceptance Criteria

1. THE Drops_Page SHALL be accessible at the /drops route
2. THE Drops_Page SHALL use the Design_System background color #08080f
3. THE Drops_Page SHALL use Cormorant Garamond font for all serif headings
4. THE Drops_Page SHALL use Inter font with weight 300 for all body text
5. THE Drops_Page SHALL use #c9a96e for all gold accent colors
6. THE Drops_Page SHALL use #e8e4dc for all primary text colors
7. THE Drops_Page SHALL use 0px border radius for cards and section containers. Pill-shaped buttons retain their border radius as designed.
8. THE Drops_Page SHALL be fully responsive on mobile, tablet, and desktop viewports

### Requirement 2: DropsHero Section

**User Story:** As a visitor, I want to see a compelling hero section, so that I understand the purpose of drops and can take action.

#### Acceptance Criteria

1. THE DropsHero SHALL display an eyebrow label "DROPS" in gold (#c9a96e) with 11px font size and 0.3em letter spacing in uppercase
2. THE DropsHero SHALL display the heading "Limited releases. Quiet power." in Cormorant Garamond serif font
3. THE DropsHero SHALL display subtext in Inter font with weight 300 and color #e8e4dc
4. THE DropsHero SHALL render a star field background with 50 micro stars at random positions with 0.1 to 0.2 opacity
5. THE DropsHero SHALL render a radial nebula gradient overlay at 20% opacity
6. THE DropsHero SHALL render a crescent moon SVG in the bottom-left corner at 8% opacity with partial cropping
7. THE DropsHero SHALL display two pill-shaped buttons: "Join the Sanctuary" with gold border and "Get drop alerts" with muted border
8. THE DropsHero SHALL display the member benefit line "MEMBERS UNLOCK SANCTUARY PRICING AND EARLY ACCESS." in tracked caps gold 11px below the buttons
9. WHEN a user clicks "Join the Sanctuary" button, THE Drops_Page SHALL scroll to the MembershipSignup section
10. WHEN a user clicks "Get drop alerts" button, THE Drops_Page SHALL scroll to the DropAlertBand section

### Requirement 3: NextDrop Section with Sanity CMS Integration

**User Story:** As a visitor, I want to see when the next drop is scheduled, so that I can plan to participate.

#### Acceptance Criteria

1. THE NextDrop SHALL display an eyebrow label "NEXT DROP" in tracked caps gold
2. THE NextDrop SHALL fetch the current drop data from Sanity_CMS using the currentDrop schema
3. WHEN Sanity_CMS returns a dropName field, THE NextDrop SHALL display the drop name
4. WHEN Sanity_CMS does not return a dropName field, THE NextDrop SHALL display "Coming Soon" as fallback
5. THE NextDrop SHALL display the static subtext "When the window opens, the Threshold shifts. Join to be notified first."
6. THE NextDrop SHALL display a three-column status strip with columns for PREVIEW WINDOW, RELEASE WINDOW, and SANCTUARY EARLY ACCESS
7. WHEN Sanity_CMS returns a previewDate, THE NextDrop SHALL display the formatted date in the PREVIEW WINDOW column
8. WHEN Sanity_CMS does not return a previewDate, THE NextDrop SHALL display "TBA" in the PREVIEW WINDOW column
9. WHEN Sanity_CMS returns a releaseDate, THE NextDrop SHALL display the formatted date in the RELEASE WINDOW column
10. WHEN Sanity_CMS does not return a releaseDate, THE NextDrop SHALL display "TBA" in the RELEASE WINDOW column
11. WHEN Sanity_CMS returns a sanctuaryAccessDate, THE NextDrop SHALL display the formatted date in the SANCTUARY EARLY ACCESS column
12. WHEN Sanity_CMS does not return a sanctuaryAccessDate, THE NextDrop SHALL display "TBA" in the SANCTUARY EARLY ACCESS column
13. THE NextDrop SHALL style each status column with background color #0e0e1a, 2px gold top border, tracked caps label, and serif value
14. THE NextDrop SHALL render a thin horizontal gold connecting line between the three columns
15. THE NextDrop SHALL apply a subtle CSS pulse animation to the connecting line

### Requirement 4: Sanity CMS Schema for Drop Data

**User Story:** As a content manager, I want to manage drop scheduling data in Sanity CMS, so that the Drops page displays current information.

#### Acceptance Criteria

1. THE Sanity_CMS SHALL define a currentDrop schema with fields: dropName (string), previewDate (datetime), releaseDate (datetime), sanctuaryAccessDate (datetime)
2. THE Drops_Page SHALL query Sanity_CMS for the currentDrop document
3. WHEN Sanity_CMS query fails, THE Drops_Page SHALL display fallback values ("Coming Soon" and "TBA") without crashing
4. THE Drops_Page SHALL format datetime values from Sanity_CMS into human-readable date strings

### Requirement 5: MembershipBenefits Section

**User Story:** As a visitor, I want to understand membership benefits, so that I can decide whether to join.

#### Acceptance Criteria

1. THE MembershipBenefits SHALL display an eyebrow label "MEMBERSHIP" in tracked caps gold
2. THE MembershipBenefits SHALL display the heading "The quieter way in." in serif font
3. THE MembershipBenefits SHALL display the subtext "Free to join. No feed. No noise. Just access."
4. THE MembershipBenefits SHALL display three benefit cards with titles "Always First", "Always Less", and "Always Yours"
5. THE MembershipBenefits SHALL display descriptive copy for each benefit card matching the Sanctuary design language
6. THE MembershipBenefits SHALL render a MembershipSignup block below the benefit cards

### Requirement 6: MembershipSignup Block

**User Story:** As a visitor, I want to sign up for membership directly from the Drops page, so that I can access member benefits.

#### Acceptance Criteria

1. THE MembershipSignup SHALL display the heading "Join free. Leave anytime."
2. THE MembershipSignup SHALL display the subtext "No credit card. No performance. Just the quieter side of the drop."
3. THE MembershipSignup SHALL render an email input field with appropriate placeholder text
4. THE MembershipSignup SHALL render a "Join the Sanctuary" pill button
5. THE MembershipSignup SHALL display "ALREADY A MEMBER? SIGN IN." in tracked caps muted text with a clickable link
6. WHEN a user submits the MembershipSignup form with a valid email, THE Drops_Page SHALL create a Supabase auth user with the provided email
7. WHEN Supabase auth user creation succeeds, THE Drops_Page SHALL redirect the user to /sanctuary
8. WHEN Supabase auth user creation fails, THE Drops_Page SHALL display an error message to the user
9. WHEN a user clicks "SIGN IN" link, THE Drops_Page SHALL navigate to the appropriate sign-in page

### Requirement 7: DropAlertBand Section

**User Story:** As a visitor, I want to subscribe to drop alerts, so that I receive notifications about upcoming drops.

#### Acceptance Criteria

1. THE DropAlertBand SHALL render as a full-width dark band with 1px gold top and bottom borders
2. THE DropAlertBand SHALL display "STAY IN THE WINDOW" label text on the left side
3. THE DropAlertBand SHALL display descriptive subtext on the left side
4. THE DropAlertBand SHALL render an email input field on the right side
5. THE DropAlertBand SHALL render a "NOTIFY ME" pill button on the right side
6. WHEN Mailchimp is configured, THE DropAlertBand SHALL submit the email to the Mailchimp drop alerts list
7. WHEN Mailchimp is not configured, THE DropAlertBand SHALL insert the email into the Supabase drop_alerts table
8. WHEN email submission succeeds, THE DropAlertBand SHALL display a success message to the user
9. WHEN email submission fails, THE DropAlertBand SHALL display an error message to the user
10. THE DropAlertBand SHALL validate email format before submission

### Requirement 8: Supabase Drop Alerts Table

**User Story:** As a system administrator, I want drop alert emails stored in Supabase when Mailchimp is not configured, so that we can notify users about drops.

#### Acceptance Criteria

1. THE Supabase SHALL define a drop_alerts table with columns: id (UUID primary key), email (TEXT NOT NULL UNIQUE), created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())
2. WHEN Mailchimp is not configured and a user submits a drop alert email, THE Drops_Page SHALL insert the email into the drop_alerts table
3. WHEN a duplicate email is submitted, THE Drops_Page SHALL handle the unique constraint error gracefully
4. THE drop_alerts table SHALL use gen_random_uuid() for automatic id generation

### Requirement 9: DropsArchive Section with Member Gating

**User Story:** As a visitor, I want to see that past drops are archived, so that I understand the value of membership.

#### Acceptance Criteria

1. THE DropsArchive SHALL display the heading "Archive" in serif font
2. THE DropsArchive SHALL display a "LOCKED" badge in the top-right corner
3. THE DropsArchive SHALL display the subtext "Past drops, preserved in the dark. Join to unlock the archive."
4. THE DropsArchive SHALL render three archive cards with titles "OBSIDIAN ARCHIVE", "ECLIPSE VAULT", and "NOCTURNE SHELF"
5. THE DropsArchive SHALL style each archive card with tall aspect ratio, background color #0e0e1a, gold border at 15% opacity, tracked caps label in top-left, and centered gold lock icon
6. WHEN a user hovers over an archive card, THE DropsArchive SHALL apply a faint gold glow effect
7. THE DropsArchive SHALL use the useSanctuaryAccess hook to determine if the user is a Sanctuary_Member
8. WHEN useSanctuaryAccess returns isMember as false, THE DropsArchive SHALL display locked archive cards with lock icons
9. WHEN useSanctuaryAccess returns isMember as true, THE DropsArchive SHALL remove lock icons and reveal archive content
10. WHEN useSanctuaryAccess returns isMember as true, THE DropsArchive SHALL remove the "LOCKED" badge

### Requirement 10: DropsStickBar Component

**User Story:** As a visitor scrolling the Drops page, I want a persistent call-to-action, so that I can easily join the Sanctuary.

#### Acceptance Criteria

1. THE DropsStickBar SHALL render as a fixed bottom bar identical in style to the Sanctuary StickyJoinBar
2. THE DropsStickBar SHALL display the text "JOIN FREE TO UNLOCK EARLY ACCESS AND SANCTUARY PRICING." on the left side
3. THE DropsStickBar SHALL render a "JOIN FREE" button on the right side
4. WHEN a user clicks the "JOIN FREE" button, THE DropsStickBar SHALL navigate to /join or scroll to the MembershipSignup section
5. THE DropsStickBar SHALL use the useSanctuaryAccess hook to determine if the user is a Sanctuary_Member
6. WHEN useSanctuaryAccess returns isMember as true, THE DropsStickBar SHALL be hidden from view
7. WHEN useSanctuaryAccess returns isMember as false, THE DropsStickBar SHALL be visible

### Requirement 11: Authentication and Access Control

**User Story:** As a visitor, I want to access the Drops page without authentication, so that I can learn about drops before joining.

#### Acceptance Criteria

1. THE Drops_Page SHALL be fully accessible to unauthenticated visitors
2. THE Drops_Page SHALL not require authentication to view any section except unlocked archive content
3. THE DropsArchive SHALL apply visual locking (blur and lock icon) for non-members
4. THE Drops_Page SHALL not redirect unauthenticated users away from the page
5. THE Drops_Page SHALL allow unauthenticated users to submit the MembershipSignup form
6. THE Drops_Page SHALL allow unauthenticated users to submit the DropAlertBand form

### Requirement 12: Mailchimp Integration Stub

**User Story:** As a developer, I want a clear integration point for Mailchimp, so that I can implement the API connection later.

#### Acceptance Criteria

1. WHEN Mailchimp is not configured, THE DropAlertBand submit handler SHALL log the email to the browser console
2. THE DropAlertBand submit handler SHALL check for Mailchimp configuration before attempting API calls
3. THE DropAlertBand submit handler SHALL provide a clear code comment indicating where Mailchimp API integration should be implemented
4. WHEN Mailchimp configuration is detected, THE DropAlertBand SHALL attempt to submit the email to Mailchimp API
5. WHEN Mailchimp API call fails, THE DropAlertBand SHALL fall back to Supabase drop_alerts table insertion
