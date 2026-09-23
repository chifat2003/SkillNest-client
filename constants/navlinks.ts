export interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Find Freelancers", href: "/freelancers" },
  { label: "Find Projects", href: "/projects" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About", href: "/about" },
];
