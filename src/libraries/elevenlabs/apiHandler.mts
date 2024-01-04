export async function base(
  endpoint: string,
  method: "GET" | "POST" | "DELETE",
  headers?: Record<string, string>,
  body?: any
) {
  const baseUrl = "https://api.elevenlabs.io/v1";
  return await fetch(baseUrl + endpoint, {
      method,
      headers,
      body: body ?? undefined,
  });
}

export async function get(endpoint: string, contentType: string, apiKey: string, accept?: string) {
  return await base(endpoint, "GET", {
      "Content-Type": contentType ?? "",
      "xi-api-key": apiKey ?? "",
      accept: accept ?? "",
  });
}

export async function jsonGet(endpoint: string, apiKey: string) {
  return await get(endpoint, "application/json", apiKey, "application/json")
      .then((response) => response.json())
      .catch((error) => console.log(error));
}

export async function audioGet(endpoint: string, apiKey: string) {
  return await get(endpoint, "", apiKey, "audio/mpeg")
      .then((response) => response.blob())
      .catch((error) => console.log(error));
}

export async function post(endpoint: string, headers: Record<string, string>, body?: any) {
  return await base(endpoint, "POST", headers, body);
}

export async function jsonPost(endpoint: string, apiKey: string, body?: any) {
  return await post(endpoint, {
      "Content-Type": "application/json",
      "xi-api-key": apiKey ?? "",
  }, JSON.stringify(body))
      .then((response) => response.json())
      .catch((error) => console.log(error));
}

export async function fullJsonPost(endpoint: string, apiKey: string, body?: any) {
  return await post(endpoint, {
      "Content-Type": "application/json",
      "xi-api-key": apiKey ?? "",
      accept: "application/json",
  }, JSON.stringify(body))
      .then((response) => response.json())
      .catch((error) => console.log(error));
}

export async function audioPost(endpoint: string, apiKey: string, body?: any) {
  return await post(endpoint, {
      accept: "audio/mpeg",
      "xi-api-key": apiKey ?? "",
      "Content-Type": "application/json",
  }, JSON.stringify(body))
      .then((response) => response.blob())
      .catch((error) => console.log(error));
}

export async function deleteReq(endpoint: string, apiKey: string) {
  return await base(endpoint, "DELETE", {
      "Content-Type": "application/json",
      "xi-api-key": apiKey ?? "",
  }, {})
      .then((response) => response.json())
      .catch((error) => console.log(error));
}