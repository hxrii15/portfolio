export type Education = {
  id: string;
  institution: string;
  degree: string;
  duration: string;
  current: boolean;
  institutionLink?: string;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  link: string;
  details: string;
};

export type BlogPost = {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  readTime: string;
  content: string;
};

export type HomeData = {
  name: string;
  roles: string[];
  description: string;
  profileImage: string;
};

export type Skill = {
  id: string;
  name: string;
  icon: string;
  description: string;
};

export type AboutData = {
  title: string;
  description: string;
  journeyTitle: string;
  journeyDescription1: string;
  journeyDescription2: string;
  skillsetTitle: string;
  aboutImage: string;
  skills: Skill[];
};

export type Poem = {
  id: string;
  title: string;
  author: string;
  image: string;
  poem: string;
};

export type Certificate = {
  id: string;
  name: string;
  provider: string;
  certificateId: string;
  issueDate: string;
  imageUrl?: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: number;
};
