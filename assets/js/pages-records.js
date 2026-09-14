(function (window, document) {
  "use strict";

  var HXZ = window.HXZ;
  var DATA = HXZ.data;
  var U = HXZ.util;

  function dimensionLabel(key, techniqueId) {
    return U.dimensionLabel(key, techniqueId);
  }

  function renderRecordCard(record) {
    return '<a class="card record-card" href="record-detail.html?id=' + encodeURIComponent(record.id) + '"><span class="record-card__score">' + Number(record.score) + '</span><div class="record-card__main"><span class="badge ' + (record.score >= 85 ? "badge--success" : "badge--gold") + '">' + U.escapeHTML(record.level) + '</span><h3>' + U.escapeHTML(record.techniqueName + " · " + record.caseTitle) + '</h3><p>' + U.escapeHTML(record.date) + '</p></div><span class="record-card__arrow">›</span></a>';
  }

  HXZ.pages.records = {
    options: { title: "训练记录" },
    filter: "all",
    getFiltered: function () {
      var self = this;
      return HXZ.records.getAll().filter(function (record) {
        return self.filter === "all" || record.techniqueId === self.filter;
      });
    },
    renderList: function () {
      var records = this.getFiltered();
      if (!records.length) {
        return '<div class="card empty-state"><img src="assets/images/legacy/icon_02.png" alt=""><h3>暂无训练记录</h3><p>完成一次模拟训练后，记录会保存在这里。</p><button class="btn btn--primary" type="button" data-route="training">开始训练</button></div>';
      }
      return records.map(renderRecordCard).join("");
    },
    renderFilters: function () {
      var filters = [{ id: "all", name: "全部" }].concat(DATA.techniques.map(function (item) {
        return { id: item.id, name: item.name };
      }));
      var current = this.filter;
      return filters.map(function (item) {
        return '<button class="tab ' + (item.id === current ? "is-active" : "") + '" type="button" data-record-filter="' + U.escapeHTML(item.id) + '">' + U.escapeHTML(item.name) + '</button>';
      }).join("");
    },
    render: function () {
      this.filter = "all";
      var records = HXZ.records.getAll();
      var avg = U.average(records.map(function (item) { return item.score; }));
      var best = records.length ? Math.max.apply(null, records.map(function (item) { return Number(item.score); })) : 0;
      return '<section class="page-section grid-3"><div class="card stat-card"><p class="stat-card__label">累计训练</p><p class="stat-card__value">' + records.length + '</p><p class="stat-card__note">次有效记录</p></div><div class="card stat-card"><p class="stat-card__label">平均得分</p><p class="stat-card__value">' + avg + '</p><p class="stat-card__note">所有训练平均</p></div><div class="card stat-card"><p class="stat-card__label">最佳表现</p><p class="stat-card__value">' + best + '</p><p class="stat-card__note">历史最高得分</p></div></section><section class="page-section card card-body"><div class="section-head"><div><h2>能力变化趋势</h2><p>按训练完成时间排列</p></div><span class="badge">本地记录</span></div><div id="record-trend-chart" class="chart-box" role="img" aria-label="训练得分趋势图"></div></section><section class="page-section"><div class="section-head"><div><h2>历史训练</h2><p>点击记录查看完整评价</p></div></div><div class="tabs">' + this.renderFilters() + '</div><div class="stack" id="record-list">' + this.renderList() + '</div></section>';
    },
    drawChart: function () {
      var records = this.getFiltered().slice().reverse();
      var chartElement = U.qs("#record-trend-chart");
      if (!chartElement) return;
      HXZ.charts.dispose(chartElement);
      chartElement.innerHTML = "";
      if (!records.length) {
        chartElement.innerHTML = '<div class="empty-state"><p>暂无可绘制的数据</p></div>';
        return;
      }
      HXZ.charts.create(chartElement, {
        color: ["#26979f"],
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(21,42,57,.92)",
          borderWidth: 0,
          textStyle: { color: "#fff" }
        },
        grid: { left: 16, right: 18, top: 24, bottom: 16, containLabel: true },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: records.map(function (item, index) { return "第" + (index + 1) + "次"; }),
          axisLine: { lineStyle: { color: "#dcebef" } },
          axisTick: { show: false },
          axisLabel: { color: "#607581" }
        },
        yAxis: {
          type: "value",
          min: 40,
          max: 100,
          splitNumber: 3,
          axisLabel: { color: "#607581" },
          splitLine: { lineStyle: { color: "#edf3f5" } }
        },
        series: [{
          type: "line",
          smooth: true,
          symbolSize: 8,
          data: records.map(function (item) { return Number(item.score); }),
          lineStyle: { width: 3 },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(100,213,218,.42)" },
                { offset: 1, color: "rgba(100,213,218,.03)" }
              ]
            }
          }
        }]
      });
    },
    init: function () {
      var self = this;
      this.drawChart();
      U.qsa("[data-record-filter]").forEach(function (button) {
        button.addEventListener("click", function () {
          self.filter = button.getAttribute("data-record-filter");
          U.qsa("[data-record-filter]").forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          U.qs("#record-list").innerHTML = self.renderList();
          self.drawChart();
        });
      });
    }
  };

  HXZ.pages["record-detail"] = {
    options: { title: "记录详情" },
    record: null,
    render: function () {
      this.record = HXZ.records.getById(HXZ.navigation.getQuery("id"));
      if (!this.record) {
        return '<section class="card empty-state"><img src="assets/images/legacy/icon_02.png" alt=""><h2>没有找到这条记录</h2><p>该记录可能已经被清除。</p><button class="btn" type="button" data-route="records">返回记录列表</button></section>';
      }
      var dimensionRows = Object.keys(this.record.dimensions || {}).map(function (key) {
        var score = Number(HXZ.pages["record-detail"].record.dimensions[key]);
        return '<div class="list-row"><span class="list-row__icon">' + score + '</span><div class="list-row__content"><h3>' + U.escapeHTML(dimensionLabel(key, HXZ.pages["record-detail"].record.techniqueId)) + '</h3><div class="progress" style="margin-top:7px"><span class="progress__value" style="width:' + score + '%"></span></div></div></div>';
      }).join("");
      var turns = this.record.turns && this.record.turns.length ? this.record.turns : [{
        id: "single",
        reply: this.record.userReply,
        evaluation: {
          score: this.record.score,
          feedback: this.record.feedback,
          suggestion: this.record.suggestion
        },
        caseId: this.record.caseId
      }];
      var conversation = turns.map(function (turn, index) {
        var caseData = U.getCase(turn.caseId);
        return '<div class="conversation-line"><strong>案例 ' + (index + 1) + ' · 来访者</strong><p>' + U.escapeHTML(caseData.message) + '</p></div><div class="conversation-line"><strong>你的回应</strong><p>' + U.escapeHTML(turn.reply) + '</p></div><div class="feedback-card" style="margin-bottom:18px"><div class="feedback-card__head"><span class="badge">本轮评价</span><span class="feedback-card__score">' + Number(turn.evaluation.score) + '</span></div><p>' + U.escapeHTML(turn.evaluation.feedback) + '</p><div class="feedback-card__tip"><strong>建议：</strong>' + U.escapeHTML(turn.evaluation.suggestion) + '</div></div>';
      }).join("");
      return '<section class="page-section card result-hero"><div class="score-ring" style="--score:' + Number(this.record.score) + '"><span class="score-ring__value">' + Number(this.record.score) + '</span></div><span class="badge badge--gold">' + U.escapeHTML(this.record.level) + '</span><h1>' + U.escapeHTML(this.record.techniqueName + " · " + this.record.caseTitle) + '</h1><p>' + U.escapeHTML(this.record.date) + '完成，共记录 ' + turns.length + ' 轮回应。</p></section><section class="page-section detail-grid"><div class="card card-body"><div class="section-head"><div><h2>完整训练过程</h2><p>来访者表达、你的回应与本地反馈</p></div></div>' + conversation + '</div><aside class="stack"><div class="card card-body"><div class="section-head"><div><h2>分项结果</h2><p>本次综合表现</p></div></div>' + dimensionRows + '</div><div class="card card-body"><h2 style="margin-bottom:8px">下一步建议</h2><p class="muted">' + U.escapeHTML(this.record.suggestion) + '</p><div class="button-row no-print"><button class="btn btn--primary btn--compact" type="button" data-route="trainingGuide" data-param-technique="' + U.escapeHTML(this.record.techniqueId) + '">再次训练</button><button class="btn btn--compact" type="button" onclick="window.print()">打印报告</button></div></div></aside></section>';
    }
  };
})(window, document);
