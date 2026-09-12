import 'dotenv/config';
import mongoose from 'mongoose';
import Category from '../models/Category.js';

const categories = [
  { name: 'Web Development', slug: 'web-development' },
  { name: 'Mobile Development', slug: 'mobile-development' },
  { name: 'Design', slug: 'design' },
  { name: 'Writing & Translation', slug: 'writing-translation' },
  { name: 'Digital Marketing', slug: 'digital-marketing' },
  { name: 'Video & Animation', slug: 'video-animation' },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Category.deleteMany({});
  await Category.insertMany(categories);
  console.log('Categories seeded');
  await mongoose.disconnect();
};

run();