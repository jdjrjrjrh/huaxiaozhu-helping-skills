(function (window, document) {
  "use strict";

  var HXZ = window.HXZ;
  var DATA = HXZ.data;
  var U = HXZ.util;

  function renderTechniqueCard(item) {
    var locked = item.status !== "available";
    var recommended = item.order === 1;
    var statusLabel = locked ? "待解锁" : recommended ? "推荐入门" : "可训练";
    return (
      '<button class="card technique-card ' +
      (locked ? "is-locked" : "") +
      '" type="button" data-technique="' +
      U.escapeHTML(item.id) +
      '" data-status="' +
      U.escapeHTML(item.status) +
      '"><span class="technique-card__top"><img class="technique-card__icon" src="' +
      U.escapeHTML(item.icon) +
      '" alt=""><span class="badge ' +
      (locked
        ? "badge--muted"
        : recommended
          ? "badge--gold"
          : "badge--success") +
      '">' +
      statusLabel +
      '</span></span><span class="technique-card__title">' +
      U.escapeHTML(item.name) +
      '</span><span class="technique-card__description">' +
      U.escapeHTML(item.description) +
      '</span><span class="technique-card__meta"><span>' +
      U.escapeHTML(item.level) +
      " · " +
      U.escapeHTML(item.categoryLabel) +
      "</span><span>约 " +
      Number(item.duration || 8) +
      " 分钟</span></span></button>"
    );
  }

  function renderArticleCard(article) {
    return (
      '<a class="card article-card" href="article.html?id=' +
      encodeURIComponent(article.id) +
      '"><img class="article-card__cover" src="' +
      U.escapeHTML(article.cover) +
      '" alt=""><div class="article-card__body"><span class="badge">' +
      U.escapeHTML(article.category) +
      "</span><h3>" +
      U.escapeHTML(article.title) +
      '</h3><div class="article-card__meta"><span>阅读 ' +
      Number(article.readMinutes) +
      " 分钟</span><span>♡ " +
      Number(article.likes) +
      "</span></div></div></a>"
    );
  }

  HXZ.pages.welcome = {
    options: { title: "欢迎使用" },
    render: function () {
      return '<main class="welcome-hero"><section class="welcome-copy"><span class="welcome-copy__eyebrow">OFFLINE · RULE-BASED PRACTICE</span><h1>把每一次倾听，练成更好的<span>回应</span></h1><p class="welcome-copy__lead">华小助为心理助人技术学习者提供一个可离线运行的模拟训练环境。从理解技术，到练习回应，再到回看成长；反馈由透明的本地规则生成。</p><div class="button-row"><button class="btn btn--primary" type="button" data-route="login">开始使用 <span aria-hidden="true">→</span></button><button class="btn btn--soft" type="button" id="demo-entry">游客体验</button></div><div class="feature-strip"><div class="feature-item"><span class="feature-item__icon">01</span><span><strong>技术导学</strong><span>用简单示例理解要点</span></span></div><div class="feature-item"><span class="feature-item__icon">02</span><span><strong>模拟训练</strong><span>在情境中练习回应</span></span></div><div class="feature-item"><span class="feature-item__icon">03</span><span><strong>成长记录</strong><span>看见每一次能力变化</span></span></div></div></section><section class="welcome-visual" aria-label="华小助平台插画"><div class="welcome-visual__halo"></div><img class="welcome-visual__image" src="assets/images/legacy/icon_02.png" alt="华小助助人技术训练"></section></main>';
    },
    init: function () {
      var demo = U.qs("#demo-entry");
      if (demo)
        demo.addEventListener("click", function () {
          HXZ.auth.demoLogin();
          HXZ.navigation.go("home");
        });
    },
  };

  HXZ.pages.login = {
    options: { title: "登录" },
    mode: "login",
    render: function () {
      return '<main class="login-layout"><section class="login-visual"><img src="assets/images/illustrations/practice-dialogue.svg" alt="倾听、回应与复盘的助人技能练习流程"></section><section class="login-card"><div class="login-card__head"><span class="badge">欢迎回来</span><h1>进入华小助</h1><p>登录后继续你的助人技术训练。</p></div><div class="auth-switch" role="tablist"><button class="is-active" type="button" data-auth-mode="login">登录</button><button type="button" data-auth-mode="register">注册</button></div><form id="auth-form" novalidate><div class="form-group is-hidden" id="name-group"><label class="form-label" for="display-name">怎么称呼你</label><input class="form-control" id="display-name" maxlength="20" autocomplete="name" placeholder="请输入昵称"></div><div class="form-group"><label class="form-label" for="account">账号</label><input class="form-control" id="account" autocomplete="username" placeholder="请输入账号" value=""><p class="form-error is-hidden" id="account-error">请输入至少2个字符的账号。</p></div><div class="form-group"><label class="form-label" for="password">密码</label><input class="form-control" id="password" type="password" autocomplete="current-password" placeholder="请输入至少4位密码"><p class="form-error is-hidden" id="password-error">密码至少需要4个字符。</p></div><label class="checkbox-row"><input id="terms" type="checkbox"><span>我已阅读并同意本地演示说明。本静态版本不会把账号或训练内容上传到网络。</span></label><div class="stack" style="margin-top:22px"><button class="btn btn--primary btn--block" type="submit" id="auth-submit">登录</button><button class="btn btn--soft btn--block" type="button" id="demo-login">直接进入体验模式</button></div><div class="button-row" style="justify-content:center;margin-top:18px"><button class="text-button" type="button" id="about-platform">关于平台</button></div></form></section></main>';
    },
    init: function () {
      var self = this;
      U.qsa("[data-auth-mode]").forEach(function (button) {
        button.addEventListener("click", function () {
          self.mode = button.getAttribute("data-auth-mode");
          U.qsa("[data-auth-mode]").forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          U.qs("#name-group").classList.toggle(
            "is-hidden",
            self.mode !== "register",
          );
          U.qs("#auth-submit").textContent =
            self.mode === "register" ? "注册并进入" : "登录";
          U.qs("#password").setAttribute(
            "autocomplete",
            self.mode === "register" ? "new-password" : "current-password",
          );
        });
      });

      U.qs("#auth-form").addEventListener("submit", function (event) {
        event.preventDefault();
        var account = U.qs("#account").value.trim();
        var password = U.qs("#password").value;
        var name = U.qs("#display-name").value.trim();
        var accountValid = account.length >= 2;
        var passwordValid = password.length >= 4;
        U.qs("#account").classList.toggle("is-invalid", !accountValid);
        U.qs("#password").classList.toggle("is-invalid", !passwordValid);
        U.qs("#account-error").classList.toggle("is-hidden", accountValid);
        U.qs("#password-error").classList.toggle("is-hidden", passwordValid);
        if (!accountValid || !passwordValid) return;
        if (!U.qs("#terms").checked) {
          HXZ.ui.toast("请先勾选本地演示说明。", "error");
          return;
        }
        HXZ.auth.login(
          account,
          self.mode === "register" ? name || account : "",
        );
        HXZ.ui.toast(self.mode === "register" ? "注册成功" : "登录成功");
        var next = HXZ.navigation.getQuery("next");
        window.setTimeout(function () {
          if (DATA.routes[next]) {
            HXZ.navigation.go(next);
          } else if (next && DATA.pageTitles[next]) {
            window.location.href = next + ".html";
          } else {
            HXZ.navigation.go("home");
          }
        }, 260);
      });

      U.qs("#demo-login").addEventListener("click", function () {
        HXZ.auth.demoLogin();
        HXZ.navigation.go("home");
      });

      U.qs("#about-platform").addEventListener("click", function () {
        HXZ.ui.modal({
          title: "关于华小助",
          html: '<p>华小助将心理助人技术学习内容、模拟训练和成长记录整合在一个轻量平台中。</p><p class="small muted">当前交付为纯静态演示版，全部数据仅保存在本机浏览器中。</p>',
          image: "assets/images/legacy/idx_02.png",
        });
      });
    },
  };

  HXZ.pages.home = {
    options: { title: "首页" },
    render: function () {
      var user = HXZ.auth.getUser();
      var records = HXZ.records.getAll();
      var latest = records[0];
      var avgScore = U.average(
        records.map(function (item) {
          return item.score;
        }),
      );
      var progress = Math.min(100, 18 + records.length * 8);
      var recommended =
        DATA.techniques.find(function (item) {
          return (
            item.status === "available" &&
            !records.some(function (record) {
              return record.techniqueId === item.id;
            })
          );
        }) || DATA.techniques[0];
      var recent = latest
        ? '<a class="list-row" href="record-detail.html?id=' +
          encodeURIComponent(latest.id) +
          '"><span class="list-row__icon">' +
          latest.score +
          '</span><div class="list-row__content"><h3>' +
          U.escapeHTML(latest.techniqueName + " · " + latest.caseTitle) +
          "</h3><p>" +
          U.escapeHTML(latest.date) +
          " · " +
          U.escapeHTML(latest.level) +
          '</p></div><span class="list-row__arrow">›</span></a>'
        : '<div class="empty-state"><p>还没有训练记录。</p></div>';
      return (
        '<section class="page-section card home-hero"><div class="home-hero__content"><span class="badge badge--gold">今日训练建议</span><h1>你好，' +
        U.escapeHTML(user.name) +
        '</h1><p>从一次简短的重述练习开始，保持对事实、语言和回应边界的敏感。</p><div class="button-row"><button class="btn btn--primary" type="button" data-route="trainingGuide" data-param-technique="' +
        U.escapeHTML(recommended.id) +
        '">继续' +
        U.escapeHTML(recommended.name) +
        '训练</button><button class="btn btn--soft" type="button" data-route="records">查看成长记录</button></div></div><img class="home-hero__image" src="assets/images/legacy/icon_02.png" alt=""></section><section class="page-section grid-3"><div class="card stat-card"><p class="stat-card__label">累计训练</p><p class="stat-card__value">' +
        records.length +
        '</p><p class="stat-card__note">次有效练习</p></div><div class="card stat-card"><p class="stat-card__label">平均得分</p><p class="stat-card__value">' +
        avgScore +
        '</p><p class="stat-card__note">基于本地训练记录</p></div><div class="card stat-card"><p class="stat-card__label">当前进度</p><p class="stat-card__value">' +
        progress +
        '%</p><div class="progress" aria-label="训练进度"><span class="progress__value" style="width:' +
        progress +
        '%"></span></div></div></section><section class="page-section"><div class="section-head"><div><h2>快速开始</h2><p>选择你现在想做的事情</p></div></div><div class="grid-4"><a class="card quick-entry" href="assessment.html"><span class="quick-entry__icon">✓</span><div><h3>能力自测</h3><p>3分钟了解当前状态</p></div></a><a class="card quick-entry" href="training.html"><span class="quick-entry__icon">✦</span><div><h3>模拟训练</h3><p>在情境中练习回应</p></div></a><a class="card quick-entry" href="learning.html"><span class="quick-entry__icon">▤</span><div><h3>学习资料</h3><p>快速理解技术要点</p></div></a><a class="card quick-entry" href="records.html"><span class="quick-entry__icon">↗</span><div><h3>成长记录</h3><p>回看训练和变化</p></div></a></div></section><section class="page-section grid-2"><div><div class="section-head"><div><h2>推荐训练</h2><p>从基础到进阶，按你的节奏练习</p></div><a class="section-link" href="training.html">全部技术</a></div>' +
        renderTechniqueCard(recommended) +
        '</div><div><div class="section-head"><div><h2>最近一次</h2><p>继续沿着上次的反馈练习</p></div></div><div class="card card-body">' +
        recent +
        '</div></div></section><section class="page-section"><div class="section-head"><div><h2>今日学习</h2><p>用几分钟补充一个技术要点</p></div><a class="section-link" href="learning.html">更多资料</a></div><div class="grid-2">' +
        DATA.articles.slice(0, 2).map(renderArticleCard).join("") +
        "</div></section>"
      );
    },
    init: function () {
      var card = U.qs("[data-technique]");
      if (card)
        card.addEventListener("click", function () {
          HXZ.navigation.go("trainingGuide", {
            technique: card.getAttribute("data-technique"),
          });
        });
    },
  };

  HXZ.pages.training = {
    options: { title: "训练中心" },
    activeCategory: "all",
    renderCards: function () {
      var self = this;
      var items = DATA.techniques.filter(function (item) {
        return (
          self.activeCategory === "all" || item.category === self.activeCategory
        );
      });
      return items.map(renderTechniqueCard).join("");
    },
    render: function () {
      var counts = {
        empathy: DATA.techniques.filter(function (item) {
          return item.category === "empathy";
        }).length,
        insight: DATA.techniques.filter(function (item) {
          return item.category === "insight";
        }).length,
        action: DATA.techniques.filter(function (item) {
          return item.category === "action";
        }).length,
      };
      return (
        '<section class="page-section card category-banner"><span class="badge">阶段式训练</span><h1>把技术理解变成可重复的能力</h1><p>从内容重述开始，逐步练习情感反映、共情综合、领悟和行动支持。六项技术均已开放，可自由选择训练顺序。</p></section><section class="page-section card training-summary"><div class="training-summary__item"><strong>' +
        DATA.techniques.length +
        '</strong><span>项训练技术</span></div><div class="training-summary__item"><strong>' +
        counts.empathy +
        '</strong><span>共情方向</span></div><div class="training-summary__item"><strong>' +
        (counts.insight + counts.action) +
        '</strong><span>领悟与行动</span></div><div class="training-summary__item"><strong>全部</strong><span>已解锁可用</span></div></section><section class="page-section"><div class="tabs" id="training-tabs"><button class="tab is-active" type="button" data-category="all">全部</button><button class="tab" type="button" data-category="empathy">共情</button><button class="tab" type="button" data-category="insight">领悟</button><button class="tab" type="button" data-category="action">行动</button></div><div class="grid-3" id="technique-grid">' +
        this.renderCards() +
        "</div></section>"
      );
    },
    bindCards: function () {
      U.qsa("[data-technique]").forEach(function (card) {
        card.addEventListener("click", function () {
          var id = card.getAttribute("data-technique");
          var technique = U.getTechnique(id);
          if (card.getAttribute("data-status") !== "available") {
            HXZ.ui.lockedNotice(technique.name);
            return;
          }
          HXZ.navigation.go("trainingGuide", { technique: id });
        });
      });
    },
    init: function () {
      var self = this;
      this.bindCards();
      U.qsa("[data-category]").forEach(function (tab) {
        tab.addEventListener("click", function () {
          self.activeCategory = tab.getAttribute("data-category");
          U.qsa("[data-category]").forEach(function (item) {
            item.classList.toggle("is-active", item === tab);
          });
          U.qs("#technique-grid").innerHTML = self.renderCards();
          self.bindCards();
        });
      });
    },
  };

  HXZ.pages.learning = {
    options: { title: "学习中心" },
    category: "all",
    query: "",
    filtered: function () {
      var self = this;
      return DATA.articles.filter(function (item) {
        var categoryMatch =
          self.category === "all" || item.category === self.category;
        var queryMatch =
          !self.query ||
          (item.title + item.summary)
            .toLowerCase()
            .indexOf(self.query.toLowerCase()) !== -1;
        return categoryMatch && queryMatch;
      });
    },
    renderList: function () {
      var items = this.filtered();
      return items.length
        ? items.map(renderArticleCard).join("")
        : '<div class="card empty-state" style="grid-column:1/-1"><img src="assets/images/legacy/icon_02.png" alt=""><h3>没有找到相关资料</h3><p>换一个关键词或分类试试。</p></div>';
    },
    render: function () {
      return (
        '<section class="page-section card category-banner"><span class="badge">知识补给站</span><h1>用低负担的方式理解助人技术</h1><p>从概念、示例和常见误区入手，再进入模拟练习。</p></section><section class="page-section"><div class="search-bar"><label class="sr-only" for="article-search">搜索学习资料</label><input class="form-control" id="article-search" placeholder="搜索技术、示例或关键词"></div></section><section class="page-section"><div class="tabs" id="learning-tabs"><button class="tab is-active" type="button" data-learning-category="all">全部</button><button class="tab" type="button" data-learning-category="共情">共情</button><button class="tab" type="button" data-learning-category="领悟">领悟</button><button class="tab" type="button" data-learning-category="行动">行动</button></div><div class="grid-3" id="article-grid">' +
        this.renderList() +
        "</div></section>"
      );
    },
    init: function () {
      var self = this;
      U.qs("#article-search").addEventListener(
        "input",
        U.debounce(function (event) {
          self.query = event.target.value.trim();
          U.qs("#article-grid").innerHTML = self.renderList();
        }, 120),
      );
      U.qsa("[data-learning-category]").forEach(function (tab) {
        tab.addEventListener("click", function () {
          self.category = tab.getAttribute("data-learning-category");
          U.qsa("[data-learning-category]").forEach(function (item) {
            item.classList.toggle("is-active", item === tab);
          });
          U.qs("#article-grid").innerHTML = self.renderList();
        });
      });
    },
  };

  HXZ.pages.article = {
    options: { title: "学习资料" },
    render: function () {
      var article = U.getArticle(HXZ.navigation.getQuery("id"));
      var favorites = HXZ.storage.get("favorites", []);
      var isFavorite = favorites.indexOf(article.id) !== -1;
      var content = article.content
        .map(function (block) {
          if (block.type === "heading")
            return "<h2>" + U.escapeHTML(block.text) + "</h2>";
          if (block.type === "quote")
            return "<blockquote>" + U.escapeHTML(block.text) + "</blockquote>";
          if (block.type === "lead")
            return (
              '<p style="font-size:18px;color:var(--text-soft)">' +
              U.escapeHTML(block.text) +
              "</p>"
            );
          return "<p>" + U.escapeHTML(block.text) + "</p>";
        })
        .join("");
      return (
        '<article class="article-page card"><div class="article-header"><span class="badge">' +
        U.escapeHTML(article.category) +
        "</span><h1>" +
        U.escapeHTML(article.title) +
        '</h1><div class="article-header__meta"><span>' +
        U.escapeHTML(article.publishedAt) +
        "</span><span>阅读约 " +
        Number(article.readMinutes) +
        " 分钟</span><span>♡ " +
        Number(article.likes) +
        '</span></div><div class="button-row no-print" style="margin-top:18px"><button class="btn btn--soft btn--compact" type="button" id="favorite-article">' +
        (isFavorite ? "已收藏" : "收藏文章") +
        '</button><button class="btn btn--compact" type="button" data-route="trainingGuide" data-param-technique="restatement">进入对应训练</button></div></div><img class="article-cover" src="' +
        U.escapeHTML(article.cover) +
        '" alt=""><div class="article-content">' +
        content +
        "</div></article>"
      );
    },
    init: function () {
      var article = U.getArticle(HXZ.navigation.getQuery("id"));
      var button = U.qs("#favorite-article");
      button.addEventListener("click", function () {
        var favorites = HXZ.storage.get("favorites", []);
        var index = favorites.indexOf(article.id);
        if (index === -1) {
          favorites.push(article.id);
          button.textContent = "已收藏";
          HXZ.ui.toast("已收藏到个人中心");
        } else {
          favorites.splice(index, 1);
          button.textContent = "收藏文章";
          HXZ.ui.toast("已取消收藏");
        }
        HXZ.storage.set("favorites", favorites);
      });
      HXZ.storage.set("lastArticle", article.id);
    },
  };

  HXZ.pages.profile = {
    options: { title: "个人中心" },
    render: function () {
      var user = HXZ.auth.getUser();
      var records = HXZ.records.getAll();
      var favorites = HXZ.storage.get("favorites", []);
      var avgScore = U.average(
        records.map(function (item) {
          return item.score;
        }),
      );
      var progress = Math.min(100, 18 + records.length * 8);
      return (
        '<section class="page-section card profile-hero"><div class="profile-avatar"><img src="' +
        U.escapeHTML(user.avatar) +
        '" alt=""></div><div class="profile-hero__main"><h1>' +
        U.escapeHTML(user.name) +
        "</h1><p>ID：" +
        U.escapeHTML(user.account || user.id) +
        " · " +
        U.escapeHTML(user.school || "未填写单位") +
        '</p></div><button class="btn btn--soft btn--compact" type="button" data-route="profileEdit">编辑资料</button></section><section class="page-section grid-3"><div class="card stat-card"><p class="stat-card__label">训练次数</p><p class="stat-card__value">' +
        records.length +
        '</p><p class="stat-card__note">次本地记录</p></div><div class="card stat-card"><p class="stat-card__label">平均得分</p><p class="stat-card__value">' +
        avgScore +
        '</p><p class="stat-card__note">最近训练综合表现</p></div><div class="card stat-card"><p class="stat-card__label">学习收藏</p><p class="stat-card__value">' +
        favorites.length +
        '</p><p class="stat-card__note">篇已收藏资料</p></div></section><section class="page-section card card-body"><div class="section-head"><div><h2>助人技术实训进度</h2><p>六项训练技术已全部开放，可自由练习</p></div><span class="badge">' +
        progress +
        '%</span></div><div class="progress"><span class="progress__value" style="width:' +
        progress +
        '%"></span></div><div style="display:flex;justify-content:space-between;margin-top:9px;color:var(--muted);font-size:12px"><span>菜鸟</span><span>进阶</span><span>高手</span></div></section><section class="page-section card card-body"><a class="list-row" href="records.html"><span class="list-row__icon">↗</span><div class="list-row__content"><h3>训练记录</h3><p>查看趋势、评价和历史对话</p></div><span class="list-row__arrow">›</span></a><a class="list-row" href="learning.html"><span class="list-row__icon">♡</span><div class="list-row__content"><h3>学习收藏</h3><p>查看已收藏的学习资料</p></div><span class="list-row__arrow">›</span></a><button class="list-row" style="width:100%;text-align:left;background:none;border-left:0;border-right:0;border-top:0" type="button" id="feedback-entry"><span class="list-row__icon">✎</span><div class="list-row__content"><h3>意见反馈</h3><p>告诉我们你的使用感受</p></div><span class="list-row__arrow">›</span></button><button class="list-row" style="width:100%;text-align:left;background:none;border-left:0;border-right:0;border-top:0" type="button" id="contact-entry"><span class="list-row__icon">@</span><div class="list-row__content"><h3>联系我们</h3><p>查看项目说明与联系信息</p></div><span class="list-row__arrow">›</span></button></section><section class="page-section button-row"><button class="btn btn--danger" type="button" id="clear-local-data">清除本地数据</button><button class="btn" type="button" id="logout">退出登录</button></section>'
      );
    },
    init: function () {
      U.qs("#feedback-entry").addEventListener("click", function () {
        HXZ.ui.modal({
          title: "意见反馈",
          html: '<label class="form-label" for="feedback-text" style="text-align:left">你的建议</label><textarea class="form-control" id="feedback-text" maxlength="300" placeholder="请描述你遇到的问题或建议"></textarea><p class="small muted">静态演示版会把反馈保存在当前浏览器中。</p>',
          confirmText: "保存反馈",
          cancelText: "取消",
          onConfirm: function (modalRoot) {
            var input = U.qs("#feedback-text", modalRoot);
            var value = input ? input.value.trim() : "";
            if (value) {
              var feedback = HXZ.storage.get("feedback", []);
              feedback.push({
                id: U.uid("feedback"),
                text: value,
                date: U.formatDate(),
              });
              HXZ.storage.set("feedback", feedback);
            }
            HXZ.ui.toast(value ? "反馈已保存在本机" : "未填写反馈内容");
          },
        });
      });
      U.qs("#contact-entry").addEventListener("click", function () {
        HXZ.ui.modal({
          title: "联系我们",
          html: '<p>欢迎通过开源仓库的 Issues 提交问题或建议。</p><p class="small muted">请勿在公开问题中粘贴真实咨询记录、个人身份信息或其他敏感数据。</p>',
          image: "assets/images/legacy/idx_02.png",
        });
      });
      U.qs("#clear-local-data").addEventListener("click", function () {
        HXZ.ui.modal({
          title: "确认清除本地数据？",
          message:
            "这会清除当前浏览器中的训练、自测、收藏和个人资料，操作无法撤销。",
          confirmText: "确认清除",
          cancelText: "取消",
          danger: true,
          onConfirm: function () {
            HXZ.storage.clearAll();
            HXZ.navigation.replace("welcome");
          },
        });
      });
      U.qs("#logout").addEventListener("click", function () {
        HXZ.auth.logout();
      });
    },
  };

  HXZ.pages["profile-edit"] = {
    options: { title: "编辑资料" },
    render: function () {
      var user = HXZ.auth.getUser();
      return (
        '<section class="card card-body" style="max-width:720px;margin:0 auto"><div class="section-head"><div><h2>个人资料</h2><p>资料仅保存在当前浏览器中</p></div></div><form id="profile-form"><div class="profile-hero" style="margin-bottom:22px;border-radius:20px"><div class="profile-avatar"><img src="' +
        U.escapeHTML(user.avatar) +
        '" alt=""></div><div><strong>默认头像</strong><p class="small muted">静态版本暂不上传图片</p></div></div><div class="form-group"><label class="form-label" for="profile-name">昵称</label><input class="form-control" id="profile-name" maxlength="20" value="' +
        U.escapeHTML(user.name) +
        '"></div><div class="form-group"><label class="form-label" for="profile-school">学校或单位</label><input class="form-control" id="profile-school" maxlength="40" value="' +
        U.escapeHTML(user.school || "") +
        '"></div><div class="form-group"><label class="form-label" for="profile-role">身份</label><select class="form-control" id="profile-role"><option ' +
        (user.role === "学习者" ? "selected" : "") +
        ">学习者</option><option " +
        (user.role === "心理学学生" ? "selected" : "") +
        ">心理学学生</option><option " +
        (user.role === "教师" ? "selected" : "") +
        ">教师</option><option " +
        (user.role === "助人工作者" ? "selected" : "") +
        '>助人工作者</option></select></div><div class="button-row"><button class="btn btn--primary" type="submit">保存修改</button><button class="btn" type="button" data-back>取消</button></div></form></section>'
      );
    },
    init: function () {
      U.qs("#profile-form").addEventListener("submit", function (event) {
        event.preventDefault();
        var name = U.qs("#profile-name").value.trim();
        if (!name) {
          HXZ.ui.toast("昵称不能为空。", "error");
          return;
        }
        HXZ.auth.updateUser({
          name: name,
          school: U.qs("#profile-school").value.trim(),
          role: U.qs("#profile-role").value,
        });
        HXZ.ui.toast("资料已保存");
        window.setTimeout(function () {
          HXZ.navigation.go("profile");
        }, 280);
      });
    },
  };
})(window, document);
