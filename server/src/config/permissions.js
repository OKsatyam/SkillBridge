export const ROLE_PERMISSIONS = {
  client: [
    'job:create', 'job:edit',
    'proposal:manage',   // shortlist / reject / accept — PATCH /proposals/:id
    'contract:create',   // buy a gig / hire from proposal — POST /contracts
    'contract:fund',     // fund milestone into escrow
    'contract:approve',  // approve delivery, release escrow
    'wallet:withdraw',
    'chat:use',
    'review:create',
    'dispute:raise',
  ],
  freelancer: [
    'gig:create', 'gig:edit',
    'proposal:submit',
    'milestone:submit',
    'wallet:withdraw',
    'chat:use',
    'review:create',
    'dispute:raise',
  ],
  admin: [
    'chat:use',
    'dispute:resolve',
    'user:manage',
    'category:manage',
    'content:moderate',
    'analytics:view',
  ],
};