  $(document).ready(function() {
  $(".expand-trigger").click(function() {
    $(this).next().slideToggle();
  });
});

$(document).ready(function() {
  $('.toggleButton').click(function() {
    $('.toggleButton').each(function() {
      var target = $(this).data('target');
      $(target).css('display', 'none');
    });
    var target = $(this).data('target');
    $(target).css('display', 'block');
  });
});

/* ES3 compatible */

(function () {
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
    // remove query and hash
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

  function extractVideos(html) {
    var results = [];
    var match, url;

    // --- Method 1: video and source tags ---
    // matches src='...' or src="..." even with extra attributes
    var re1 = /<\s*(?:video|source)[^>]*?\s+src\s*=\s*(["'])(.*?)\1/gi;
    while ((match = re1.exec(html)) !== null) {
      url = match[2];
      if (url) uniquePush(results, url);
    }

    // --- Method 2: any src= or href= that ends with video extension ---
    var re2 = /(?:src|href)\s*=\s*(["'])(.*?)\1/gi;
    while ((match = re2.exec(html)) !== null) {
      url = match[2];
      if (isVideoUrl(url)) {
        uniquePush(results, url);
      }
    }

    // --- Method 3: bare http(s) URLs that look like videos ---
    var re3 = /(https?:\/\/[^\s"'<>]+)/gi;
    while ((match = re3.exec(html)) !== null) {
      url = match[1];
      // clean trailing punctuation that sometimes sticks
      url = url.replace(/[.,;:)\]]+$/, "");
      if (isVideoUrl(url)) {
        uniquePush(results, url);
      }
    }

    // --- Method 4: also catch src= without quotes (rare but possible) ---
    var re4 = /(?:src|href)\s*=\s*([^\s>]+)/gi;
    while ((match = re4.exec(html)) !== null) {
      url = match[1];
      // remove possible trailing quote leftovers
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
      status.innerHTML = "Scanned HTML — 0 video links found.";
      return;
    }

    var html = "";
    var i;
    for (i = 0; i < urls.length; i++) {
      html += '<div class="video-item">';
      html += '<div class="video-url">' + (i + 1) + ". " + urls[i] + '</div>';
      html += '<a class="dl-btn" href="' + urls[i] + '" target="_blank">Download</a>';
      html += '</div>';
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
      '<html><body>',
      '<video controls width="400">',
      '  <source src="https://example.com/videos/demo.mp4" type="video/mp4">',
      '  <source src="https://example.com/videos/demo.webm" type="video/webm">',
      '  Your browser does not support the video tag.',
      '</video>',
      '<p>Also a direct link: <a href="https://cdn.example.org/movie.mkv">Download MKV</a></p>',
      '<p>And a bare URL: https://media.example.net/clip.mov?id=123</p>',
      '</body></html>'
    ].join("\n");

    htmlInput.value = sample;
    status.innerHTML = "Sample HTML loaded. Click Extract Video Links.";
    output.innerHTML = '<span class="no-results">Sample loaded — click Extract.</span>';
  }

  function onClear() {
    htmlInput.value = "";
    output.innerHTML = '<span class="no-results">Paste HTML and click Extract.</span>';
    status.innerHTML = "";
  }

  // Event binding (ES3 friendly)
  if (btnExtract.addEventListener) {
    btnExtract.addEventListener("click", onExtract, false);
    btnSample.addEventListener("click", onSample, false);
    btnClear.addEventListener("click", onClear, false);
  } else if (btnExtract.attachEvent) {
    btnExtract.attachEvent("onclick", onExtract);
    btnSample.attachEvent("onclick", onSample);
    btnClear.attachEvent("onclick", onClear);
  }
})();
