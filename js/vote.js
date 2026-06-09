(function () {
  var API = "/api";

  var els = {
    loginPanel: document.getElementById("loginPanel"),
    ballotPanel: document.getElementById("ballotPanel"),
    donePanel: document.getElementById("donePanel"),
    closedPanel: document.getElementById("closedPanel"),
    welcome: document.getElementById("voteWelcome"),
    welcomeName: document.getElementById("welcomeName"),
    welcomeMeta: document.getElementById("welcomeMeta"),
    alert: document.getElementById("voteAlert"),
    ballotForm: document.getElementById("ballotForm"),
    positions: document.getElementById("ballotPositions"),
    electionTitle: document.getElementById("electionTitle"),
    turnout: document.getElementById("voteTurnout"),
    loginForm: document.getElementById("loginForm"),
    logoutBtn: document.getElementById("logoutBtn"),
    confirmOverlay: document.getElementById("confirmOverlay"),
    confirmList: document.getElementById("confirmList"),
    confirmSubmit: document.getElementById("confirmSubmit"),
    confirmCancel: document.getElementById("confirmCancel"),
  };

  var state = {
    student: null,
    election: null,
    ballot: null,
    selections: {},
  };

  function showAlert(message, type) {
    els.alert.textContent = message;
    els.alert.className = "vote-alert vote-alert-" + (type || "info");
    els.alert.classList.remove("vote-hidden");
  }

  function hideAlert() {
    els.alert.classList.add("vote-hidden");
  }

  function showPanel(name) {
    ["loginPanel", "ballotPanel", "donePanel", "closedPanel"].forEach(
      function (id) {
        var el = document.getElementById(id);
        if (el) el.classList.toggle("vote-hidden", id !== name);
      },
    );
  }

  function api(path, options) {
    return fetch(
      API + path,
      Object.assign({ credentials: "include" }, options || {}),
    )
      .then(function (r) {
        return r
          .json()
          .catch(function () {
            return {};
          })
          .then(function (body) {
            return { ok: r.ok, status: r.status, body: body };
          });
      })
      .catch(function () {
        return { ok: false, status: 0, body: { error: "network_error" } };
      });
  }

  function formatDate(iso) {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString("en-GH", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch (e) {
      return iso;
    }
  }

  function updateWelcome() {
    if (!state.student) return;
    els.welcomeName.textContent = state.student.full_name;
    var meta = state.student.index_number;
    if (state.student.level) meta += " · Level " + state.student.level;
    els.welcomeMeta.textContent = meta;
    els.welcome.classList.remove("vote-hidden");
  }

  function loadTurnout() {
    api("/election/status").then(function (res) {
      if (!res.ok || !els.turnout) return;
      var t = res.body.turnout;
      els.turnout.textContent =
        "Turnout: " +
        t.voted +
        " of " +
        t.eligible +
        " students (" +
        t.percent +
        "%)";
    });
  }

  function renderBallot(ballot) {
    els.positions.innerHTML = "";
    state.selections = {};

    ballot.forEach(function (pos) {
      var section = document.createElement("div");
      section.className = "vote-position";
      section.dataset.positionId = pos.id;

      var heading = document.createElement("h3");
      heading.textContent = pos.title;
      section.appendChild(heading);

      if (pos.slug === "president-vp" || pos.slug === "president-ticket") {
        var hint = document.createElement("p");
        hint.className = "vote-position-hint";
        hint.textContent =
          "Each option is a President and Vice President pair — one vote selects both.";
        section.appendChild(hint);
      }

      var abstain = document.createElement("label");
      abstain.className = "vote-candidate";
      abstain.innerHTML =
        '<input type="radio" name="pos-' +
        pos.id +
        '" value="">' +
        '<div class="vote-candidate-body"><strong>Abstain</strong><span>No preference for this office</span></div>';
      abstain.querySelector("input").addEventListener("change", function () {
        state.selections[pos.id] = null;
        syncSelected(abstain);
      });
      section.appendChild(abstain);

      pos.candidates.forEach(function (cand) {
        var label = document.createElement("label");
        label.className = "vote-candidate";
        var imgHtml = cand.photo_url
          ? '<img class="vote-candidate-img" src="' +
            cand.photo_url +
            '" alt="" loading="lazy">'
          : "";
        var linkHtml = cand.manifesto_url
          ? '<a href="' +
            cand.manifesto_url +
            '" target="_blank" rel="noopener">Read manifesto</a>'
          : "";
        label.innerHTML =
          '<input type="radio" name="pos-' +
          pos.id +
          '" value="' +
          cand.id +
          '">' +
          imgHtml +
          '<div class="vote-candidate-body"><strong>' +
          cand.full_name +
          "</strong>" +
          linkHtml +
          "</div>";
        label.querySelector("input").addEventListener("change", function () {
          state.selections[pos.id] = cand.id;
          syncSelected(label);
        });
        section.appendChild(label);
      });

      els.positions.appendChild(section);
    });
  }

  function syncSelected(activeLabel) {
    var section = activeLabel.closest(".vote-position");
    section.querySelectorAll(".vote-candidate").forEach(function (el) {
      el.classList.toggle("selected", el === activeLabel);
    });
  }

  function buildChoices() {
    return Object.keys(state.selections).map(function (positionId) {
      return {
        position_id: positionId,
        candidate_id: state.selections[positionId],
      };
    });
  }

  function showConfirm() {
    var items = [];
    els.ballotForm
      .querySelectorAll(".vote-position")
      .forEach(function (section) {
        var title = section.querySelector("h3").textContent;
        var checked = section.querySelector("input:checked");
        var label = checked ? checked.closest(".vote-candidate") : null;
        var name = label ? label.querySelector("strong").textContent : "—";
        items.push("<li><strong>" + title + ":</strong> " + name + "</li>");
      });
    els.confirmList.innerHTML = items.join("");
    els.confirmOverlay.classList.remove("vote-hidden");
  }

  function routeFromSession() {
    if (state.election && state.election.status === "not_open") {
      showPanel("closedPanel");
      showAlert(
        "Voting opens on " + formatDate(state.election.opensAt) + ".",
        "info",
      );
      return;
    }
    if (state.election && state.election.status === "closed") {
      showPanel("closedPanel");
      showAlert("Voting has ended.", "warn");
      return;
    }
    if (state.student && state.student.has_voted) {
      showPanel("donePanel");
      hideAlert();
      return;
    }
    if (state.student) {
      return loadBallot();
    }
    showPanel("loginPanel");
  }

  function loadBallot() {
    return api("/ballot").then(function (res) {
      if (res.status === 403 && res.body.error === "already_voted") {
        state.student.has_voted = true;
        showPanel("donePanel");
        return;
      }
      if (!res.ok) {
        showAlert(errorMessage(res.body.error), "error");
        if (
          res.body.error === "election_not_open" ||
          res.body.error === "election_closed"
        ) {
          showPanel("closedPanel");
        }
        return;
      }
      state.ballot = res.body.ballot;
      renderBallot(res.body.ballot);
      showPanel("ballotPanel");
      hideAlert();
    });
  }

  function errorMessage(code) {
    var map = {
      invalid_credentials: "Index number or password is incorrect.",
      not_authenticated: "Please sign in again.",
      election_not_open: "Voting is not open yet.",
      election_closed: "Voting has closed.",
      already_voted: "You have already voted.",
      incomplete_ballot:
        "Please select a choice for every office (or abstain).",
      empty_ballot: "Your ballot is empty.",
      server_error:
        "Something went wrong. Try again or contact the electoral committee.",
      network_error:
        "Voting server is not available. Please check your internet connection or contact the electoral committee.",
    };
    return map[code] || "Unable to complete this action.";
  }

  function initSession() {
    return api("/auth/me").then(function (res) {
      if (!res.ok) {
        showPanel("loginPanel");
        loadTurnout();
        return;
      }
      state.student = res.body.student;
      state.election = res.body.election;
      if (els.electionTitle && state.election.title) {
        els.electionTitle.textContent = state.election.title;
      }
      updateWelcome();
      if (els.logoutBtn) els.logoutBtn.classList.remove("vote-hidden");
      routeFromSession();
      loadTurnout();
    });
  }

  els.loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    hideAlert();
    var fd = new FormData(els.loginForm);
    var indexInput = fd.get("index_number");
    var passwordInput = fd.get("password");

    // Log what we're sending (without the actual password)
    console.log("Login attempt with index:", indexInput);

    api("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        index_number: indexInput,
        password: passwordInput,
      }),
    }).then(function (res) {
      if (!res.ok) {
        console.error("Login failed:", res.status, res.body);
        showAlert(errorMessage(res.body.error), "error");
        return;
      }
      console.log("Login successful for:", res.body.student.full_name);
      state.student = res.body.student;
      state.election = res.body.election;
      if (els.electionTitle && state.election.title) {
        els.electionTitle.textContent = state.election.title;
      }
      updateWelcome();
      if (els.logoutBtn) els.logoutBtn.classList.remove("vote-hidden");
      routeFromSession();
    });
  });

  els.logoutBtn.addEventListener("click", function () {
    api("/auth/logout", { method: "POST" }).then(function () {
      state.student = null;
      state.ballot = null;
      els.loginForm.reset();
      if (els.logoutBtn) els.logoutBtn.classList.add("vote-hidden");
      showPanel("loginPanel");
      hideAlert();
    });
  });

  els.ballotForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var sections = els.ballotForm.querySelectorAll(".vote-position");
    var complete = true;
    sections.forEach(function (section) {
      if (!section.querySelector("input:checked")) complete = false;
    });
    if (!complete) {
      showAlert(
        "Please select a candidate or abstain for every office.",
        "warn",
      );
      return;
    }
    sections.forEach(function (section) {
      var posId = section.dataset.positionId;
      var checked = section.querySelector("input:checked");
      state.selections[posId] = checked.value ? checked.value : null;
    });
    showConfirm();
  });

  els.confirmCancel.addEventListener("click", function () {
    els.confirmOverlay.classList.add("vote-hidden");
  });

  els.confirmSubmit.addEventListener("click", function () {
    els.confirmOverlay.classList.add("vote-hidden");
    api("/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ choices: buildChoices() }),
    }).then(function (res) {
      if (!res.ok) {
        showAlert(errorMessage(res.body.error), "error");
        return;
      }
      state.student.has_voted = true;
      showPanel("donePanel");
      showAlert(res.body.message, "success");
      loadTurnout();
    });
  });

  initSession();
})();
