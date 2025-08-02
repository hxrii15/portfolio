export const educationData = [
  {
    institution: 'University of Tech',
    degree: 'Master of Science in Computer Science',
    duration: '2022 - Present',
    logo: '/logo-ut.svg',
    current: true,
  },
  {
    institution: 'State College of Engineering',
    degree: 'Bachelor of Engineering in Information Technology',
    duration: '2018 - 2022',
    logo: '/logo-sce.svg',
  },
];

export const projectsData = [
  {
    title: 'AI-Powered Portfolio Assistant',
    description: 'An intelligent chatbot integrated into this portfolio to help visitors navigate and find information seamlessly. Built with Next.js and Google\'s Gemini.',
    image: 'https://placehold.co/600x400.png',
    tags: ['Next.js', 'TypeScript', 'GenAI', 'TailwindCSS'],
    link: '#',
    details: 'This project features a sophisticated AI assistant designed to enhance user experience. It leverages server actions and a custom UI to provide intuitive, conversational navigation. The backend is powered by Google\'s Gemini model for natural language understanding and response generation.'
  },
  {
    title: 'E-Commerce Analytics Dashboard',
    description: 'A comprehensive dashboard for visualizing sales data, customer behavior, and product performance for an e-commerce platform.',
    image: 'https://placehold.co/600x400.png',
    tags: ['React', 'D3.js', 'Node.js', 'PostgreSQL'],
    link: '#',
    details: 'The dashboard provides real-time insights through interactive charts and graphs. It features role-based access control, data export functionality, and a custom alerting system for key performance indicators.'
  },
  {
    title: 'Real-time Collaborative Whiteboard',
    description: 'A web-based whiteboard application that allows multiple users to draw and brainstorm together in real-time.',
    image: 'https://placehold.co/600x400.png',
    tags: ['Vue.js', 'WebSockets', 'Node.js', 'MongoDB'],
    link: '#',
    details: 'This application uses WebSockets for low-latency communication between clients. It supports various drawing tools, shape creation, and text annotations. The backend is built with Node.js and Express, with MongoDB for storing board states.'
  },
  {
    title: 'Mobile Fitness Tracker',
    description: 'An iOS and Android app to track workouts, monitor progress, and connect with a community of fitness enthusiasts.',
    image: 'https://placehold.co/600x400.png',
    tags: ['React Native', 'Firebase', 'GraphQL'],
    link: '#',
    details: 'The app integrates with device hardware like GPS and accelerometers to track activities. It uses Firebase for authentication and real-time database updates, and a GraphQL API for efficient data fetching.'
  },
];

export const blogData = [
  {
    title: 'The Rise of Server Components in Next.js',
    description: 'A deep dive into React Server Components and how they are changing the landscape of web development with Next.js.',
    image: 'https://placehold.co/600x400.png',
    tags: ['Next.js', 'React', 'Web Development'],
    readTime: '8 min read',
    content: '<h2>Introduction to Server Components</h2><p>React Server Components are a new paradigm that allows developers to write UI components that run exclusively on the server...</p>'
  },
  {
    title: 'Mastering TailwindCSS for Rapid UI Development',
    description: 'Practical tips and advanced techniques for building beautiful, responsive user interfaces with TailwindCSS.',
    image: 'https://placehold.co/600x400.png',
    tags: ['TailwindCSS', 'CSS', 'UI/UX'],
    readTime: '12 min read',
    content: '<h2>Why TailwindCSS?</h2><p>TailwindCSS provides a utility-first approach to styling, which can dramatically speed up development time...</p>'
  },
  {
    title: 'A Guide to choosing your first GenAI Model',
    description: 'Exploring the differences between major AI models like Gemini, GPT, and Claude, and how to choose the right one for your project.',
    image: 'https://placehold.co/600x400.png',
    tags: ['GenAI', 'Machine Learning', 'API'],
    readTime: '10 min read',
    content: '<h2>Understanding the AI Landscape</h2><p>The world of Generative AI is vast and growing. This guide helps you navigate it...</p>'
  }
];
