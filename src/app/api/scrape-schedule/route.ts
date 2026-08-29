import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || !url.startsWith("https://jadwalmisa.id/")) {
      return NextResponse.json({ error: "Invalid URL. Must be a jadwalmisa.id URL." }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch from jadwalmisa.id" }, { status: 500 });
    }

    const html = await res.text();
    
    // Extract __NEXT_DATA__
    const searchStr = '__NEXT_DATA__" type="application/json">';
    const startIdx = html.indexOf(searchStr);
    
    if (startIdx === -1) {
      return NextResponse.json({ error: "Could not find schedule data in page" }, { status: 500 });
    }
    
    const start = startIdx + searchStr.length;
    const end = html.indexOf('</script>', start);
    
    if (end === -1) {
      return NextResponse.json({ error: "Malformed page structure" }, { status: 500 });
    }

    const jsonStr = html.substring(start, end);
    const data = JSON.parse(jsonStr);
    
    const churchData = data?.props?.pageProps?.churchData;
    
    if (!churchData) {
      return NextResponse.json({ error: "No church data found for this URL" }, { status: 404 });
    }

    return NextResponse.json({ data: churchData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

