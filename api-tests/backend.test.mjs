import test from "node:test";
import assert from "node:assert/strict";

import { handleRequest } from "../worker/src/index.js";

function request(path, { method = "GET", body, headers = {} } = {}) {
  const allHeaders = new Headers(headers);
  if (body !== undefined && !allHeaders.has("Content-Type")) allHeaders.set("Content-Type", "application/json");
  if (body !== undefined && !allHeaders.has("CF-Connecting-IP")) allHeaders.set("CF-Connecting-IP", `test-${Math.random()}`);
  return new Request(`https://api.example.test${path}`, {
    method,
    headers: allHeaders,
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
}

test("health endpoint reports AI binding state without leaking configuration", async () => {
  const response = await handleRequest(request("/health"), {});
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, service: "mazinmind-receptionist-api", mode: "ai-unavailable" });
});

test("unknown route returns stable JSON error", async () => {
  const response = await handleRequest(request("/nope"), {});
  assert.equal(response.status, 404);
  assert.equal((await response.json()).error.code, "NOT_FOUND");
});

test("chat requires JSON content type", async () => {
  const response = await handleRequest(request("/api/v1/chat", { method: "POST", body: "hello", headers: { "Content-Type": "text/plain" } }), {});
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, "INVALID_CONTENT_TYPE");
});

test("chat rejects invalid JSON", async () => {
  const response = await handleRequest(request("/api/v1/chat", { method: "POST", body: "{broken" }), {});
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, "INVALID_JSON");
});

test("chat validates message length and presence", async () => {
  const response = await handleRequest(request("/api/v1/chat", { method: "POST", body: { message: " " } }), { AI: { run: async () => ({ response: "should not run" }) } });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, "INVALID_REQUEST");
});

test("chat returns graceful 503 when Workers AI binding is missing", async () => {
  const response = await handleRequest(request("/api/v1/chat", { method: "POST", body: { message: "I need a plumber" } }), {});
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error.code, "AI_UNAVAILABLE");
});

test("chat invokes the provider adapter and returns normalized reply", async () => {
  let calledWith;
  const env = { AI: { run: async (model, input) => { calledWith = { model, input }; return { response: "I can help collect the service details." }; } } };
  const response = await handleRequest(request("/api/v1/chat", { method: "POST", body: { message: "I need a plumber", profile: "hvac" } }), env);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { reply: "I can help collect the service details.", provider: "cloudflare-workers-ai" });
  assert.equal(calledWith.model, "@cf/meta/llama-3.1-8b-instruct");
  assert.equal(calledWith.input.messages[1].content, "I need a plumber");
  assert.match(calledWith.input.messages[0].content, /Never invent prices/);
});

test("provider failures are hidden behind a stable error response", async () => {
  const response = await handleRequest(request("/api/v1/chat", { method: "POST", body: { message: "Need help" } }), { AI: { run: async () => { throw new Error("private upstream detail"); } } });
  assert.equal(response.status, 502);
  const data = await response.json();
  assert.equal(data.error.code, "MODEL_PROVIDER_ERROR");
  assert.doesNotMatch(JSON.stringify(data), /private upstream detail/);
});

test("configured CORS origin receives explicit allow-origin header", async () => {
  const response = await handleRequest(request("/health", { headers: { Origin: "https://mazinmind-digital.github.io" } }), {});
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "https://mazinmind-digital.github.io");
});

test("unapproved browser origin is rejected", async () => {
  const response = await handleRequest(request("/api/v1/chat", { method: "POST", body: { message: "hello" }, headers: { Origin: "https://attacker.example" } }), { AI: { run: async () => ({ response: "no" }) } });
  assert.equal(response.status, 403);
  assert.equal((await response.json()).error.code, "ORIGIN_NOT_ALLOWED");
});
