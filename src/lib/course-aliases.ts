// Course name aliases for better calendar display
export const COURSE_ALIASES: Record<string, string> = {
  // Math
  "Calc BC": "AP Calculus BC",
  "Calc AB": "AP Calculus AB",
  "Calc 3": "AP Calculus 3",
  "HMA": "Honors Math Analysis",
  "IM1": "Integrated Math 1",
  "IM2": "Integrated Math 2",
  "IM3": "Integrated Math 3",
  "IM 2B/3": "Integrated Math 2B/3",
  "IM1/2A": "Integrated Math 1/2A",
  "Stats": "Statistics",
  "H Stats": "Honors Statistics",
  "Fin Lit": "Financial Literacy",
  "MA": "Math Analysis",
  
  // English
  "English 1-2": "English 1-2",
  "English 3-4": "English 3-4",
  "English 5-6": "English 5-6",
  "English 7-8": "English 7-8",
  "H English 3-4": "Honors English 3-4",
  "H English 5-6": "Honors English 5-6",
  "AP Lit": "AP English Literature",
  "AP Seminar": "AP Seminar",
  "AP Research": "AP Research",
  "Creative/Public": "Creative Writing/Public Speaking",
  "Journalism": "Journalism",
  
  // Science
  "H Chem": "Honors Chemistry",
  "AP Chem": "AP Chemistry",
  "AP Biology": "AP Biology",
  "AP Physics": "AP Physics",
  "H Physics": "Honors Physics",
  "APES": "AP Environmental Science",
  "Anatomy/Phys": "Anatomy & Physiology",
  "Guitar Eng": "Guitar Engineering",
  "Entomology": "Entomology",
  
  // Social Studies
  "MWH": "Modern World History",
  "H MWH": "Honors Modern World History",
  "US History": "United States History",
  "APUSH": "AP United States History",
  "Civics/Econ": "Civics/Economics",
  "World Cultures": "World Cultures",
  "Psychology": "Psychology",
  "Dir Studies": "Directed Studies",
  
  // Languages
  "Spanish 1": "Spanish 1",
  "Spanish 2": "Spanish 2",
  "Spanish 3": "Spanish 3",
  "Spanish 4": "Spanish 4",
  "AP Spanish": "AP Spanish Language",
  "French 2": "French 2",
  "French 3/4H/AP": "French 3-4 Honors/AP",
  "Chinese 2": "Chinese 2",
  "Chinese 3": "Chinese 3",
  "Chinese 4": "Chinese 4",
  "AP Chinese": "AP Chinese Language",
  "Foundations": "Foundations",
  
  // CS/Business
  "AP CSP": "AP Computer Science Principles",
  "AP CSA": "AP Computer Science A",
  "AP Business": "AP Business",
  "Robotics": "Robotics",
  
  // Arts
  "Art 1": "Art 1",
  "Art 2": "Art 2",
  "Art 3/4/H/AP2D": "Art 3-4 Honors/AP 2D",
  "AP Art Hist": "AP Art History",
  "Ceramics 1": "Ceramics 1",
  "Ceramics 2/3/4/AP3D": "Ceramics 2-3-4/AP 3D",
  "Symp Band & Symp Band H": "Symphonic Band / Symphonic Band Honors",
  "Orchestra & Orchestra H": "Orchestra / Orchestra Honors",
  "Jazz Band & Jazz Band H": "Jazz Band / Jazz Band Honors",
  "Choir": "Choir",
  "Acting 1/Stage": "Acting 1/Stagecraft",
  "Acting 2": "Acting 2",
  "Acting 3/4/H": "Acting 3-4 Honors",
  
  // PE
  "PE": "Physical Education",
  "PE/Dance": "PE/Dance",
  "Weight Tr": "Weight Training",
  
  // Other
  "ASB": "Associated Student Body",
  "Yearbook": "Yearbook",
  "Prep": "Prep/Planning",
  "Tech Coord": "Tech Coordinator",
  "Adult School": "Adult School",
  "APT": "Academic Prep Time",
  "MHS": "MHS",
  "CEC": "CEC",
  "LC": "Learning Center",
  "SC LC": "Specialized Learning Center",
  "HB": "Home Base",
  "PMS": "PMS",
};

export function getCourseAlias(courseName: string): string {
  if (!courseName) return courseName;
  
  // Check for exact match
  if (COURSE_ALIASES[courseName]) {
    return COURSE_ALIASES[courseName];
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(COURSE_ALIASES)) {
    if (courseName.includes(key) && key.length > 3) {
      return courseName.replace(key, value);
    }
  }
  
  return courseName;
}
