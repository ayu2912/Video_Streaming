require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const mongoose = require("mongoose");
const Video = require("./models/Video");

const allVideos = [
  // ── SPORTS ────────────────────────────────────────────────────
  { youtubeId: "5WJ0ZgZ6XK8", title: "Football Highlights", category: "sports", description: "Best goals and saves from this week's top football matches worldwide." },
  { youtubeId: "bNpx7gpSqbY", title: "Cricket Match", category: "sports", description: "Full match highlights from an intense cricket series between rival teams." },
  { youtubeId: "Ic8Y4vWbM6Q", title: "NBA Game", category: "sports", description: "Slam dunks, buzzer beaters and clutch plays from the NBA season." },
  { youtubeId: "3GwjfUFyY6M", title: "Tennis Finals", category: "sports", description: "Epic rallies and match points from a Grand Slam tennis final." },
  { youtubeId: "XIMLoLxmTDw", title: "Olympics Highlights", category: "sports", description: "Medal moments and record-breaking performances from the Olympic Games." },

  // ── MUSIC ─────────────────────────────────────────────────────
  { youtubeId: "kJQP7kiw5Fk", title: "Despacito", category: "music", description: "Luis Fonsi ft. Daddy Yankee — one of the most-viewed music videos ever." },
  { youtubeId: "OPf0YbXqDm0", title: "Uptown Funk", category: "music", description: "Mark Ronson ft. Bruno Mars — a feel-good funk anthem for the ages." },
  { youtubeId: "JGwWNGJdvx8", title: "Shape of You", category: "music", description: "Ed Sheeran's chart-topping love song with an irresistible beat." },
  { youtubeId: "3tmd-ClpJxA", title: "Counting Stars", category: "music", description: "OneRepublic's breakout hit blending pop, folk and soul." },
  { youtubeId: "l482T0yNkeo", title: "Sweet Child O Mine", category: "music", description: "Guns N' Roses classic rock masterpiece with an iconic guitar riff." },

  // ── DANCE ─────────────────────────────────────────────────────
  { youtubeId: "gOBEDDCyXMU", title: "World Dance Championship", category: "dance", description: "Elite crews compete in an electrifying world dance championship final." },
  { youtubeId: "MrV0z3rNpV4", title: "Hip Hop Battle", category: "dance", description: "Street dancers face off in raw, high-energy hip hop battles." },
  { youtubeId: "pRpeEdMmmQ0", title: "Bollywood Dance", category: "dance", description: "Vibrant Bollywood choreography full of colour, energy and expression." },
  { youtubeId: "LQZLGU9D2OI", title: "Ballet Performance", category: "dance", description: "A breathtaking classical ballet performance from a world-renowned company." },
  { youtubeId: "KQ6zr6kCPj8", title: "Salsa Showdown", category: "dance", description: "Passionate salsa dancers heat up the floor at an international competition." },

  // ── NEWS ──────────────────────────────────────────────────────
  { youtubeId: "HmZm8vNHBSU", title: "Global News Roundup", category: "news", description: "A comprehensive daily roundup of the most important stories from around the globe." },
  { youtubeId: "h406QGkeusc", title: "Breaking News Live", category: "news", description: "Live coverage and analysis of today's breaking news events." },
  { youtubeId: "6ZFbXIJkuI1", title: "World Report", category: "news", description: "In-depth reporting on international affairs and geopolitical developments." },
  { youtubeId: "Yn7Rc4PTXVA", title: "Tech News Today", category: "news", description: "Latest in technology: AI, gadgets, startups, and industry news." },
  { youtubeId: "MLpWqAx37cE", title: "Economy Update", category: "news", description: "Market analysis, economic indicators, and financial news for the week." },

  // ── GAMING ────────────────────────────────────────────────────
  { youtubeId: "mYfJxlgR2jw", title: "Esports Finals", category: "gaming", description: "World's best esports teams clash in the grand finals of a major tournament." },
  { youtubeId: "hY0mTcCFpxQ", title: "Minecraft Live", category: "gaming", description: "Creative builds, survival adventures, and community events in Minecraft." },
  { youtubeId: "GPQalxIuEoM", title: "Fortnite Tournament", category: "gaming", description: "Top Fortnite players battle it out for championship glory and prize money." },
  { youtubeId: "9D6Mq1aKmyY", title: "FIFA Gameplay", category: "gaming", description: "High-skill FIFA matches with pro-level tactics and stunning goals." },
  { youtubeId: "r88yfnMzPlk", title: "Call of Duty Highlights", category: "gaming", description: "Best plays, killstreaks, and clutch moments from Call of Duty." },

  // ── EDUCATION ─────────────────────────────────────────────────
  { youtubeId: "iG9CE55wbtY", title: "Do Schools Kill Creativity?", category: "education", description: "Sir Ken Robinson's iconic TED Talk challenging conventional education with humour and deep insight." },
  { youtubeId: "PHe0bXAIuk0", title: "How The Economic Machine Works", category: "education", description: "Ray Dalio explains how the economy works in simple terms — credit, debt cycles, and more." },
  { youtubeId: "sNhhvQGsMEc", title: "The Fermi Paradox", category: "education", description: "Kurzgesagt explores why, if the universe is so vast, we haven't found alien life yet." },
  { youtubeId: "aircAruvnKk", title: "But What Is a Neural Network?", category: "education", description: "3Blue1Brown breaks down neural networks and deep learning with beautiful visual explanations." },
  { youtubeId: "UF8uR6Z6KLc", title: "Steve Jobs Stanford Commencement", category: "education", description: "Steve Jobs shares three powerful life stories at Stanford University's 2005 commencement." },

  // ── COMEDY ────────────────────────────────────────────────────
  { youtubeId: "LsoLEjrDogU", title: "East-West Bowl Sketch", category: "comedy", description: "Key & Peele's hilarious take on over-the-top college football player names." },
  { youtubeId: "puDqBSGTEJU", title: "Rowan Atkinson at Oxford Union", category: "comedy", description: "The brilliant Mr. Bean actor delivers a side-splitting speech at the Oxford Union." },
  { youtubeId: "pD-J8nUxUFk", title: "Glitter Bomb Prank", category: "comedy", description: "Mark Rober's glitter bomb trap for package thieves — with hilarious caught-on-camera reactions." },
  { youtubeId: "txqiwrbYGrs", title: "David After Dentist", category: "comedy", description: "A classic viral video of a young boy hilariously loopy after a trip to the dentist." },
  { youtubeId: "a1Y73sPHKxw", title: "Dramatic Chipmunk", category: "comedy", description: "The legendary five-second clip that became one of the internet's earliest and greatest memes." },

  // ── VLOGS ─────────────────────────────────────────────────────
  { youtubeId: "jNQXAC9IVRw", title: "Me at the Zoo", category: "vlogs", description: "The very first video ever uploaded to YouTube, by co-founder Jawed Karim at San Diego Zoo." },
  { youtubeId: "hMtZfW2z9dw", title: "Tokyo Day in My Life", category: "vlogs", description: "A cinematic vlog exploring the streets, food stalls, and hidden gems of Tokyo for a full day." },
  { youtubeId: "aBr2kKAHN6A", title: "NYC Street Food Tour", category: "vlogs", description: "Exploring New York City's best street food spots — hot dogs, dumplings, and much more." },
  { youtubeId: "l1a2N_sWD6o", title: "Morning Routine 2024", category: "vlogs", description: "A calm and productive morning routine with journaling, a workout, and a home-cooked breakfast." },
  { youtubeId: "X3paOmcrTjQ", title: "Road Trip Across America", category: "vlogs", description: "Epic cross-country road trip through national parks, quirky small towns, and open highways." },

  // ── ART & CRAFT ───────────────────────────────────────────────
  { youtubeId: "7TXEZ4tP06c", title: "Realistic Portrait Drawing", category: "art", description: "Step-by-step tutorial for drawing a hyper-realistic portrait using graphite pencils." },
  { youtubeId: "WCSZfGiqPMY", title: "Watercolour Landscape", category: "art", description: "A soothing watercolour session painting a serene mountain lake at golden hour." },
  { youtubeId: "9Sqkr2pC0d4", title: "Origami Masterclass", category: "art", description: "Learn to fold intricate origami animals and geometric shapes with a world champion." },
  { youtubeId: "0AJLLMhBDeI", title: "Acrylic Pour Painting", category: "art", description: "Mesmerising fluid acrylic pour technique creating stunning abstract art on canvas." },
  { youtubeId: "6x5YIh9OLAE", title: "DIY Resin Craft", category: "art", description: "Create beautiful epoxy resin jewellery and home décor pieces completely from scratch." },

  // ── BEAUTY ────────────────────────────────────────────────────
  { youtubeId: "ZJOcT0wXJKY", title: "The Power of Makeup", category: "beauty", description: "NikkieTutorials' iconic half-face transformation that inspired the global #powerofmakeup movement." },
  { youtubeId: "eBuNaqc1KJY", title: "Smokey Eye Tutorial", category: "beauty", description: "Master the classic smokey eye look with expert blending tips that work for every eye shape." },
  { youtubeId: "LO-V39fYPrw", title: "10-Step Skincare Routine", category: "beauty", description: "A complete morning and night skincare routine for achieving healthy, glowing skin." },
  { youtubeId: "4e2YS7ejlLo", title: "Natural Everyday Makeup", category: "beauty", description: "A quick five-minute natural makeup look perfect for work, school, or casual outings." },
  { youtubeId: "Y4SHhpFE7RM", title: "Hair Colour at Home", category: "beauty", description: "How to safely dye your hair at home and achieve a salon-worthy result on a budget." },
];

const NEW_CATEGORIES = ["education", "comedy", "vlogs", "art", "beauty"];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    // Check which new categories are missing
    const existing = await Video.distinct("category");
    const missing = NEW_CATEGORIES.filter((c) => !existing.includes(c));

    if (missing.length === 0) {
      console.log("All categories already seeded. No changes made.");
      console.log("To re-seed everything, run: node seed.js --fresh");
    } else if (process.argv.includes("--fresh")) {
      // Full re-seed: wipe and insert all
      await Video.deleteMany({});
      await Video.insertMany(allVideos);
      console.log(`Fresh seed complete — inserted ${allVideos.length} videos across ${[...new Set(allVideos.map(v => v.category))].length} categories.`);
    } else {
      // Only insert missing categories
      const toInsert = allVideos.filter((v) => missing.includes(v.category));
      await Video.insertMany(toInsert);
      console.log(`Added ${toInsert.length} videos for: ${missing.join(", ")}`);
    }

    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
