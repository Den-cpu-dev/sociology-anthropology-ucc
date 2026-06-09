(function () {
  var API = '/api/admin';
  var keyInput = document.getElementById('adminKey');

  function headers() {
    return {
      'Content-Type': 'application/json',
      'X-Admin-Key': keyInput.value.trim(),
    };
  }

  function adminFetch(path, options) {
    return fetch(API + path, Object.assign({ headers: headers() }, options || {})).then(function (r) {
      return r.json().then(function (body) {
        return { ok: r.ok, body: body };
      });
    });
  }

  function toLocalInput(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    var pad = function (n) {
      return String(n).padStart(2, '0');
    };
    return (
      d.getFullYear() +
      '-' +
      pad(d.getMonth() + 1) +
      '-' +
      pad(d.getDate()) +
      'T' +
      pad(d.getHours()) +
      ':' +
      pad(d.getMinutes())
    );
  }

  function fromLocalInput(value) {
    if (!value) return null;
    return new Date(value).toISOString();
  }

  document.getElementById('saveConfigBtn').addEventListener('click', function () {
    adminFetch('/election-config', {
      method: 'PATCH',
      body: JSON.stringify({
        title: document.getElementById('cfgTitle').value,
        opens_at: fromLocalInput(document.getElementById('cfgOpens').value),
        closes_at: fromLocalInput(document.getElementById('cfgCloses').value),
        results_published: document.getElementById('cfgPublished').checked,
      }),
    }).then(function (res) {
      document.getElementById('configStatus').textContent = JSON.stringify(res.body, null, 2);
    });
  });

  document.getElementById('importStudentsBtn').addEventListener('click', function () {
    adminFetch('/import-students', {
      method: 'POST',
      body: JSON.stringify({
        csv: document.getElementById('studentsCsv').value,
        replace: document.getElementById('replaceStudents').checked,
      }),
    }).then(function (res) {
      alert(res.ok ? 'Imported ' + res.body.imported + ' students' : res.body.error);
    });
  });

  document.getElementById('importCandidatesBtn').addEventListener('click', function () {
    adminFetch('/import-candidates', {
      method: 'POST',
      body: JSON.stringify({
        csv: document.getElementById('candidatesCsv').value,
        replace: document.getElementById('replaceCandidates').checked,
      }),
    }).then(function (res) {
      alert(res.ok ? 'Imported ' + res.body.imported + ' candidates' : res.body.error);
    });
  });

  document.getElementById('loadResultsBtn').addEventListener('click', function () {
    adminFetch('/results').then(function (res) {
      document.getElementById('resultsOutput').textContent = JSON.stringify(res.body, null, 2);
    });
  });

  adminFetch('/election-config').then(function (res) {
    if (!res.ok) return;
    var c = res.body;
    document.getElementById('cfgTitle').value = c.title || '';
    document.getElementById('cfgOpens').value = toLocalInput(c.opens_at);
    document.getElementById('cfgCloses').value = toLocalInput(c.closes_at);
    document.getElementById('cfgPublished').checked = !!c.results_published;
    document.getElementById('configStatus').textContent = JSON.stringify(c, null, 2);
  });
})();
