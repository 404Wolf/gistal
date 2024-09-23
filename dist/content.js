// node_modules/@valtown/sdk/version.mjs
var VERSION = "0.23.0";

// node_modules/@valtown/sdk/_shims/registry.mjs
function setShims(shims, options = { auto: false }) {
  if (auto) {
    throw new Error(`you must \`import '@valtown/sdk/shims/${shims.kind}'\` before importing anything else from @valtown/sdk`);
  }
  if (kind) {
    throw new Error(`can't \`import '@valtown/sdk/shims/${shims.kind}'\` after \`import '@valtown/sdk/shims/${kind}'\``);
  }
  auto = options.auto;
  kind = shims.kind;
  fetch2 = shims.fetch;
  Request2 = shims.Request;
  Response2 = shims.Response;
  Headers2 = shims.Headers;
  FormData2 = shims.FormData;
  Blob2 = shims.Blob;
  File2 = shims.File;
  ReadableStream2 = shims.ReadableStream;
  getMultipartRequestOptions = shims.getMultipartRequestOptions;
  getDefaultAgent = shims.getDefaultAgent;
  fileFromPath = shims.fileFromPath;
  isFsReadStream = shims.isFsReadStream;
}
var auto = false;
var kind = undefined;
var fetch2 = undefined;
var Request2 = undefined;
var Response2 = undefined;
var Headers2 = undefined;
var FormData2 = undefined;
var Blob2 = undefined;
var File2 = undefined;
var ReadableStream2 = undefined;
var getMultipartRequestOptions = undefined;
var getDefaultAgent = undefined;
var fileFromPath = undefined;
var isFsReadStream = undefined;

// node_modules/@valtown/sdk/_shims/MultipartBody.mjs
class MultipartBody {
  constructor(body) {
    this.body = body;
  }
  get [Symbol.toStringTag]() {
    return "MultipartBody";
  }
}

// node_modules/@valtown/sdk/_shims/web-runtime.mjs
function getRuntime({ manuallyImported } = {}) {
  const recommendation = manuallyImported ? `You may need to use polyfills` : `Add one of these imports before your first \`import \u2026 from '@valtown/sdk'\`:
- \`import '@valtown/sdk/shims/node'\` (if you're running on Node)
- \`import '@valtown/sdk/shims/web'\` (otherwise)
`;
  let _fetch, _Request, _Response, _Headers;
  try {
    _fetch = fetch;
    _Request = Request;
    _Response = Response;
    _Headers = Headers;
  } catch (error) {
    throw new Error(`this environment is missing the following Web Fetch API type: ${error.message}. ${recommendation}`);
  }
  return {
    kind: "web",
    fetch: _fetch,
    Request: _Request,
    Response: _Response,
    Headers: _Headers,
    FormData: typeof FormData !== "undefined" ? FormData : class FormData3 {
      constructor() {
        throw new Error(`file uploads aren't supported in this environment yet as 'FormData' is undefined. ${recommendation}`);
      }
    },
    Blob: typeof Blob !== "undefined" ? Blob : class Blob3 {
      constructor() {
        throw new Error(`file uploads aren't supported in this environment yet as 'Blob' is undefined. ${recommendation}`);
      }
    },
    File: typeof File !== "undefined" ? File : class File3 {
      constructor() {
        throw new Error(`file uploads aren't supported in this environment yet as 'File' is undefined. ${recommendation}`);
      }
    },
    ReadableStream: typeof ReadableStream !== "undefined" ? ReadableStream : class ReadableStream3 {
      constructor() {
        throw new Error(`streaming isn't supported in this environment yet as 'ReadableStream' is undefined. ${recommendation}`);
      }
    },
    getMultipartRequestOptions: async (form, opts) => ({
      ...opts,
      body: new MultipartBody(form)
    }),
    getDefaultAgent: (url) => {
      return;
    },
    fileFromPath: () => {
      throw new Error("The `fileFromPath` function is only supported in Node. See the README for more details: https://www.github.com/val-town/sdk#file-uploads");
    },
    isFsReadStream: (value) => false
  };
}

// node_modules/@valtown/sdk/_shims/index.mjs
if (!kind)
  setShims(getRuntime(), { auto: true });

// node_modules/@valtown/sdk/uploads.mjs
async function toFile(value, name, options) {
  value = await value;
  if (isFileLike(value)) {
    return value;
  }
  if (isResponseLike(value)) {
    const blob = await value.blob();
    name || (name = new URL(value.url).pathname.split(/[\\/]/).pop() ?? "unknown_file");
    const data = isBlobLike(blob) ? [await blob.arrayBuffer()] : [blob];
    return new File2(data, name, options);
  }
  const bits = await getBytes(value);
  name || (name = getName(value) ?? "unknown_file");
  if (!options?.type) {
    const type = bits[0]?.type;
    if (typeof type === "string") {
      options = { ...options, type };
    }
  }
  return new File2(bits, name, options);
}
async function getBytes(value) {
  let parts = [];
  if (typeof value === "string" || ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
    parts.push(value);
  } else if (isBlobLike(value)) {
    parts.push(await value.arrayBuffer());
  } else if (isAsyncIterableIterator(value)) {
    for await (const chunk of value) {
      parts.push(chunk);
    }
  } else {
    throw new Error(`Unexpected data type: ${typeof value}; constructor: ${value?.constructor?.name}; props: ${propsForError(value)}`);
  }
  return parts;
}
function propsForError(value) {
  const props = Object.getOwnPropertyNames(value);
  return `[${props.map((p) => `"${p}"`).join(", ")}]`;
}
function getName(value) {
  return getStringFromMaybeBuffer(value.name) || getStringFromMaybeBuffer(value.filename) || getStringFromMaybeBuffer(value.path)?.split(/[\\/]/).pop();
}
var isResponseLike = (value) => value != null && typeof value === "object" && typeof value.url === "string" && typeof value.blob === "function";
var isFileLike = (value) => value != null && typeof value === "object" && typeof value.name === "string" && typeof value.lastModified === "number" && isBlobLike(value);
var isBlobLike = (value) => value != null && typeof value === "object" && typeof value.size === "number" && typeof value.type === "string" && typeof value.text === "function" && typeof value.slice === "function" && typeof value.arrayBuffer === "function";
var getStringFromMaybeBuffer = (x) => {
  if (typeof x === "string")
    return x;
  if (typeof Buffer !== "undefined" && x instanceof Buffer)
    return String(x);
  return;
};
var isAsyncIterableIterator = (value) => value != null && typeof value === "object" && typeof value[Symbol.asyncIterator] === "function";
var isMultipartBody = (body) => body && typeof body === "object" && body.body && body[Symbol.toStringTag] === "MultipartBody";

// node_modules/@valtown/sdk/core.mjs
async function defaultParseResponse(props) {
  const { response } = props;
  if (response.status === 204) {
    return null;
  }
  if (props.options.__binaryResponse) {
    return response;
  }
  const contentType = response.headers.get("content-type");
  const isJSON = contentType?.includes("application/json") || contentType?.includes("application/vnd.api+json");
  if (isJSON) {
    const json = await response.json();
    debug("response", response.status, response.url, response.headers, json);
    return json;
  }
  const text = await response.text();
  debug("response", response.status, response.url, response.headers, text);
  return text;
}
function getBrowserInfo() {
  if (typeof navigator === "undefined" || !navigator) {
    return null;
  }
  const browserPatterns = [
    { key: "edge", pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "chrome", pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "firefox", pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "safari", pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/ }
  ];
  for (const { key, pattern } of browserPatterns) {
    const match = pattern.exec(navigator.userAgent);
    if (match) {
      const major = match[1] || 0;
      const minor = match[2] || 0;
      const patch = match[3] || 0;
      return { browser: key, version: `${major}.${minor}.${patch}` };
    }
  }
  return null;
}
function isEmptyObj(obj) {
  if (!obj)
    return true;
  for (const _k in obj)
    return false;
  return true;
}
function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
function applyHeadersMut(targetHeaders, newHeaders) {
  for (const k in newHeaders) {
    if (!hasOwn(newHeaders, k))
      continue;
    const lowerKey = k.toLowerCase();
    if (!lowerKey)
      continue;
    const val = newHeaders[k];
    if (val === null) {
      delete targetHeaders[lowerKey];
    } else if (val !== undefined) {
      targetHeaders[lowerKey] = val;
    }
  }
}
function debug(action, ...args) {
  if (typeof process !== "undefined" && process?.env?.["DEBUG"] === "true") {
    console.log(`ValTown:DEBUG:${action}`, ...args);
  }
}
var __classPrivateFieldSet = function(receiver, state, value, kind2, f) {
  if (kind2 === "m")
    throw new TypeError("Private method is not writable");
  if (kind2 === "a" && !f)
    throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind2 === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
};
var __classPrivateFieldGet = function(receiver, state, kind2, f) {
  if (kind2 === "a" && !f)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind2 === "m" ? f : kind2 === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AbstractPage_client;

class APIPromise extends Promise {
  constructor(responsePromise, parseResponse = defaultParseResponse) {
    super((resolve) => {
      resolve(null);
    });
    this.responsePromise = responsePromise;
    this.parseResponse = parseResponse;
  }
  _thenUnwrap(transform) {
    return new APIPromise(this.responsePromise, async (props) => transform(await this.parseResponse(props)));
  }
  asResponse() {
    return this.responsePromise.then((p) => p.response);
  }
  async withResponse() {
    const [data, response] = await Promise.all([this.parse(), this.asResponse()]);
    return { data, response };
  }
  parse() {
    if (!this.parsedPromise) {
      this.parsedPromise = this.responsePromise.then(this.parseResponse);
    }
    return this.parsedPromise;
  }
  then(onfulfilled, onrejected) {
    return this.parse().then(onfulfilled, onrejected);
  }
  catch(onrejected) {
    return this.parse().catch(onrejected);
  }
  finally(onfinally) {
    return this.parse().finally(onfinally);
  }
}

class APIClient {
  constructor({
    baseURL,
    maxRetries = 2,
    timeout = 60000,
    httpAgent,
    fetch: overridenFetch
  }) {
    this.baseURL = baseURL;
    this.maxRetries = validatePositiveInteger("maxRetries", maxRetries);
    this.timeout = validatePositiveInteger("timeout", timeout);
    this.httpAgent = httpAgent;
    this.fetch = overridenFetch ?? fetch2;
  }
  authHeaders(opts) {
    return {};
  }
  defaultHeaders(opts) {
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": this.getUserAgent(),
      ...getPlatformHeaders(),
      ...this.authHeaders(opts)
    };
  }
  validateHeaders(headers, customHeaders) {
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${uuid4()}`;
  }
  get(path, opts) {
    return this.methodRequest("get", path, opts);
  }
  post(path, opts) {
    return this.methodRequest("post", path, opts);
  }
  patch(path, opts) {
    return this.methodRequest("patch", path, opts);
  }
  put(path, opts) {
    return this.methodRequest("put", path, opts);
  }
  delete(path, opts) {
    return this.methodRequest("delete", path, opts);
  }
  methodRequest(method, path, opts) {
    return this.request(Promise.resolve(opts).then(async (opts2) => {
      const body = opts2 && isBlobLike(opts2?.body) ? new DataView(await opts2.body.arrayBuffer()) : opts2?.body instanceof DataView ? opts2.body : opts2?.body instanceof ArrayBuffer ? new DataView(opts2.body) : opts2 && ArrayBuffer.isView(opts2?.body) ? new DataView(opts2.body.buffer) : opts2?.body;
      return { method, path, ...opts2, body };
    }));
  }
  getAPIList(path, Page, opts) {
    return this.requestAPIList(Page, { method: "get", path, ...opts });
  }
  calculateContentLength(body) {
    if (typeof body === "string") {
      if (typeof Buffer !== "undefined") {
        return Buffer.byteLength(body, "utf8").toString();
      }
      if (typeof TextEncoder !== "undefined") {
        const encoder = new TextEncoder;
        const encoded = encoder.encode(body);
        return encoded.length.toString();
      }
    } else if (ArrayBuffer.isView(body)) {
      return body.byteLength.toString();
    }
    return null;
  }
  buildRequest(options) {
    const { method, path, query, headers = {} } = options;
    const body = ArrayBuffer.isView(options.body) || options.__binaryRequest && typeof options.body === "string" ? options.body : isMultipartBody(options.body) ? options.body.body : options.body ? JSON.stringify(options.body, null, 2) : null;
    const contentLength = this.calculateContentLength(body);
    const url = this.buildURL(path, query);
    if ("timeout" in options)
      validatePositiveInteger("timeout", options.timeout);
    const timeout = options.timeout ?? this.timeout;
    const httpAgent = options.httpAgent ?? this.httpAgent ?? getDefaultAgent(url);
    const minAgentTimeout = timeout + 1000;
    if (typeof httpAgent?.options?.timeout === "number" && minAgentTimeout > (httpAgent.options.timeout ?? 0)) {
      httpAgent.options.timeout = minAgentTimeout;
    }
    if (this.idempotencyHeader && method !== "get") {
      if (!options.idempotencyKey)
        options.idempotencyKey = this.defaultIdempotencyKey();
      headers[this.idempotencyHeader] = options.idempotencyKey;
    }
    const reqHeaders = this.buildHeaders({ options, headers, contentLength });
    const req = {
      method,
      ...body && { body },
      headers: reqHeaders,
      ...httpAgent && { agent: httpAgent },
      signal: options.signal ?? null
    };
    return { req, url, timeout };
  }
  buildHeaders({ options, headers, contentLength }) {
    const reqHeaders = {};
    if (contentLength) {
      reqHeaders["content-length"] = contentLength;
    }
    const defaultHeaders = this.defaultHeaders(options);
    applyHeadersMut(reqHeaders, defaultHeaders);
    applyHeadersMut(reqHeaders, headers);
    if (isMultipartBody(options.body) && kind !== "node") {
      delete reqHeaders["content-type"];
    }
    this.validateHeaders(reqHeaders, headers);
    return reqHeaders;
  }
  async prepareOptions(options) {
  }
  async prepareRequest(request, { url, options }) {
  }
  parseHeaders(headers) {
    return !headers ? {} : (Symbol.iterator in headers) ? Object.fromEntries(Array.from(headers).map((header) => [...header])) : { ...headers };
  }
  makeStatusError(status, error, message, headers) {
    return APIError.generate(status, error, message, headers);
  }
  request(options, remainingRetries = null) {
    return new APIPromise(this.makeRequest(options, remainingRetries));
  }
  async makeRequest(optionsInput, retriesRemaining) {
    const options = await optionsInput;
    if (retriesRemaining == null) {
      retriesRemaining = options.maxRetries ?? this.maxRetries;
    }
    await this.prepareOptions(options);
    const { req, url, timeout } = this.buildRequest(options);
    await this.prepareRequest(req, { url, options });
    debug("request", url, options, req.headers);
    if (options.signal?.aborted) {
      throw new APIUserAbortError;
    }
    const controller = new AbortController;
    const response = await this.fetchWithTimeout(url, req, timeout, controller).catch(castToError);
    if (response instanceof Error) {
      if (options.signal?.aborted) {
        throw new APIUserAbortError;
      }
      if (retriesRemaining) {
        return this.retryRequest(options, retriesRemaining);
      }
      if (response.name === "AbortError") {
        throw new APIConnectionTimeoutError;
      }
      throw new APIConnectionError({ cause: response });
    }
    const responseHeaders = createResponseHeaders(response.headers);
    if (!response.ok) {
      if (retriesRemaining && this.shouldRetry(response)) {
        const retryMessage2 = `retrying, ${retriesRemaining} attempts remaining`;
        debug(`response (error; ${retryMessage2})`, response.status, url, responseHeaders);
        return this.retryRequest(options, retriesRemaining, responseHeaders);
      }
      const errText = await response.text().catch((e) => castToError(e).message);
      const errJSON = safeJSON(errText);
      const errMessage = errJSON ? undefined : errText;
      const retryMessage = retriesRemaining ? `(error; no more retries left)` : `(error; not retryable)`;
      debug(`response (error; ${retryMessage})`, response.status, url, responseHeaders, errMessage);
      const err = this.makeStatusError(response.status, errJSON, errMessage, responseHeaders);
      throw err;
    }
    return { response, options, controller };
  }
  requestAPIList(Page, options) {
    const request = this.makeRequest(options, null);
    return new PagePromise(this, request, Page);
  }
  buildURL(path, query) {
    const url = isAbsoluteURL(path) ? new URL(path) : new URL(this.baseURL + (this.baseURL.endsWith("/") && path.startsWith("/") ? path.slice(1) : path));
    const defaultQuery = this.defaultQuery();
    if (!isEmptyObj(defaultQuery)) {
      query = { ...defaultQuery, ...query };
    }
    if (typeof query === "object" && query && !Array.isArray(query)) {
      url.search = this.stringifyQuery(query);
    }
    return url.toString();
  }
  stringifyQuery(query) {
    return Object.entries(query).filter(([_, value]) => typeof value !== "undefined").map(([key, value]) => {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      }
      if (value === null) {
        return `${encodeURIComponent(key)}=`;
      }
      throw new ValTownError(`Cannot stringify type ${typeof value}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
    }).join("&");
  }
  async fetchWithTimeout(url, init, ms, controller) {
    const { signal, ...options } = init || {};
    if (signal)
      signal.addEventListener("abort", () => controller.abort());
    const timeout = setTimeout(() => controller.abort(), ms);
    return this.getRequestClient().fetch.call(undefined, url, { signal: controller.signal, ...options }).finally(() => {
      clearTimeout(timeout);
    });
  }
  getRequestClient() {
    return { fetch: this.fetch };
  }
  shouldRetry(response) {
    const shouldRetryHeader = response.headers.get("x-should-retry");
    if (shouldRetryHeader === "true")
      return true;
    if (shouldRetryHeader === "false")
      return false;
    if (response.status === 408)
      return true;
    if (response.status === 409)
      return true;
    if (response.status === 429)
      return true;
    if (response.status >= 500)
      return true;
    return false;
  }
  async retryRequest(options, retriesRemaining, responseHeaders) {
    let timeoutMillis;
    const retryAfterMillisHeader = responseHeaders?.["retry-after-ms"];
    if (retryAfterMillisHeader) {
      const timeoutMs = parseFloat(retryAfterMillisHeader);
      if (!Number.isNaN(timeoutMs)) {
        timeoutMillis = timeoutMs;
      }
    }
    const retryAfterHeader = responseHeaders?.["retry-after"];
    if (retryAfterHeader && !timeoutMillis) {
      const timeoutSeconds = parseFloat(retryAfterHeader);
      if (!Number.isNaN(timeoutSeconds)) {
        timeoutMillis = timeoutSeconds * 1000;
      } else {
        timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
      }
    }
    if (!(timeoutMillis && 0 <= timeoutMillis && timeoutMillis < 60 * 1000)) {
      const maxRetries = options.maxRetries ?? this.maxRetries;
      timeoutMillis = this.calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries);
    }
    await sleep(timeoutMillis);
    return this.makeRequest(options, retriesRemaining - 1);
  }
  calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries) {
    const initialRetryDelay = 0.5;
    const maxRetryDelay = 8;
    const numRetries = maxRetries - retriesRemaining;
    const sleepSeconds = Math.min(initialRetryDelay * Math.pow(2, numRetries), maxRetryDelay);
    const jitter = 1 - Math.random() * 0.25;
    return sleepSeconds * jitter * 1000;
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${VERSION}`;
  }
}

class AbstractPage {
  constructor(client, response, body, options) {
    _AbstractPage_client.set(this, undefined);
    __classPrivateFieldSet(this, _AbstractPage_client, client, "f");
    this.options = options;
    this.response = response;
    this.body = body;
  }
  hasNextPage() {
    const items = this.getPaginatedItems();
    if (!items.length)
      return false;
    return this.nextPageInfo() != null;
  }
  async getNextPage() {
    const nextInfo = this.nextPageInfo();
    if (!nextInfo) {
      throw new ValTownError("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    }
    const nextOptions = { ...this.options };
    if ("params" in nextInfo && typeof nextOptions.query === "object") {
      nextOptions.query = { ...nextOptions.query, ...nextInfo.params };
    } else if ("url" in nextInfo) {
      const params = [...Object.entries(nextOptions.query || {}), ...nextInfo.url.searchParams.entries()];
      for (const [key, value] of params) {
        nextInfo.url.searchParams.set(key, value);
      }
      nextOptions.query = undefined;
      nextOptions.path = nextInfo.url.toString();
    }
    return await __classPrivateFieldGet(this, _AbstractPage_client, "f").requestAPIList(this.constructor, nextOptions);
  }
  async* iterPages() {
    let page = this;
    yield page;
    while (page.hasNextPage()) {
      page = await page.getNextPage();
      yield page;
    }
  }
  async* [(_AbstractPage_client = new WeakMap, Symbol.asyncIterator)]() {
    for await (const page of this.iterPages()) {
      for (const item of page.getPaginatedItems()) {
        yield item;
      }
    }
  }
}

class PagePromise extends APIPromise {
  constructor(client, request, Page) {
    super(request, async (props) => new Page(client, props.response, await defaultParseResponse(props), props.options));
  }
  async* [Symbol.asyncIterator]() {
    const page = await this;
    for await (const item of page) {
      yield item;
    }
  }
}
var createResponseHeaders = (headers) => {
  return new Proxy(Object.fromEntries(headers.entries()), {
    get(target, name) {
      const key = name.toString();
      return target[key.toLowerCase()] || target[key];
    }
  });
};
var requestOptionsKeys = {
  method: true,
  path: true,
  query: true,
  body: true,
  headers: true,
  maxRetries: true,
  stream: true,
  timeout: true,
  httpAgent: true,
  signal: true,
  idempotencyKey: true,
  __binaryRequest: true,
  __binaryResponse: true
};
var isRequestOptions = (obj) => {
  return typeof obj === "object" && obj !== null && !isEmptyObj(obj) && Object.keys(obj).every((k) => hasOwn(requestOptionsKeys, k));
};
var getPlatformProperties = () => {
  if (typeof Deno !== "undefined" && Deno.build != null) {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": normalizePlatform(Deno.build.os),
      "X-Stainless-Arch": normalizeArch(Deno.build.arch),
      "X-Stainless-Runtime": "deno",
      "X-Stainless-Runtime-Version": typeof Deno.version === "string" ? Deno.version : Deno.version?.deno ?? "unknown"
    };
  }
  if (typeof EdgeRuntime !== "undefined") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": `other:${EdgeRuntime}`,
      "X-Stainless-Runtime": "edge",
      "X-Stainless-Runtime-Version": process.version
    };
  }
  if (Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": normalizePlatform(process.platform),
      "X-Stainless-Arch": normalizeArch(process.arch),
      "X-Stainless-Runtime": "node",
      "X-Stainless-Runtime-Version": process.version
    };
  }
  const browserInfo = getBrowserInfo();
  if (browserInfo) {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": "unknown",
      "X-Stainless-Runtime": `browser:${browserInfo.browser}`,
      "X-Stainless-Runtime-Version": browserInfo.version
    };
  }
  return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": VERSION,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
var normalizeArch = (arch) => {
  if (arch === "x32")
    return "x32";
  if (arch === "x86_64" || arch === "x64")
    return "x64";
  if (arch === "arm")
    return "arm";
  if (arch === "aarch64" || arch === "arm64")
    return "arm64";
  if (arch)
    return `other:${arch}`;
  return "unknown";
};
var normalizePlatform = (platform) => {
  platform = platform.toLowerCase();
  if (platform.includes("ios"))
    return "iOS";
  if (platform === "android")
    return "Android";
  if (platform === "darwin")
    return "MacOS";
  if (platform === "win32")
    return "Windows";
  if (platform === "freebsd")
    return "FreeBSD";
  if (platform === "openbsd")
    return "OpenBSD";
  if (platform === "linux")
    return "Linux";
  if (platform)
    return `Other:${platform}`;
  return "Unknown";
};
var _platformHeaders;
var getPlatformHeaders = () => {
  return _platformHeaders ?? (_platformHeaders = getPlatformProperties());
};
var safeJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    return;
  }
};
var startsWithSchemeRegexp = new RegExp("^(?:[a-z]+:)?//", "i");
var isAbsoluteURL = (url) => {
  return startsWithSchemeRegexp.test(url);
};
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var validatePositiveInteger = (name, n) => {
  if (typeof n !== "number" || !Number.isInteger(n)) {
    throw new ValTownError(`${name} must be an integer`);
  }
  if (n < 0) {
    throw new ValTownError(`${name} must be a positive integer`);
  }
  return n;
};
var castToError = (err) => {
  if (err instanceof Error)
    return err;
  if (typeof err === "object" && err !== null) {
    try {
      return new Error(JSON.stringify(err));
    } catch {
    }
  }
  return new Error(err);
};
var readEnv = (env) => {
  if (typeof process !== "undefined") {
    return process.env?.[env]?.trim() ?? undefined;
  }
  if (typeof Deno !== "undefined") {
    return Deno.env?.get?.(env)?.trim();
  }
  return;
};
var uuid4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
};

// node_modules/@valtown/sdk/error.mjs
class ValTownError extends Error {
}

class APIError extends ValTownError {
  constructor(status, error, message, headers) {
    super(`${APIError.makeMessage(status, error, message)}`);
    this.status = status;
    this.headers = headers;
    this.error = error;
  }
  static makeMessage(status, error, message) {
    const msg = error?.message ? typeof error.message === "string" ? error.message : JSON.stringify(error.message) : error ? JSON.stringify(error) : message;
    if (status && msg) {
      return `${status} ${msg}`;
    }
    if (status) {
      return `${status} status code (no body)`;
    }
    if (msg) {
      return msg;
    }
    return "(no status code or body)";
  }
  static generate(status, errorResponse, message, headers) {
    if (!status) {
      return new APIConnectionError({ message, cause: castToError(errorResponse) });
    }
    const error = errorResponse;
    if (status === 400) {
      return new BadRequestError(status, error, message, headers);
    }
    if (status === 401) {
      return new AuthenticationError(status, error, message, headers);
    }
    if (status === 403) {
      return new PermissionDeniedError(status, error, message, headers);
    }
    if (status === 404) {
      return new NotFoundError(status, error, message, headers);
    }
    if (status === 409) {
      return new ConflictError(status, error, message, headers);
    }
    if (status === 422) {
      return new UnprocessableEntityError(status, error, message, headers);
    }
    if (status === 429) {
      return new RateLimitError(status, error, message, headers);
    }
    if (status >= 500) {
      return new InternalServerError(status, error, message, headers);
    }
    return new APIError(status, error, message, headers);
  }
}

class APIUserAbortError extends APIError {
  constructor({ message } = {}) {
    super(undefined, undefined, message || "Request was aborted.", undefined);
    this.status = undefined;
  }
}

class APIConnectionError extends APIError {
  constructor({ message, cause }) {
    super(undefined, undefined, message || "Connection error.", undefined);
    this.status = undefined;
    if (cause)
      this.cause = cause;
  }
}

class APIConnectionTimeoutError extends APIConnectionError {
  constructor({ message } = {}) {
    super({ message: message ?? "Request timed out." });
  }
}

class BadRequestError extends APIError {
  constructor() {
    super(...arguments);
    this.status = 400;
  }
}

class AuthenticationError extends APIError {
  constructor() {
    super(...arguments);
    this.status = 401;
  }
}

class PermissionDeniedError extends APIError {
  constructor() {
    super(...arguments);
    this.status = 403;
  }
}

class NotFoundError extends APIError {
  constructor() {
    super(...arguments);
    this.status = 404;
  }
}

class ConflictError extends APIError {
  constructor() {
    super(...arguments);
    this.status = 409;
  }
}

class UnprocessableEntityError extends APIError {
  constructor() {
    super(...arguments);
    this.status = 422;
  }
}

class RateLimitError extends APIError {
  constructor() {
    super(...arguments);
    this.status = 429;
  }
}

class InternalServerError extends APIError {
}

// node_modules/@valtown/sdk/pagination.mjs
class PageCursorURL extends AbstractPage {
  constructor(client, response, body, options) {
    super(client, response, body, options);
    this.data = body.data || [];
    this.links = body.links || {};
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageParams() {
    const info = this.nextPageInfo();
    if (!info)
      return null;
    if ("params" in info)
      return info.params;
    const params = Object.fromEntries(info.url.searchParams);
    if (!Object.keys(params).length)
      return null;
    return params;
  }
  nextPageInfo() {
    const url = this.links?.next;
    if (!url)
      return null;
    return { url: new URL(url) };
  }
}

// node_modules/@valtown/sdk/resources/shared.mjs
class BasicValsPageCursorURL extends PageCursorURL {
}
// node_modules/@valtown/sdk/resource.mjs
class APIResource {
  constructor(client) {
    this._client = client;
  }
}

// node_modules/@valtown/sdk/resources/alias/username/val-name.mjs
class ValName extends APIResource {
  retrieve(username, valName, options) {
    return this._client.get(`/v1/alias/${username}/${valName}`, options);
  }
}
(function(ValName2) {
})(ValName || (ValName = {}));

// node_modules/@valtown/sdk/resources/alias/username/username.mjs
class Username extends APIResource {
  constructor() {
    super(...arguments);
    this.valName = new ValName(this._client);
  }
  retrieve(username, options) {
    return this._client.get(`/v1/alias/${username}`, options);
  }
}
(function(Username2) {
  Username2.ValName = ValName;
})(Username || (Username = {}));

// node_modules/@valtown/sdk/resources/alias/alias.mjs
class Alias extends APIResource {
  constructor() {
    super(...arguments);
    this.username = new Username(this._client);
  }
}
(function(Alias2) {
  Alias2.Username = Username;
})(Alias || (Alias = {}));
// node_modules/@valtown/sdk/resources/blobs.mjs
class Blobs extends APIResource {
  list(query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.get("/v1/blob", { query, ...options });
  }
  delete(key, options) {
    return this._client.delete(`/v1/blob/${key}`, {
      ...options,
      headers: { Accept: "*/*", ...options?.headers }
    });
  }
  get(key, options) {
    return this._client.get(`/v1/blob/${key}`, { ...options, __binaryResponse: true });
  }
  store(key, body, options) {
    return this._client.post(`/v1/blob/${key}`, {
      body,
      ...options,
      headers: { Accept: "*/*", ...options?.headers },
      __binaryRequest: true
    });
  }
}
(function(Blobs2) {
})(Blobs || (Blobs = {}));
// node_modules/@valtown/sdk/resources/emails.mjs
class Emails extends APIResource {
  send(body = {}, options) {
    if (isRequestOptions(body)) {
      return this.send({}, body);
    }
    return this._client.post("/v1/email", { body, ...options });
  }
}
(function(Emails2) {
})(Emails || (Emails = {}));
// node_modules/@valtown/sdk/resources/me/comments.mjs
class Comments extends APIResource {
  list(query, options) {
    return this._client.getAPIList("/v1/me/comments", CommentListResponsesPageCursorURL, {
      query,
      ...options
    });
  }
}

class CommentListResponsesPageCursorURL extends PageCursorURL {
}
(function(Comments2) {
  Comments2.CommentListResponsesPageCursorURL = CommentListResponsesPageCursorURL;
})(Comments || (Comments = {}));

// node_modules/@valtown/sdk/resources/me/likes.mjs
class Likes extends APIResource {
  list(query, options) {
    return this._client.getAPIList("/v1/me/likes", BasicValsPageCursorURL, { query, ...options });
  }
}
(function(Likes2) {
})(Likes || (Likes = {}));

// node_modules/@valtown/sdk/resources/me/profile.mjs
class Profile extends APIResource {
  retrieve(options) {
    return this._client.get("/v1/me", options);
  }
}
(function(Profile2) {
})(Profile || (Profile = {}));

// node_modules/@valtown/sdk/resources/me/references.mjs
class References extends APIResource {
  list(query, options) {
    return this._client.getAPIList("/v1/me/references", ReferenceListResponsesPageCursorURL, {
      query,
      ...options
    });
  }
}

class ReferenceListResponsesPageCursorURL extends PageCursorURL {
}
(function(References2) {
  References2.ReferenceListResponsesPageCursorURL = ReferenceListResponsesPageCursorURL;
})(References || (References = {}));

// node_modules/@valtown/sdk/resources/me/me.mjs
class Me extends APIResource {
  constructor() {
    super(...arguments);
    this.profile = new Profile(this._client);
    this.likes = new Likes(this._client);
    this.comments = new Comments(this._client);
    this.references = new References(this._client);
  }
}
(function(Me2) {
  Me2.Profile = Profile;
  Me2.Likes = Likes;
  Me2.Comments = Comments;
  Me2.CommentListResponsesPageCursorURL = CommentListResponsesPageCursorURL;
  Me2.References = References;
  Me2.ReferenceListResponsesPageCursorURL = ReferenceListResponsesPageCursorURL;
})(Me || (Me = {}));
// node_modules/@valtown/sdk/resources/search/vals.mjs
class Vals extends APIResource {
  list(query, options) {
    return this._client.getAPIList("/v1/search/vals", BasicValsPageCursorURL, { query, ...options });
  }
}
(function(Vals2) {
})(Vals || (Vals = {}));

// node_modules/@valtown/sdk/resources/search/search.mjs
class Search extends APIResource {
  constructor() {
    super(...arguments);
    this.vals = new Vals(this._client);
  }
}
(function(Search2) {
  Search2.Vals = Vals;
})(Search || (Search = {}));
// node_modules/@valtown/sdk/resources/sqlite.mjs
class Sqlite extends APIResource {
  batch(body, options) {
    return this._client.post("/v1/sqlite/batch", { body, ...options });
  }
  execute(body, options) {
    return this._client.post("/v1/sqlite/execute", { body, ...options });
  }
}
(function(Sqlite2) {
})(Sqlite || (Sqlite = {}));
// node_modules/@valtown/sdk/resources/users/vals.mjs
class Vals2 extends APIResource {
  list(userId, query, options) {
    return this._client.getAPIList(`/v1/users/${userId}/vals`, BasicValsPageCursorURL, { query, ...options });
  }
}
(function(Vals3) {
})(Vals2 || (Vals2 = {}));

// node_modules/@valtown/sdk/resources/users/users.mjs
class Users extends APIResource {
  constructor() {
    super(...arguments);
    this.vals = new Vals2(this._client);
  }
  retrieve(userId, options) {
    return this._client.get(`/v1/users/${userId}`, options);
  }
}
(function(Users2) {
  Users2.Vals = Vals2;
})(Users || (Users = {}));
// node_modules/@valtown/sdk/resources/vals/versions.mjs
class Versions extends APIResource {
  create(valId, body, options) {
    return this._client.post(`/v1/vals/${valId}/versions`, { body, ...options });
  }
  retrieve(valId, version, query, options) {
    return this._client.get(`/v1/vals/${valId}/versions/${version}`, { query, ...options });
  }
  list(valId, query, options) {
    return this._client.getAPIList(`/v1/vals/${valId}/versions`, VersionListResponsesPageCursorURL, {
      query,
      ...options
    });
  }
  delete(valId, version, options) {
    return this._client.delete(`/v1/vals/${valId}/versions/${version}`, {
      ...options,
      headers: { Accept: "*/*", ...options?.headers }
    });
  }
}

class VersionListResponsesPageCursorURL extends PageCursorURL {
}
(function(Versions2) {
  Versions2.VersionListResponsesPageCursorURL = VersionListResponsesPageCursorURL;
})(Versions || (Versions = {}));

// node_modules/@valtown/sdk/resources/vals/vals.mjs
class Vals3 extends APIResource {
  constructor() {
    super(...arguments);
    this.versions = new Versions(this._client);
  }
  create(body, options) {
    return this._client.post("/v1/vals", { body, ...options });
  }
  retrieve(valId, options) {
    return this._client.get(`/v1/vals/${valId}`, options);
  }
  update(valId, body = {}, options) {
    if (isRequestOptions(body)) {
      return this.update(valId, {}, body);
    }
    return this._client.put(`/v1/vals/${valId}`, {
      body,
      ...options,
      headers: { Accept: "*/*", ...options?.headers }
    });
  }
  delete(valId, options) {
    return this._client.delete(`/v1/vals/${valId}`, {
      ...options,
      headers: { Accept: "*/*", ...options?.headers }
    });
  }
  cancelEvaluation(valId, evaluationId, options) {
    return this._client.post(`/v1/vals/${valId}/evaluations/${evaluationId}/cancel`, options);
  }
  createOrUpdate(body, options) {
    return this._client.put("/v1/vals", {
      body,
      ...options,
      headers: { Accept: "*/*", ...options?.headers }
    });
  }
}
(function(Vals4) {
  Vals4.Versions = Versions;
  Vals4.VersionListResponsesPageCursorURL = VersionListResponsesPageCursorURL;
})(Vals3 || (Vals3 = {}));
// node_modules/@valtown/sdk/index.mjs
var _a;

class ValTown extends APIClient {
  constructor({ baseURL = readEnv("VAL_TOWN_BASE_URL"), bearerToken = readEnv("VAL_TOWN_API_KEY"), ...opts } = {}) {
    if (bearerToken === undefined) {
      throw new ValTownError("The VAL_TOWN_API_KEY environment variable is missing or empty; either provide it, or instantiate the ValTown client with an bearerToken option, like new ValTown({ bearerToken: 'My Bearer Token' }).");
    }
    const options = {
      bearerToken,
      ...opts,
      baseURL: baseURL || `https://api.val.town`
    };
    super({
      baseURL: options.baseURL,
      timeout: options.timeout ?? 60000,
      httpAgent: options.httpAgent,
      maxRetries: options.maxRetries,
      fetch: options.fetch
    });
    this.search = new Search(this);
    this.alias = new Alias(this);
    this.me = new Me(this);
    this.blobs = new Blobs(this);
    this.users = new Users(this);
    this.sqlite = new Sqlite(this);
    this.vals = new Vals3(this);
    this.emails = new Emails(this);
    this._options = options;
    this.bearerToken = bearerToken;
  }
  defaultQuery() {
    return this._options.defaultQuery;
  }
  defaultHeaders(opts) {
    return {
      ...super.defaultHeaders(opts),
      ...this._options.defaultHeaders
    };
  }
  authHeaders(opts) {
    return { Authorization: `Bearer ${this.bearerToken}` };
  }
}
_a = ValTown;
ValTown.ValTown = _a;
ValTown.DEFAULT_TIMEOUT = 60000;
ValTown.ValTownError = ValTownError;
ValTown.APIError = APIError;
ValTown.APIConnectionError = APIConnectionError;
ValTown.APIConnectionTimeoutError = APIConnectionTimeoutError;
ValTown.APIUserAbortError = APIUserAbortError;
ValTown.NotFoundError = NotFoundError;
ValTown.ConflictError = ConflictError;
ValTown.RateLimitError = RateLimitError;
ValTown.BadRequestError = BadRequestError;
ValTown.AuthenticationError = AuthenticationError;
ValTown.InternalServerError = InternalServerError;
ValTown.PermissionDeniedError = PermissionDeniedError;
ValTown.UnprocessableEntityError = UnprocessableEntityError;
ValTown.toFile = toFile;
ValTown.fileFromPath = fileFromPath;
(function(ValTown2) {
  ValTown2.PageCursorURL = PageCursorURL;
  ValTown2.Search = Search;
  ValTown2.Alias = Alias;
  ValTown2.Me = Me;
  ValTown2.Blobs = Blobs;
  ValTown2.Users = Users;
  ValTown2.Sqlite = Sqlite;
  ValTown2.Vals = Vals3;
  ValTown2.Emails = Emails;
})(ValTown || (ValTown = {}));
var sdk_default = ValTown;

// content.ts
console.log("Loaded content script for github gist val runner");
(async () => {
  const valTownClient = new sdk_default({
    bearerToken: (await chrome.storage.sync.get(["apiKey"])).apiKey
  });
  for (const buttonContainer of Array.from(document.querySelectorAll(".file-actions.flex-order-2.pt-0"))) {
    const viewRawCodeButton = buttonContainer.querySelector("a");
    const filename = viewRawCodeButton.href.match("(?<=/)[^/]+.w*$")[0].split(".");
    if (filename[1] === "ts") {
      const rawCode = fetch(viewRawCodeButton.href).then((res) => res.text());
      const callback = async () => {
        const sanitizedFilename = filename[0].replace(/[^a-zA-Z0-9]/g, "_");
        console.log("Creating new val named", sanitizedFilename);
        const newVal = await valTownClient.vals.create({
          code: await rawCode,
          name: sanitizedFilename,
          privacy: "public",
          readme: `Created from [this GitHub Gist](${window.location.href}), using [gistal](https://github.com/404wolf/gistal)`
        });
        window.open(newVal.url);
      };
      buttonContainer.appendChild(Object.assign(document.createElement("button"), {
        innerText: "Run in Val.Town",
        onclick: callback,
        className: "btn btn-sm"
      }));
    }
  }
})();
