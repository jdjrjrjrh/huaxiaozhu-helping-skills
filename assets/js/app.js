(function (window, document) {
  "use strict";

  var HXZ = window.HXZ = window.HXZ || {};
  var DATA = HXZ.data;
  var STORAGE_PREFIX = "hxz_v2_";

  HXZ.pages = HXZ.pages || {};

  HXZ.util = {
    qs: function (selector, root) {
      return (root || document).querySelector(selector);
    },

    qsa: function (selector, root) {
      return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    },

    escapeHTML: function (value) {
      return String(value === null || value === undefined ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    },

    clamp: function (value, min, max) {
      return Math.min(Math.max(Number(value) || 0, min), max);
    },

    uid: function (prefix) {
      return (prefix || "id") + "-" + Date.now() + "-" + Math.random().toString(16).slice(2, 8);
    },

    debounce: function (callback, wait) {
      var timer;
      return function () {
        var context = this;
        var args = arguments;
        window.clearTimeout(timer);
        timer = window.setTimeout(function () {
          callback.apply(context, args);
        }, wait || 120);
      };
    },

    getTechnique: function (id) {
      return DATA.techniques.find(function (item) { return item.id === id; }) || DATA.techniques[0];
    },

    getAssessment: function (id) {
      return DATA.assessments.find(function (item) { return item.id === id; }) || DATA.assessments[0];
    },

    dimensionLabel: function (key, techniqueId) {
      var technique = this.getTechnique(techniqueId);
      var labels = (technique && technique.dimensionLabels) || {
        accuracy: "准确性",
        concise: "简洁性",
        neutral: "中立性",
        natural: "自然度"
      };
      return labels[key] || {
        accuracy: "准确性",
        concise: "简洁性",
        neutral: "中立性",
        natural: "自然度"
      }[key] || key;
    },

    getCase: function (id) {
      return DATA.trainingCases.find(function (item) { return item.id === id; }) || DATA.trainingCases[0];
    },

    getArticle: function (id) {
      return DATA.articles.find(function (item) { return item.id === id; }) || DATA.articles[0];
    },

    formatDate: function (dateValue) {
      var date = dateValue ? new Date(dateValue) : new Date();
      if (Number.isNaN(date.getTime())) return String(dateValue || "");
      var pad = function (number) { return String(number).padStart(2, "0"); };
      return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) + " " + pad(date.getHours()) + ":" + pad(date.getMinutes());
    },

    average: function (values) {
      if (!values || !values.length) return 0;
      return Math.round(values.reduce(function (sum, value) { return sum + Number(value || 0); }, 0) / values.length);
    }
  };

  HXZ.storage = {
    get: function (key, fallback) {
      try {
        var raw = window.localStorage.getItem(STORAGE_PREFIX + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (error) {
        return fallback;
      }
    },

    set: function (key, value) {
      try {
        window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
        return true;
      } catch (error) {
        HXZ.ui.toast("本地保存失败，请检查浏览器存储权限。", "error");
        return false;
      }
    },

    remove: function (key) {
      try {
        window.localStorage.removeItem(STORAGE_PREFIX + key);
      } catch (error) {
        return false;
      }
      return true;
    },

    clearAll: function () {
      try {
        Object.keys(window.localStorage).forEach(function (key) {
          if (key.indexOf(STORAGE_PREFIX) === 0) window.localStorage.removeItem(key);
        });
        return true;
      } catch (error) {
        return false;
      }
    }
  };

  HXZ.auth = {
    isLoggedIn: function () {
      return Boolean(HXZ.storage.get("auth", null));
    },

    getUser: function () {
      return HXZ.storage.get("user", {
        id: "guest",
        name: "体验用户",
        account: "demo",
        school: "演示单位",
        role: "学习者",
        avatar: "assets/images/legacy/icon_01.png"
      });
    },

    login: function (account, name) {
      var user = HXZ.storage.get("user", null) || {
        id: HXZ.util.uid("user"),
        name: name || account || "华小助用户",
        account: account || "demo",
        school: "演示单位",
        role: "学习者",
        avatar: "assets/images/legacy/icon_01.png"
      };
      if (name) user.name = name;
      if (account) user.account = account;
      HXZ.storage.set("user", user);
      HXZ.storage.set("auth", { userId: user.id, loggedAt: Date.now() });
      HXZ.records.ensureSeeded();
      return user;
    },

    demoLogin: function () {
      return this.login("demo", "体验用户");
    },

    updateUser: function (patch) {
      var user = this.getUser();
      Object.keys(patch || {}).forEach(function (key) {
        user[key] = patch[key];
      });
      HXZ.storage.set("user", user);
      return user;
    },

    logout: function () {
      HXZ.storage.remove("auth");
      HXZ.navigation.replace("login");
    }
  };

  HXZ.records = {
    ensureSeeded: function () {
      if (HXZ.storage.get("records", null) === null) {
        HXZ.storage.set("records", DATA.demoRecords.slice());
      }
    },

    getAll: function () {
      this.ensureSeeded();
      return HXZ.storage.get("records", []).slice().sort(function (a, b) {
        return String(b.date).localeCompare(String(a.date));
      });
    },

    getById: function (id) {
      return this.getAll().find(function (item) { return item.id === id; }) || null;
    },

    add: function (record) {
      var records = this.getAll();
      records.unshift(record);
      HXZ.storage.set("records", records);
      HXZ.storage.set("latestRecordId", record.id);
      return record;
    },

    latest: function () {
      var records = this.getAll();
      return records[0] || null;
    },

    clear: function () {
      HXZ.storage.set("records", []);
    }
  };

  HXZ.navigation = {
    getQuery: function (name) {
      var params = new URLSearchParams(window.location.search || "");
      return name ? params.get(name) : params;
    },

    build: function (routeName, params) {
      var file = DATA.routes[routeName] || routeName || "index.html";
      var query = new URLSearchParams();
      Object.keys(params || {}).forEach(function (key) {
        var value = params[key];
        if (value !== null && value !== undefined && value !== "") query.set(key, value);
      });
      var queryString = query.toString();
      return file + (queryString ? "?" + queryString : "");
    },

    go: function (routeName, params) {
      window.location.href = this.build(routeName, params);
    },

    replace: function (routeName, params) {
      window.location.replace(this.build(routeName, params));
    },

    back: function (fallbackRoute) {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        this.go(fallbackRoute || "home");
      }
    },

    groupForPage: function (page) {
      if (page.indexOf("assessment") === 0) return "assessment";
      if (page.indexOf("training") === 0) return "training";
      if (page === "learning" || page === "article") return "learning";
      if (page === "profile" || page === "profile-edit" || page === "records" || page === "record-detail") return "profile";
      return "home";
    },

    isSubPage: function (page) {
      return ["assessment-session", "assessment-result", "training-guide", "training-session", "training-result", "record-detail", "article", "profile-edit"].indexOf(page) !== -1;
    }
  };

  HXZ.ui = {
    _modalCleanup: null,

    toast: function (message, type) {
      var region = HXZ.util.qs("#toast-region");
      if (!region) {
        region = document.createElement("div");
        region.id = "toast-region";
        region.className = "toast-region";
        region.setAttribute("aria-live", "polite");
        document.body.appendChild(region);
      }
      var toast = document.createElement("div");
      toast.className = "toast";
      toast.innerHTML = '<span class="toast__mark">' + (type === "error" ? "!" : "✓") + '</span><div>' + HXZ.util.escapeHTML(message) + '</div>';
      region.appendChild(toast);
      window.setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 3200);
    },

    modal: function (options) {
      options = options || {};
      this.closeModal();
      var previousFocus = document.activeElement;
      var backdrop = document.createElement("div");
      backdrop.id = "app-modal";
      backdrop.className = "modal-backdrop";
      backdrop.setAttribute("role", "dialog");
      backdrop.setAttribute("aria-modal", "true");
      var image = options.image ? '<img class="modal__illustration" src="' + HXZ.util.escapeHTML(options.image) + '" alt="">' : "";
      var cancel = options.cancelText ? '<button class="btn" type="button" data-modal-cancel>' + HXZ.util.escapeHTML(options.cancelText) + '</button>' : "";
      var confirmClass = options.danger ? "btn btn--danger" : "btn btn--primary";
      backdrop.innerHTML = '<div class="modal">' + image + '<h2 class="modal__title">' + HXZ.util.escapeHTML(options.title || "提示") + '</h2><div class="modal__body">' + (options.html || HXZ.util.escapeHTML(options.message || "")) + '</div><div class="modal__actions">' + cancel + '<button class="' + confirmClass + '" type="button" data-modal-confirm>' + HXZ.util.escapeHTML(options.confirmText || "我知道了") + '</button></div></div>';
      document.body.appendChild(backdrop);
      document.body.classList.add("is-modal-open");

      var close = this.closeModal.bind(this);
      var confirmButton = HXZ.util.qs("[data-modal-confirm]", backdrop);
      var cancelButton = HXZ.util.qs("[data-modal-cancel]", backdrop);
      confirmButton.addEventListener("click", function () {
        var result;
        if (typeof options.onConfirm === "function") result = options.onConfirm(backdrop);
        if (result !== false) close();
      });
      if (cancelButton) {
        cancelButton.addEventListener("click", function () {
          var result;
          if (typeof options.onCancel === "function") result = options.onCancel(backdrop);
          if (result !== false) close();
        });
      }
      backdrop.addEventListener("click", function (event) {
        if (event.target === backdrop && options.locked !== true) close();
      });
      var escapeHandler = function (event) {
        if (event.key === "Escape" && options.locked !== true) {
          close();
        }
      };
      document.addEventListener("keydown", escapeHandler);
      this._modalCleanup = function () {
        document.removeEventListener("keydown", escapeHandler);
        if (previousFocus && typeof previousFocus.focus === "function" && document.contains(previousFocus)) {
          previousFocus.focus();
        }
      };
      window.setTimeout(function () { confirmButton.focus(); }, 30);
    },

    closeModal: function () {
      var modal = HXZ.util.qs("#app-modal");
      if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
      document.body.classList.remove("is-modal-open");
      if (typeof this._modalCleanup === "function") {
        var cleanup = this._modalCleanup;
        this._modalCleanup = null;
        cleanup();
      }
    },

    lockedNotice: function (name) {
      this.modal({
        title: "该训练尚未解锁",
        message: (name || "这项技术") + "属于进阶训练。请先完成重述技术训练，再逐步解锁。",
        image: "assets/images/legacy/icon_15.png"
      });
    }
  };

  HXZ.charts = {
    instances: [],

    dispose: function (element) {
      if (!element || !window.echarts) return;
      var existing = window.echarts.getInstanceByDom(element);
      if (!existing) return;
      if (typeof existing.__hxzCleanup === "function") existing.__hxzCleanup();
      var index = this.instances.indexOf(existing);
      if (index !== -1) this.instances.splice(index, 1);
      existing.dispose();
    },

    create: function (element, option) {
      if (!element || !window.echarts) return null;
      this.dispose(element);
      element.innerHTML = "";
      var chart = window.echarts.init(element);
      chart.setOption(option, true);
      this.instances.push(chart);
      var resize = HXZ.util.debounce(function () { chart.resize(); }, 100);
      window.addEventListener("resize", resize);
      var observer = null;
      if (window.ResizeObserver) {
        observer = new window.ResizeObserver(resize);
        observer.observe(element);
      }
      chart.__hxzCleanup = function () {
        window.removeEventListener("resize", resize);
        if (observer) observer.disconnect();
        chart.__hxzCleanup = null;
      };
      return chart;
    },

    baseText: {
      color: "#607581",
      fontFamily: "PingFang SC, Microsoft YaHei, sans-serif"
    }
  };

  HXZ.layout = {
    renderPublicHeader: function () {
      return '<header class="public-header"><a class="brand" href="index.html"><img class="brand__logo" src="assets/images/legacy/idx_02.png" alt="华小助"><span><span class="brand__name">华小助</span><span class="brand__desc">心理助人技术训练平台</span></span></a><button type="button" class="btn btn--compact btn--soft" data-route="login">登录平台</button></header>';
    },

    renderSidebar: function (activeGroup, user) {
      var nav = DATA.navigation.map(function (item) {
        return '<a class="sidebar-nav__item ' + (item.id === activeGroup ? "is-active" : "") + '" href="' + item.file + '"><span class="sidebar-nav__icon">' + item.icon + '</span><span>' + item.label + '</span></a>';
      }).join("");
      return '<aside class="desktop-sidebar"><a class="sidebar-brand" href="home.html"><img src="assets/images/legacy/idx_02.png" alt=""><span><strong>华小助</strong><span>心理助人技术训练平台</span></span></a><nav class="sidebar-nav" aria-label="主导航">' + nav + '</nav><a class="sidebar-user" href="profile.html"><img src="' + HXZ.util.escapeHTML(user.avatar) + '" alt=""><span class="sidebar-user__main"><strong>' + HXZ.util.escapeHTML(user.name) + '</strong><span>' + HXZ.util.escapeHTML(user.role || "学习者") + '</span></span></a></aside>';
    },

    renderMobileNav: function (activeGroup) {
      return '<nav class="mobile-nav" aria-label="移动端主导航">' + DATA.navigation.map(function (item) {
        return '<a class="mobile-nav__item ' + (item.main ? "mobile-nav__item--main " : "") + (item.id === activeGroup ? "is-active" : "") + '" href="' + item.file + '"><span class="mobile-nav__icon">' + item.icon + '</span><span>' + item.label + '</span></a>';
      }).join("") + '</nav>';
    },

    renderHeader: function (page, title, user) {
      var back = HXZ.navigation.isSubPage(page) ? '<button class="header-action" type="button" data-back aria-label="返回">‹</button>' : "";
      return '<header class="app-header"><div class="app-header__side">' + back + '</div><div class="app-header__center"><p class="app-header__eyebrow">HUAXIAOZHU TRAINING</p><h1 class="app-header__title">' + HXZ.util.escapeHTML(title) + '</h1></div><div class="app-header__side"><a class="header-avatar" href="profile.html" aria-label="个人中心"><img src="' + HXZ.util.escapeHTML(user.avatar) + '" alt=""></a></div></header>';
    },

    renderApp: function (page, content, options) {
      options = options || {};
      var user = HXZ.auth.getUser();
      var activeGroup = HXZ.navigation.groupForPage(page);
      var title = options.title || DATA.pageTitles[page] || "华小助";
      return '<div class="app-shell">' + this.renderSidebar(activeGroup, user) + '<div class="app-stage">' + this.renderHeader(page, title, user) + '<main class="page-content ' + (options.wide ? "page-content--wide" : "") + '" id="page-content">' + content + '</main></div>' + this.renderMobileNav(activeGroup) + '</div><div id="toast-region" class="toast-region" aria-live="polite"></div>';
    },

    renderPublic: function (content, options) {
      document.body.classList.add("public-page");
      return '<div class="public-shell">' + (options && options.hideHeader ? "" : this.renderPublicHeader()) + content + '</div><div id="toast-region" class="toast-region" aria-live="polite"></div>';
    }
  };

  HXZ.common = {
    bind: function () {
      document.addEventListener("click", function (event) {
        var routeElement = event.target.closest("[data-route]");
        if (routeElement) {
          event.preventDefault();
          var route = routeElement.getAttribute("data-route");
          var params = {};
          Array.prototype.slice.call(routeElement.attributes).forEach(function (attribute) {
            if (attribute.name.indexOf("data-param-") === 0) {
              params[attribute.name.slice(11)] = attribute.value;
            }
          });
          HXZ.navigation.go(route, params);
          return;
        }
        var backElement = event.target.closest("[data-back]");
        if (backElement) {
          event.preventDefault();
          HXZ.navigation.back(backElement.getAttribute("data-fallback") || "home");
        }
      });
    }
  };

  HXZ.boot = function () {
    var page = document.body.getAttribute("data-page") || "welcome";
    var isPublic = document.body.hasAttribute("data-public");
    var root = HXZ.util.qs("#app");
    if (!root) return;

    if (!isPublic && !HXZ.auth.isLoggedIn()) {
      HXZ.navigation.replace("login", { next: page });
      return;
    }

    HXZ.records.ensureSeeded();
    var controller = HXZ.pages[page];
    if (!controller) {
      root.innerHTML = HXZ.layout.renderPublic('<main class="welcome-hero"><section class="welcome-copy"><span class="welcome-copy__eyebrow">404</span><h1>页面暂时<span>找不到</span></h1><p class="welcome-copy__lead">你访问的页面不存在或已被移动。</p><button class="btn btn--primary" data-route="home">返回首页</button></section></main>');
      HXZ.common.bind();
      return;
    }

    var pageContent = typeof controller.render === "function" ? controller.render() : "";
    if (isPublic) {
      root.innerHTML = HXZ.layout.renderPublic(pageContent, controller.options || {});
    } else {
      root.innerHTML = HXZ.layout.renderApp(page, pageContent, controller.options || {});
    }
    HXZ.common.bind();
    if (typeof controller.init === "function") controller.init();
    document.title = (controller.options && controller.options.title ? controller.options.title : DATA.pageTitles[page] || "华小助") + "｜华小助";
  };

  document.addEventListener("DOMContentLoaded", HXZ.boot);
})(window, document);
