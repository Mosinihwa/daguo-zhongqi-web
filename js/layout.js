(function () {
  function currentFile() {
    var path = window.location.pathname.replace(/\\/g, "/");
    var name = path.split("/").pop() || "index.html";
    if (!name || name.indexOf(".html") === -1) name = "index.html";
    return decodeURIComponent(name).toLowerCase();
  }

  function isActive(href, file) {
    return href.toLowerCase() === file;
  }

  function navClass(href, file, extra) {
    return (
      "site-nav-link" +
      (isActive(href, file) ? " is-active" : "") +
      (extra ? " " + extra : "")
    );
  }

  function seriesOpen(file, options) {
    return (
      file.indexOf("series-") === 0 ||
      (file === "detail.html" && options.detailGroup === "series")
    );
  }

  function renderHeader(file, options) {
    options = options || {};
    var exhibitActive =
      seriesOpen(file, options) ||
      isActive("series-transport.html", file) ||
      isActive("series-space.html", file) ||
      isActive("series-energy.html", file);
    var relicActive =
      isActive("artifacts.html", file) ||
      (file === "detail.html" && options.detailGroup === "artifacts");
    var timelineActive =
      isActive("timeline.html", file) ||
      (file === "detail.html" && options.detailGroup === "timeline");
    var cultureActive =
      isActive("culture.html", file) ||
      (file === "detail.html" &&
        (options.detailGroup === "culture" || options.detailGroup === "flash"));
    var aboutActive =
      isActive("about.html", file) ||
      isActive("contact.html", file) ||
      (file === "detail.html" && options.detailGroup === "notice");
    var homeActive =
      isActive("index.html", file) ||
      (file === "detail.html" && options.detailGroup === "news");
    var seriesPage = options.seriesPage || "";

    function seriesLink(href, label) {
      var active =
        isActive(href, file) ||
        (file === "detail.html" && seriesPage === href);
      return (
        '<a class="site-sublink' +
        (active ? " is-active" : "") +
        '" href="' +
        href +
        '">' +
        label +
        "</a>"
      );
    }

    return (
      '<div class="site-header-inner">' +
      '  <a class="site-brand" href="index.html">' +
      '    <i class="fa-solid fa-landmark"></i>' +
      '    <span class="site-brand-text">' +
      '      <strong>大国重器</strong>' +
      "      <small>历史文化中的大国重器</small>" +
      "    </span>" +
      "  </a>" +
      '  <button class="icon-btn mobile-toggle" id="mobileToggle" type="button" aria-label="打开菜单">' +
      '    <i class="fa-solid fa-bars"></i>' +
      "  </button>" +
      '  <nav class="site-nav" id="siteNav" aria-label="主导航">' +
      '    <a class="site-nav-link' +
      (homeActive ? " is-active" : "") +
      '" href="index.html"><span>首页</span><small>Home</small></a>' +
      '    <a class="site-nav-link' +
      (relicActive ? " is-active" : "") +
      '" href="artifacts.html"><span>重器典藏</span><small>Artifacts</small></a>' +
      '    <div class="site-nav-item has-sub' +
      (exhibitActive ? " is-open" : "") +
      '">' +
      '      <button type="button" class="site-nav-link' +
      (exhibitActive ? " is-active" : "") +
      '" data-nav-toggle aria-expanded="' +
      (exhibitActive ? "true" : "false") +
      '">' +
      "        <span>主题陈列</span><small>Exhibits</small>" +
      '        <i class="fa-solid fa-chevron-down nav-chevron"></i>' +
      "      </button>" +
      '      <div class="site-submenu" role="menu">' +
      seriesLink("series-transport.html", "交通基建") +
      seriesLink("series-space.html", "航天深空") +
      seriesLink("series-energy.html", "算力能源") +
      "      </div>" +
      "    </div>" +
      '    <a class="site-nav-link' +
      (timelineActive ? " is-active" : "") +
      '" href="timeline.html"><span>时代脉络</span><small>Timeline</small></a>' +
      '    <a class="site-nav-link' +
      (cultureActive ? " is-active" : "") +
      '" href="culture.html"><span>历史文化</span><small>Culture</small></a>' +
      '    <a class="site-nav-link' +
      (aboutActive ? " is-active" : "") +
      '" href="about.html"><span>关于我们</span><small>About</small></a>' +
      "  </nav>" +
      "</div>"
    );
  }

  function renderFooter() {
    return (
      '<div class="site-footer-inner">' +
      "  <div>" +
      "    <strong>历史文化中的大国重器</strong>" +
      "    <p>以网页展陈呈现国之重器与时代脉络 · 原生 HTML / CSS / JS</p>" +
      "  </div>" +
      '  <div class="site-footer-links">' +
      '    <a href="artifacts.html">重器典藏</a>' +
      '    <a href="culture.html">历史文化</a>' +
      '    <a href="about.html">留言联系</a>' +
      '    <a href="login.html">登录演示</a>' +
      "  </div>" +
      "</div>"
    );
  }

  function bindHeader() {
    var overlay = document.getElementById("overlay");
    var nav = document.getElementById("siteNav");
    var mobileToggle = document.getElementById("mobileToggle");
    var header = document.getElementById("siteHeader");
    var scrollTicking = false;

    function closeMobile() {
      if (nav) nav.classList.remove("is-open");
      if (overlay) overlay.classList.remove("is-visible");
      if (header) header.classList.remove("nav-open");
      document.body.style.overflow = "";
    }

    function openMobile() {
      if (nav) nav.classList.add("is-open");
      if (overlay) overlay.classList.add("is-visible");
      if (header) header.classList.add("nav-open");
      document.body.style.overflow = "hidden";
    }

    function updateScrolled() {
      if (!header) return;
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    }

    if (mobileToggle) {
      mobileToggle.addEventListener("click", function () {
        if (nav && nav.classList.contains("is-open")) closeMobile();
        else openMobile();
      });
    }

    if (overlay) overlay.addEventListener("click", closeMobile);

    window.addEventListener(
      "scroll",
      function () {
        if (scrollTicking) return;
        scrollTicking = true;
        window.requestAnimationFrame(function () {
          updateScrolled();
          scrollTicking = false;
        });
      },
      { passive: true }
    );
    updateScrolled();

    if (nav) {
      nav.querySelectorAll("[data-nav-toggle]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var item = btn.closest(".site-nav-item");
          if (!item) return;
          var willOpen = !item.classList.contains("is-open");
          nav.querySelectorAll(".site-nav-item.is-open").forEach(function (other) {
            if (other !== item) {
              other.classList.remove("is-open");
              var ob = other.querySelector("[data-nav-toggle]");
              if (ob) ob.setAttribute("aria-expanded", "false");
            }
          });
          item.classList.toggle("is-open", willOpen);
          btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
        });
      });

      nav.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", closeMobile);
      });
    }
  }

  function init(options) {
    var file = currentFile();
    var header = document.getElementById("siteHeader");
    var footer = document.getElementById("siteFooter");

    if (header) {
      header.className = "site-header";
      header.innerHTML = renderHeader(file, options || {});
    }
    if (footer) {
      footer.className = "site-footer";
      footer.innerHTML = renderFooter();
    }

    bindHeader();
    return { file: file, session: window.DGZQAuth ? window.DGZQAuth.getSession() : null };
  }

  window.DGZQLayout = { init: init, currentFile: currentFile };
})();
