const KEY = "contraction-tracker";

export function get() {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

export function reset() {
  set([]);
}

export function set(value) {
  localStorage.setItem(KEY, JSON.stringify(value));
}
