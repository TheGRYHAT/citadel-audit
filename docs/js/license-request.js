/*
 * Private license requests.
 *
 * Licenses are machine-bound. This page collects the request and hands it
 * to the tester's own mail client. It does not post to GitHub Issues or
 * to any server of ours.
 *
 * To swap in a hosted form later, change licenseRequestConfig.mode to
 * "form" and set endpoint to that form's URL. Keep the same fields.
 * Do not point endpoint at a public issue tracker.
 */
var licenseRequestConfig = {
  mode: "mailto",
  to: "andy@gryhat.com",
  subject: "Citadel Audit license request",
  endpoint: ""
};

(function () {
  var form = document.querySelector("[data-license-form]");
  if (!form) return;

  var error = form.querySelector("[data-form-error]");
  var preview = document.querySelector("[data-mail-preview]");
  var copyBtn = document.querySelector("[data-copy-request]");
  var fields = ["name", "company", "email", "os", "machine"];

  function valueOf(name) {
    var node = form.elements[name];
    if (!node) return "";
    if (node.length && node[0] && node[0].type === "radio") {
      var chosen = form.querySelector('input[name="' + name + '"]:checked');
      return chosen ? chosen.value : "";
    }
    return String(node.value || "").trim();
  }

  function payload() {
    return {
      name: valueOf("name"),
      company: valueOf("company"),
      email: valueOf("email"),
      os: valueOf("os"),
      machine: valueOf("machine")
    };
  }

  function bodyFor(data) {
    return [
      "Citadel Audit license request",
      "",
      "Name: " + data.name,
      "Company: " + data.company,
      "Email: " + data.email,
      "OS: " + data.os,
      "Machine ID: " + data.machine,
      "",
      "A machine-bound license key is requested for the Machine ID above."
    ].join("\n");
  }

  function mailtoFor(data) {
    return (
      "mailto:" +
      licenseRequestConfig.to +
      "?subject=" +
      encodeURIComponent(licenseRequestConfig.subject) +
      "&body=" +
      encodeURIComponent(bodyFor(data))
    );
  }

  function problems(data) {
    var missing = [];
    if (!data.name) missing.push("name");
    if (!data.company) missing.push("company");
    if (!data.email) missing.push("email");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) missing.push("a valid email");
    if (!data.os) missing.push("operating system");
    if (!data.machine) missing.push("Machine ID");
    else if (data.machine.length < 4) missing.push("a complete Machine ID (that value looks too short)");
    var consent = form.querySelector('input[name="consent"]');
    if (consent && !consent.checked) missing.push("confirmation that this email has no scan data");
    return missing;
  }

  function paint() {
    var data = payload();
    if (preview) preview.textContent = bodyFor(data);
    return data;
  }

  function deliverLicenseRequest(url) {
    /* One exit. A future form endpoint replaces this function's body. */
    window.dispatchEvent(new CustomEvent("citadel-license-request", { detail: url }));
    window.location.href = url;
  }

  function submitLicenseRequest(data) {
    if (licenseRequestConfig.mode === "mailto") {
      deliverLicenseRequest(mailtoFor(data));
      return;
    }
    if (licenseRequestConfig.mode === "form") {
      if (!licenseRequestConfig.endpoint) {
        throw new Error("Form endpoint is not configured.");
      }
      /* Reserved for a future private form. Do not send Machine IDs to GitHub. */
      return fetch(licenseRequestConfig.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: licenseRequestConfig.subject,
          name: data.name,
          company: data.company,
          email: data.email,
          os: data.os,
          machineId: data.machine
        })
      });
    }
    throw new Error("Unknown license request mode.");
  }

  form.addEventListener("input", paint);
  form.addEventListener("change", paint);
  paint();

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var data = paint();
    var missing = problems(data);
    if (missing.length) {
      error.hidden = false;
      error.classList.add("is-on");
      error.textContent = "Still needed: " + missing.join(", ") + ".";
      return;
    }
    error.classList.remove("is-on");
    error.hidden = true;
    try {
      submitLicenseRequest(data);
    } catch (err) {
      error.hidden = false;
      error.classList.add("is-on");
      error.textContent = err.message;
    }
  });

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var text =
        "To: " +
        licenseRequestConfig.to +
        "\nSubject: " +
        licenseRequestConfig.subject +
        "\n\n" +
        bodyFor(paint());
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          copyBtn.textContent = "Copied";
        });
      }
    });
  }
})();
