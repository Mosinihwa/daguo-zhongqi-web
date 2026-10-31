(function () {
  function queryId() {
    try {
      return new URLSearchParams(window.location.search).get("id");
    } catch (e) {
      var m = window.location.search.match(/[?&]id=([^&]+)/);
      return m ? decodeURIComponent(m[1]) : null;
    }
  }

  function renderMissing(root) {
    root.innerHTML =
      '<section class="page-hero">' +
      '<p class="page-kicker">NOT FOUND</p>' +
      "<h1>未找到该内容</h1>" +
      '<p>请从首页区块或各栏目列表重新进入。</p>' +
      "</section>" +
      '<section class="section detail-actions">' +
      '<a class="btn" href="artifacts.html">去重器典藏</a>' +
      '<a class="btn btn-ghost" href="index.html">回首页</a>' +
      "</section>";
  }

  function renderItem(item) {
    var related = window.DGZQCatalog.getRelated(item);
    var exhibiting = window.DGZQCatalog.exhibitingNow(item.id, 3);
    var highlights = (item.highlights || [])
      .map(function (h) {
        return "<li>" + h + "</li>";
      })
      .join("");
    var paragraphs = (item.body || [])
      .map(function (p) {
        return "<p>" + p + "</p>";
      })
      .join("");
    var relatedHtml = related
      .map(function (r) {
        return (
          '<a class="entry-card" href="detail.html?id=' +
          encodeURIComponent(r.id) +
          '">' +
          '<i class="fa-solid fa-book-open"></i>' +
          "<strong>" +
          r.title +
          "</strong>" +
          "<span>" +
          r.tag +
          " · " +
          r.summary +
          "</span>" +
          "</a>"
        );
      })
      .join("");
    var exhibitHtml = exhibiting
      .map(function (e) {
        return (
          '<a href="detail.html?id=' +
          encodeURIComponent(e.id) +
          '">' +
          e.title +
          " · " +
          e.tag +
          "</a>"
        );
      })
      .join("");

    return (
      '<section class="page-hero ' +
      (item.heroClass || "") +
      '">' +
      '<p class="breadcrumb"><a href="index.html">首页</a> / <a href="' +
      item.back +
      '">' +
      item.backLabel +
      "</a> / " +
      item.title +
      "</p>" +
      '<p class="page-kicker">' +
      item.kicker +
      "</p>" +
      "<h1>" +
      item.title +
      "</h1>" +
      "<p>" +
      item.summary +
      "</p>" +
      (item.date
        ? '<p class="page-path">发布 / 节点：' + item.date + "</p>"
        : "") +
      "</section>" +
      '<section class="section detail-layout">' +
      '<div class="detail-main">' +
      '<div class="detail-meta"><span class="tag">' +
      item.tag +
      "</span></div>" +
      '<div class="detail-body">' +
      paragraphs +
      "</div>" +
      '<div class="detail-actions">' +
      '<a class="btn" href="' +
      item.back +
      '"><i class="fa-solid fa-arrow-left"></i> 返回' +
      item.backLabel +
      "</a>" +
      (item.series
        ? '<a class="btn btn-ghost" href="' +
          item.series +
          '">' +
          item.seriesLabel +
          " →</a>"
        : "") +
      "</div>" +
      "</div>" +
      '<aside class="detail-side">' +
      "<h3>要点速览</h3>" +
      '<ul class="detail-points">' +
      highlights +
      "</ul>" +
      (exhibitHtml
        ? '<div class="exhibit-strip"><h3>正在展出</h3>' + exhibitHtml + "</div>"
        : "") +
      "</aside>" +
      "</section>" +
      (relatedHtml
        ? '<section class="section"><div class="section-head"><h3>相关阅读</h3><p>可继续跳转到关联展项、时间节点或文脉文章。</p></div><div class="entry-grid entry-grid-2">' +
          relatedHtml +
          "</div></section>"
        : "")
    );
  }

  if (!window.DGZQCatalog || !window.DGZQLayout) {
    console.error("detail page missing catalog/layout");
    return;
  }

  var id = queryId();
  var item = window.DGZQCatalog.getItem(id);
  var seriesPage =
    item && item.series && /^series-.*\.html$/i.test(item.series)
      ? item.series
      : "";
  window.DGZQLayout.init({
    detailGroup: item ? item.group : null,
    seriesPage: item && item.group === "series" ? seriesPage : "",
  });

  var root = document.getElementById("detailRoot");
  var backTop = document.getElementById("backTop");
  var footBack = document.getElementById("footBack");

  if (!item) {
    renderMissing(root);
    document.title = "未找到 · 大国重器";
    return;
  }

  root.innerHTML = renderItem(item);
  if (backTop) {
    backTop.href = item.back;
    backTop.textContent = "返回" + item.backLabel;
  }
  if (footBack) {
    footBack.href = item.back;
    footBack.textContent = "← 返回" + item.backLabel;
  }
  document.title = item.title + " · 详情";
})();
