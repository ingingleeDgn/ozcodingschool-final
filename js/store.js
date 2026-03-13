const STORE_PREFIX = "witin_";

export const store = {
  get(key) {
    try {
      const data = localStorage.getItem(STORE_PREFIX + key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Error reading from localStorage", e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(STORE_PREFIX + key, JSON.stringify(value));
      // 상태 변경 이벤트를 발생시켜 다른 컴포넌트가 반응할 수 있게 함
      window.dispatchEvent(
        new CustomEvent("witin-store-update", { detail: { key, value } }),
      );
    } catch (e) {
      console.error("Error writing to localStorage", e);
    }
  },

  remove(key) {
    localStorage.removeItem(STORE_PREFIX + key);
  },
};

export function initStore() {
  if (!store.get("user")) {
    store.set("user", {
      name: "김위틴",
      email: "user@witin.test",
      balance: 1500000,
      lastSync: new Date().toISOString(),
    });
  }

  if (!store.get("criteria")) {
    store.set("criteria", {
      period: "this_month",
      incomeType: "normal",
      income: 3000000,
      expenseType: "normal",
      expense: 2000000,
      bufferPeriod: "this_month",
      buffer: 500000,
      extraIncome: 0,
      extraExpense: 0,
    });
  }

  if (!store.get("history")) {
    store.set("history", []);
  }
}
