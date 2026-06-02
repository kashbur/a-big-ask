exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const token = process.env.TINYURL_TOKEN;
  if (!token) {
    return json(500, { error: "TinyURL token is not configured" });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (error) {
    return json(400, { error: "Invalid JSON body" });
  }

  const longUrl = String(payload.url || "").trim();
  if (!/^https?:\/\//i.test(longUrl)) {
    return json(400, { error: "A valid http or https URL is required" });
  }

  try {
    const response = await fetch("https://api.tinyurl.com/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: longUrl,
        domain: "tinyurl.com",
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return json(response.status, {
        error: data.errors?.[0] || data.message || "TinyURL request failed",
      });
    }

    const shortUrl = data.data?.tiny_url;
    if (!shortUrl) {
      return json(502, { error: "TinyURL did not return a short URL" });
    }

    return json(200, { shortUrl });
  } catch (error) {
    return json(502, { error: "Unable to reach TinyURL" });
  }
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}
