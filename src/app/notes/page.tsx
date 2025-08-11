import { createClient } from '@/lib/supabase/server';

export default async function Notes() {
  const supabase = await createClient();
  const { data: pilars } = await supabase.from('pilar').select();

  return <pre>{JSON.stringify(pilars, null, 2)}</pre>;
}
