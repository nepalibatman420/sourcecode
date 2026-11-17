/* Strict ES3 Compatible SPA + Video Link Extractor */
(function () {
  function addEvent(el, evt, fn) {
    if (!el) return;
    if (el.addEventListener) {
      el.addEventListener(evt, fn, false);
    } else if (el.attachEvent) {
      el.attachEvent("on" + evt, fn);
    }
  }

  /* --- 1. ES3 Hash Router --- */
  var routes = ["extractor", "videos", "blog", "tools"];

  function switchView(routeName) {
    var i, viewEl, navEl, found;
    found = false;

    for (i = 0; i < routes.length; i++) {
      if (routes[i] === routeName) {
        found = true;
        break;
      }
    }
    if (!found) {
      routeName = "extractor";
    }

    for (i = 0; i < routes.length; i++) {
      viewEl = document.getElementById("view-" + routes[i]);
      navEl = document.getElementById("nav-" + routes[i]);

      if (viewEl) {
        viewEl.className = (routes[i] === routeName) ? "spa-view active-view" : "spa-view";
      }
      if (navEl) {
        navEl.className = (routes[i] === routeName) ? "active-tab" : "";
      }
    }
  }

  function bindNavLinks() {
    var i, navEl;
    for (i = 0; i < routes.length; i++) {
      (function (route) {
        navEl = document.getElementById("nav-" + route);
        addEvent(navEl, "click", function (e) {
          e = e || window.event;
          if (e.preventDefault) {
            e.preventDefault();
          } else {
            e.returnValue = false;
          }
          window.location.hash = route;
          switchView(route);
        });
      })(routes[i]);
    }

    var brandEl = document.getElementById("brand");
    addEvent(brandEl, "click", function (e) {
      e = e || window.event;
      if (e.preventDefault) {
        e.preventDefault();
      } else {
        e.returnValue = false;
      }
      window.location.hash = "extractor";
      switchView("extractor");
    });
  }

  function checkInitialHash() {
    var hash = window.location.hash;
    if (hash && hash.length > 1) {
      switchView(hash.substring(1));
    } else {
      switchView("extractor");
    }
  }

  bindNavLinks();
  checkInitialHash();
  addEvent(window, "hashchange", checkInitialHash);

  /* --- 2. ES3 Video Link Extractor (Tab 1) --- */
  var htmlInput = document.getElementById("html-input");
  var btnExtract = document.getElementById("btn-extract");
  var btnSample = document.getElementById("btn-sample");
  var btnClear = document.getElementById("btn-clear");
  var output = document.getElementById("output");
  var status = document.getElementById("status");

  var videoExt = ["mp4", "webm", "ogg", "ogv", "mov", "mkv", "avi", "m4v", "flv", "ts", "m3u8", "mpeg", "mpg"];

  function endsWithExt(str, ext) {
    if (!str || str.length < ext.length + 1) return false;
    var lower = str.toLowerCase();
    return lower.substring(lower.length - ext.length - 1) === "." + ext;
  }

  function isVideoUrl(url) {
    if (!url) return false;
    var clean = url.split("?")[0].split("#")[0];
    var i;
    for (i = 0; i < videoExt.length; i++) {
      if (endsWithExt(clean, videoExt[i])) {
        return true;
      }
    }
    return false;
  }

  function uniquePush(arr, value) {
    var i;
    for (i = 0; i < arr.length; i++) {
      if (arr[i] === value) return;
    }
    arr.push(value);
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function extractVideos(html) {
    var results = [];
    var match, url;

    // Method 1: video and source tags
    var re1 = /<\s*(?:video|source)[^>]*?\s+src\s*=\s*(["'])(.*?)\1/gi;
    while ((match = re1.exec(html)) !== null) {
      url = match[2];
      if (url) uniquePush(results, url);
    }

    // Method 2: quoted src= or href= ending with video extension
    var re2 = /(?:src|href)\s*=\s*(["'])(.*?)\1/gi;
    while ((match = re2.exec(html)) !== null) {
      url = match[2];
      if (isVideoUrl(url)) {
        uniquePush(results, url);
      }
    }

    // Method 3: bare http(s) URLs ending with video extension
    var re3 = /(https?:\/\/[^\s"'<>]+)/gi;
    while ((match = re3.exec(html)) !== null) {
      url = match[1].replace(/[.,;:)\]]+$/, "");
      if (isVideoUrl(url)) {
        uniquePush(results, url);
      }
    }

    // Method 4: unquoted src= or href=
    var re4 = /(?:src|href)\s*=\s*([^\s>]+)/gi;
    while ((match = re4.exec(html)) !== null) {
      url = match[1];
      if (url.charAt(0) === '"' || url.charAt(0) === "'") {
        url = url.substring(1);
      }
      if (url.charAt(url.length - 1) === '"' || url.charAt(url.length - 1) === "'") {
        url = url.substring(0, url.length - 1);
      }
      if (isVideoUrl(url)) {
        uniquePush(results, url);
      }
    }

    return results;
  }

  function renderResults(urls) {
    if (urls.length === 0) {
      output.innerHTML = '<span class="no-results">No video links found in the HTML.</span>';
      status.innerHTML = "Scanned HTML - 0 video links found.";
      return;
    }

    var html = "";
    var i, safeUrl;
    for (i = 0; i < urls.length; i++) {
      safeUrl = escapeHtml(urls[i]);
      html += '<div class="video-item">';
      html += '<div class="video-url">' + (i + 1) + ". " + safeUrl + "</div>";
      html += '<a class="dl-btn" href="' + safeUrl + '" target="_blank">Download</a>';
      html += "</div>";
    }
    output.innerHTML = html;
    status.innerHTML = "Found " + urls.length + " video link(s).";
  }

  function onExtract() {
    var html = htmlInput.value;
    if (!html || html.replace(/\s/g, "").length === 0) {
      output.innerHTML = '<span class="no-results">Paste some HTML first.</span>';
      status.innerHTML = "";
      return;
    }
    status.innerHTML = "Scanning...";
    var urls = extractVideos(html);
    renderResults(urls);
  }

  function onSample() {
    var sample = [
      "<html><body>",
      '<video controls width="400">',
      '  <source src="https://example.com" type="video/mp4">',
      '  <source src="https://example.com" type="video/webm">',
      "  Your browser does not support the video tag.",
      "</video>",
      '<p>Also a direct link: <a href="https://example.org">Download MKV</a></p>',
      "<p>And a bare URL: https://example.net</p>",
      "</body></html>"
    ].join("\n");

    htmlInput.value = sample;
    status.innerHTML = "Sample HTML loaded. Click Extract Video Links.";
    output.innerHTML = '<span class="no-results">Sample loaded - click Extract.</span>';
  }

  function onClear() {
    htmlInput.value = "";
    output.innerHTML = '<span class="no-results">Paste HTML and click Extract.</span>';
    status.innerHTML = "";
  }

  addEvent(btnExtract, "click", onExtract);
  addEvent(btnSample, "click", onSample);
  addEvent(btnClear, "click", onClear);
})();
