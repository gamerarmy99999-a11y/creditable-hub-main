const API_ROOT = "/api";
const TOKEN_KEY = "creditable_auth_token";

function authHeaders() {
  const token = typeof localStorage === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const response = await fetch(`${API_ROOT}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...options.headers },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok)
    return {
      data: null,
      error: { message: payload.error || "Request failed", code: payload.code },
    };
  return payload;
}

class QueryBuilder {
  constructor(table) {
    this.table = table;
    this.body = { operation: "select", table, filters: [], order: [] };
  }
  select(columns = "*") {
    this.body.select = columns;
    return this;
  }
  insert(values) {
    this.body.operation = "insert";
    this.body.values = values;
    return this;
  }
  upsert(values) {
    this.body.operation = "upsert";
    this.body.values = values;
    return this;
  }
  update(values) {
    this.body.operation = "update";
    this.body.values = values;
    return this;
  }
  delete() {
    this.body.operation = "delete";
    return this;
  }
  eq(column, value) {
    this.body.filters.push({ table: this.table, column, operator: "eq", value });
    return this;
  }
  neq(column, value) {
    this.body.filters.push({ table: this.table, column, operator: "neq", value });
    return this;
  }
  gt(column, value) {
    this.body.filters.push({ table: this.table, column, operator: "gt", value });
    return this;
  }
  gte(column, value) {
    this.body.filters.push({ table: this.table, column, operator: "gte", value });
    return this;
  }
  lt(column, value) {
    this.body.filters.push({ table: this.table, column, operator: "lt", value });
    return this;
  }
  lte(column, value) {
    this.body.filters.push({ table: this.table, column, operator: "lte", value });
    return this;
  }
  ilike(column, value) {
    this.body.filters.push({
      table: this.table,
      column,
      operator: "ilike",
      value: value.replaceAll("%", ""),
    });
    return this;
  }
  order(column, options = {}) {
    this.body.order.push({ column, ascending: options.ascending !== false });
    return this;
  }
  range(from, to) {
    this.body.offset = from;
    this.body.limit = to - from + 1;
    return this;
  }
  limit(count) {
    this.body.limit = count;
    return this;
  }
  single() {
    this.body.single = true;
    return this;
  }
  maybeSingle() {
    this.body.single = true;
    this.body.maybeSingle = true;
    return this;
  }
  or() {
    return this;
  }
  then(resolve, reject) {
    return request(`/data/${this.table}`, { method: "POST", body: JSON.stringify(this.body) }).then(
      resolve,
      reject,
    );
  }
}

const listeners = new Set();
const auth = {
  async signInWithPassword(credentials) {
    const result = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    if (!result.error && typeof localStorage !== "undefined") {
      localStorage.setItem(TOKEN_KEY, result.access_token);
      listeners.forEach((listener) =>
        listener("SIGNED_IN", { access_token: result.access_token, user: result.user }),
      );
    }
    return {
      data: result.error ? null : { session: result, user: result.user },
      error: result.error,
    };
  },
  async getUser() {
    const result = await request("/auth/me");
    return { data: { user: result.error ? null : result.user }, error: result.error };
  },
  async getSession() {
    const token = typeof localStorage === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
    if (!token) return { data: { session: null }, error: null };
    const result = await auth.getUser();
    return {
      data: { session: result.error ? null : { access_token: token, user: result.data.user } },
      error: result.error,
    };
  },
  async signOut() {
    if (typeof localStorage !== "undefined") localStorage.removeItem(TOKEN_KEY);
    listeners.forEach((listener) => listener("SIGNED_OUT", null));
    return { error: null };
  },
  async updateUser(attributes) {
    const result = await request("/auth/user", {
      method: "PATCH",
      body: JSON.stringify(attributes),
    });
    return { data: result.error ? null : { user: result.user }, error: result.error };
  },
  onAuthStateChange(callback) {
    listeners.add(callback);
    return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
  },
};

const storage = {
  from() {
    return {
      async upload(path, file, options = {}) {
        const data = await file.arrayBuffer();
        return request("/storage/upload", {
          method: "POST",
          body: JSON.stringify({
            path,
            contentType: options.contentType ?? file.type,
            data: btoa(String.fromCharCode(...new Uint8Array(data))),
          }),
        });
      },
      async createSignedUrl(path) {
        const token =
          typeof localStorage === "undefined" ? "" : (localStorage.getItem(TOKEN_KEY) ?? "");
        return {
          data: {
            signedUrl: `/api/storage/file?path=${encodeURIComponent(path)}&token=${encodeURIComponent(token)}`,
          },
          error: null,
        };
      },
    };
  },
};

export const supabase = { auth, storage, from: (table) => new QueryBuilder(table) };
