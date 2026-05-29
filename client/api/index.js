import server from '../dist/server/server.js';

export default async function handler(req, res) {
  try {
    // Construct the full URL
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const url = `${protocol}://${host}${req.url}`;

    // Read the body if any
    let body = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      body = Buffer.concat(buffers);
    }

    // Construct Web Request
    const webRequest = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: body,
    });

    // Run the server fetch
    const webResponse = await server.fetch(webRequest);

    // Write headers
    res.status(webResponse.status);
    webResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Write body
    const responseBody = await webResponse.arrayBuffer();
    res.end(Buffer.from(responseBody));
  } catch (error) {
    console.error('Error in custom Vercel handler:', error);
    res.status(500).send('Internal Server Error');
  }
}
