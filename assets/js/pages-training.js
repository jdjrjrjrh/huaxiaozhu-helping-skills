(function (window, document) {
  "use strict";

  var HXZ = window.HXZ;
  var DATA = HXZ.data;
  var U = HXZ.util;
  var ACTIVE_SESSION_KEY = "active_training_session";

  function createSession(techniqueId) {
    return {
      id: U.uid("session"),
      techniqueId: techniqueId,
      caseIndex: 0,
      turns: [],
      startedAt: Date.now(),
      updatedAt: Date.now(),
      status: "active"
    };
  }

  function getSession(techniqueId) {
    var session = HXZ.storage.get(ACTIVE_SESSION_KEY, null);
    if (!session || session.status !== "active" || session.techniqueId !== techniqueId) {
      session = createSession(techniqueId);
      HXZ.storage.set(ACTIVE_SESSION_KEY, session);
    }
    return session;
  }

  function saveSession(session) {
    session.updatedAt = Date.now();
    HXZ.storage.set(ACTIVE_SESSION_KEY, session);
  }

  function casesForTechnique(techniqueId) {
    return DATA.trainingCases.filter(function (item) { return item.technique === techniqueId; });
  }

  function factLabel(fact) {
    return Array.isArray(fact) ? fact[0] : fact;
  }

  function keywordMatch(reply, fact) {
    var normalizedReply = String(reply || "").replace(/\s+/g, "");
    var terms = Array.isArray(fact) ? fact : [fact];
    return terms.some(function (term) {
      return normalizedReply.indexOf(String(term).replace(/\s+/g, "")) !== -1;
    });
  }

  function dimensionLabel(key, techniqueId) {
    var technique = U.getTechnique(techniqueId);
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
  }

  function evaluateReply(reply, caseData, technique) {
    var text = reply.trim();
    var factMatches = (caseData.keyFacts || []).filter(function (fact) {
      return keywordMatch(text, fact);
    }).length;
    var avoidHits = (caseData.avoidWords || []).filter(function (word) {
      return text.indexOf(word) !== -1;
    });
    var length = text.length;
    var keyFactCount = (caseData.keyFacts || []).length || 1;

    var accuracy = U.clamp(46 + factMatches * (50 / keyFactCount) - avoidHits.length * 7, 35, 96);
    var concise = length >= 16 && length <= 58 ? 88 : (length < 10 ? 52 : (length <= 85 ? 72 : 56));
    var neutral = U.clamp(91 - avoidHits.length * 17, 38, 94);
    var natural = U.clamp(58 + Math.min(length, 45) * 0.66 - (/[！!]{2,}/.test(text) ? 8 : 0), 48, 91);
    var score = Math.round((accuracy + concise + neutral + natural) / 4);
    var level = score >= 85 ? "优秀" : score >= 70 ? "良好" : score >= 58 ? "继续练习" : "需要调整";
    var missingFacts = (caseData.keyFacts || []).filter(function (fact) { return !keywordMatch(text, fact); });
    var techniqueName = (technique && technique.name) || "当前技术";
    var feedback;
    var suggestion;

    if (factMatches >= Math.ceil(keyFactCount * 0.75) && avoidHits.length === 0) {
      feedback = "回应较好地覆盖了来访者表达中的关键信息，语言中立，没有加入明显的额外判断。";
      suggestion = length > 60 ? "可以再压缩句子，让核心信息更突出。" : "保持当前的信息提取方式，尝试让表达更口语化。";
    } else if (factMatches >= 2) {
      feedback = "已经抓住了部分核心内容，但仍有一些重要线索没有被回应。";
      suggestion = "可以再关注“" + missingFacts.slice(0, 2).map(factLabel).join("、") + "”这些信息。";
    } else {
      feedback = "当前回应与来访者表达的核心内容连接较弱，可能让对方难以确认自己是否被听见。";
      suggestion = "先找出发生了什么、出现了什么变化，再结合“" + techniqueName + "”的要点进行回应。";
    }

    if (avoidHits.length) {
      suggestion += " 同时避免直接使用“" + avoidHits.join("、") + "”等带有判断或推测的表达。";
    }

    return {
      score: score,
      level: level,
      dimensions: {
        accuracy: Math.round(accuracy),
        concise: Math.round(concise),
        neutral: Math.round(neutral),
        natural: Math.round(natural)
      },
      factMatches: factMatches,
      feedback: feedback,
      suggestion: suggestion,
      reference: caseData.reference
    };
  }

  HXZ.pages["training-guide"] = {
    options: { title: "技术导学" },
    technique: null,
    render: function () {
      this.technique = U.getTechnique(HXZ.navigation.getQuery("technique") || "restatement");
      var technique = this.technique;
      if (technique.status !== "available") {
        return '<section class="card empty-state"><img src="assets/images/legacy/icon_15.png" alt=""><h2>' + U.escapeHTML(technique.name) + '尚未解锁</h2><p>请先完成重述技术的基础训练。</p><button class="btn btn--primary" type="button" data-route="trainingGuide" data-param-technique="restatement">学习重述技术</button></section>';
      }
      var points = (technique.goals || []).map(function (goal, index) {
        return '<div class="learning-point"><span class="learning-point__number">' + (index + 1) + '</span><span><strong>' + U.escapeHTML(goal) + '</strong></span></div>';
      }).join("");
      var exampleCase = casesForTechnique(technique.id)[0] || DATA.trainingCases[0];
      var completed = HXZ.storage.get("guide_completed_" + technique.id, false);
      return '<section class="guide-layout"><div class="card guide-visual"><img src="' + U.escapeHTML(technique.icon) + '" alt=""></div><div class="card guide-content"><span class="badge">' + U.escapeHTML(technique.categoryLabel) + ' · ' + U.escapeHTML(technique.level) + '</span><h1>' + U.escapeHTML(technique.name) + '</h1><p class="guide-content__intro">' + U.escapeHTML(technique.description) + '</p><div class="focus-box"><strong>训练要点：</strong>' + U.escapeHTML(technique.focus || technique.description) + '</div>' + points + '<div class="example-box"><p><strong>来访者：</strong>' + U.escapeHTML(exampleCase.message) + '</p><p><strong>容易出现的问题：</strong>' + U.escapeHTML(technique.badExample || "") + '</p><p><strong>更合适的回应：</strong>' + U.escapeHTML(technique.goodExample || "") + '</p></div><div class="countdown" id="guide-countdown">' + (completed ? "完成" : "5s") + '</div><div class="button-row"><button class="btn btn--primary" type="button" id="start-training" ' + (completed ? "" : "disabled") + '>' + (completed ? "开始训练" : "阅读后开始") + '</button><button class="btn" type="button" data-route="training">稍后学习</button></div></div></section>';
    },
    init: function () {
      if (!this.technique || this.technique.status !== "available") return;
      var techniqueId = this.technique.id;
      var button = U.qs("#start-training");
      var countdown = U.qs("#guide-countdown");
      var completed = HXZ.storage.get("guide_completed_" + techniqueId, false);
      if (!completed) {
        var count = 5;
        var timer = window.setInterval(function () {
          count -= 1;
          if (count > 0) {
            countdown.textContent = count + "s";
          } else {
            window.clearInterval(timer);
            countdown.textContent = "完成";
            button.disabled = false;
            button.textContent = "开始训练";
            HXZ.storage.set("guide_completed_" + techniqueId, true);
          }
        }, 1000);
      }
      button.addEventListener("click", function () {
        if (button.disabled) return;
        HXZ.navigation.go("trainingSession", { technique: techniqueId });
      });
    }
  };

  HXZ.pages["training-session"] = {
    options: { title: "模拟训练", wide: true },
    technique: null,
    session: null,
    caseList: null,
    render: function () {
      var techniqueId = HXZ.navigation.getQuery("technique") || "restatement";
      this.technique = U.getTechnique(techniqueId);
      this.caseList = casesForTechnique(techniqueId);
      this.session = getSession(techniqueId);
      if (!this.caseList.length) {
        return '<section class="card empty-state"><h2>暂无可用案例</h2><p>该技术的案例正在准备中。</p><button class="btn" type="button" data-route="training">返回训练中心</button></section>';
      }
      this.session.caseIndex = U.clamp(this.session.caseIndex, 0, this.caseList.length - 1);
      return '<div id="training-session-root">' + this.renderWorkspace() + '</div>';
    },
    turnsForCurrentCase: function () {
      var currentCase = this.caseList[this.session.caseIndex];
      return this.session.turns.filter(function (turn) { return turn.caseId === currentCase.id; });
    },
    renderMessages: function (currentCase) {
      var turns = this.turnsForCurrentCase();
      var messages = '<div class="message"><span class="message__avatar"><img src="assets/images/legacy/idx_02.png" alt=""></span><div class="message__bubble">你好，下面开始“' + U.escapeHTML(this.technique.name) + '”训练。请根据来访者的表达给出一句咨询回应。</div></div><div class="message"><span class="message__avatar"><img src="assets/images/legacy/idx_02.png" alt=""></span><div class="message__bubble">' + U.escapeHTML(currentCase.message) + '</div></div>';
      turns.forEach(function (turn) {
        messages += '<div class="message message--user"><span class="message__avatar">我</span><div class="message__bubble">' + U.escapeHTML(turn.reply) + '</div></div><div class="feedback-card"><div class="feedback-card__head"><span><span class="badge ' + (turn.evaluation.score >= 85 ? "badge--success" : "badge--gold") + '">' + U.escapeHTML(turn.evaluation.level) + '</span></span><strong class="feedback-card__score">' + Number(turn.evaluation.score) + '</strong></div><p>' + U.escapeHTML(turn.evaluation.feedback) + '</p><div class="feedback-card__tip"><strong>改进建议：</strong>' + U.escapeHTML(turn.evaluation.suggestion) + '</div><div class="button-row" style="margin-top:10px"><button class="btn btn--compact" type="button" data-helpful="' + U.escapeHTML(turn.id) + '" data-value="yes">有帮助</button><button class="btn btn--compact" type="button" data-helpful="' + U.escapeHTML(turn.id) + '" data-value="no">没帮助</button></div></div>';
      });
      return messages;
    },
    renderWorkspace: function () {
      var currentCase = this.caseList[this.session.caseIndex];
      var turns = this.turnsForCurrentCase();
      var hasEvaluation = turns.length > 0;
      var actionButtons = hasEvaluation ? '<div class="button-row" style="margin-top:14px"><button class="btn btn--soft btn--compact" type="button" id="retry-case">再试一次</button>' + (this.session.caseIndex < this.caseList.length - 1 ? '<button class="btn btn--primary btn--compact" type="button" id="next-case">下一案例</button>' : '<button class="btn btn--primary btn--compact" type="button" id="finish-training">完成训练</button>') + '</div>' : "";
      return '<div class="training-workspace"><aside class="card case-panel"><span class="badge">案例 ' + (this.session.caseIndex + 1) + ' / ' + this.caseList.length + '</span><h2>' + U.escapeHTML(currentCase.title) + '</h2><p class="case-panel__text">' + U.escapeHTML(currentCase.context) + '</p><div class="case-panel__goal"><strong>本轮目标：</strong>' + U.escapeHTML(this.technique.focus || this.technique.description) + '</div><div class="progress" style="margin-top:18px"><span class="progress__value" style="width:' + Math.round(((this.session.caseIndex + 1) / this.caseList.length) * 100) + '%"></span></div>' + actionButtons + '<p class="small muted" style="margin:16px 0 0">当前评价由本地规则生成，仅用于演示交互流程，不代表专业督导结论。</p></aside><section class="card chat-panel"><header class="chat-head"><div class="chat-head__person"><span class="chat-head__avatar"><img src="assets/images/legacy/idx_02.png" alt=""></span><div><h2>' + U.escapeHTML(currentCase.speaker) + '</h2><p>● 模拟来访者</p></div></div><span class="badge">' + U.escapeHTML(this.technique.name) + '</span></header><div class="chat-messages" id="chat-messages">' + this.renderMessages(currentCase) + '</div><div class="chat-input"><div class="chat-input__row"><textarea class="form-control" id="training-reply" maxlength="180" placeholder="输入你的咨询回应……"></textarea><button class="chat-input__send" type="button" id="send-reply" aria-label="发送回应">↑</button></div><div class="chat-input__meta"><span>建议使用一句话回应</span><span id="reply-count">0 / 180</span></div></div></section></div>';
    },
    refresh: function () {
      U.qs("#training-session-root").innerHTML = this.renderWorkspace();
      this.bindWorkspace();
      var messages = U.qs("#chat-messages");
      if (messages) messages.scrollTop = messages.scrollHeight;
    },
    submitReply: function () {
      var input = U.qs("#training-reply");
      var reply = input.value.trim();
      if (reply.length < 6) {
        HXZ.ui.toast("回应太短，请至少完整表达一句话。", "error");
        input.focus();
        return;
      }
      var currentCase = this.caseList[this.session.caseIndex];
      var evaluation = evaluateReply(reply, currentCase, this.technique);
      this.session.turns.push({
        id: U.uid("turn"),
        caseId: currentCase.id,
        reply: reply,
        evaluation: evaluation,
        createdAt: Date.now(),
        helpful: null
      });
      saveSession(this.session);
      this.refresh();
      HXZ.ui.toast("已生成本地演示评价");
    },
    finish: function () {
      var turns = this.session.turns;
      if (!turns.length) {
        HXZ.ui.toast("请至少完成一次回应。", "error");
        return;
      }
      var dimensionKeys = ["accuracy", "concise", "neutral", "natural"];
      var dimensions = {};
      dimensionKeys.forEach(function (key) {
        dimensions[key] = U.average(turns.map(function (turn) { return turn.evaluation.dimensions[key]; }));
      });
      var score = U.average(turns.map(function (turn) { return turn.evaluation.score; }));
      var level = score >= 85 ? "优秀" : score >= 70 ? "良好" : score >= 58 ? "继续练习" : "需要调整";
      var lastTurn = turns[turns.length - 1];
      var lastCase = U.getCase(lastTurn.caseId);
      var record = {
        id: U.uid("record"),
        techniqueId: this.technique.id,
        techniqueName: this.technique.name,
        caseId: lastCase.id,
        caseTitle: lastCase.title,
        date: U.formatDate(),
        score: score,
        level: level,
        dimensions: dimensions,
        userReply: lastTurn.reply,
        clientMessage: lastCase.message,
        feedback: lastTurn.evaluation.feedback,
        suggestion: lastTurn.evaluation.suggestion,
        reference: lastTurn.evaluation.reference,
        turns: turns,
        startedAt: this.session.startedAt,
        finishedAt: Date.now()
      };
      HXZ.records.add(record);
      this.session.status = "completed";
      saveSession(this.session);
      HXZ.navigation.go("trainingResult", { id: record.id });
    },
    bindWorkspace: function () {
      var self = this;
      var input = U.qs("#training-reply");
      var count = U.qs("#reply-count");
      if (input) {
        input.addEventListener("input", function () {
          count.textContent = input.value.length + " / 180";
        });
        input.addEventListener("keydown", function (event) {
          if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            self.submitReply();
          }
        });
      }
      var send = U.qs("#send-reply");
      if (send) send.addEventListener("click", function () { self.submitReply(); });
      var retry = U.qs("#retry-case");
      if (retry) retry.addEventListener("click", function () {
        input.focus();
        HXZ.ui.toast("可以在输入框中重新组织回应");
      });
      var next = U.qs("#next-case");
      if (next) next.addEventListener("click", function () {
        self.session.caseIndex += 1;
        saveSession(self.session);
        self.refresh();
        window.scrollTo(0, 0);
      });
      var finish = U.qs("#finish-training");
      if (finish) finish.addEventListener("click", function () { self.finish(); });
      U.qsa("[data-helpful]").forEach(function (button) {
        button.addEventListener("click", function () {
          var turn = self.session.turns.find(function (item) { return item.id === button.getAttribute("data-helpful"); });
          if (turn) {
            turn.helpful = button.getAttribute("data-value") === "yes";
            saveSession(self.session);
            HXZ.ui.toast("感谢你的反馈");
          }
        });
      });
    },
    init: function () {
      this.bindWorkspace();
      var messages = U.qs("#chat-messages");
      if (messages) messages.scrollTop = messages.scrollHeight;
    }
  };

  HXZ.pages["training-result"] = {
    options: { title: "训练评价" },
    record: null,
    render: function () {
      var id = HXZ.navigation.getQuery("id") || HXZ.storage.get("latestRecordId", "");
      this.record = HXZ.records.getById(id) || HXZ.records.latest();
      if (!this.record) {
        return '<section class="card empty-state"><img src="assets/images/legacy/icon_02.png" alt=""><h2>还没有训练结果</h2><p>完成一次模拟训练后，这里会生成评价。</p><button class="btn btn--primary" type="button" data-route="training">进入训练中心</button></section>';
      }
      var techniqueId = this.record.techniqueId;
      var dimensions = Object.keys(this.record.dimensions).map(function (key) {
        var score = Number(HXZ.pages["training-result"].record.dimensions[key]);
        return '<div class="list-row"><span class="list-row__icon">' + score + '</span><div class="list-row__content"><h3>' + dimensionLabel(key, techniqueId) + '</h3><div class="progress" style="margin-top:7px"><span class="progress__value" style="width:' + score + '%"></span></div></div></div>';
      }).join("");
      return '<section class="page-section card result-hero"><img src="assets/images/legacy/icon_20.png" alt="" style="width:140px;height:110px;object-fit:contain;margin:0 auto 5px"><div class="score-ring" style="--score:' + Number(this.record.score) + '"><span class="score-ring__value">' + Number(this.record.score) + '</span></div><span class="badge badge--gold">' + U.escapeHTML(this.record.level) + '</span><h1>本次“' + U.escapeHTML(this.record.techniqueName) + '”训练已完成</h1><p>' + U.escapeHTML(this.record.feedback) + '</p></section><section class="page-section grid-2"><div class="card card-body"><div class="section-head"><div><h2>分项表现</h2><p>本地演示评价</p></div></div>' + dimensions + '</div><div class="card card-body"><div class="section-head"><div><h2>回应对照</h2><p>' + U.escapeHTML(this.record.caseTitle) + '</p></div></div><div class="conversation-line"><strong>你的回应</strong><p>' + U.escapeHTML(this.record.userReply) + '</p></div><div class="conversation-line"><strong>参考表达</strong><p>' + U.escapeHTML(this.record.reference || U.getCase(this.record.caseId).reference) + '</p></div><div class="feedback-card__tip"><strong>下一步：</strong>' + U.escapeHTML(this.record.suggestion) + '</div></div></section><section class="page-section card card-body no-print"><div class="section-head"><div><h2>接下来做什么</h2><p>重复练习能帮助形成稳定表现</p></div></div><div class="button-row"><button class="btn btn--primary" type="button" id="train-again">再练一次</button><button class="btn btn--soft" type="button" data-route="records">查看全部记录</button><button class="btn" type="button" onclick="window.print()">打印结果</button></div></section>';
    },
    init: function () {
      var self = this;
      var again = U.qs("#train-again");
      if (again) again.addEventListener("click", function () {
        HXZ.storage.remove(ACTIVE_SESSION_KEY);
        HXZ.navigation.go("trainingSession", { technique: self.record.techniqueId });
      });
    }
  };

  HXZ.trainingHelpers = {
    dimensionLabel: dimensionLabel,
    evaluateReply: evaluateReply
  };
})(window, document);
