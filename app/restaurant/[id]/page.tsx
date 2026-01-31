import { notFound } from 'next/navigation';
import { getInstitution, getMenuCategories, getMenuItems } from '@/lib/supabase/queries';
import { transformMenuItems, transformCategories, type FrontendRestaurant, type FrontendCategory, type FrontendMenuItem } from '@/lib/data-transform';
import RestaurantClient from './RestaurantClient';

// Enable static generation with ISR
// Pages will be generated on first request, then cached
export const revalidate = 3600; // Revalidate every hour

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function RestaurantPage({ params }: PageProps) {
  const { id } = await params;
  
  try {
    // Fetch data from Supabase
    const [institution, categories, menuItems] = await Promise.all([
      getInstitution(id),
      getMenuCategories(id),
      getMenuItems(id),
    ]);

    // Transform data to frontend format
    const transformedMenuItems = transformMenuItems(menuItems, categories);
    const transformedCategories = transformCategories(categories);

    // Build restaurant object (you may need to add more fields from your DB)
    const restaurant: FrontendRestaurant = {
      id: institution.id,
      name: institution.name,
      tagline: institution.slug, // You may want to add a tagline field to your DB
      deliveryFee: 2.99, // You may want to add this to your DB
      minOrder: 15, // You may want to add this to your DB
      isOpen: true, // You may want to add this to your DB or calculate from hours
      coverImage: undefined, // You may want to add this to your DB
    };

    return (
      <RestaurantClient
        restaurant={restaurant}
        categories={transformedCategories}
        menuItems={transformedMenuItems}
      />
    );
  } catch (error) {
    console.error('Error fetching restaurant data:', error);
    notFound();
  }
}

// Generate static params for all restaurants (optional - for pre-rendering)
export async function generateStaticParams() {
  // If you want to pre-generate all restaurant pages at build time,
  // fetch all institution IDs here
  // For now, we'll generate pages on-demand
  return [];
}
