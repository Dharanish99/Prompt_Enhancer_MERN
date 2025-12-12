import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Template from '../models/Template.js';
import connectDB from '../config/db.js';

dotenv.config();

const proTemplates = [
  // ================= VISUALS =================
  {
    title: "Corporate Headshot Pro",
    category: "image",
    promptContent: "Professional corporate headshot of a [Subject] wearing [Attire], shot on 85mm lens f/1.8, bokeh [Background], soft studio lighting, rim light, high texture skin details, 8k, photorealistic --ar 4:5 --v 6.0",
    questions: [
      "Who is the subject? (e.g. Asian man, elderly woman)",
      "What are they wearing? (e.g. Navy suit, black turtleneck)",
      "What is the background setting? (e.g. Office window, grey studio)"
    ],
    modelConfig: "midjourney",
    previewImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop",
    tags: ["professional", "linkedin", "portrait"]
  },
  {
    title: "SaaS Landing Page UI",
    category: "image",
    promptContent: "High fidelity UI/UX design of a landing page for [Product], minimalist, clean layout, whitespace, [Color] color scheme, floating 3d elements, glassmorphism cards, figma style --ar 16:9 --v 6.0",
    questions: [
      "What is the product niche? (e.g. AI CRM, Yoga App)",
      "What is the primary color? (e.g. Electric Blue, Pastel Pink)"
    ],
    modelConfig: "midjourney",
    previewImage: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
    tags: ["ui", "web", "tech"]
  },
  {
    title: "Pixar 3D Character",
    category: "image",
    promptContent: "3D render of a [Character], Pixar animation style, Disney artstyle, subsurface scattering, expressive eyes, soft global illumination, octane render, 4k, cute personality.",
    questions: [
      "Describe the character (e.g. A baby dragon, a grumpy robot)",
      "What are they doing? (e.g. Holding a flower, running)"
    ],
    modelConfig: "dalle",
    previewImage: "https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=1000&auto=format&fit=crop",
    tags: ["3d", "cute", "character"]
  },
  {
    title: "Neo-Noir Cinematic Shot",
    category: "image",
    promptContent: "Cinematic shot of [Subject], neo-noir atmosphere, rain-slicked streets, reflecting neon signs, heavy shadows, high contrast, teal and orange color grading, shot on Arri Alexa --ar 21:9 --v 6.0",
    questions: [
      "What is happening in the scene?",
      "What specific neon colors do you want?"
    ],
    modelConfig: "midjourney",
    previewImage: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1000&auto=format&fit=crop",
    tags: ["cinematic", "dark", "neon"]
  },

  // ================= CODING =================
  {
    title: "React Component Architect",
    category: "code",
    promptContent: "Act as a Senior Frontend Engineer. Create a reusable React Functional Component for a [Component]. \nRequirements:\n1. Use TypeScript interfaces.\n2. Style using Tailwind CSS.\n3. Implement [Features].\n4. Include error handling.",
    questions: [
      "What component are we building? (e.g. Navbar, Modal)",
      "Any specific features needed? (e.g. Dark mode support, animation)"
    ],
    tags: ["react", "frontend", "typescript"]
  },
  {
    title: "Python FastAPI Endpoint",
    category: "code",
    promptContent: "Write a production-ready FastAPI endpoint for [Functionality]. \n- Input: Pydantic model validating [Fields].\n- Logic: [Logic Details].\n- Output: JSON response.",
    questions: [
      "What does this endpoint do? (e.g. User Login, Data Analysis)",
      "What data fields are required? (e.g. email, password)"
    ],
    tags: ["python", "backend", "api"]
  },

  // ================= WRITING =================
  {
    title: "Cold Email Outreach",
    category: "business",
    promptContent: "Draft a cold email to a [Role] at a [Industry] company.\nProduct: [Product].\nValue Proposition: [Benefit].\nFramework: AIDA.\nTone: Professional and concise.",
    questions: [
      "Target Audience Role? (e.g. CEO, Marketing Manager)",
      "What is your product? (e.g. SEO Services)",
      "What is the main benefit? (e.g. Double traffic in 30 days)"
    ],
    tags: ["sales", "marketing", "email"]
  },
  {
    title: "SEO Blog Post Generator",
    category: "writing",
    promptContent: "Write a 1500-word SEO-optimized blog post about [Topic].\nTarget Keywords: [Keywords].\nStructure: Catchy H1, Intro, H2/H3 headers, Conclusion.\nTone: [Tone].",
    questions: [
      "What is the blog topic?",
      "List 2-3 target keywords",
      "What is the tone? (e.g. Educational, Witty)"
    ],
    tags: ["seo", "content", "blog"]
  }
];

const seedDB = async () => {
  await connectDB();
  try {
    await Template.deleteMany();
    await Template.insertMany(proTemplates);
    console.log('✅ 8 Pro Templates with Questions Seeded!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();