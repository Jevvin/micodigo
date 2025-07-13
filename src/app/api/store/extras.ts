// src/app/api/store/extras.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  const productId = req.nextUrl.searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 });
  }

  // Obtener product_extra_groups
  const { data: productExtraGroups, error: pegError } = await supabase
    .from('product_extra_groups')
    .select(`
      id,
      extra_group_id,
      extra_groups (
        id,
        name,
        description,
        selection_type,
        is_required,
        min_select,
        max_select,
        extras (
          id,
          name,
          price,
          is_available
        )
      )
    `)
    .eq('product_id', productId);

  if (pegError) {
    console.error('Error fetching extras:', pegError);
    return NextResponse.json({ error: 'Error fetching extras' }, { status: 500 });
  }

  return NextResponse.json({ extras: productExtraGroups });
}
