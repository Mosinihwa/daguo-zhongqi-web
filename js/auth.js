(function () {
  var USERS_KEY = "dgzq_users";
  var SESSION_KEY = "dgzq_session";
  var RETURN_KEY = "dgzq_return";
  var DEMO_USER = { username: "demo", password: "demo123" };

  function readUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function writeUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function ensureDemoUser() {
    var users = readUsers();
    var exists = users.some(function (u) {
      return u.username === DEMO_USER.username;
    });
    if (!exists) {
      users.push({ username: DEMO_USER.username, password: DEMO_USER.password });
      writeUsers(users);
    }
    return DEMO_USER;
  }

  function setSession(user) {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ username: user.username, loginAt: Date.now() })
    );
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch (e) {
      return null;
    }
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function currentPageTarget() {
    var path = (window.location.pathname || "").replace(/\\/g, "/");
    var name = path.split("/").pop() || "index.html";
    if (!name || name.indexOf(".html") === -1) name = "index.html";
    return decodeURIComponent(name) + (window.location.search || "");
  }

  function isSafeTarget(target) {
    return /^[A-Za-z0-9_\-]+\.html(\?[A-Za-z0-9_\-=&%]*)?$/.test(target || "");
  }

  function saveReturnUrl(target) {
    var t = target || currentPageTarget();
    if (!isSafeTarget(t) || /^login\.html/i.test(t)) return;
    try {
      sessionStorage.setItem(RETURN_KEY, t);
    } catch (e) {}
  }

  function consumeReturnUrl(fallback) {
    var t = null;
    try {
      t = sessionStorage.getItem(RETURN_KEY);
      sessionStorage.removeItem(RETURN_KEY);
    } catch (e) {}
    if (isSafeTarget(t) && !/^login\.html/i.test(t)) return t;
    return fallback || "index.html";
  }

  function clearReturnUrl() {
    try {
      sessionStorage.removeItem(RETURN_KEY);
    } catch (e) {}
  }

  function requireAuth() {
    if (!getSession()) {
      saveReturnUrl();
      window.location.href = "login.html";
      return null;
    }
    return getSession();
  }

  function validateUsername(name) {
    return /^[\w\u4e00-\u9fa5]{2,16}$/.test(name);
  }

  function validatePassword(pwd) {
    return typeof pwd === "string" && pwd.length >= 6;
  }

  function goAfterLogin() {
    window.location.href = consumeReturnUrl("index.html");
  }

  function loginAsDemo() {
    ensureDemoUser();
    setSession(DEMO_USER);
    goAfterLogin();
  }

  function switchAccount() {
    clearSession();
    clearReturnUrl();
    window.location.href = "login.html";
  }

  window.DGZQAuth = {
    USERS_KEY: USERS_KEY,
    SESSION_KEY: SESSION_KEY,
    DEMO_USER: DEMO_USER,
    readUsers: readUsers,
    writeUsers: writeUsers,
    ensureDemoUser: ensureDemoUser,
    setSession: setSession,
    getSession: getSession,
    clearSession: clearSession,
    requireAuth: requireAuth,
    validateUsername: validateUsername,
    validatePassword: validatePassword,
    loginAsDemo: loginAsDemo,
    switchAccount: switchAccount,
    saveReturnUrl: saveReturnUrl,
    consumeReturnUrl: consumeReturnUrl,
    clearReturnUrl: clearReturnUrl,
    goAfterLogin: goAfterLogin,
    isSafeTarget: isSafeTarget,
  };
})();
