// Cloudflare Pages Function – nur für /assets/video/*
//
// Warum: Cloudflare Pages liefert statische Dateien ohne Teilabruf ("Range",
// Antwort 206) aus. Safari auf iPhone/iPad/Mac verlangt Teilabrufe, sonst
// spielt es <video> nicht ab. Diese Funktion holt die Datei aus den statischen
// Assets und schneidet den angefragten Bereich heraus.
//
// Die Videos hier sind klein (wenige MB), deshalb ist das Einlesen im Speicher
// unkritisch. Für große Videos stattdessen Vimeo/Cloudflare Stream nehmen.

export async function onRequest({ request, env }) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return env.ASSETS.fetch(request);
  }

  // Datei ohne Range-Header aus den statischen Assets holen
  const asset = await env.ASSETS.fetch(new Request(request.url, { method: 'GET' }));
  const type = asset.headers.get('Content-Type') || '';
  if (!asset.ok || !type.startsWith('video/')) {
    return asset; // unbekannter Pfad o. Ä.: unverändert durchreichen
  }

  const headers = new Headers(asset.headers);
  headers.set('Accept-Ranges', 'bytes');

  const range = request.headers.get('Range');
  if (!range) {
    return new Response(request.method === 'HEAD' ? null : asset.body, { status: 200, headers });
  }

  const data = await asset.arrayBuffer();
  const size = data.byteLength;
  const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());

  let start, end;
  if (m && m[1] !== '') {
    start = parseInt(m[1], 10);
    end = m[2] !== '' ? Math.min(parseInt(m[2], 10), size - 1) : size - 1;
  } else if (m && m[2] !== '') {
    start = Math.max(0, size - parseInt(m[2], 10)); // "bytes=-500": die letzten 500 Bytes
    end = size - 1;
  }

  if (start === undefined || start >= size || start > end) {
    headers.set('Content-Range', `bytes */${size}`);
    headers.delete('Content-Length');
    return new Response(null, { status: 416, headers });
  }

  headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  headers.set('Content-Length', String(end - start + 1));
  return new Response(request.method === 'HEAD' ? null : data.slice(start, end + 1), { status: 206, headers });
}
