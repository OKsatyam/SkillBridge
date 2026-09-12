import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Gig from '../models/Gig.js';
import Job from '../models/Job.js';

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const categories = await Category.find();
  if (categories.length === 0) {
    console.log('No categories found — run category.seed.js first.');
    process.exit(1);
  }
  const findCat = (slug) => categories.find((c) => c.slug === slug) || categories[0];

  let freelancer = await User.findOne({ email: 'demo.freelancer@skillbridge.test' });
  if (!freelancer) {
    freelancer = await User.create({
      name: 'Aisha Khan',
      email: 'demo.freelancer@skillbridge.test',
      password: 'password123',
      roles: ['client', 'freelancer'],
      bio: 'Full-stack developer specializing in MERN apps.',
      skills: ['React', 'Node.js', 'MongoDB'],
    });
  }

  let client = await User.findOne({ email: 'demo.client@skillbridge.test' });
  if (!client) {
    client = await User.create({
      name: 'Rahul Verma',
      email: 'demo.client@skillbridge.test',
      password: 'password123',
      roles: ['client'],
    });
  }

  await Gig.deleteMany({ owner: freelancer._id });
  await Job.deleteMany({ client: client._id });

  const gigs = [
    {
      owner: freelancer._id,
      title: 'I will build a full-stack MERN web application',
      category: findCat('web-development')._id,
      description: 'Custom MERN stack development with React, Node.js, Express, and MongoDB. Clean architecture, tested, and documented.',
      images: [],
      tags: ['react', 'node', 'mongodb', 'fullstack'],
      packages: [
        { tier: 'basic', price: 80, deliveryDays: 5, revisions: 1, features: ['Single page app', 'Basic API'] },
        { tier: 'standard', price: 200, deliveryDays: 10, revisions: 3, features: ['Multi-page app', 'Auth', 'Database'] },
        { tier: 'premium', price: 450, deliveryDays: 15, revisions: 5, features: ['Full app', 'Auth', 'Payments', 'Deployment'] },
      ],
      status: 'active',
    },
    {
      owner: freelancer._id,
      title: 'I will design a modern responsive UI in Figma',
      category: findCat('design')._id,
      description: 'Modern, clean, responsive UI/UX design for web and mobile apps using Figma.',
      images: [],
      tags: ['figma', 'ui', 'ux', 'design'],
      packages: [
        { tier: 'basic', price: 40, deliveryDays: 3, revisions: 1, features: ['3 screens'] },
        { tier: 'standard', price: 100, deliveryDays: 5, revisions: 2, features: ['8 screens', 'Design system'] },
        { tier: 'premium', price: 220, deliveryDays: 8, revisions: 4, features: ['Full app', 'Design system', 'Prototype'] },
      ],
      status: 'active',
    },
    {
      owner: freelancer._id,
      title: 'I will write SEO-optimized blog content',
      category: findCat('writing-translation')._id,
      description: 'High-quality, SEO-optimized blog articles tailored to your niche.',
      images: [],
      tags: ['writing', 'seo', 'content'],
      packages: [
        { tier: 'basic', price: 20, deliveryDays: 2, revisions: 1, features: ['1 article, 500 words'] },
        { tier: 'standard', price: 50, deliveryDays: 4, revisions: 2, features: ['3 articles, 800 words each'] },
        { tier: 'premium', price: 120, deliveryDays: 7, revisions: 3, features: ['5 articles, 1000 words each'] },
      ],
      status: 'active',
    },
  ];

  const jobs = [
    {
      client: client._id,
      title: 'Need a React developer to build an admin dashboard',
      category: findCat('web-development')._id,
      description: 'Looking for an experienced React developer to build an admin dashboard with charts, tables, and role-based access.',
      skills: ['react', 'redux', 'mui'],
      budgetType: 'fixed',
      budget: 500,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'open',
    },
    {
      client: client._id,
      title: 'Mobile app UI/UX designer needed',
      category: findCat('design')._id,
      description: 'Need a talented designer to create UI/UX for a fitness tracking mobile app.',
      skills: ['figma', 'mobile design'],
      budgetType: 'hourly',
      budget: 25,
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      status: 'open',
    },
    {
      client: client._id,
      title: 'Digital marketing strategist for product launch',
      category: findCat('digital-marketing')._id,
      description: 'Need a marketing expert to plan and execute a digital marketing strategy for our product launch.',
      skills: ['marketing', 'social media', 'seo'],
      budgetType: 'fixed',
      budget: 300,
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: 'open',
    },
  ];

  await Gig.insertMany(gigs);
  await Job.insertMany(jobs);

  console.log('Demo gigs and jobs seeded.');
  console.log('Freelancer login: demo.freelancer@skillbridge.test / password123');
  console.log('Client login: demo.client@skillbridge.test / password123');

  await mongoose.disconnect();
};

run();
