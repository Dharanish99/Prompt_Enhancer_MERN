import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Template from './models/Template.js'; 
import connectDB from './config/db.js';

dotenv.config();

const templates = [
  // ==============================================================================
  // 1. VISUAL ENGINE (Image Generation) - CONCRETE EXAMPLES
  // ==============================================================================
  {
    title: "Cinematic 8K Portrait",
    description: "Ultra-realistic photography style for character portraits.",
    category: "image",
    tags: ["photography", "realistic", "portrait", "8k"],
    promptContent: "A hyper-realistic close-up portrait of an elderly cybernetic watchmaker, shot on 35mm Kodak Portra 400, cinematic lighting revealing intricate clockwork gears inside his glass eye, shallow depth of field, bokeh workshop background, highly detailed skin pores and metal textures, sharp focus, 8k resolution, dramatic chiaroscuro lighting.",
    previewImage: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Cyberpunk Cityscape",
    description: "Futuristic neon-noir environment design.",
    category: "image",
    tags: ["sci-fi", "neon", "environment", "concept art"],
    promptContent: "A futuristic cyberpunk city street in Neo-Tokyo 2099 at midnight, rain-slicked asphalt reflecting holographic advertisements, massive brutalist skyscrapers connected by sky-bridges, volumetric blue fog, pedestrians with glowing tech-wear, teal and orange color palette, Unreal Engine 5 render, ray tracing, wide angle lens.",
    previewImage: "https://images.unsplash.com/photo-1515630278258-407f66498911?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Ghibli Style Landscape",
    description: "Whimsical, hand-painted anime style.",
    category: "image",
    tags: ["anime", "ghibli", "art", "illustration"],
    promptContent: "A whimsical anime landscape of a cozy cottage nestled in a rolling green valley, Studio Ghibli art style, fluffy cumulus clouds in a bright blue sky, vibrant lush grass swaying in the wind, wildflowers, hand-painted watercolor textures, peaceful atmosphere, detailed background art by Hayao Miyazaki, masterpiece.",
    previewImage: "https://media.indulgexpress.com/indulgexpress%2F2025-03-29%2F0sx96stc%2FGm90d49bYAEyO0T.jpg?rect=0%2C224%2C1024%2C576&w=480&auto=format%2Ccompress&fit=max"
  },
  {
    title: "Minimalist Tech Logo",
    description: "Clean, vector-style logo design for tech brands.",
    category: "image",
    tags: ["logo", "vector", "minimalist", "branding"],
    promptContent: "A minimalist vector logo design for an AI Cloud Startup named 'Nebula', featuring a stylized abstract cloud combined with a circuit board pattern, flat design, geometric shapes, negative space, matte white background, Paul Rand style, clean lines, high contrast, scalable vector graphics, sans-serif typography.",
    previewImage: "https://img.freepik.com/free-vector/abstract-company-logo_53876-120501.jpg?semt=ais_hybrid&w=740&q=80"
  },
  {
    title: "Pixar 3D Character",
    description: "Cute, expressive 3D character render.",
    category: "image",
    tags: ["3d", "pixar", "cute", "character"],
    promptContent: "A cute 3D rendered character of a baby dragon learning to breathe fire, Pixar animation style, subsurface scattering on scales, expressive big eyes, soft studio lighting, clay render texture, 4k resolution, octane render, Cinema 4D, adorable expression.",
    previewImage: "https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Dark Fantasy Oil Painting",
    description: "Moody, classical art style for fantasy concepts.",
    category: "image",
    tags: ["fantasy", "painting", "dark", "rpg"],
    promptContent: "An oil painting of a fallen knight kneeling before a glowing eldritch shrine in a dark forest, dark fantasy style, influences of Frank Frazetta and Greg Rutkowski, heavy impasto brushstrokes, dramatic chiaroscuro lighting, ominous atmosphere, detailed armor rust and moss textures, magical particles.",
    previewImage: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Product Photography (Luxury)",
    description: "High-end commercial product shot.",
    category: "image",
    tags: ["product", "commercial", "luxury", "advertising"],
    promptContent: "Professional product photography of a gold-rimmed perfume bottle, placed on a white marble podium, surrounded by white silk drapes, soft luxury studio lighting, neutral beige background, golden accents, sharp focus, advertising standard, 8k resolution, elegant composition.",
    previewImage: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Retro Vaporwave Aesthetic",
    description: "1980s synthwave and nostalgic digital art.",
    category: "image",
    tags: ["retro", "vaporwave", "80s", "digital art"],
    promptContent: "Vaporwave aesthetic artwork of a Roman statue bust wearing virtual reality goggles, floating against a pink and purple neon grid background, glitched VHS effects, 1980s computer graphics style, palm trees, geometric shapes, nostalgic lo-fi atmosphere, synthwave album cover.",
    previewImage: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Isometric 3D Room",
    description: "Cute low-poly isometric room design.",
    category: "image",
    tags: ["isometric", "3d", "low poly", "cute"],
    promptContent: "A cute isometric 3D room design of a cozy gamer bedroom at night, pastel color palette with neon accents, soft lighting from a computer screen, blender render, low poly aesthetic, cozy atmosphere, detailed tiny furniture, bean bag, potted plants, orthographic view.",
    previewImage: "https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Double Exposure Nature",
    description: "Artistic double exposure silhouette.",
    category: "image",
    tags: ["art", "abstract", "nature", "silhouette"],
    promptContent: "Double exposure art combining a side-profile silhouette of a woman with a dense pine forest in winter, white background, high contrast, intricate details, branches blending into hair, dreamlike quality, fine art photography, monochrome with blue tint.",
    previewImage: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=800&q=80"
  },

  // ==============================================================================
  // 2. CODE ARCHITECT (Development) - CONCRETE TASKS
  // ==============================================================================
  {
    title: "React Functional Component",
    description: "Generates a clean, modern React component with props.",
    category: "code",
    tags: ["react", "javascript", "frontend", "component"],
    promptContent: "Create a modern, reusable React functional component named 'HeroSection'. It should accept 'title', 'subtitle', and 'onCtaClick' as props. Use Tailwind CSS for a full-screen gradient background styling. Include PropTypes for validation, a default prop for the subtitle, and a JSDoc comment explaining usage. Ensure it is fully responsive on mobile."
  },
  {
    title: "API Endpoint (Node/Express)",
    description: "Secure, async Express route handler.",
    category: "code",
    tags: ["node", "express", "backend", "api"],
    promptContent: "Write a secure Node.js Express API endpoint for 'POST /api/users/register'. The handler should: 1. Validate email and password strength using Zod. 2. Hash the password using bcrypt. 3. Save the user to MongoDB using Mongoose. 4. Return a JWT token in the response. Use async/await and a try-catch block for proper error handling."
  },
  {
    title: "Python Data Analysis Script",
    description: "Pandas script for cleaning and analyzing data.",
    category: "code",
    tags: ["python", "pandas", "data science", "analysis"],
    promptContent: "Write a Python script using Pandas to analyze a CSV file named 'sales_data.csv'. The script should: 1. Load the data. 2. Remove rows with missing 'price' values. 3. Group by 'product_category' and calculate the total revenue. 4. Plot a bar chart of revenue by category using Seaborn. Add detailed comments explaining each step."
  },
  {
    title: "Unit Test Generator (Jest)",
    description: "Generates comprehensive test cases for a function.",
    category: "code",
    tags: ["testing", "jest", "unit test", "qa"],
    promptContent: "Write a comprehensive Jest unit test suite for a function named 'calculateShippingCost(weight, destination)'. Include specific test cases for: 1. Standard weight within US (valid). 2. Heavy weight (surcharge applied). 3. International destination (customs fee). 4. Invalid inputs (negative weight). Mock any external service calls."
  },
  {
    title: "SQL Query Optimizer",
    description: "Optimizes complex SQL queries for performance.",
    category: "code",
    tags: ["sql", "database", "optimization", "performance"],
    promptContent: "Optimize the following SQL query for better performance on a PostgreSQL database with 1 million rows: 'SELECT * FROM orders WHERE user_id IN (SELECT id FROM users WHERE region = 'US')'. Suggest replacing the subquery with a JOIN, adding indexes on 'user_id' and 'region', and explain why these changes reduce execution time."
  },
  {
    title: "Regex Generator",
    description: "Creates complex Regular Expressions.",
    category: "code",
    tags: ["regex", "parsing", "validation", "utils"],
    promptContent: "Write a robust Regular Expression (Regex) to match standard IPv4 addresses (e.g., 192.168.0.1). Ensure it validates that each number block is between 0 and 255. Explain the logic of the regex components (capture groups, range checks) step-by-step. Provide 3 valid examples and 3 invalid examples."
  },
  {
    title: "CSS Grid Layout",
    description: "Generates a responsive grid layout.",
    category: "code",
    tags: ["css", "frontend", "layout", "responsive"],
    promptContent: "Create a responsive CSS Grid layout for an 'Image Gallery' section. It should have 4 columns on desktop (1200px+), 2 columns on tablet (768px+), and 1 column on mobile. Use 'grid-template-columns' with 'minmax', and add a 1rem gap between items. Provide both the HTML structure and the CSS classes."
  },
  {
    title: "Docker Compose Setup",
    description: "Sets up a multi-container Docker environment.",
    category: "code",
    tags: ["docker", "devops", "container", "setup"],
    promptContent: "Create a production-ready `docker-compose.yml` file to set up a full stack environment. Service 1: A Node.js API (port 5000). Service 2: A PostgreSQL database (port 5432) with a persistent volume for data. Service 3: Redis cache. Include environment variables for DB credentials and define a custom network to link them."
  },
  {
    title: "Git Commit Message Formatter",
    description: "Writes conventional commit messages.",
    category: "code",
    tags: ["git", "version control", "productivity"],
    promptContent: "Refactor the following code change summary into a standard Conventional Commit message: 'I fixed the bug where the login button was crashing on mobile and also added some blue styling to the header'. The format should be 'fix(auth): prevent crash on mobile login' with a body explaining the style changes. Follow the Angular commit convention."
  },
  {
    title: "Algorithm Explanation",
    description: "Explains complex algorithms simply.",
    category: "code",
    tags: ["algorithm", "computer science", "learning"],
    promptContent: "Explain the 'Dijkstra's Shortest Path' algorithm to a junior developer. Use a real-world analogy involving a road trip map to describe how it works. Then, provide a clean, commented implementation in Python using a priority queue (heapq) to find the shortest path in a weighted graph."
  },

  // ==============================================================================
  // 3. BUSINESS SUITE - CONCRETE SCENARIOS
  // ==============================================================================
  {
    title: "Cold Email Outreach",
    description: "High-conversion cold email for B2B sales.",
    category: "business",
    tags: ["email", "sales", "marketing", "b2b"],
    promptContent: "Write a cold outreach email to a Marketing Director at a mid-sized E-commerce brand. Pitch an AI-powered Chatbot service as a solution to their high customer support costs. Keep it under 150 words. Use the PAS framework (Problem: Low retention, Agitation: Losing revenue, Solution: Our AI Chatbot). Tone: Professional, concise, and value-driven."
  },
  {
    title: "SEO Blog Post Generator",
    description: "Full SEO-optimized article structure.",
    category: "business",
    tags: ["seo", "content", "marketing", "blog"],
    promptContent: "Write a comprehensive, SEO-optimized blog post about 'The Future of Remote Work'. Target keyword: 'Hybrid Work Models'. Include a catchy H1, three H2 subheaders (Benefits, Challenges, Tools), and a conclusion with a Call to Action to subscribe to the newsletter. Use short paragraphs and bullet points. Tone: Authoritative and data-backed."
  },
  {
    title: "Pitch Deck Slide Content",
    description: "Content for a startup pitch deck slide.",
    category: "business",
    tags: ["startup", "pitch", "funding", "presentation"],
    promptContent: "Draft the content for the 'Problem Statement' slide of a pitch deck for a new Food Delivery Startup. Use 3 punchy bullet points to describe the issue (e.g., High fees, Slow delivery, Cold food). Include a placeholder for a key market statistic (e.g., '60% of customers hate fees') and a 'Bottom Line' summary sentence."
  },
  {
    title: "Product Description (E-com)",
    description: "Persuasive copy for online products.",
    category: "business",
    tags: ["ecommerce", "copywriting", "sales", "product"],
    promptContent: "Write a persuasive product description for a 'Noise-Cancelling Wireless Headset'. Target audience: Remote Workers and Gamers. Highlight these features: 30-hour battery life, active noise cancellation, and memory foam earcups. Focus on benefits (e.g., 'Focus anywhere' instead of just 'ANC'). Tone: Exciting and premium."
  },
  {
    title: "LinkedIn Thought Leadership",
    description: "Viral-style LinkedIn post.",
    category: "business",
    tags: ["linkedin", "social media", "personal branding"],
    promptContent: "Write a LinkedIn post about 'Why Multitasking is a Myth'. Start with a controversial hook ('Stop wearing busy like a badge of honor'). Use a storytelling format about a time you burned out. Use short, punchy sentences. Include a 'Key Takeaway' about deep work and ask a specific question to drive comments."
  },
  {
    title: "Job Description",
    description: "Clear and attractive JD for hiring.",
    category: "business",
    tags: ["hr", "hiring", "management", "job"],
    promptContent: "Write a job description for a 'Senior UI/UX Designer' role at a fast-paced Fintech Startup. Responsibilities include: Prototyping in Figma, User Research, and Design System maintenance. Requirements: 5+ years experience, Portfolio required. Emphasize the collaborative culture and remote-first perks to attract top talent."
  },
  {
    title: "Customer Support Response",
    description: "Empathetic reply to a complaint.",
    category: "business",
    tags: ["support", "service", "email", "communication"],
    promptContent: "Draft an empathetic email response to a VIP customer who received a damaged package. Acknowledge the mistake immediately, apologize sincerely without making excuses, offer a full replacement plus a 20% discount code for the next order, and reassure them that shipping protocols have been reviewed. Tone: Warm, polite, and helpful."
  },
  {
    title: "SWOT Analysis",
    description: "Strategic planning framework.",
    category: "business",
    tags: ["strategy", "planning", "analysis", "management"],
    promptContent: "Conduct a SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats) for a local 'Artisanal Coffee Shop' competing with big chains. Strengths: Quality, Community. Weaknesses: Price, Speed. Opportunities: Online bean sales. Threats: Rent hikes. Provide 3 bullet points for each quadrant."
  },
  {
    title: "Mission Statement Generator",
    description: "Inspiring brand vision statements.",
    category: "business",
    tags: ["branding", "vision", "startup", "identity"],
    promptContent: "Create 3 distinct Mission Statement options for a 'Sustainable Fashion Brand' that values ethical labor and recycled materials. Option 1: Short & Punchy (Nike style). Option 2: Descriptive & Emotional (Patagonia style). Option 3: Future-Focused (Tesla style). Explain the vibe of each."
  },
  {
    title: "Meeting Agenda",
    description: "Structured agenda for productive meetings.",
    category: "business",
    tags: ["management", "productivity", "meeting"],
    promptContent: "Create a structured agenda for a 45-minute 'Quarterly Marketing Review' meeting. Attendees: CMO, Content Lead, Ad Specialist. Include specific time slots: 5min Intro, 15min Data Review (ROI/CPC), 15min Strategy Brainstorming for Q3, and 10min Action Items assignment. Ensure the tone is focused on results."
  },

  // ==============================================================================
  // 4. WRITING & EDITING - CONCRETE TASKS
  // ==============================================================================
  {
    title: "Story Plot Outline",
    description: "Hero's Journey structure for fiction.",
    category: "writing",
    tags: ["fiction", "storytelling", "creative writing"],
    promptContent: "Create a detailed story outline for a Dystopian Sci-Fi novel using the Hero's Journey framework. Protagonist: A memory archivist who finds a forbidden file. Goal: Expose the government's lies. Setting: A subterranean mega-city. Outline the 12 stages from the 'Ordinary World' to the 'Return with the Elixir'."
  },
  {
    title: "Essay Polisher",
    description: "Improves flow and vocabulary of academic text.",
    category: "writing",
    tags: ["academic", "editing", "essay", "school"],
    promptContent: "Rewrite the following paragraph to improve flow, vocabulary, and academic tone. Remove passive voice. Text to rewrite: 'The experiment was done by the students and the results were found to be good. It is thought that the temperature had an effect on the reaction speed.' Make it sound professional and authoritative."
  },
  {
    title: "YouTube Video Script",
    description: "Engaging script with hooks and CTAs.",
    category: "writing",
    tags: ["youtube", "video", "script", "content creator"],
    promptContent: "Write a script for a 5-minute YouTube video titled 'How to Learn Coding in 2024'. Structure: 1. Hook (0-30s): 'Stop wasting time on tutorials'. 2. Intro Animation. 3. The 'Meat': Step 1 (Pick a language), Step 2 (Build projects), Step 3 (Contribute to Open Source). 4. Conclusion and Call to Action (Subscribe for more). Tone: High energy and encouraging."
  },
  {
    title: "Grammar & Style Fixer",
    description: "Corrects errors and standardizes style.",
    category: "writing",
    tags: ["editing", "grammar", "proofreading"],
    promptContent: "Proofread the following text for grammar, spelling, and punctuation errors. Also, suggest improvements for clarity. Text: 'Their going to the park, to see the dogs running loose. Its a beautiful day exept for the clouds.' List every correction made and explain why."
  },
  {
    title: "Haiku Generator",
    description: "Creates Japanese style poetry.",
    category: "writing",
    tags: ["poetry", "creative", "short"],
    promptContent: "Write a traditional Haiku (5-7-5 syllables) about 'The First Snow of Winter'. Focus on imagery related to silence and the color white. Avoid abstract concepts; show the scene through sensory details (cold, quiet, falling)."
  },
  {
    title: "Character Profile",
    description: "Deep character sheet for writers.",
    category: "writing",
    tags: ["character", "fiction", "worldbuilding"],
    promptContent: "Create a detailed character profile for the Antagonist of a Fantasy Novel. Role: A Corrupt High Priest. Name: Malachai. Include: Appearance (robes, scars), Key Personality Traits (manipulative, pious), Backstory Trauma (orphan raised by cult), Motivation (order through tyranny), and a Secret weakness."
  },
  {
    title: "TL;DR Summarizer",
    description: "Condenses long text into bullet points.",
    category: "writing",
    tags: ["summary", "productivity", "reading"],
    promptContent: "Summarize the concept of 'Quantum Entanglement' into a 'Too Long; Didn't Read' (TL;DR) format. Provide the main idea in one simple sentence, followed by 3 key bullet points capturing the most important details (spooky action at a distance, state correlation, applications). Keep it accessible to a layperson."
  },
  {
    title: "Screenplay Dialogue",
    description: "Realistic dialogue formatting.",
    category: "writing",
    tags: ["screenwriting", "movie", "script"],
    promptContent: "Write a scene of dialogue between a Detective (gritty, tired) and a Suspect (nervous, lying) in an interrogation room. Conflict: The detective found the suspect's fingerprints. Use standard Screenplay format (Scene Heading: INT. INTERROGATION ROOM - NIGHT). Include parentheticals for actions (slams table, wipes sweat)."
  },
  {
    title: "Metaphor Machine",
    description: "Explains concepts using analogies.",
    category: "writing",
    tags: ["creative", "learning", "explanation"],
    promptContent: "Give me 3 creative metaphors to explain the concept of 'API (Application Programming Interface)' to a non-technical business owner. 1. The Restaurant Waiter analogy. 2. The Power Outlet analogy. 3. The Universal Remote analogy. Explain each briefly."
  },
  {
    title: "Press Release",
    description: "Standard PR format for news.",
    category: "writing",
    tags: ["pr", "news", "business", "media"],
    promptContent: "Draft a formal Press Release for a startup named 'GreenTech' announcing their Series A funding of $10M led by 'Future Ventures'. Include: FOR IMMEDIATE RELEASE, Headline, Dateline (San Francisco), Body Paragraphs (Mission to clean oceans, how funds will be used), Quote from the CEO, and Boilerplate 'About Us' section."
  }
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log('✅ Database Connected. Clearing old templates...');
    await Template.deleteMany({});
    console.log('🌱 Injecting 40 Elite, Ready-to-Use Templates...');
    await Template.insertMany(templates);
    console.log('🎉 Success! Database seeded.');
    process.exit();
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDB();