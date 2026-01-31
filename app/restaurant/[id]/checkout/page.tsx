import { notFound } from 'next/navigation';
import { getInstitution, getBranches } from '@/lib/supabase/queries';
import CheckoutClient from './CheckoutClient';

// Enable static generation with ISR
export const revalidate = 3600; // Revalidate every hour

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CheckoutPage({ params }: PageProps) {
  const { id } = await params;
  
  try {
    // Fetch restaurant and branches data
    const [institution, branches] = await Promise.all([
      getInstitution(id),
      getBranches(id).catch((error) => {
        // Log error but don't fail the page if branches can't be fetched
        console.error('Error fetching branches (non-critical):', error);
        return [];
      }),
    ]);

    console.log(`Fetched ${branches.length} branches for institution ${id}`);

    return (
      <CheckoutClient
        institutionId={id}
        institutionName={institution.name}
        branches={branches}
      />
    );
  } catch (error) {
    console.error('Error fetching checkout data:', error);
    notFound();
  }
}
