I want to build a UI that demonstrates a user signing up from Kombai.com and coming into the Kombai app as a free user. Free users start with 150 credits. I want the app UI to be completely minimalistic with a dark mode.

I want to build the following flows:

1. User signs into the Kombai app and lands into the overview page.
2. User can go to Your plan and see 2 cards - Upgrade to Pro and Upgrade to Teams.

For users moving from Free to Pro plan:

1. For users selecting a Pro plan - If user selects plan credits from dropdown(more credits in a plan, more it costs), open a modal for now to aunthenticate payment.
2. On successful payment, redirect user to Your plan page with plan = Pro and show plan usage.
3. User also has ability to buy additional credits(fixed one time credit bundles at flat rate) from this page.
4. User can also cancel plan, change payment method, view plan invoices from this page.They can also upgrade to Teams plan from this page.
5. They can also check their usage from the Usage tab just below My tab.
6. Your plan also has a Upgrade Pro plan card

For users moving from Free to Teams plan:

1. For users selecting Teams plan, take them to manage teams page. They can buy any number of seats(10$ per seat per month) and a plan(fixed credits per month).
2. These credits will be shared across all seats. This needs to be clear to user that X credits will be shared across Y seats. They also need to see avg credits per seat.
3. If the average credits per seat is less than 1000 give a recommendation to user to select more seats. a After selecting seats and plan, user can pay.
4. For now open a modal for now to aunthenticate payment. On successful payment, redirect user to Team members page.
5. In team members page user can see available seats. They can invite users from this page. You can also set credit restriction limits for each seat. There is also an option to buy seats which redirects user to manage teams page.
6. In the manage teams page user can add in additional seats or Upgrade plan. They can also see summary of their current teams plan. User also has ability to buy additional credits(fixed one time credit bundles at flat rate) from this page. The additional credits are shared across all users.
7. For each team member, they can access Your plan to check their plan details, billing cycle, and credit usage.
8. They have access to a team usage page which shows the credit usage across all teams and individual team members if filtered.
9. To check their individual usage, they need to go to the Usage tab.

For users moving from Pro to Teams plan:

1. When users move from Pro plan to Teams plan, their remaining credits get added to the team plan's shared credits.
2. Their billing cycle will reset
3. They will now have access to the team members page.
4. There, your plan screen will change to resemble a team members page.

Summary of what each user sees in the navigation bar according to their plans.

1. Free users see:

- Overview page
- Your Plans page
- Usage page

2. Team members see:

- Overview page
- Your Plans page
- Usage page
- Teams section under which they see:
- Team members page
- Team usage page

3. Pro members see:

- Overview page
- Your Plans page
- Usage page

Some miscellaneous items that you need to add temporarily in the sidebar:

1. A logout button
2. User email through which user has logged in
3. A button to clear local storage
4. A dropdown to select users so that I can impersonate the user and their associated plans

Frontend implementation:
Team Management page, Create Organisation Page -> propelauth
