(function () {
  /* ----- carousel ----- */
  var slides = Array.from(document.querySelectorAll(".carousel .slide"));
  if (slides.length) {
    var carousel = document.querySelector(".carousel");
    var dotsWrap = document.getElementById("carouselDots");
    var prevBtn = document.getElementById("prevSlide");
    var nextBtn = document.getElementById("nextSlide");
    var index = 0;
    var timer = null;
    var paused = false;
    var durationMs = 5000;

    if (carousel) {
      var raw = getComputedStyle(carousel).getPropertyValue("--carousel-duration").trim();
      var sec = parseFloat(raw);
      if (!isNaN(sec) && sec > 0) durationMs = sec * 1000;
    }

    function restartTextAnimation(slide) {
      var inner = slide.querySelector(".slide-inner");
      if (!inner) return;
      inner.style.animation = "none";
      // force reflow so staggered child animations replay
      void inner.offsetWidth;
      inner.querySelectorAll(".slide-kicker, h2, p, .slide-cta").forEach(function (el) {
        el.style.animation = "none";
        void el.offsetWidth;
        el.style.animation = "";
      });
      inner.style.animation = "";
    }

    function restartKenBurns(slide) {
      var bg = slide.querySelector(".slide-bg");
      if (!bg) return;
      bg.style.animation = "none";
      void bg.offsetWidth;
      bg.style.animation = "";
    }

    function renderDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      slides.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "dot" + (i === index ? " is-active" : "");
        if (i === index && paused) dot.classList.add("is-paused");
        dot.setAttribute("aria-label", "切换到第 " + (i + 1) + " 张");
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-selected", i === index ? "true" : "false");
        var bar = document.createElement("span");
        bar.className = "dot-progress";
        bar.setAttribute("aria-hidden", "true");
        dot.appendChild(bar);
        dot.addEventListener("click", function () {
          goTo(i);
        });
        dotsWrap.appendChild(dot);
      });
    }

    function setPaused(next) {
      paused = next;
      if (!dotsWrap) return;
      var active = dotsWrap.querySelector(".dot.is-active");
      if (!active) return;
      active.classList.toggle("is-paused", paused);
    }

    function goTo(i) {
      var next = (i + slides.length) % slides.length;
      if (next === index && slides[index].classList.contains("is-active")) {
        restartKenBurns(slides[index]);
        restartTextAnimation(slides[index]);
        renderDots();
        if (!paused) restartTimer();
        return;
      }

      var prev = index;
      index = next;

      slides.forEach(function (slide, n) {
        slide.classList.remove("is-leaving");
        if (n === prev && prev !== index) {
          slide.classList.add("is-leaving");
          slide.classList.remove("is-active");
        } else {
          slide.classList.toggle("is-active", n === index);
        }
      });

      window.setTimeout(function () {
        slides.forEach(function (slide) {
          slide.classList.remove("is-leaving");
        });
      }, 900);

      restartKenBurns(slides[index]);
      restartTextAnimation(slides[index]);
      renderDots();
      if (!paused) restartTimer();
    }

    function restartTimer() {
      clearInterval(timer);
      timer = null;
      if (paused) return;
      timer = setInterval(function () {
        goTo(index + 1);
      }, durationMs);
    }

    function pause() {
      clearInterval(timer);
      timer = null;
      setPaused(true);
    }

    function resume() {
      setPaused(false);
      restartTimer();
      // restart progress fill on active dot
      renderDots();
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goTo(index - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        goTo(index + 1);
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    });

    if (carousel) {
      carousel.addEventListener("mouseenter", pause);
      carousel.addEventListener("mouseleave", resume);
      carousel.addEventListener("focusin", pause);
      carousel.addEventListener("focusout", function (e) {
        if (!carousel.contains(e.relatedTarget)) resume();
      });
    }

    // initial paint without treating as "same index skip"
    slides.forEach(function (slide, n) {
      slide.classList.toggle("is-active", n === 0);
    });
    index = 0;
    restartKenBurns(slides[0]);
    restartTextAnimation(slides[0]);
    renderDots();
    restartTimer();
  }

  /* ----- home blocks from catalog ----- */
  if (!window.DGZQCatalog) return;

  function newsItem(it) {
    return (
      "<li><a href=\"detail.html?id=" +
      encodeURIComponent(it.id) +
      "\"><span>" +
      it.title +
      '</span><span class="news-date">' +
      (it.date || "") +
      "</span></a></li>"
    );
  }

  function fillList(elId, group, limit) {
    var el = document.getElementById(elId);
    if (!el) return;
    el.innerHTML = window.DGZQCatalog.listByGroup(group, limit)
      .map(newsItem)
      .join("");
  }

  fillList("newsList", "news", 5);
  fillList("flashList", "flash", 5);
  fillList("noticeList", "notice", 6);
  fillList("timelinePreview", "timeline", 4);

  var artifactGrid = document.getElementById("artifactGrid");
  if (artifactGrid) {
    artifactGrid.innerHTML = window.DGZQCatalog.featuredArtifacts(6)
      .map(function (it) {
        return (
          '<a class="artifact artifact-card" href="detail.html?id=' +
          encodeURIComponent(it.id) +
          '">' +
          '<span class="tag">' +
          it.tag +
          "</span>" +
          "<h4>" +
          it.title +
          "</h4>" +
          "<p>" +
          it.summary +
          "</p>" +
          '<span class="artifact-link">查看详情 →</span>' +
          "</a>"
        );
      })
      .join("");
  }

  var viewGrid = document.getElementById("viewGrid");
  if (viewGrid) {
    var views = [
      {
        href: "series-transport.html",
        icon: "fa-train-subway",
        title: "交通视界",
        desc: "高铁与跨海通道",
      },
      {
        href: "series-space.html",
        icon: "fa-rocket",
        title: "航天视界",
        desc: "空间站与深空探测",
      },
      {
        href: "series-energy.html",
        icon: "fa-bolt",
        title: "能源视界",
        desc: "算力与清洁能源",
      },
      {
        href: "culture.html",
        icon: "fa-book-open",
        title: "文脉视界",
        desc: "工程背后的历史文化",
      },
    ];
    viewGrid.innerHTML = views
      .map(function (v) {
        return (
          '<a class="entry-card view-card" href="' +
          v.href +
          '">' +
          '<i class="fa-solid ' +
          v.icon +
          '"></i>' +
          "<strong>" +
          v.title +
          "</strong>" +
          "<span>" +
          v.desc +
          "</span>" +
          "</a>"
        );
      })
      .join("");
  }

  var seriesPreview = document.getElementById("seriesPreview");
  if (seriesPreview) {
    var series = [
      {
        href: "series-transport.html",
        title: "交通基建",
        desc: "干线客运与跨海工程",
      },
      {
        href: "series-space.html",
        title: "航天深空",
        desc: "在轨运营与探月",
      },
      {
        href: "series-energy.html",
        title: "算力能源",
        desc: "超算、核电与电网",
      },
    ];
    seriesPreview.innerHTML = series
      .map(function (s) {
        return (
          '<a class="entry-card" href="' +
          s.href +
          '">' +
          '<i class="fa-solid fa-layer-group"></i>' +
          "<strong>" +
          s.title +
          "</strong>" +
          "<span>" +
          s.desc +
          "</span>" +
          "</a>"
        );
      })
      .join("");
  }
})();
