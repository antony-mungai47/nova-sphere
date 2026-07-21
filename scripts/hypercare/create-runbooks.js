const fs = require('fs');
const runbooks = [
  'Stripe_Runbook.md',
  'Neon_Runbook.md',
  'Pusher_Runbook.md',
  'Clerk_Runbook.md',
  'Cloudinary_Runbook.md',
  'Inngest_Runbook.md',
  'AIGateway_Runbook.md',
  'Checkout_Runbook.md',
  'Auction_Runbook.md'
];

const template = (title) => `# ${title} Runbook

## 1. Purpose
Define the scope and critical functions of ${title}.

## 2. Symptoms
Common user-facing or system-level symptoms of a ${title} failure.

## 3. Detection
How to detect the failure (alerts, metrics, logs).

## 4. Immediate Response
First actions to mitigate impact (e.g., enable maintenance mode, pause queues).

## 5. Diagnosis
Steps to identify the root cause of the ${title} issue.

## 6. Recovery
Step-by-step resolution process.

## 7. Verification
How to confirm the service is restored.

## 8. Rollback
Steps to safely undo recovery actions if they fail.

## 9. Prevention
Long-term fixes or architecture changes to prevent recurrence.

## 10. Escalation
Who to contact if the issue cannot be resolved within 15 minutes.
`;

if (!fs.existsSync('docs/runbooks')) {
    fs.mkdirSync('docs/runbooks', { recursive: true });
}

runbooks.forEach(file => {
  const title = file.split('_')[0];
  fs.writeFileSync('docs/runbooks/' + file, template(title));
});
console.log('Created 9 runbooks.');
