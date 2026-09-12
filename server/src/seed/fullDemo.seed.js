// One-command demo dataset for viewing the whole app populated end to end.
// Drives the real service layer (not raw document inserts) wherever the flow matters —
// proposals, contracts, wallet funding/escrow, milestone submit/approve, reviews — so every
// number, status, notification, and auto-created chat conversation is exactly what the live
// app would have produced by clicking through the UI.
//
// Usage (from server/):  node src/seed/fullDemo.seed.js
import 'dotenv/config';
import mongoose from 'mongoose';

import User from '../models/User.js';
import Category from '../models/Category.js';
import Gig from '../models/Gig.js';
import Job from '../models/Job.js';
import Proposal from '../models/Proposal.js';
import Contract from '../models/Contract.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

import { submitProposal } from '../services/proposal.service.js';
import { createContractFromGig, createContractFromJob, submitMilestone } from '../services/contract.service.js';
import { deposit, fundMilestone, approveMilestone } from '../services/wallet.service.js';
import { createReview } from '../services/review.service.js';

const CATEGORIES = [
  { name: 'Web Development', slug: 'web-development' },
  { name: 'Mobile Development', slug: 'mobile-development' },
  { name: 'Design', slug: 'design' },
  { name: 'Writing & Translation', slug: 'writing-translation' },
  { name: 'Digital Marketing', slug: 'digital-marketing' },
  { name: 'Video & Animation', slug: 'video-animation' },
];

const PASSWORD = 'password123';

const upsertUser = async (fields) => {
  let user = await User.findOne({ email: fields.email });
  if (!user) {
    user = await User.create({ ...fields, password: PASSWORD });
  }
  return user;
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding full demo dataset...\n');

  // ---------------------------------------------------------------- categories
  for (const c of CATEGORIES) {
    await Category.findOneAndUpdate({ slug: c.slug }, c, { upsert: true, new: true });
  }
  const categories = await Category.find();
  const cat = (slug) => categories.find((c) => c.slug === slug)._id;

  // ---------------------------------------------------------------- users
  const aisha = await upsertUser({
    name: 'Aisha Khan', email: 'demo.freelancer@skillbridge.test',
    roles: ['client', 'freelancer'], bio: 'Full-stack developer specializing in MERN apps.',
    skills: ['React', 'Node.js', 'MongoDB'],
  });
  const marcus = await upsertUser({
    name: 'Marcus Chen', email: 'demo.designer@skillbridge.test',
    roles: ['freelancer'], bio: 'Product designer focused on clean, usable interfaces.',
    skills: ['Figma', 'UI Design', 'Prototyping'],
  });
  const priya = await upsertUser({
    name: 'Priya Nair', email: 'demo.writer@skillbridge.test',
    roles: ['freelancer'], bio: 'SEO copywriter and content strategist for SaaS brands.',
    skills: ['Copywriting', 'SEO', 'Content Strategy'],
  });
  const rahul = await upsertUser({
    name: 'Rahul Verma', email: 'demo.client@skillbridge.test', roles: ['client'],
  });
  const sophie = await upsertUser({
    name: 'Sophie Martin', email: 'demo.client2@skillbridge.test', roles: ['client'],
  });
  const admin = await upsertUser({
    name: 'Admin', email: 'admin@skillbridge.test', roles: ['client', 'admin'],
  });

  const freelancers = [aisha, marcus, priya];
  const clients = [rahul, sophie];

  // ---------------------------------------------------------------- clean slate for demo users
  // Wipe anything previously seeded for these users so the script is safely re-runnable.
  const demoUserIds = [...freelancers, ...clients].map((u) => u._id);
  const oldGigs = await Gig.find({ owner: { $in: demoUserIds } }).select('_id');
  const oldJobs = await Job.find({ client: { $in: demoUserIds } }).select('_id');
  const oldContracts = await Contract.find({
    $or: [{ client: { $in: demoUserIds } }, { freelancer: { $in: demoUserIds } }],
  }).select('_id');
  const contractIds = oldContracts.map((c) => c._id);

  const oldConvos = await Conversation.find({ contract: { $in: contractIds } }).select('_id');
  await Message.deleteMany({ conversation: { $in: oldConvos.map((c) => c._id) } });
  await Conversation.deleteMany({ _id: { $in: oldConvos.map((c) => c._id) } });

  await Promise.all([
    Proposal.deleteMany({ job: { $in: oldJobs.map((j) => j._id) } }),
    Review.deleteMany({ contract: { $in: contractIds } }),
    Notification.deleteMany({ user: { $in: demoUserIds } }),
    Transaction.deleteMany({ contract: { $in: contractIds } }),
    Contract.deleteMany({ _id: { $in: contractIds } }),
    Gig.deleteMany({ _id: { $in: oldGigs.map((g) => g._id) } }),
    Job.deleteMany({ _id: { $in: oldJobs.map((j) => j._id) } }),
  ]);
  await Wallet.deleteMany({ user: { $in: demoUserIds } });

  // ---------------------------------------------------------------- gigs
  const gigDefs = [
    {
      owner: aisha, title: 'I will build a full-stack MERN web application', category: 'web-development',
      description: 'Custom MERN stack development with React, Node.js, Express, and MongoDB. Clean architecture, tested, and documented.',
      tags: ['react', 'node', 'mongodb', 'fullstack'],
      packages: [
        { tier: 'basic', price: 80, deliveryDays: 5, revisions: 1, features: ['Single page app', 'Basic API'] },
        { tier: 'standard', price: 200, deliveryDays: 10, revisions: 3, features: ['Multi-page app', 'Auth', 'Database'] },
        { tier: 'premium', price: 450, deliveryDays: 15, revisions: 5, features: ['Full app', 'Auth', 'Payments', 'Deployment'] },
      ],
    },
    {
      owner: aisha, title: 'I will fix bugs and optimize your React app performance', category: 'web-development',
      description: 'Fast, reliable bug fixes and performance tuning for existing React/Node codebases.',
      tags: ['react', 'debugging', 'performance'],
      packages: [
        { tier: 'basic', price: 35, deliveryDays: 2, revisions: 1, features: ['1 bug fix'] },
        { tier: 'standard', price: 90, deliveryDays: 4, revisions: 2, features: ['Up to 5 bug fixes'] },
        { tier: 'premium', price: 180, deliveryDays: 6, revisions: 3, features: ['Full audit + fixes'] },
      ],
    },
    {
      owner: marcus, title: 'I will design a modern responsive UI in Figma', category: 'design',
      description: 'Modern, clean, responsive UI/UX design for web and mobile apps using Figma.',
      tags: ['figma', 'ui', 'ux', 'design'],
      packages: [
        { tier: 'basic', price: 40, deliveryDays: 3, revisions: 1, features: ['3 screens'] },
        { tier: 'standard', price: 100, deliveryDays: 5, revisions: 2, features: ['8 screens', 'Design system'] },
        { tier: 'premium', price: 220, deliveryDays: 8, revisions: 4, features: ['Full app', 'Design system', 'Prototype'] },
      ],
    },
    {
      owner: marcus, title: 'I will create a brand identity and logo package', category: 'design',
      description: 'Complete brand identity including logo, color palette, and typography guide.',
      tags: ['branding', 'logo', 'identity'],
      packages: [
        { tier: 'basic', price: 50, deliveryDays: 3, revisions: 2, features: ['Logo only'] },
        { tier: 'standard', price: 130, deliveryDays: 6, revisions: 3, features: ['Logo + brand guide'] },
        { tier: 'premium', price: 280, deliveryDays: 10, revisions: 5, features: ['Full identity package'] },
      ],
    },
    {
      owner: priya, title: 'I will write SEO-optimized blog content', category: 'writing-translation',
      description: 'High-quality, SEO-optimized blog articles tailored to your niche.',
      tags: ['writing', 'seo', 'content'],
      packages: [
        { tier: 'basic', price: 20, deliveryDays: 2, revisions: 1, features: ['1 article, 500 words'] },
        { tier: 'standard', price: 50, deliveryDays: 4, revisions: 2, features: ['3 articles, 800 words each'] },
        { tier: 'premium', price: 120, deliveryDays: 7, revisions: 3, features: ['5 articles, 1000 words each'] },
      ],
    },
    {
      owner: priya, title: 'I will write product landing page copy that converts', category: 'digital-marketing',
      description: 'Conversion-focused landing page and ad copy for SaaS and product launches.',
      tags: ['copywriting', 'landing-page', 'conversion'],
      packages: [
        { tier: 'basic', price: 45, deliveryDays: 3, revisions: 1, features: ['1 landing page'] },
        { tier: 'standard', price: 110, deliveryDays: 5, revisions: 2, features: ['Landing page + 3 ad variants'] },
        { tier: 'premium', price: 240, deliveryDays: 8, revisions: 3, features: ['Full funnel copy'] },
      ],
    },
  ];

  const gigs = [];
  for (const g of gigDefs) {
    const gig = await Gig.create({
      owner: g.owner._id, title: g.title, category: cat(g.category), description: g.description,
      images: [], tags: g.tags, packages: g.packages, status: 'active',
    });
    gigs.push(gig);
  }

  // ---------------------------------------------------------------- jobs
  const jobDefs = [
    {
      client: rahul, title: 'Need a React developer to build an admin dashboard', category: 'web-development',
      description: 'Looking for an experienced React developer to build an admin dashboard with charts, tables, and role-based access.',
      skills: ['react', 'redux', 'mui'], budgetType: 'fixed', budget: 500, deadlineDays: 14,
    },
    {
      client: rahul, title: 'Mobile app UI/UX designer needed', category: 'design',
      description: 'Need a talented designer to create UI/UX for a fitness tracking mobile app.',
      skills: ['figma', 'mobile design'], budgetType: 'hourly', budget: 25, deadlineDays: 21,
    },
    {
      client: sophie, title: 'Digital marketing strategist for product launch', category: 'digital-marketing',
      description: 'Need a marketing expert to plan and execute a digital marketing strategy for our product launch.',
      skills: ['marketing', 'social media', 'seo'], budgetType: 'fixed', budget: 300, deadlineDays: 10,
    },
    {
      client: sophie, title: 'Backend API developer for e-commerce platform', category: 'web-development',
      description: 'Build REST APIs for an e-commerce platform: products, cart, checkout, and order management.',
      skills: ['node', 'express', 'mongodb'], budgetType: 'fixed', budget: 650, deadlineDays: 20,
    },
  ];

  const jobs = [];
  for (const j of jobDefs) {
    const job = await Job.create({
      client: j.client._id, title: j.title, category: cat(j.category), description: j.description,
      skills: j.skills, budgetType: j.budgetType, budget: j.budget,
      deadline: new Date(Date.now() + j.deadlineDays * 24 * 60 * 60 * 1000), status: 'open',
    });
    jobs.push(job);
  }
  const [dashboardJob, mobileDesignJob, marketingJob, backendJob] = jobs;

  // ---------------------------------------------------------------- proposals
  // A couple of freelancers competing for the same job — realistic "browse proposals" view.
  const proposalAisha = await submitProposal(dashboardJob._id, aisha._id, {
    coverLetter: "I've built several admin dashboards with React + MUI + role-based routing. Happy to walk through my approach.",
    bidAmount: 480, durationDays: 12,
  });
  await submitProposal(dashboardJob._id, marcus._id, {
    coverLetter: 'I can handle the dashboard UI/UX end to end and hand off clean, documented components.',
    bidAmount: 520, durationDays: 14,
  });
  const proposalPriyaMarketing = await submitProposal(marketingJob._id, priya._id, {
    coverLetter: 'I specialize in SaaS launch copy and channel strategy — I can put together a full plan this week.',
    bidAmount: 300, durationDays: 7,
  });
  await submitProposal(backendJob._id, aisha._id, {
    coverLetter: 'I build production Node/Express APIs regularly, including full e-commerce order flows.',
    bidAmount: 620, durationDays: 18,
  });

  // ---------------------------------------------------------------- fund client wallets
  await deposit(rahul._id, 3000);
  await deposit(sophie._id, 3000);

  // ---------------------------------------------------------------- contracts in different states
  // 1) Gig order, freelancer delivered, awaiting client approval.
  const contractAwaitingApproval = await createContractFromGig(rahul._id, gigs[0]._id, 'standard');
  const m1 = contractAwaitingApproval.milestones[0];
  await fundMilestone(contractAwaitingApproval._id, m1._id, rahul._id);
  await submitMilestone(contractAwaitingApproval._id, m1._id, aisha._id);

  // 2) Gig order, funded and in progress — freelancer hasn't delivered yet.
  const contractInProgress = await createContractFromGig(sophie._id, gigs[2]._id, 'basic');
  const m2 = contractInProgress.milestones[0];
  await fundMilestone(contractInProgress._id, m2._id, sophie._id);

  // 3) Gig order, fully completed, with two-way reviews.
  const contractCompletedGig = await createContractFromGig(rahul._id, gigs[4]._id, 'standard');
  const m3 = contractCompletedGig.milestones[0];
  await fundMilestone(contractCompletedGig._id, m3._id, rahul._id);
  await submitMilestone(contractCompletedGig._id, m3._id, priya._id);
  await approveMilestone(contractCompletedGig._id, m3._id, rahul._id);
  await createReview(contractCompletedGig._id, rahul._id, {
    rating: 5, comment: 'Fantastic turnaround and the copy read exactly like our brand voice. Highly recommend.',
  });
  await createReview(contractCompletedGig._id, priya._id, {
    rating: 5, comment: 'Clear brief, fast payment, great communication throughout.',
  });

  // 4) Job-hire contract, freshly awarded, milestone still pending funding.
  const contractPendingFund = await createContractFromJob(rahul._id, proposalAisha._id, [
    { title: 'Dashboard MVP — auth, layout, core tables', amount: 280, dueDate: new Date(Date.now() + 7 * 86400000) },
    { title: 'Charts, filters, and polish', amount: 200, dueDate: new Date(Date.now() + 14 * 86400000) },
  ]);

  // 5) Job-hire contract, fully completed, with two-way reviews.
  const contractCompletedJob = await createContractFromJob(sophie._id, proposalPriyaMarketing._id, null);
  const m5 = contractCompletedJob.milestones[0];
  await fundMilestone(contractCompletedJob._id, m5._id, sophie._id);
  await submitMilestone(contractCompletedJob._id, m5._id, priya._id);
  await approveMilestone(contractCompletedJob._id, m5._id, sophie._id);
  await createReview(contractCompletedJob._id, sophie._id, {
    rating: 4, comment: 'Solid strategy doc, would have liked a bit more detail on paid channels but overall great work.',
  });
  await createReview(contractCompletedJob._id, priya._id, {
    rating: 5, comment: 'Great client — clear goals and quick to give feedback.',
  });

  // ---------------------------------------------------------------- a couple of chat messages
  // The chat conversation is auto-created by createContractFromGig/Job; add a short exchange
  // on the "awaiting approval" contract so ChatBox has something to show immediately.
  const convo = await Conversation.findOne({ contract: contractAwaitingApproval._id });
  if (convo) {
    const msg1 = await Message.create({
      conversation: convo._id, sender: rahul._id,
      text: "Hey! Just checking in — how's the dashboard coming along?", readBy: [rahul._id],
    });
    const msg2 = await Message.create({
      conversation: convo._id, sender: aisha._id,
      text: "Just submitted the delivery — take a look and let me know if you'd like any tweaks!",
      readBy: [aisha._id],
    });
    convo.lastMessage = msg2.text;
    convo.lastMessageAt = msg2.createdAt;
    await convo.save();
  }

  // ---------------------------------------------------------------- summary
  console.log('Demo dataset seeded successfully.\n');
  console.log('Accounts (password for all: password123):');
  console.log('  Freelancer  demo.freelancer@skillbridge.test   (Aisha Khan — web dev)');
  console.log('  Freelancer  demo.designer@skillbridge.test     (Marcus Chen — design)');
  console.log('  Freelancer  demo.writer@skillbridge.test       (Priya Nair — writing/marketing)');
  console.log('  Client      demo.client@skillbridge.test       (Rahul Verma)');
  console.log('  Client      demo.client2@skillbridge.test      (Sophie Martin)');
  console.log('  Admin       admin@skillbridge.test              (roles: client, admin)');
  console.log('\nCreated:');
  console.log(`  ${categories.length} categories, ${gigs.length} gigs, ${jobs.length} jobs`);
  console.log('  4 proposals, 5 contracts (1 awaiting approval, 1 in progress, 1 pending funding, 2 completed w/ reviews)');
  console.log('  Client wallets funded with $3000 each, escrow/payout transactions recorded');
  console.log('  Notifications generated automatically via the real service layer');
  console.log('  1 chat conversation seeded with sample messages');

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('Seeding failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
