import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete('ai_work_hub_token');
  redirect('/login');
}
