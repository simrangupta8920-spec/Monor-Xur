// Demo memory data for the patient Memories gallery. Fictional/demo content.

export type MemoryCategory = "Family" | "People" | "Places" | "Special Moments";

export type Memory = {
  id: string;
  title: string;
  person?: string;
  category: MemoryCategory;
  image: string;
  description: string;
};

export const MEMORY_CATEGORIES: MemoryCategory[] = ["Family", "People", "Places", "Special Moments"];

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80`;

export const MEMORIES: Memory[] = [
  {
    id: "m1",
    title: "Family Picnic",
    person: "Everyone together",
    category: "Family",
    image: img("1529156069898-49953e39b3ac"),
    description: "A sunny afternoon in the park. Sandwiches, laughter, and a big blanket on the grass.",
  },
  {
    id: "m2",
    title: "Family Celebration",
    person: "At home",
    category: "Family",
    image: img("1511895426328-dc8714191300"),
    description: "The whole family gathered together, sharing stories and warm smiles.",
  },
  {
    id: "m3",
    title: "Granddaughter",
    person: "Little Meera",
    category: "People",
    image: img("1503454537195-1dcabb73ffb9"),
    description: "Your granddaughter Meera, always full of giggles and hugs.",
  },
  {
    id: "m4",
    title: "Old Friends",
    person: "Ravi & Lakshmi",
    category: "People",
    image: img("1447069387593-a5de0862481e"),
    description: "Dear friends from the neighbourhood you have known for many years.",
  },
  {
    id: "m5",
    title: "Home Garden",
    person: "Your garden",
    category: "Places",
    image: img("1466692476868-aef1dfb1e735"),
    description: "The garden you love, with green leaves and gentle morning light.",
  },
  {
    id: "m6",
    title: "My Village",
    person: "Home town",
    category: "Places",
    image: img("1500382017468-9049fed747ef"),
    description: "The open fields and quiet paths of the village where you grew up.",
  },
  {
    id: "m7",
    title: "Wedding Day",
    person: "A happy day",
    category: "Special Moments",
    image: img("1519741497674-611481863552"),
    description: "A joyful celebration surrounded by family, flowers, and music.",
  },
  {
    id: "m8",
    title: "Festival Lights",
    person: "Diwali evening",
    category: "Special Moments",
    image: img("1513151233558-d860c5398176"),
    description: "Warm lamps and bright lights on a special festival evening at home.",
  },
];

export function memoriesByCategory(category?: string): Memory[] {
  if (!category || category === "All") return MEMORIES;
  return MEMORIES.filter((m) => m.category === category);
}
