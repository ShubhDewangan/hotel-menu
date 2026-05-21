// ─────────────────────────────────────────────────────────────
// menuData.ts
// Static MenuConfig array — one entry per venue theme.
// app/menu/page.tsx resolves the active menu with:
//   menuData.find((m) => m.theme === theme) ?? menuData[0]
//
// Replace this with a server fetch when Appwrite is wired.
// ─────────────────────────────────────────────────────────────

import { MenuConfig } from "@/types/menu";

export const menuData: MenuConfig[] = [
  // ── Restaurant ──────────────────────────────────────────────
  {
    theme: "restaurant",
    label: "Restaurant Menu",
    categories: [
      {
        name: "Starters", sortOrder: 0,
        items: [
          { name: "Pani Puri",         description: "Semolina shells, tamarind water, potato",   price: 150, isVeg: true,  isAvailable: true, sortOrder: 0 },
          { name: "Chicken Tikka",     description: "Tandoor-charred, spiced marinade, mint",    price: 320, isVeg: false, isAvailable: true, sortOrder: 1 },
          { name: "Hara Bhara Kebab",  description: "Spinach, peas, paneer, spiced crumb",       price: 260, isVeg: true,  isAvailable: true, sortOrder: 2 },
          { name: "Seekh Kebab",       description: "Minced lamb, spiced, charcoal smoked",      price: 350, isVeg: false, isAvailable: true, sortOrder: 3 },
          { name: "Dahi Bhalla Chaat", description: "Lentil dumplings, yoghurt, chutneys",       price: 190, isVeg: true,  isAvailable: true, sortOrder: 4 },
          { name: "Amritsari Fish",    description: "Carom-spiced batter, green chutney",        price: 340, isVeg: false, isAvailable: true, sortOrder: 5 },
        ],
      },
      {
        name: "Mains", sortOrder: 1,
        items: [
          { name: "Dal Makhani",       description: "Slow-cooked black lentils, cream, butter",  price: 380, isVeg: true,  isAvailable: true, sortOrder: 0 },
          { name: "Butter Chicken",    description: "Tandoori chicken, tomato, fenugreek sauce", price: 450, isVeg: false, isAvailable: true, sortOrder: 1 },
          { name: "Paneer Lababdar",   description: "Cottage cheese, rich onion-tomato gravy",   price: 380, isVeg: true,  isAvailable: true, sortOrder: 2 },
          { name: "Rogan Josh",        description: "Slow-braised lamb, Kashmiri spices",         price: 520, isVeg: false, isAvailable: true, sortOrder: 3 },
          { name: "Prawn Balchao",     description: "Goan pickled prawn curry, vinegar",          price: 580, isVeg: false, isAvailable: true, sortOrder: 4 },
          { name: "Vegetable Biryani", description: "Saffron rice, whole spices, raita",          price: 320, isVeg: true,  isAvailable: true, sortOrder: 5 },
        ],
      },
      {
        name: "Desserts", sortOrder: 2,
        items: [
          { name: "Gulab Jamun",  description: "Milk dumplings, rose syrup, pistachios",   price: 180, isVeg: true, isAvailable: true, sortOrder: 0 },
          { name: "Kulfi Faluda", description: "Pistachio ice cream, rose vermicelli",      price: 220, isVeg: true, isAvailable: true, sortOrder: 1 },
          { name: "Gajar Halwa",  description: "Carrot fudge, cardamom, khoya, almonds",   price: 200, isVeg: true, isAvailable: true, sortOrder: 2 },
          { name: "Shahi Tukda",  description: "Fried bread, rabdi, saffron, silver leaf", price: 240, isVeg: true, isAvailable: true, sortOrder: 3 },
        ],
      },
    ],
  },

  // ── Pool ────────────────────────────────────────────────────
  {
    theme: "pool",
    label: "Pool Menu",
    categories: [
      {
        name: "Starters", sortOrder: 0,
        items: [
          { name: "Corn Cheese Toast", description: "Sourdough, sweet corn, cheddar, herbs",      price: 220, isVeg: true,  isAvailable: true, sortOrder: 0 },
          { name: "Grilled Calamari",  description: "Lemon butter, parsley, aioli",               price: 380, isVeg: false, isAvailable: true, sortOrder: 1 },
          { name: "Nachos Grande",     description: "Tortilla, jalapeños, guacamole, sour cream", price: 320, isVeg: true,  isAvailable: true, sortOrder: 2 },
          { name: "Chicken Wings",     description: "Buffalo sauce, blue cheese dip, celery",     price: 420, isVeg: false, isAvailable: true, sortOrder: 3 },
          { name: "Spring Rolls",      description: "Vegetables, glass noodles, sweet chilli",    price: 260, isVeg: true,  isAvailable: true, sortOrder: 4 },
          { name: "Prawn Cocktail",    description: "Tiger prawns, Marie Rose, iceberg",          price: 450, isVeg: false, isAvailable: true, sortOrder: 5 },
        ],
      },
      {
        name: "Mains", sortOrder: 1,
        items: [
          { name: "Club Sandwich",     description: "Triple decker, chicken, bacon, egg, fries", price: 480, isVeg: false, isAvailable: true, sortOrder: 0 },
          { name: "Veggie Burger",     description: "Beetroot patty, lettuce, sriracha mayo",    price: 380, isVeg: true,  isAvailable: true, sortOrder: 1 },
          { name: "Fish & Chips",      description: "Beer-battered sole, mushy peas, tartar",    price: 520, isVeg: false, isAvailable: true, sortOrder: 2 },
          { name: "Caesar Salad",      description: "Romaine, parmesan, croutons, anchovies",    price: 360, isVeg: false, isAvailable: true, sortOrder: 3 },
          { name: "Margherita Pizza",  description: "San Marzano, buffalo mozzarella, basil",    price: 420, isVeg: true,  isAvailable: true, sortOrder: 4 },
          { name: "BBQ Chicken Pizza", description: "Smoky BBQ, mozzarella, red onion",          price: 480, isVeg: false, isAvailable: true, sortOrder: 5 },
        ],
      },
      {
        name: "Beverages", sortOrder: 2,
        items: [
          { name: "Fresh Lime Soda", description: "Squeezed lime, soda, mint, black salt", price: 120, isVeg: true, isAvailable: true, sortOrder: 0 },
          { name: "Mango Lassi",     description: "Alphonso mango, yoghurt, cardamom",      price: 180, isVeg: true, isAvailable: true, sortOrder: 1 },
          { name: "Iced Americano",  description: "Double espresso, filtered water, ice",   price: 200, isVeg: true, isAvailable: true, sortOrder: 2 },
          { name: "Coconut Water",   description: "Fresh tender coconut, served chilled",   price: 150, isVeg: true, isAvailable: true, sortOrder: 3 },
        ],
      },
    ],
  },

  // ── Lobby ───────────────────────────────────────────────────
  {
    theme: "lobby",
    label: "Lobby Café Menu",
    categories: [
      {
        name: "Starters", sortOrder: 0,
        items: [
          { name: "Pani Puri",         description: "Semolina shells, tamarind water, potato",  price: 150, isVeg: true,  isAvailable: true, sortOrder: 0 },
          { name: "Chicken Tikka",     description: "Tandoor-charred, spiced marinade, mint",   price: 320, isVeg: false, isAvailable: true, sortOrder: 1 },
          { name: "Hara Bhara Kebab",  description: "Spinach, peas, paneer, spiced crumb",      price: 260, isVeg: true,  isAvailable: true, sortOrder: 2 },
          { name: "Seekh Kebab",       description: "Minced lamb, spiced, charcoal smoked",     price: 350, isVeg: false, isAvailable: true, sortOrder: 3 },
          { name: "Dahi Bhalla Chaat", description: "Lentil dumplings, yoghurt, chutneys",      price: 190, isVeg: true,  isAvailable: true, sortOrder: 4 },
          { name: "Amritsari Fish",    description: "Carom-spiced batter, green chutney",       price: 340, isVeg: false, isAvailable: true, sortOrder: 5 },
        ],
      },
      {
        name: "All-Day Dining", sortOrder: 1,
        items: [
          { name: "Eggs Benedict",       description: "Poached eggs, hollandaise, toasted muffin",    price: 380, isVeg: false, isAvailable: true, sortOrder: 0 },
          { name: "Avocado Toast",       description: "Sourdough, smashed avo, feta, chilli flakes",  price: 320, isVeg: true,  isAvailable: true, sortOrder: 1 },
          { name: "Masala Omelette",     description: "Three eggs, onion, tomato, green chilli",      price: 280, isVeg: true,  isAvailable: true, sortOrder: 2 },
          { name: "Pancake Stack",       description: "Buttermilk pancakes, maple syrup, berries",    price: 340, isVeg: true,  isAvailable: true, sortOrder: 3 },
          { name: "Smoked Salmon Bagel", description: "Cream cheese, capers, red onion, dill",        price: 480, isVeg: false, isAvailable: true, sortOrder: 4 },
          { name: "Granola Bowl",        description: "House granola, Greek yoghurt, seasonal fruit",  price: 280, isVeg: true,  isAvailable: true, sortOrder: 5 },
        ],
      },
      {
        name: "Patisserie", sortOrder: 2,
        items: [
          { name: "Croissant",        description: "Butter laminated, served warm, preserve", price: 180, isVeg: true, isAvailable: true, sortOrder: 0 },
          { name: "Pain au Chocolat", description: "Dark chocolate, flaky pastry",            price: 200, isVeg: true, isAvailable: true, sortOrder: 1 },
          { name: "Blueberry Muffin", description: "Fresh blueberries, lemon zest, streusel", price: 160, isVeg: true, isAvailable: true, sortOrder: 2 },
          { name: "Opera Cake",       description: "Coffee buttercream, chocolate ganache",    price: 280, isVeg: true, isAvailable: true, sortOrder: 3 },
        ],
      },
    ],
  },
  // ── end of static menus ─────────────────────────────────────
  // "event" menus are fetched dynamically; no static entry here.
  // page.tsx falls back to menuData[0] for event venues until
  // the Appwrite fetch is wired.
  // ────────────────────────────────────────────────────────────
];