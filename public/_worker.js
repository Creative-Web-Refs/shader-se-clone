const ORIGIN = "https://www.shader.se";
const MIRROR_HEADER = "Shader.se mirror - original rights belong to Shader Sweden AB";

function createOriginRequest(request) {
  const incomingUrl = new URL(request.url);
  const originUrl = new URL(incomingUrl.pathname + incomingUrl.search, ORIGIN);
  const headers = new Headers(request.headers);

  headers.delete("cf-connecting-ip");
  headers.delete("cf-ipcountry");
  headers.delete("cf-ray");
  headers.delete("cf-visitor");
  headers.delete("cookie");
  headers.delete("x-forwarded-for");
  headers.delete("x-forwarded-host");
  headers.delete("x-forwarded-proto");
  headers.set("referer", `${ORIGIN}/`);

  const init = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
  }

  return new Request(originUrl, init);
}

function rewriteLocation(headers, mirrorOrigin) {
  const location = headers.get("location");
  if (!location) return;

  try {
    const locationUrl = new URL(location, ORIGIN);
    if (locationUrl.origin === ORIGIN) {
      headers.set(
        "location",
        `${mirrorOrigin}${locationUrl.pathname}${locationUrl.search}${locationUrl.hash}`,
      );
    }
  } catch {
    // Preserve malformed or non-URL Location values byte-for-byte.
  }
}

export default {
  async fetch(request) {
    const incomingUrl = new URL(request.url);

    if (incomingUrl.pathname === "/__mirror-health") {
      return Response.json({
        ok: true,
        mode: "live-reverse-proxy",
        origin: ORIGIN,
      });
    }

    try {
      const originResponse = await fetch(createOriginRequest(request));
      const headers = new Headers(originResponse.headers);

      rewriteLocation(headers, incomingUrl.origin);
      headers.set("x-mirror-source", ORIGIN);
      headers.set("x-mirror-notice", MIRROR_HEADER);

      return new Response(originResponse.body, {
        status: originResponse.status,
        statusText: originResponse.statusText,
        headers,
      });
    } catch {
      return new Response(
        "The Shader.se mirror could not reach its upstream origin. Please retry shortly.",
        {
          status: 502,
          headers: {
            "cache-control": "no-store",
            "content-type": "text/plain; charset=utf-8",
            "x-mirror-notice": MIRROR_HEADER,
          },
        },
      );
    }
  },
};
