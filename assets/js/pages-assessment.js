(function (window, document) {
  "use strict";

  var HXZ = window.HXZ;
  var DATA = HXZ.data;
  var U = HXZ.util;

  function progressKey(id) {
    return "assessment_progress_" + id;
  }

  function resultKey(id) {
    return "assessment_result_" + id;
  }

  function getResult(id) {
    return HXZ.storage.get(resultKey(id), null);
  }

  function getProgress(id) {
    return HXZ.storage.get(progressKey(id), {
      assessmentId: id,
      current: 0,
      answers: {},
      startedAt: Date.now()
    });
  }

  function getAssessment(id) {
    return DATA.assessments.find(function (item) { return item.id === id; }) || DATA.assessments[0];
  }

  function questionsFor(id) {
    return DATA.assessmentQuestionSets[id] || DATA.assessmentQuestions || [];
  }

  function latestResult() {
    var latest = null;
    DATA.assessments.forEach(function (item) {
      var result = getResult(item.id);
      if (result && (!latest || String(result.date).localeCompare(String(latest.date)) > 0)) {
        latest = result;
      }
    });
    return latest;
  }

  function renderAssessmentCard(item) {
    var result = getResult(item.id);
    var progress = getProgress(item.id);
    var hasProgress = Object.keys(progress.answers || {}).length > 0;
    var locked = item.status !== "available";
    var buttonLabel = result ? "查看结果" : (hasProgress ? "继续自测" : "开始自测");
    return '<article class="card assessment-card"><div class="assessment-card__head"><span class="assessment-card__icon">' + item.icon + '</span><div><span class="badge ' + (locked ? "badge--muted" : "badge--success") + '">' + (locked ? "待开放" : (result ? "已完成" : "可使用")) + '</span><h3>' + U.escapeHTML(item.name) + '</h3><p>' + U.escapeHTML(item.description) + '</p></div></div><div class="assessment-card__meta"><span>约 ' + Number(item.duration) + ' 分钟</span><span>' + Number(item.questionCount) + ' 道题</span>' + (result ? "<span>最近得分 " + Number(result.overall) + "</span>" : "") + '</div><button class="btn ' + (locked ? "" : "btn--primary") + ' btn--block" type="button" data-assessment="' + U.escapeHTML(item.id) + '" data-status="' + U.escapeHTML(item.status) + '" data-has-result="' + Boolean(result) + '">' + buttonLabel + '</button></article>';
  }

  HXZ.pages.assessment = {
    options: { title: "自测中心" },
    render: function () {
      var latest = latestResult();
      var intro = latest ? '<div class="card card-body"><div class="section-head"><div><h2>最近一次自测</h2><p>' + U.escapeHTML(latest.date) + ' · ' + U.escapeHTML(getAssessment(latest.assessmentId).name) + '</p></div><span class="badge badge--gold">' + Number(latest.overall) + ' 分</span></div><p class="muted">当前水平：' + U.escapeHTML(latest.level) + '。你可以查看完整结果，或重新完成一次自测。</p><button class="btn btn--soft btn--compact" type="button" data-route="assessmentResult" data-param-id="' + U.escapeHTML(latest.assessmentId) + '">查看结果</button></div>' : '<div class="card card-body"><div class="section-head"><div><h2>先了解自己，再选择训练</h2><p>自测结果用于生成本地训练建议</p></div></div><p class="muted">请根据日常状态作答，没有标准答案。所有作答只保存在当前浏览器中。</p></div>';
      return '<section class="page-section card category-banner"><span class="badge">能力起点</span><h1>用几分钟了解你的助人沟通特点</h1><p>结果不是专业诊断，也不用于评价个人好坏，它只帮助你选择更适合的练习方向。</p></section><section class="page-section">' + intro + '</section><section class="page-section"><div class="section-head"><div><h2>可用自测</h2><p>完成后获得分维度反馈</p></div></div><div class="grid-2">' + DATA.assessments.map(renderAssessmentCard).join("") + '</div></section>';
    },
    init: function () {
      U.qsa("[data-assessment]").forEach(function (button) {
        button.addEventListener("click", function () {
          var id = button.getAttribute("data-assessment");
          var item = getAssessment(id);
          if (button.getAttribute("data-status") !== "available") {
            HXZ.ui.modal({
              title: "该自测暂未开放",
              message: item.name + "正在完善中。你可以先完成其他自测。",
              image: "assets/images/legacy/icon_15.png"
            });
            return;
          }
          if (button.getAttribute("data-has-result") === "true") {
            HXZ.ui.modal({
              title: "选择下一步",
              message: "你已经完成过这项自测，可以查看已有结果，也可以重新作答。",
              confirmText: "重新自测",
              cancelText: "查看结果",
              onConfirm: function () {
                HXZ.storage.remove(progressKey(id));
                HXZ.navigation.go("assessmentSession", { id: id });
              },
              onCancel: function () {
                HXZ.navigation.go("assessmentResult", { id: id });
              }
            });
            return;
          }
          HXZ.navigation.go("assessmentSession", { id: id });
        });
      });
    }
  };

  HXZ.pages["assessment-session"] = {
    options: { title: "能力自测" },
    assessmentId: "helping-baseline",
    assessment: null,
    questions: null,
    progress: null,
    render: function () {
      this.assessmentId = HXZ.navigation.getQuery("id") || "helping-baseline";
      this.assessment = getAssessment(this.assessmentId);
      this.questions = questionsFor(this.assessmentId);
      this.progress = getProgress(this.assessmentId);
      return '<div id="assessment-session-root">' + this.renderQuestion() + '</div>';
    },
    renderQuestion: function () {
      var index = U.clamp(this.progress.current, 0, this.questions.length - 1);
      var question = this.questions[index];
      var selected = this.progress.answers[question.id];
      var percent = Math.round(((index + 1) / this.questions.length) * 100);
      var options = DATA.assessmentOptions.map(function (item, optionIndex) {
        var isSelected = Number(selected) === Number(item.value);
        return '<label class="option-item ' + (isSelected ? "is-selected" : "") + '"><input type="radio" name="assessment-option" value="' + item.value + '" ' + (isSelected ? "checked" : "") + '><span class="option-item__mark">' + String.fromCharCode(65 + optionIndex) + '</span><span>' + U.escapeHTML(item.label) + '</span></label>';
      }).join("");
      return '<section class="card session-panel"><div class="session-progress"><div class="session-progress__meta"><span>第 ' + (index + 1) + ' / ' + this.questions.length + ' 题</span><span>已完成 ' + percent + '%</span></div><div class="progress"><span class="progress__value" style="width:' + percent + '%"></span></div></div><div class="question-number">' + U.escapeHTML(question.dimension) + '</div><h2 class="question-title">' + U.escapeHTML(question.text) + '</h2><div class="option-list">' + options + '</div><div class="session-actions"><button class="btn" type="button" id="assessment-prev" ' + (index === 0 ? "disabled" : "") + '>上一题</button><button class="btn btn--primary" type="button" id="assessment-next">' + (index === this.questions.length - 1 ? "提交自测" : "下一题") + '</button></div><div style="text-align:center;margin-top:16px"><button class="text-button small" type="button" id="assessment-exit">暂时退出，稍后继续</button></div></section>';
    },
    saveSelection: function () {
      var input = U.qs('input[name="assessment-option"]:checked');
      if (!input) return false;
      var question = this.questions[this.progress.current];
      this.progress.answers[question.id] = Number(input.value);
      this.progress.updatedAt = Date.now();
      HXZ.storage.set(progressKey(this.assessmentId), this.progress);
      return true;
    },
    refresh: function () {
      U.qs("#assessment-session-root").innerHTML = this.renderQuestion();
      this.bindQuestion();
      window.scrollTo(0, 0);
    },
    submit: function () {
      var answers = this.progress.answers;
      var grouped = {};
      this.questions.forEach(function (question) {
        grouped[question.dimension] = grouped[question.dimension] || [];
        grouped[question.dimension].push(Number(answers[question.id] || 0));
      });
      var dimensions = {};
      Object.keys(grouped).forEach(function (key) {
        dimensions[key] = Math.round((grouped[key].reduce(function (sum, value) { return sum + value; }, 0) / grouped[key].length) * 20);
      });
      var overall = Math.round((Object.keys(answers).reduce(function (sum, key) { return sum + Number(answers[key]); }, 0) / this.questions.length) * 20);
      var level = overall >= 85 ? "优势稳定" : overall >= 70 ? "基础良好" : overall >= 55 ? "持续发展中" : "处于起步阶段";
      var weakest = Object.keys(dimensions).sort(function (a, b) { return dimensions[a] - dimensions[b]; })[0];
      var result = {
        assessmentId: this.assessmentId,
        overall: overall,
        level: level,
        dimensions: dimensions,
        weakest: weakest,
        answers: answers,
        date: U.formatDate()
      };
      HXZ.storage.set(resultKey(this.assessmentId), result);
      HXZ.storage.remove(progressKey(this.assessmentId));
      HXZ.navigation.go("assessmentResult", { id: this.assessmentId });
    },
    bindQuestion: function () {
      var self = this;
      U.qsa(".option-item").forEach(function (label) {
        label.addEventListener("click", function () {
          var input = label.querySelector("input");
          if (input) input.checked = true;
          U.qsa(".option-item").forEach(function (item) { item.classList.remove("is-selected"); });
          label.classList.add("is-selected");
          self.saveSelection();
        });
      });
      U.qs("#assessment-prev").addEventListener("click", function () {
        self.saveSelection();
        self.progress.current = Math.max(0, self.progress.current - 1);
        HXZ.storage.set(progressKey(self.assessmentId), self.progress);
        self.refresh();
      });
      U.qs("#assessment-next").addEventListener("click", function () {
        if (!self.saveSelection()) {
          HXZ.ui.toast("请选择一个最符合你的选项。", "error");
          return;
        }
        if (self.progress.current >= self.questions.length - 1) {
          self.submit();
        } else {
          self.progress.current += 1;
          HXZ.storage.set(progressKey(self.assessmentId), self.progress);
          self.refresh();
        }
      });
      U.qs("#assessment-exit").addEventListener("click", function () {
        self.saveSelection();
        HXZ.ui.toast("当前进度已保存");
        window.setTimeout(function () { HXZ.navigation.go("assessment"); }, 250);
      });
    },
    init: function () {
      this.bindQuestion();
    }
  };

  HXZ.pages["assessment-result"] = {
    options: { title: "自测结果" },
    assessmentId: "helping-baseline",
    assessment: null,
    result: null,
    render: function () {
      this.assessmentId = HXZ.navigation.getQuery("id") || "helping-baseline";
      this.assessment = getAssessment(this.assessmentId);
      this.result = getResult(this.assessmentId);
      if (!this.result) {
        return '<section class="card empty-state"><img src="assets/images/legacy/icon_02.png" alt=""><h2>还没有自测结果</h2><p>完成' + U.escapeHTML(this.assessment.name) + '后，这里会生成分维度反馈。</p><button class="btn btn--primary" type="button" data-route="assessmentSession" data-param-id="' + U.escapeHTML(this.assessmentId) + '">开始自测</button></section>';
      }
      var recommend = this.assessment.recommend || {};
      var dimensionList = Object.keys(this.result.dimensions).map(function (key) {
        var score = Number(HXZ.pages["assessment-result"].result.dimensions[key]);
        return '<div class="list-row"><span class="list-row__icon">' + score + '</span><div class="list-row__content"><h3>' + U.escapeHTML(key) + '</h3><div class="progress" style="margin-top:7px"><span class="progress__value" style="width:' + score + '%"></span></div></div></div>';
      }).join("");
      return '<section class="page-section card result-hero"><div class="score-ring" style="--score:' + Number(this.result.overall) + '"><span class="score-ring__value">' + Number(this.result.overall) + '</span></div><span class="badge badge--gold">' + U.escapeHTML(this.result.level) + '</span><h1>你的“' + U.escapeHTML(this.assessment.name) + '”画像</h1><p>当前结果显示你已经具备一定的助人沟通意识。建议优先练习“' + U.escapeHTML(this.result.weakest) + '”，并通过重复训练观察变化。</p></section><section class="page-section grid-2"><div class="card card-body"><div class="section-head"><div><h2>能力分布</h2><p>分数仅用于本地训练建议</p></div></div><div id="assessment-radar" class="chart-box" role="img" aria-label="助人沟通能力雷达图"></div></div><div class="card card-body"><div class="section-head"><div><h2>分维度结果</h2><p>从相对较低的维度开始练习</p></div></div>' + dimensionList + '</div></section><section class="page-section card card-body"><div class="section-head"><div><h2>下一步建议</h2><p>根据当前画像生成</p></div></div><div class="grid-2"><div class="card card--flat" style="padding:18px;background:var(--primary-pale)"><span class="badge">推荐训练</span><h3>' + U.escapeHTML(recommend.trainingLabel || "重述技术") + '</h3><p class="muted">' + U.escapeHTML(recommend.trainingText || "练习准确提取和简洁回应谈话中的主要信息。") + '</p><button class="btn btn--primary btn--compact" type="button" data-route="trainingGuide" data-param-technique="' + U.escapeHTML(recommend.training || "restatement") + '">开始训练</button></div><div class="card card--flat" style="padding:18px;background:#fff8e9"><span class="badge badge--gold">推荐学习</span><h3>' + U.escapeHTML(recommend.articleLabel || "重述的三个重点") + '</h3><p class="muted">' + U.escapeHTML(recommend.articleText || "先理解常见误区，再进入模拟案例。") + '</p><a class="btn btn--compact" href="article.html?id=' + encodeURIComponent(recommend.article || "restatement-basics") + '">阅读资料</a></div></div><div class="button-row no-print" style="margin-top:20px"><button class="btn" type="button" id="restart-assessment">重新自测</button><button class="btn btn--soft" type="button" onclick="window.print()">打印结果</button></div></section>';
    },
    init: function () {
      if (!this.result) return;
      var self = this;
      var keys = Object.keys(this.result.dimensions);
      var values = keys.map(function (key) { return Number(HXZ.pages["assessment-result"].result.dimensions[key]); });
      HXZ.charts.create(U.qs("#assessment-radar"), {
        color: ["#26979f"],
        tooltip: {},
        radar: {
          radius: "64%",
          splitNumber: 4,
          indicator: keys.map(function (key) { return { name: key, max: 100 }; }),
          axisName: { color: "#607581", fontSize: 12 },
          splitArea: { areaStyle: { color: ["#f8fcfd", "#eef8f9"] } },
          splitLine: { lineStyle: { color: "#dcebef" } },
          axisLine: { lineStyle: { color: "#dcebef" } }
        },
        series: [{
          type: "radar",
          data: [{ value: values, name: "当前得分", areaStyle: { color: "rgba(100,213,218,.32)" }, lineStyle: { width: 2 } }],
          symbolSize: 6
        }]
      });
      var restart = U.qs("#restart-assessment");
      if (restart) restart.addEventListener("click", function () {
        HXZ.ui.modal({
          title: "重新开始自测？",
          message: "重新提交后会覆盖当前自测结果。",
          confirmText: "重新开始",
          cancelText: "取消",
          onConfirm: function () {
            HXZ.storage.remove(progressKey(self.assessmentId));
            HXZ.navigation.go("assessmentSession", { id: self.assessmentId });
          }
        });
      });
    }
  };
})(window, document);
