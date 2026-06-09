(function () {
  var API = "/api/admin";
  var KEY_STORAGE = "soasa_ec_admin_key";

  function getKey() {
    return sessionStorage.getItem(KEY_STORAGE) || "";
  }

  function setKey(k) {
    sessionStorage.setItem(KEY_STORAGE, k);
  }

  function configureAuthUI() {
    var hint = document.getElementById("ecAuthHint");
    if (!hint) return;
    hint.textContent =
      "Enter the commissioner password shared with you by the electoral committee. Do not share it with students.";
  }

  function adminHeaders() {
    return {
      "Content-Type": "application/json",
      "X-Admin-Key": getKey(),
    };
  }

  function adminFetch(path, options) {
    return fetch(
      API + path,
      Object.assign({ headers: adminHeaders() }, options || {}),
    )
      .then(function (r) {
        return r.json().then(function (body) {
          return { ok: r.ok, status: r.status, body: body };
        });
      })
      .catch(function () {
        return { ok: false, status: 0, body: { error: "network_error" } };
      });
  }

  function initials(name) {
    return (name || "")
      .split(" ")
      .filter(function (w) {
        return w;
      })
      .map(function (w) {
        return w[0];
      })
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  function photoHtml(url, name) {
    return url
      ? '<img src="' + url + '" alt="">'
      : '<div class="ec-winner-initials">' + initials(name) + "</div>";
  }

  function renderStats(data) {
    var el = document.getElementById("ecStats");
    var t = data.turnout;
    var s = data.summary;
    el.innerHTML =
      '<div class="ec-stat-box"><div class="ec-stat-label">Total eligible</div><div class="ec-stat-value">' +
      t.total_eligible +
      "</div></div>" +
      '<div class="ec-stat-box"><div class="ec-stat-label">Total voted</div><div class="ec-stat-value">' +
      t.total_voted +
      "</div></div>" +
      '<div class="ec-stat-box"><div class="ec-stat-label">Not voted</div><div class="ec-stat-value">' +
      t.not_voted +
      "</div></div>" +
      '<div class="ec-stat-box"><div class="ec-stat-label">Turnout</div><div class="ec-stat-value">' +
      t.turnout_percent +
      "%</div></div>" +
      '<div class="ec-stat-box"><div class="ec-stat-label">Offices</div><div class="ec-stat-value">' +
      s.offices +
      "</div></div>" +
      '<div class="ec-stat-box"><div class="ec-stat-label">Candidates</div><div class="ec-stat-value">' +
      s.candidates_registered +
      "</div></div>" +
      '<div class="ec-stat-box"><div class="ec-stat-label">Declared winners</div><div class="ec-stat-value">' +
      s.declared_winners +
      "</div></div>" +
      '<div class="ec-stat-box"><div class="ec-stat-label">Ties pending</div><div class="ec-stat-value">' +
      s.ties_pending +
      "</div></div>";
    document.getElementById("ecTurnoutBar").style.width =
      t.turnout_percent + "%";
    document.getElementById("ecLastUpdated").textContent =
      "Updated " + new Date(data.generated_at).toLocaleTimeString();
  }

  function renderWinners(positions) {
    var html = "";
    positions.forEach(function (pos) {
      var dec = pos.declaration;
      var photo = "";
      var winnerText = "";
      var statusClass = "ec-winner-pending";
      if (dec.status === "declared" && dec.winner) {
        photo = photoHtml(dec.winner.photo_url, dec.winner.full_name);
        winnerText = dec.winner.full_name;
        statusClass = "ec-winner-declared";
      } else if (dec.is_tie) {
        photo = '<div class="ec-winner-initials">TIE</div>';
        winnerText = "Tie — resolve required";
        statusClass = "ec-winner-tie";
      } else {
        photo = '<div class="ec-winner-initials">?</div>';
        winnerText = "Pending results";
      }
      html +=
        '<div class="ec-winner-card ' +
        statusClass +
        '">' +
        '<div class="ec-winner-photo">' +
        photo +
        "</div>" +
        '<div class="ec-winner-body"><h4>' +
        pos.title +
        "</h4><p>" +
        winnerText +
        "</p></div></div>";
    });
    document.getElementById("ecWinnerGrid").innerHTML = html;
  }

  function renderDetailed(positions) {
    var html = "";
    positions.forEach(function (pos) {
      var dec = pos.declaration;
      var statusBadge = "";
      if (dec.status === "declared") {
        statusBadge =
          '<span class="ec-result-badge ec-result-declared">Declared winner</span>';
      } else if (dec.is_tie) {
        statusBadge = '<span class="ec-result-badge ec-result-tie">Tie</span>';
      }
      html +=
        '<div class="ec-result-section"><h3>' +
        pos.title +
        "</h3>" +
        statusBadge;
      if (pos.candidates && pos.candidates.length) {
        html +=
          '<table class="ec-result-table"><thead><tr><th>Candidate</th><th style="text-align:right">Votes</th></tr></thead><tbody>';
        pos.candidates.forEach(function (c) {
          var isWinner = dec.winner && dec.winner.id === c.id;
          html +=
            "<tr" +
            (isWinner ? ' class="ec-result-row-winner"' : "") +
            "><td>" +
            c.full_name +
            '</td><td style="text-align:right">' +
            c.votes +
            "</td></tr>";
        });
        html += "</tbody></table>";
      }
      if (pos.abstentions) {
        html +=
          '<p style="margin-top:.5rem;font-size:.9rem;color:var(--muted-fg)">Abstentions: ' +
          pos.abstentions +
          "</p>";
      }
      if (dec.message) {
        html +=
          '<p style="margin-top:.5rem;font-size:.9rem;color:var(--muted-fg)">' +
          dec.message +
          "</p>";
      }
      html += "</div>";
    });
    document.getElementById("ecDetailedResults").innerHTML = html;
  }

  function loadDashboard() {
    return adminFetch("/dashboard").then(function (res) {
      if (!res.ok) {
        alert(res.body.error || "Could not load dashboard");
        return;
      }
      renderStats(res.body);
      renderWinners(res.body.positions);
      renderDetailed(res.body.positions);
    });
  }

  function fillPositionSelect(positions) {
    var sel = document.getElementById("ecCandPosition");
    sel.innerHTML = '<option value="">Select position…</option>';
    positions.forEach(function (p) {
      var opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.title;
      sel.appendChild(opt);
    });
  }

  function loadPositions() {
    return adminFetch("/positions").then(function (res) {
      if (res.ok) fillPositionSelect(res.body.positions || []);
    });
  }

  function renderCandidateList(list) {
    var el = document.getElementById("ecCandidateList");
    if (!list.length) {
      el.innerHTML = '<p style="color:var(--muted-fg)">No candidates yet.</p>';
      return;
    }
    el.innerHTML = list
      .map(function (c) {
        var title = (c.positions && c.positions.title) || "";
        var img = c.photo_url
          ? '<img src="' + c.photo_url + '" alt="">'
          : '<div class="ec-winner-initials" style="width:64px;height:64px;font-size:1rem">' +
            initials(c.full_name) +
            "</div>";
        return (
          '<div class="ec-candidate-item" data-id="' +
          c.id +
          '">' +
          img +
          '<div class="ec-ci-body"><h4>' +
          c.full_name +
          "</h4><p>" +
          title +
          '</p><div class="ec-ci-actions"><button type="button" class="btn btn-ghost btn-sm ec-del-cand">Remove</button></div></div></div>'
        );
      })
      .join("");

    el.querySelectorAll(".ec-del-cand").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.closest(".ec-candidate-item").dataset.id;
        if (!confirm("Remove this candidate from the ballot?")) return;
        adminFetch("/candidate?id=" + encodeURIComponent(id), {
          method: "DELETE",
        }).then(function (res) {
          if (res.ok) loadCandidates();
          else alert(res.body.error || "Delete failed");
        });
      });
    });
  }

  function loadCandidates() {
    return adminFetch("/candidates").then(function (res) {
      if (res.ok) renderCandidateList(res.body.candidates || []);
    });
  }

  function readFileAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function unlock() {
    var key = document.getElementById("ecAdminKey").value.trim();
    if (!key) return;
    setKey(key);
    adminFetch("/positions").then(function (res) {
      if (res.ok) showApp();
      else {
        sessionStorage.removeItem(KEY_STORAGE);
        var msg = "Invalid password.";
        if (res.body.error === "unauthorized") {
          msg = "Incorrect commissioner password.";
        } else if (res.status === 0) {
          msg =
            "Cannot reach the server. Make sure you are connected to the internet and the backend is deployed.";
        }
        alert(msg);
      }
    });
  }

  function showApp() {
    document.getElementById("ecAuth").classList.add("vote-hidden");
    document.getElementById("ecApp").classList.remove("vote-hidden");
    loadDashboard();
    loadPositions();
    loadCandidates();
    loadConfig();
  }

  function loadConfig() {
    adminFetch("/election-config").then(function (res) {
      if (!res.ok) return;
      var c = res.body;
      document.getElementById("ecCfgTitle").value = c.title || "";
      document.getElementById("ecCfgOpens").value = toLocal(c.opens_at);
      document.getElementById("ecCfgCloses").value = toLocal(c.closes_at);
      document.getElementById("ecCfgPublished").checked = !!c.results_published;
    });
  }

  function toLocal(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    var p = function (n) {
      return String(n).padStart(2, "0");
    };
    return (
      d.getFullYear() +
      "-" +
      p(d.getMonth() + 1) +
      "-" +
      p(d.getDate()) +
      "T" +
      p(d.getHours()) +
      ":" +
      p(d.getMinutes())
    );
  }

  function fromLocal(localStr) {
    if (!localStr) return null;
    return new Date(localStr).toISOString();
  }

  document.getElementById("ecUnlockBtn").addEventListener("click", unlock);
  document
    .getElementById("ecAdminKey")
    .addEventListener("keydown", function (e) {
      if (e.key === "Enter") unlock();
    });

  document
    .getElementById("ecRefreshDashboard")
    .addEventListener("click", loadDashboard);

  document.querySelectorAll(".ec-tab").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var tab = btn.dataset.tab;
      document.querySelectorAll(".ec-tab").forEach(function (b) {
        b.classList.toggle("active", b === btn);
      });
      document.querySelectorAll(".ec-panel").forEach(function (panel) {
        panel.classList.toggle("active", panel.id === "panel-" + tab);
      });
    });
  });

  document
    .getElementById("ecCandPhoto")
    .addEventListener("change", function (e) {
      var file = e.target.files[0];
      if (!file) return;
      readFileAsDataUrl(file).then(function (dataUrl) {
        var img = document.getElementById("ecPhotoPreview");
        img.src = dataUrl;
        img.classList.remove("vote-hidden");
      });
    });

  document
    .getElementById("ecCandidateForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      var status = document.getElementById("ecCandidateStatus");
      status.textContent = "Saving…";
      status.style.color = "var(--muted-fg)";

      var positionId = document.getElementById("ecCandPosition").value.trim();
      var fullName = document.getElementById("ecCandName").value.trim();
      var manifesto = document.getElementById("ecCandManifesto").value.trim();
      var file = document.getElementById("ecCandPhoto").files[0];

      var payload = {
        position_id: positionId,
        full_name: fullName,
        manifesto_url: manifesto || null,
      };

      var done = function (msg, ok) {
        status.textContent = msg;
        status.style.color = ok ? "var(--primary)" : "#8b1a12";
      };

      var submit = function () {
        adminFetch("/candidates", {
          method: "POST",
          body: JSON.stringify(payload),
        }).then(function (res) {
          if (res.ok) {
            document.getElementById("ecCandidateForm").reset();
            document
              .getElementById("ecPhotoPreview")
              .classList.add("vote-hidden");
            done("Candidate saved.", true);
            loadCandidates();
          } else {
            done(res.body.message || res.body.error || "Save failed", false);
          }
        });
      };

      if (file) {
        readFileAsDataUrl(file).then(function (dataUrl) {
          payload.photo_base64 = dataUrl;
          submit();
        });
      } else {
        submit();
      }
    });

  document
    .getElementById("ecImportStudents")
    .addEventListener("click", function () {
      adminFetch("/import-students", {
        method: "POST",
        body: JSON.stringify({
          csv: document.getElementById("ecStudentsCsv").value,
          replace: document.getElementById("ecReplaceStudents").checked,
        }),
      }).then(function (res) {
        alert(
          res.ok
            ? "Imported " + res.body.imported + " students"
            : res.body.error,
        );
      });
    });

  document
    .getElementById("ecSaveConfig")
    .addEventListener("click", function () {
      adminFetch("/election-config", {
        method: "PATCH",
        body: JSON.stringify({
          title: document.getElementById("ecCfgTitle").value,
          opens_at: fromLocal(document.getElementById("ecCfgOpens").value),
          closes_at: fromLocal(document.getElementById("ecCfgCloses").value),
          results_published: document.getElementById("ecCfgPublished").checked,
        }),
      }).then(function (res) {
        alert(res.ok ? "Settings saved" : res.body.error);
      });
    });

  configureAuthUI();

  if (getKey()) {
    showApp();
  }
})();
