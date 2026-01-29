'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Mock data - will be replaced with backend integration later
const mockRestaurant = {
  id: '1',
  name: 'Ember & Oak',
  tagline: 'Wood-fired comfort, crafted daily',
  rating: 4.8,
  reviewCount: 324,
  deliveryTime: '25-35',
  deliveryFee: 2.99,
  minOrder: 15,
  cuisine: 'American · Wood-fired · Comfort',
  isOpen: true,
  coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
};

const mockCategories = [
  { id: 'popular', name: 'Popular' },
  { id: 'starters', name: 'Starters' },
  { id: 'mains', name: 'Mains' },
  { id: 'pizza', name: 'Pizza' },
  { id: 'sides', name: 'Sides' },
  { id: 'drinks', name: 'Drinks' },
];

type ModificationOption = {
  id: string;
  name: string;
  price: number;
};

type ModificationGroup = {
  id: string;
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  options: ModificationOption[];
};

type MenuItem = {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  isPopular?: boolean;
  dietaryTags: string[];
  modificationGroups?: ModificationGroup[];
};

const mockMenuItems: MenuItem[] = [
  // Popular items
  {
    id: '1',
    category: 'popular',
    name: 'Smoked Brisket Sandwich',
    description: '12-hour smoked brisket, pickled onions, house BBQ, brioche',
    price: 16.50,
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&q=80',
    isPopular: true,
    dietaryTags: [],
    modificationGroups: [
      {
        id: 'bread',
        name: 'Choose your bread',
        required: true,
        minSelect: 1,
        maxSelect: 1,
        options: [
          { id: 'brioche', name: 'Brioche Bun', price: 0 },
          { id: 'sourdough', name: 'Sourdough', price: 0 },
          { id: 'gf-bun', name: 'Gluten-Free Bun', price: 2.00 },
        ],
      },
      {
        id: 'extras',
        name: 'Add extras',
        required: false,
        minSelect: 0,
        maxSelect: 5,
        options: [
          { id: 'cheese', name: 'Extra Cheese', price: 1.50 },
          { id: 'bacon', name: 'Crispy Bacon', price: 3.00 },
          { id: 'egg', name: 'Fried Egg', price: 2.00 },
          { id: 'avocado', name: 'Avocado', price: 2.50 },
          { id: 'jalapeno', name: 'Jalapeños', price: 0.75 },
        ],
      },
    ],
  },
  {
    id: '2',
    category: 'popular',
    name: 'Truffle Mac & Cheese',
    description: 'Three-cheese blend, black truffle oil, toasted panko',
    price: 14.00,
    image: 'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=400&q=80',
    isPopular: true,
    dietaryTags: ['vegetarian'],
    modificationGroups: [
      {
        id: 'size',
        name: 'Choose size',
        required: true,
        minSelect: 1,
        maxSelect: 1,
        options: [
          { id: 'regular', name: 'Regular', price: 0 },
          { id: 'large', name: 'Large', price: 4.00 },
        ],
      },
      {
        id: 'protein',
        name: 'Add protein',
        required: false,
        minSelect: 0,
        maxSelect: 1,
        options: [
          { id: 'chicken', name: 'Grilled Chicken', price: 5.00 },
          { id: 'shrimp', name: 'Garlic Shrimp', price: 7.00 },
          { id: 'brisket', name: 'Smoked Brisket', price: 8.00 },
        ],
      },
    ],
  },
  {
    id: 'p3',
    category: 'popular',
    name: 'BBQ Pulled Pork Tacos',
    description: 'Slow-cooked pulled pork, slaw, chipotle aioli, flour tortillas',
    price: 15.00,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80',
    isPopular: true,
    dietaryTags: [],
  },
  {
    id: 'p4',
    category: 'popular',
    name: 'Wagyu Smash Burger',
    description: 'Double wagyu patties, American cheese, special sauce, potato bun',
    price: 19.00,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    isPopular: true,
    dietaryTags: [],
    modificationGroups: [
      {
        id: 'doneness',
        name: 'How would you like it?',
        required: true,
        minSelect: 1,
        maxSelect: 1,
        options: [
          { id: 'medium', name: 'Medium', price: 0 },
          { id: 'medium-well', name: 'Medium Well', price: 0 },
          { id: 'well', name: 'Well Done', price: 0 },
        ],
      },
    ],
  },
  {
    id: 'p5',
    category: 'popular',
    name: 'Crispy Chicken Sandwich',
    description: 'Buttermilk fried chicken, pickles, honey butter, brioche',
    price: 14.50,
    image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&q=80',
    isPopular: true,
    dietaryTags: [],
  },
  {
    id: 'p6',
    category: 'popular',
    name: 'Loaded Nachos',
    description: 'House chips, queso, pico, guac, jalapeños, sour cream',
    price: 13.00,
    image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&q=80',
    isPopular: true,
    dietaryTags: ['vegetarian'],
    modificationGroups: [
      {
        id: 'protein',
        name: 'Add protein',
        required: false,
        minSelect: 0,
        maxSelect: 1,
        options: [
          { id: 'chicken', name: 'Grilled Chicken', price: 4.00 },
          { id: 'beef', name: 'Seasoned Beef', price: 4.00 },
          { id: 'carnitas', name: 'Carnitas', price: 5.00 },
        ],
      },
    ],
  },
  // Starters
  {
    id: '3',
    category: 'starters',
    name: 'Charred Corn Ribs',
    description: 'Lime crema, tajín, cilantro',
    price: 9.50,
    image: 'https://images.unsplash.com/photo-1470119693884-47d3a1d1f180?w=400&q=80',
    dietaryTags: ['vegetarian', 'gluten-free'],
  },
  {
    id: '4',
    category: 'starters',
    name: 'Crispy Brussels',
    description: 'Fish sauce caramel, crushed peanuts, Thai chili',
    price: 11.00,
    image: 'https://images.unsplash.com/photo-1584270413639-d5ee397272ff?w=400&q=80',
    dietaryTags: ['gluten-free'],
    modificationGroups: [
      {
        id: 'spice',
        name: 'Spice level',
        required: true,
        minSelect: 1,
        maxSelect: 1,
        options: [
          { id: 'mild', name: 'Mild', price: 0 },
          { id: 'medium', name: 'Medium', price: 0 },
          { id: 'hot', name: 'Hot 🌶️', price: 0 },
          { id: 'extra-hot', name: 'Extra Hot 🌶️🌶️', price: 0 },
        ],
      },
    ],
  },
  {
    id: 's3',
    category: 'starters',
    name: 'Burrata & Tomatoes',
    description: 'Fresh burrata, heirloom tomatoes, basil oil, balsamic',
    price: 14.00,
    image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=400&q=80',
    dietaryTags: ['vegetarian', 'gluten-free'],
  },
  {
    id: 's4',
    category: 'starters',
    name: 'Tuna Tartare',
    description: 'Sushi-grade ahi, avocado, sesame, wonton crisps',
    price: 16.00,
    image: 'https://images.unsplash.com/photo-1534256958597-7fe685cbd745?w=400&q=80',
    dietaryTags: [],
  },
  {
    id: 's5',
    category: 'starters',
    name: 'Wings (8pc)',
    description: 'Crispy fried wings, choice of sauce, ranch or blue cheese',
    price: 13.00,
    image: 'https://images.unsplash.com/photo-1608039829572-9b0ba67963c7?w=400&q=80',
    dietaryTags: ['gluten-free'],
    modificationGroups: [
      {
        id: 'sauce',
        name: 'Choose your sauce',
        required: true,
        minSelect: 1,
        maxSelect: 1,
        options: [
          { id: 'buffalo', name: 'Classic Buffalo', price: 0 },
          { id: 'bbq', name: 'Honey BBQ', price: 0 },
          { id: 'garlic', name: 'Garlic Parmesan', price: 0 },
          { id: 'lemon', name: 'Lemon Pepper', price: 0 },
          { id: 'korean', name: 'Korean Gochujang', price: 0 },
        ],
      },
      {
        id: 'dip',
        name: 'Choose your dip',
        required: true,
        minSelect: 1,
        maxSelect: 1,
        options: [
          { id: 'ranch', name: 'Ranch', price: 0 },
          { id: 'blue', name: 'Blue Cheese', price: 0 },
        ],
      },
    ],
  },
  {
    id: 's6',
    category: 'starters',
    name: 'Soup of the Day',
    description: 'Ask your server for today\'s selection',
    price: 8.00,
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80',
    dietaryTags: [],
  },
  {
    id: 's7',
    category: 'starters',
    name: 'Calamari Fritti',
    description: 'Lightly fried calamari, marinara, lemon aioli',
    price: 14.00,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80',
    dietaryTags: [],
  },
  {
    id: 's8',
    category: 'starters',
    name: 'Spinach Artichoke Dip',
    description: 'Creamy spinach & artichoke, toasted pita chips',
    price: 11.00,
    image: 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=400&q=80',
    dietaryTags: ['vegetarian'],
  },
  // Mains
  {
    id: '5',
    category: 'mains',
    name: 'Oak-Grilled Ribeye',
    description: '14oz prime ribeye, garlic butter, charred lemon',
    price: 38.00,
    image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&q=80',
    dietaryTags: ['gluten-free'],
    modificationGroups: [
      {
        id: 'temp',
        name: 'How would you like it cooked?',
        required: true,
        minSelect: 1,
        maxSelect: 1,
        options: [
          { id: 'rare', name: 'Rare', price: 0 },
          { id: 'medium-rare', name: 'Medium Rare', price: 0 },
          { id: 'medium', name: 'Medium', price: 0 },
          { id: 'medium-well', name: 'Medium Well', price: 0 },
          { id: 'well-done', name: 'Well Done', price: 0 },
        ],
      },
      {
        id: 'sides',
        name: 'Choose a side',
        required: true,
        minSelect: 1,
        maxSelect: 1,
        options: [
          { id: 'fries', name: 'Truffle Fries', price: 0 },
          { id: 'mash', name: 'Garlic Mashed Potatoes', price: 0 },
          { id: 'salad', name: 'House Salad', price: 0 },
          { id: 'vegetables', name: 'Seasonal Vegetables', price: 0 },
        ],
      },
      {
        id: 'sauces',
        name: 'Extra sauces',
        required: false,
        minSelect: 0,
        maxSelect: 3,
        options: [
          { id: 'peppercorn', name: 'Peppercorn Sauce', price: 2.50 },
          { id: 'bearnaise', name: 'Béarnaise', price: 2.50 },
          { id: 'chimichurri', name: 'Chimichurri', price: 2.00 },
        ],
      },
    ],
  },
  {
    id: '6',
    category: 'mains',
    name: 'Herb-Crusted Salmon',
    description: 'Atlantic salmon, lemon dill sauce, seasonal vegetables',
    price: 26.00,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80',
    dietaryTags: ['gluten-free'],
    modificationGroups: [
      {
        id: 'sides',
        name: 'Choose a side',
        required: true,
        minSelect: 1,
        maxSelect: 1,
        options: [
          { id: 'rice', name: 'Wild Rice', price: 0 },
          { id: 'quinoa', name: 'Quinoa Pilaf', price: 0 },
          { id: 'vegetables', name: 'Grilled Vegetables', price: 0 },
        ],
      },
    ],
  },
  {
    id: '7',
    category: 'mains',
    name: 'Wild Mushroom Risotto',
    description: 'Arborio rice, mixed forest mushrooms, parmesan, truffle',
    price: 22.00,
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&q=80',
    dietaryTags: ['vegetarian', 'gluten-free'],
  },
  {
    id: 'm4',
    category: 'mains',
    name: 'Braised Short Ribs',
    description: 'Red wine braised short ribs, creamy polenta, gremolata',
    price: 32.00,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80',
    dietaryTags: ['gluten-free'],
  },
  {
    id: 'm5',
    category: 'mains',
    name: 'Pan-Seared Duck Breast',
    description: 'Cherry gastrique, roasted root vegetables, crispy skin',
    price: 34.00,
    image: 'https://images.unsplash.com/photo-1580554530778-ca36943571b1?w=400&q=80',
    dietaryTags: ['gluten-free'],
  },
  {
    id: 'm6',
    category: 'mains',
    name: 'Lobster Linguine',
    description: 'Fresh lobster, cherry tomatoes, white wine garlic butter',
    price: 36.00,
    image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&q=80',
    dietaryTags: [],
  },
  {
    id: 'm7',
    category: 'mains',
    name: 'Grilled Chicken Paillard',
    description: 'Pounded chicken breast, arugula salad, lemon vinaigrette',
    price: 21.00,
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&q=80',
    dietaryTags: ['gluten-free'],
  },
  {
    id: 'm8',
    category: 'mains',
    name: 'Fish & Chips',
    description: 'Beer-battered cod, hand-cut fries, tartar sauce, mushy peas',
    price: 19.00,
    image: 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=400&q=80',
    dietaryTags: [],
  },
  {
    id: 'm9',
    category: 'mains',
    name: 'Lamb Chops',
    description: 'New Zealand lamb, mint chimichurri, roasted fingerlings',
    price: 36.00,
    image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=80',
    dietaryTags: ['gluten-free'],
    modificationGroups: [
      {
        id: 'temp',
        name: 'How would you like it cooked?',
        required: true,
        minSelect: 1,
        maxSelect: 1,
        options: [
          { id: 'rare', name: 'Rare', price: 0 },
          { id: 'medium-rare', name: 'Medium Rare', price: 0 },
          { id: 'medium', name: 'Medium', price: 0 },
          { id: 'well', name: 'Well Done', price: 0 },
        ],
      },
    ],
  },
  {
    id: 'm10',
    category: 'mains',
    name: 'Eggplant Parmesan',
    description: 'Breaded eggplant, marinara, mozzarella, basil, spaghetti',
    price: 18.00,
    image: 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=400&q=80',
    dietaryTags: ['vegetarian'],
  },
  // Pizza
  {
    id: 'pz1',
    category: 'pizza',
    name: 'Build Your Own Pizza',
    description: 'Start with our hand-stretched dough, then choose your size, crust, sauce, cheese and toppings.',
    price: 12.00,
    image: 'https://images.unsplash.com/photo-1548369937-47519962c11a?w=400&q=80',
    isPopular: true,
    dietaryTags: [],
    modificationGroups: [
      {
        id: 'size',
        name: 'Size',
        required: true,
        minSelect: 1,
        maxSelect: 1,
        options: [
          { id: 'personal', name: 'Personal 9\"', price: 0 },
          { id: 'medium', name: 'Medium 12\"', price: 4.00 },
          { id: 'large', name: 'Large 16\"', price: 8.00 },
        ],
      },
      {
        id: 'crust',
        name: 'Crust',
        required: true,
        minSelect: 1,
        maxSelect: 1,
        options: [
          { id: 'thin', name: 'Thin & Crispy', price: 0 },
          { id: 'classic', name: 'Classic Hand-Tossed', price: 0 },
          { id: 'deep', name: 'Deep Dish', price: 2.50 },
          { id: 'gf', name: 'Gluten-Free', price: 3.00 },
        ],
      },
      {
        id: 'sauce',
        name: 'Sauce',
        required: true,
        minSelect: 1,
        maxSelect: 1,
        options: [
          { id: 'red', name: 'San Marzano Red Sauce', price: 0 },
          { id: 'white', name: 'Garlic White Sauce', price: 0 },
          { id: 'pesto', name: 'Basil Pesto', price: 1.50 },
          { id: 'bbq', name: 'Smoky BBQ', price: 1.00 },
        ],
      },
      {
        id: 'cheese',
        name: 'Cheese',
        required: true,
        minSelect: 1,
        maxSelect: 1,
        options: [
          { id: 'moz', name: 'Mozzarella', price: 0 },
          { id: 'blend', name: 'Four Cheese Blend', price: 1.50 },
          { id: 'vegan', name: 'Vegan Cheese', price: 2.00 },
          { id: 'no-cheese', name: 'No Cheese', price: 0 },
        ],
      },
      {
        id: 'toppings',
        name: 'Toppings',
        required: false,
        minSelect: 0,
        maxSelect: 8,
        options: [
          { id: 'pepperoni', name: 'Pepperoni', price: 1.50 },
          { id: 'sausage', name: 'Italian Sausage', price: 1.50 },
          { id: 'bacon', name: 'Applewood Bacon', price: 1.75 },
          { id: 'chicken', name: 'Grilled Chicken', price: 1.75 },
          { id: 'mushrooms', name: 'Wild Mushrooms', price: 1.25 },
          { id: 'onion', name: 'Red Onion', price: 0.75 },
          { id: 'olive', name: 'Kalamata Olives', price: 1.00 },
          { id: 'bell-peppers', name: 'Roasted Bell Peppers', price: 1.00 },
          { id: 'jalapeno', name: 'Jalapeños', price: 0.75 },
          { id: 'spinach', name: 'Baby Spinach', price: 1.00 },
          { id: 'pineapple', name: 'Pineapple', price: 1.00 },
          { id: 'tomato', name: 'Cherry Tomatoes', price: 1.00 },
        ],
      },
      {
        id: 'finish',
        name: 'Finishing Touches',
        required: false,
        minSelect: 0,
        maxSelect: 3,
        options: [
          { id: 'chili-flakes', name: 'Chili Flakes', price: 0 },
          { id: 'basil', name: 'Fresh Basil', price: 0.50 },
          { id: 'parm', name: 'Shaved Parmesan', price: 1.00 },
          { id: 'truffle-oil', name: 'Truffle Oil Drizzle', price: 2.00 },
          { id: 'garlic-oil', name: 'Roasted Garlic Oil', price: 1.00 },
        ],
      },
    ],
  },
  // Sides
  {
    id: '8',
    category: 'sides',
    name: 'Garlic Roasted Potatoes',
    description: 'Crispy fingerlings, rosemary, sea salt',
    price: 7.00,
    image: 'https://images.unsplash.com/photo-1568569350062-ebfa3cb195df?w=400&q=80',
    dietaryTags: ['vegan', 'gluten-free'],
  },
  {
    id: '9',
    category: 'sides',
    name: 'Grilled Broccolini',
    description: 'Lemon zest, chili flakes, olive oil',
    price: 8.00,
    image: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=400&q=80',
    dietaryTags: ['vegan', 'gluten-free'],
  },
  {
    id: 'si3',
    category: 'sides',
    name: 'Truffle Fries',
    description: 'Hand-cut fries, truffle oil, parmesan, herbs',
    price: 9.00,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80',
    dietaryTags: ['vegetarian'],
  },
  {
    id: 'si4',
    category: 'sides',
    name: 'Caesar Salad',
    description: 'Romaine, parmesan, croutons, house caesar dressing',
    price: 10.00,
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&q=80',
    dietaryTags: [],
  },
  {
    id: 'si5',
    category: 'sides',
    name: 'Mac & Cheese',
    description: 'Creamy three-cheese blend, toasted breadcrumbs',
    price: 8.00,
    image: 'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=400&q=80',
    dietaryTags: ['vegetarian'],
  },
  {
    id: 'si6',
    category: 'sides',
    name: 'Creamed Spinach',
    description: 'Baby spinach, cream, nutmeg, parmesan',
    price: 8.00,
    image: 'https://images.unsplash.com/photo-1580013759032-c96505e24c1f?w=400&q=80',
    dietaryTags: ['vegetarian', 'gluten-free'],
  },
  {
    id: 'si7',
    category: 'sides',
    name: 'Sweet Potato Fries',
    description: 'Crispy sweet potato, chipotle aioli',
    price: 8.00,
    image: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?w=400&q=80',
    dietaryTags: ['vegan'],
  },
  {
    id: 'si8',
    category: 'sides',
    name: 'Coleslaw',
    description: 'Creamy house-made slaw, apple cider vinegar',
    price: 5.00,
    image: 'https://images.unsplash.com/photo-1625938145744-533e82abce26?w=400&q=80',
    dietaryTags: ['vegetarian', 'gluten-free'],
  },
  // Drinks
  {
    id: '10',
    category: 'drinks',
    name: 'House Lemonade',
    description: 'Fresh-squeezed, mint, sparkling',
    price: 5.00,
    image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&q=80',
    dietaryTags: ['vegan'],
    modificationGroups: [
      {
        id: 'sweetness',
        name: 'Sweetness level',
        required: false,
        minSelect: 0,
        maxSelect: 1,
        options: [
          { id: 'less', name: 'Less Sweet', price: 0 },
          { id: 'regular', name: 'Regular', price: 0 },
          { id: 'extra', name: 'Extra Sweet', price: 0 },
        ],
      },
    ],
  },
  {
    id: '11',
    category: 'drinks',
    name: 'Cold Brew Coffee',
    description: '18-hour steep, smooth & bold',
    price: 4.50,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80',
    dietaryTags: ['vegan'],
    modificationGroups: [
      {
        id: 'milk',
        name: 'Choose milk',
        required: false,
        minSelect: 0,
        maxSelect: 1,
        options: [
          { id: 'none', name: 'Black (no milk)', price: 0 },
          { id: 'whole', name: 'Whole Milk', price: 0 },
          { id: 'oat', name: 'Oat Milk', price: 0.75 },
          { id: 'almond', name: 'Almond Milk', price: 0.75 },
        ],
      },
      {
        id: 'shots',
        name: 'Extra shots',
        required: false,
        minSelect: 0,
        maxSelect: 2,
        options: [
          { id: 'espresso', name: 'Extra Espresso Shot', price: 1.50 },
          { id: 'vanilla', name: 'Vanilla Syrup', price: 0.50 },
          { id: 'caramel', name: 'Caramel Syrup', price: 0.50 },
        ],
      },
    ],
  },
  {
    id: 'd3',
    category: 'drinks',
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed, no pulp',
    price: 6.00,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80',
    dietaryTags: ['vegan'],
  },
  {
    id: 'd4',
    category: 'drinks',
    name: 'Iced Tea',
    description: 'House-brewed black tea, lemon',
    price: 3.50,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80',
    dietaryTags: ['vegan'],
    modificationGroups: [
      {
        id: 'sweetness',
        name: 'Sweetness',
        required: false,
        minSelect: 0,
        maxSelect: 1,
        options: [
          { id: 'unsweetened', name: 'Unsweetened', price: 0 },
          { id: 'lightly', name: 'Lightly Sweetened', price: 0 },
          { id: 'sweet', name: 'Sweet Tea', price: 0 },
        ],
      },
    ],
  },
  {
    id: 'd5',
    category: 'drinks',
    name: 'Sparkling Water',
    description: 'San Pellegrino, 500ml',
    price: 4.00,
    image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&q=80',
    dietaryTags: ['vegan'],
  },
  {
    id: 'd6',
    category: 'drinks',
    name: 'Craft Soda',
    description: 'Assorted flavors - ask your server',
    price: 4.00,
    image: 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=400&q=80',
    dietaryTags: ['vegan'],
  },
  {
    id: 'd7',
    category: 'drinks',
    name: 'Espresso',
    description: 'Double shot, rich & bold',
    price: 3.50,
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=80',
    dietaryTags: ['vegan'],
  },
  {
    id: 'd8',
    category: 'drinks',
    name: 'Matcha Latte',
    description: 'Ceremonial grade matcha, your choice of milk',
    price: 5.50,
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&q=80',
    dietaryTags: ['vegan'],
    modificationGroups: [
      {
        id: 'milk',
        name: 'Choose milk',
        required: true,
        minSelect: 1,
        maxSelect: 1,
        options: [
          { id: 'whole', name: 'Whole Milk', price: 0 },
          { id: 'oat', name: 'Oat Milk', price: 0.75 },
          { id: 'almond', name: 'Almond Milk', price: 0.75 },
          { id: 'coconut', name: 'Coconut Milk', price: 0.75 },
        ],
      },
      {
        id: 'temp',
        name: 'Temperature',
        required: true,
        minSelect: 1,
        maxSelect: 1,
        options: [
          { id: 'hot', name: 'Hot', price: 0 },
          { id: 'iced', name: 'Iced', price: 0 },
        ],
      },
    ],
  },
];

type SelectedModification = {
  groupId: string;
  optionId: string;
  name: string;
  price: number;
};

type CartItem = {
  id: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  modifications: SelectedModification[];
  totalPrice: number;
};

export default function RestaurantPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('popular');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Prevent background scroll when cart drawer or item modal is open
  useEffect(() => {
    const hasOverlayOpen = isCartOpen || !!selectedItem;
    if (hasOverlayOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isCartOpen, selectedItem]);

  const filteredItems = mockMenuItems.filter(
    (item) => item.category === activeCategory
  );

  const addToCart = (item: MenuItem, modifications: SelectedModification[], quantity: number) => {
    const modPrice = modifications.reduce((sum, m) => sum + m.price, 0);
    const totalPrice = (item.price + modPrice) * quantity;
    
    // Create a unique key based on item + modifications
    const modKey = modifications.map(m => `${m.groupId}:${m.optionId}`).sort().join('|');
    const cartItemId = `${item.id}-${modKey}`;
    
    setCart((prev) => {
      const existing = prev.find((i) => i.id === cartItemId);
      if (existing) {
        return prev.map((i) =>
          i.id === cartItemId 
            ? { ...i, quantity: i.quantity + quantity, totalPrice: (i.price + modPrice) * (i.quantity + quantity) } 
            : i
        );
      }
      return [...prev, {
        id: cartItemId,
        itemId: item.id,
        name: item.name,
        price: item.price,
        quantity,
        modifications,
        totalPrice,
      }];
    });
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === cartItemId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity <= 0) return null;
          const modPrice = item.modifications.reduce((sum, m) => sum + m.price, 0);
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: (item.price + modPrice) * newQuantity,
          };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleItemClick = (item: MenuItem) => {
    if (item.modificationGroups && item.modificationGroups.length > 0) {
      setSelectedItem(item);
    } else {
      addToCart(item, [], 1);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Cover Image */}
      <div className="relative h-48 sm:h-64 bg-stone-200 overflow-hidden">
        <img
          src={mockRestaurant.coverImage}
          alt={mockRestaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
        
        {/* Back button */}
        <a 
          href="/" 
          className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-stone-700 hover:bg-white transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </a>
        
        {/* Cart button (mobile) */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm text-stone-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-white transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {cartItemCount > 0 && (
            <>
              <span>₵{cartTotal.toFixed(2)}</span>
              <span className="w-5 h-5 bg-amber-500 text-stone-900 text-xs font-bold rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Restaurant Info Card */}
      <section className="max-w-5xl mx-auto px-4 -mt-12 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-stone-200/60 p-5">
          <div className="flex items-center gap-2 mb-2">
            {mockRestaurant.isOpen ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Open
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                Closed
              </span>
            )}
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs font-semibold text-stone-900">{mockRestaurant.rating}</span>
              <span className="text-xs text-stone-400">({mockRestaurant.reviewCount})</span>
            </div>
          </div>
          
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight mb-1">
            {mockRestaurant.name}
          </h1>
          <p className="text-stone-500 text-sm mb-3">{mockRestaurant.tagline}</p>
          
          <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {mockRestaurant.deliveryTime} min
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              ₵{mockRestaurant.deliveryFee.toFixed(2)} delivery
            </span>
            <span className="text-stone-400">{mockRestaurant.cuisine}</span>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <nav className="sticky top-0 z-30 bg-stone-50/95 backdrop-blur-md border-b border-stone-200/60 mt-4">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {mockCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === category.id
                    ? 'bg-stone-900 text-stone-50'
                    : 'text-stone-600 hover:bg-stone-200/60'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Menu Items */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onClick={() => handleItemClick(item)}
              cartQuantity={cart.filter((i) => i.itemId === item.id).reduce((sum, i) => sum + i.quantity, 0)}
            />
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-stone-400">
            <p>No items in this category yet.</p>
          </div>
        )}
      </main>

      {/* Bottom spacing for mobile cart button */}
      {cartItemCount > 0 && <div className="h-24 sm:hidden" />}

      {/* Fixed Cart Button (Mobile) */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-stone-50 via-stone-50 to-transparent sm:hidden z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-4 bg-stone-900 text-stone-50 rounded-2xl font-semibold text-sm flex items-center justify-center gap-3 shadow-lg"
          >
            <span>View Cart</span>
            <span className="w-6 h-6 bg-amber-500 text-stone-900 text-xs font-bold rounded-full flex items-center justify-center">
              {cartItemCount}
            </span>
            <span>₵{cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Item Customization Modal */}
      {selectedItem && (
        <ItemCustomizeModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={(modifications, quantity) => {
            addToCart(selectedItem, modifications, quantity);
            setSelectedItem(null);
          }}
        />
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onUpdateQuantity={updateCartQuantity}
          total={cartTotal}
          deliveryFee={mockRestaurant.deliveryFee}
          minOrder={mockRestaurant.minOrder}
          onCheckout={() => router.push('/checkout')}
          onAddItem={(itemId) => {
            const item = mockMenuItems.find((i) => i.id === itemId);
            if (!item) return;
            if (item.modificationGroups && item.modificationGroups.length > 0) {
              setSelectedItem(item);
            } else {
              addToCart(item, [], 1);
            }
          }}
        />
      )}
    </div>
  );
}

function MenuItemCard({
  item,
  onClick,
  cartQuantity,
}: {
  item: MenuItem;
  onClick: () => void;
  cartQuantity: number;
}) {
  const hasCustomizations = item.modificationGroups && item.modificationGroups.length > 0;
  
  return (
    <button
      onClick={onClick}
      className="group flex items-start gap-4 p-3 bg-white rounded-2xl border border-stone-200/60 hover:border-stone-300/80 hover:shadow-md transition-all text-left w-full"
    >
      {/* Image */}
      <div className="shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-stone-100 relative">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {cartQuantity > 0 && (
          <span className="absolute top-1 right-1 w-6 h-6 bg-amber-500 text-stone-900 text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
            {cartQuantity}
          </span>
        )}
      </div>
      
      <div className="flex-1 min-w-0 py-0.5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-medium text-stone-900 leading-tight">{item.name}</h3>
          {item.isPopular && (
            <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              Popular
            </span>
          )}
        </div>
        
        <p className="text-xs text-stone-500 mb-2 line-clamp-2 leading-relaxed">{item.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-stone-900">
              ₵{item.price.toFixed(2)}
            </span>
            {item.dietaryTags.length > 0 && (
              <div className="flex gap-1">
                {item.dietaryTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] text-stone-400"
                  >
                    {tag === 'vegetarian' && '🌿'}
                    {tag === 'vegan' && '🌱'}
                    {tag === 'gluten-free' && 'GF'}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {hasCustomizations && (
            <span className="text-[10px] text-stone-400 uppercase tracking-wider">
              Customizable
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function ItemCustomizeModal({
  item,
  onClose,
  onAddToCart,
}: {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (modifications: SelectedModification[], quantity: number) => void;
}) {
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);

  const groups = item.modificationGroups || [];
  
  // Calculate additional price from modifications
  const modificationPrice = groups.reduce((total, group) => {
    const selectedOptions = selections[group.id] || [];
    return total + selectedOptions.reduce((sum, optId) => {
      const opt = group.options.find(o => o.id === optId);
      return sum + (opt?.price || 0);
    }, 0);
  }, 0);

  const totalPrice = (item.price + modificationPrice) * quantity;

  // Check if all required groups are satisfied
  const isValid = groups.every(group => {
    if (!group.required) return true;
    const selected = selections[group.id] || [];
    return selected.length >= group.minSelect;
  });

  const toggleOption = (groupId: string, optionId: string, maxSelect: number) => {
    setSelections(prev => {
      const current = prev[groupId] || [];
      const isSelected = current.includes(optionId);
      
      if (isSelected) {
        return { ...prev, [groupId]: current.filter(id => id !== optionId) };
      } else {
        if (maxSelect === 1) {
          return { ...prev, [groupId]: [optionId] };
        } else if (current.length < maxSelect) {
          return { ...prev, [groupId]: [...current, optionId] };
        }
        return prev;
      }
    });
  };

  const handleAddToCart = () => {
    const modifications: SelectedModification[] = [];
    groups.forEach(group => {
      const selectedOptions = selections[group.id] || [];
      selectedOptions.forEach(optId => {
        const opt = group.options.find(o => o.id === optId);
        if (opt) {
          modifications.push({
            groupId: group.id,
            optionId: opt.id,
            name: opt.name,
            price: opt.price,
          });
        }
      });
    });
    onAddToCart(modifications, quantity);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-50 sm:p-4">
        <div className="bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header Image */}
          <div className="relative h-48 sm:h-56 bg-stone-100 shrink-0">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-300">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-stone-700 hover:bg-white transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5">
              {/* Item Info */}
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-stone-900 mb-1">{item.name}</h2>
                <p className="text-sm text-stone-500 mb-2">{item.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-stone-900">₵{item.price.toFixed(2)}</span>
                  {item.dietaryTags.length > 0 && (
                    <div className="flex gap-1.5">
                      {item.dietaryTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Modification Groups */}
              <div className="space-y-5">
                {groups.map((group) => {
                  const selected = selections[group.id] || [];
                  const isGroupValid = !group.required || selected.length >= group.minSelect;
                  
                  return (
                    <div key={group.id}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-stone-900">{group.name}</h3>
                          <p className="text-xs text-stone-400">
                            {group.required ? (
                              <span className="text-amber-600">
                                Required · Select {group.minSelect === group.maxSelect ? group.minSelect : `${group.minSelect}-${group.maxSelect}`}
                              </span>
                            ) : (
                              <span>Optional · Select up to {group.maxSelect}</span>
                            )}
                          </p>
                        </div>
                        {group.required && !isGroupValid && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {group.options.map((option) => {
                          const isSelected = selected.includes(option.id);
                          const isRadio = group.maxSelect === 1;
                          
                          return (
                            <button
                              key={option.id}
                              onClick={() => toggleOption(group.id, option.id, group.maxSelect)}
                              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                                isSelected
                                  ? 'border-stone-900 bg-stone-50'
                                  : 'border-stone-200 hover:border-stone-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {/* Checkbox/Radio indicator */}
                                <div className={`w-5 h-5 rounded-${isRadio ? 'full' : 'md'} border-2 flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? 'border-stone-900 bg-stone-900'
                                    : 'border-stone-300'
                                }`}>
                                  {isSelected && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                <span className={`text-sm ${isSelected ? 'font-medium text-stone-900' : 'text-stone-700'}`}>
                                  {option.name}
                                </span>
                              </div>
                              {option.price > 0 && (
                                <span className="text-sm text-stone-500">+₵{option.price.toFixed(2)}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="shrink-0 p-4 border-t border-stone-200/60 bg-white">
            {/* Quantity selector */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="text-lg font-semibold text-stone-900 w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={!isValid}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                isValid
                  ? 'bg-stone-900 text-stone-50 hover:bg-stone-800'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              <span>Add to Cart</span>
              <span>·</span>
              <span>₵{totalPrice.toFixed(2)}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function CartDrawer({
  cart,
  onClose,
  onUpdateQuantity,
  total,
  deliveryFee,
  minOrder,
  onCheckout,
  onAddItem,
}: {
  cart: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  total: number;
  deliveryFee: number;
  minOrder: number;
  onCheckout: () => void;
  onAddItem: (id: string) => void;
}) {
  const isMinOrderMet = total >= minOrder;

  const recommendedDrinks = mockMenuItems
    .filter(
      (item) =>
        item.category === 'drinks' &&
        (!item.modificationGroups || item.modificationGroups.length === 0) &&
        !cart.some((c) => c.itemId === item.id)
    )
    .slice(0, 3);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-stone-50 shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200/60">
          <h2 className="text-lg font-semibold text-stone-900">Your Order</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-200/60 text-stone-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {cart.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-stone-500 mb-1">Your cart is empty</p>
              <p className="text-sm text-stone-400">Add some delicious items to get started</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded-xl border border-stone-200/60"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-stone-900 text-sm">{item.name}</p>
                        {item.modifications.length > 0 && (
                          <p className="text-xs text-stone-400 mt-0.5">
                            {item.modifications.map(m => m.name).join(', ')}
                          </p>
                        )}
                      </div>
                      <p className="text-sm font-medium text-stone-900 shrink-0">
                        ₵{item.totalPrice.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {recommendedDrinks.length > 0 && (
                <div className="pt-2 border-t border-stone-200/70">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                      Add a drink?
                    </p>
                    <span className="text-[11px] text-stone-400">
                      Customers often add these
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {recommendedDrinks.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onAddItem(item.id)}
                        className="flex min-w-[160px] items-center gap-3 rounded-2xl border border-stone-200/70 bg-white px-3 py-2 text-left hover:border-stone-300 hover:shadow-sm transition-all"
                      >
                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-stone-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            ₵{item.price.toFixed(2)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-stone-200/60 bg-white">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Subtotal</span>
                <span className="text-stone-900">₵{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Delivery</span>
                <span className="text-stone-900">₵{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t border-stone-100">
                <span className="text-stone-900">Total</span>
                <span className="text-stone-900">₵{(total + deliveryFee).toFixed(2)}</span>
              </div>
            </div>
            
            {!isMinOrderMet && (
              <p className="text-xs text-amber-600 mb-3 text-center">
                Add ₵{(minOrder - total).toFixed(2)} more to meet the ₵{minOrder.toFixed(2)} minimum
              </p>
            )}
            
            <button
              disabled={!isMinOrderMet}
              onClick={onCheckout}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                isMinOrderMet
                  ? 'bg-stone-900 text-stone-50 hover:bg-stone-800'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
