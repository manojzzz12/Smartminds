const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

function buildUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

function getAuthHeaders(headers = {}) {
  const token = window.localStorage.getItem("sourcemind-token");
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}

function parseResponseBody(raw) {
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function createHttpError(response) {
  const error = new Error(
    response.data?.message || response.statusText || "Request failed"
  );
  error.response = response;
  return error;
}

async function request(method, path, data, config = {}) {
  const url = buildUrl(path);
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const headers = getAuthHeaders(config.headers || {});

  if (!isFormData && data !== undefined && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (typeof config.onUploadProgress === "function") {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url, true);

      Object.entries(headers).forEach(([key, value]) => xhr.setRequestHeader(key, value));

      xhr.upload.onprogress = (event) => {
        config.onUploadProgress({
          loaded: event.loaded,
          total: event.total
        });
      };

      xhr.onload = () => {
        const response = {
          status: xhr.status,
          statusText: xhr.statusText,
          data: parseResponseBody(xhr.responseText)
        };

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(response);
          return;
        }

        reject(createHttpError(response));
      };

      xhr.onerror = () => {
        reject(
          createHttpError({
            status: 0,
            statusText: "Network Error",
            data: { message: "Network request failed" }
          })
        );
      };

      xhr.send(isFormData ? data : data !== undefined ? JSON.stringify(data) : null);
    });
  }

  const response = await fetch(url, {
    method,
    headers,
    body: data === undefined ? undefined : isFormData ? data : JSON.stringify(data)
  });

  const text = await response.text();
  const parsed = parseResponseBody(text);
  const shapedResponse = {
    status: response.status,
    statusText: response.statusText,
    data: parsed
  };

  if (!response.ok) {
    throw createHttpError(shapedResponse);
  }

  return shapedResponse;
}

export const http = {
  get(path, config) {
    return request("GET", path, undefined, config);
  },
  post(path, data, config) {
    return request("POST", path, data, config);
  },
  put(path, data, config) {
    return request("PUT", path, data, config);
  },
  patch(path, data, config) {
    return request("PATCH", path, data, config);
  },
  delete(path, config) {
    return request("DELETE", path, undefined, config);
  }
};
