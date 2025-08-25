export type Education = {
  id: string;
  institution: string;
  degree: string;
  duration: string;
  current: boolean;
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
