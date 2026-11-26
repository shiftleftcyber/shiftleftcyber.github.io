/*
 * /attestations guide UI: the annotated example explorer and the in-browser
 * "Try it" check. Verification logic lives in securesbom-verify.js; the
 * example messages and field notes come from data/attestations/*.json via
 * <script type="application/json"> blocks rendered by the shortcode.
 */
(function () {
  "use strict";

  var V = window.SecureSBOMVerify;
  var TAB_ORDER = ["sign-request", "sign-response", "verify-request", "verify-response"];

  function $(id) { return document.getElementById(id); }
  function readJSON(id) { var el = $(id); return el ? JSON.parse(el.textContent) : null; }
  /* All rendering builds DOM nodes; no data or user input is ever parsed as HTML. */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "className") node.className = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) {
      if (c == null) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }
  function replaceChildren(node, children) {
    while (node.firstChild) node.removeChild(node.firstChild);
    (children || []).forEach(function (c) { if (c != null) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
  }
  /* Note text supports `code`, **bold** and _italic_ markers only. */
  function inline(text) {
    var parts = String(text).split(/(`[^`]+`|\*\*[^*]+\*\*|_[^_\s][^_]*_)/);
    return parts.filter(function (p) { return p !== ""; }).map(function (p) {
      if (p.charAt(0) === "`") return el("code", {}, [p.slice(1, -1)]);
      if (p.slice(0, 2) === "**") return el("strong", {}, [p.slice(2, -2)]);
      if (p.charAt(0) === "_" && p.length > 2) return el("em", {}, [p.slice(1, -1)]);
      return p;
    });
  }

  var EXAMPLE, FIELDS;

  /* ---------------- explorer ---------------- */
  var activeTab = TAB_ORDER[0];
  var decoded = false;

  function truncate(s) { return s.length <= 64 ? s : s.slice(0, 36) + "…" + s.slice(-10); }

  /* Renders a JSON value as pretty-printed DOM nodes, turning annotated keys
   * into numbered buttons. Appends to `out` (an array of nodes/strings). */
  function renderJSON(value, path, indent, notes, numbers, out) {
    var pad = "  ".repeat(indent);
    if (value && typeof value === "object" && value.__decoded) {
      out.push(el("span", { className: "att-decoded-tag" }, ["/* decoded from base64 */"]), " ");
      return renderJSON(value.value, path, indent, notes, numbers, out);
    }
    if (Array.isArray(value)) {
      if (!value.length) { out.push("[]"); return; }
      out.push("[\n");
      value.forEach(function (item, i) {
        out.push(pad + "  ");
        renderJSON(item, path + "[]", indent + 1, notes, numbers, out);
        out.push(i < value.length - 1 ? ",\n" : "\n");
      });
      out.push(pad + "]");
      return;
    }
    if (value && typeof value === "object") {
      var keys = Object.keys(value);
      if (!keys.length) { out.push("{}"); return; }
      out.push("{\n");
      keys.forEach(function (k, i) {
        var p = path ? path + "." + k : k;
        var keyNode = el("span", { className: "att-k" }, ['"' + k + '"']);
        if (notes[p]) {
          var id = notes[p];
          if (!numbers[id]) numbers[id] = Object.keys(numbers).length + 1;
          keyNode = el("button", { type: "button", className: "att-key", "data-note": id },
            [el("span", { className: "att-badge" }, [String(numbers[id])]), keyNode]);
        }
        out.push(pad + "  ", keyNode, ": ");
        renderJSON(value[k], p, indent + 1, notes, numbers, out);
        out.push(i < keys.length - 1 ? ",\n" : "\n");
      });
      out.push(pad + "}");
      return;
    }
    if (typeof value === "string") {
      var t = truncate(value);
      var attrs = { className: "att-s" };
      if (t !== value) attrs.title = value;
      out.push(el("span", attrs, ['"' + t + '"']));
      return;
    }
    out.push(el("span", { className: "att-n" }, [JSON.stringify(value)]));
  }

  function setTab(name) {
    activeTab = name;
    var tab = FIELDS.tabs[name];
    document.querySelectorAll(".att-tab").forEach(function (b) {
      var on = b.getAttribute("data-tab") === name;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.querySelectorAll(".att-flow-step").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-tab") === name);
    });
    $("att-endpoint").textContent = tab.endpoint;
    $("att-decode-wrap").style.display = tab.envelope ? "" : "none";

    var notes = Object.assign({}, tab.fields);
    var obj = EXAMPLE[tab.example];
    if (tab.envelope && decoded) {
      obj = JSON.parse(JSON.stringify(obj));
      var env = obj[tab.envelope];
      env.payload = { __decoded: true, value: V.decodeEnvelope(env).statement };
      Object.keys(FIELDS.decoded_fields).forEach(function (k) {
        notes[tab.envelope + ".payload." + k] = FIELDS.decoded_fields[k];
      });
    }
    // Number the fields in the order they appear in the rendered JSON.
    var numbers = {}, nodes = [];
    renderJSON(obj, "", 0, notes, numbers, nodes);
    replaceChildren($("att-code"), nodes);
    var order = Object.keys(numbers).sort(function (a, b) { return numbers[a] - numbers[b]; });
    replaceChildren($("att-notes"), order.map(function (id) {
      var n = FIELDS.notes[id];
      return el("div", { className: "att-note", "data-note": id, tabindex: "0" }, [
        el("span", { className: "att-badge" }, [String(numbers[id])]),
        el("div", {}, [
          el("p", { className: "att-note-title" }, [el("code", {}, [n.field])]),
          el("p", { className: "att-note-body" }, inline(n.body))
        ])
      ]);
    }));
  }

  function highlight(id, scrollNote) {
    document.querySelectorAll(".att-key, .att-note").forEach(function (el) {
      el.classList.toggle("is-active", el.getAttribute("data-note") === id);
    });
    if (scrollNote) {
      var n = document.querySelector('.att-note[data-note="' + id + '"]');
      var panel = $("att-notes");
      if (n && panel) panel.scrollTop = n.offsetTop - panel.offsetTop - 8;
    }
  }

  /* ---------------- try it ---------------- */
  var syncing = false;

  function examplePublicKey() {
    var k = EXAMPLE.public_key;
    return k ? (k.public_key_pem || JSON.stringify(k.public_key_jwk, null, 2)) : "";
  }

  function loadExample() {
    $("att-envelope").value = JSON.stringify(EXAMPLE.sign_response.attestation, null, 2);
    $("att-expected").value = EXAMPLE.subject_digest;
    $("att-pubkey").value = examplePublicKey();
    envelopeChanged();
    run();
  }

  function envelopeChanged() {
    if (syncing) return;
    try {
      var d = V.decodeEnvelope($("att-envelope").value);
      syncing = true;
      $("att-payload").value = d.payloadText;
    } catch (e) { /* leave the decoded view alone while the envelope is being edited */ }
    syncing = false;
    markStale();
  }

  function payloadChanged() {
    if (syncing) return;
    try {
      var env = JSON.parse($("att-envelope").value);
      syncing = true;
      $("att-envelope").value = JSON.stringify(V.withPayload(env, $("att-payload").value), null, 2);
    } catch (e) { /* envelope not parseable; nothing to re-encode into */ }
    syncing = false;
    markStale();
  }

  function markStale() {
    var v = $("att-verdict");
    if (!v.classList.contains("att-verdict-idle")) {
      v.className = "att-verdict att-verdict-idle";
      v.textContent = "Something changed. Run the checks again.";
    }
  }

  async function tamper(kind) {
    var env;
    try { env = JSON.parse($("att-envelope").value); } catch (e) { loadExample(); env = JSON.parse($("att-envelope").value); }
    var st = null;
    try { st = V.decodeEnvelope(env).statement; } catch (e) { /* fall through */ }
    function setStatement(text) { env = V.withPayload(env, text); }

    if (kind === "sbom" && st) {
      var comps = st.predicate && st.predicate.components;
      if (comps && comps.length) comps[0].version = comps[0].version === "2.0.1" ? "2.0.2" : "2.0.1";
      else st.predicate.tampered = true;
      setStatement(V.canonicalize(st));
    } else if (kind === "subject" && st) {
      var d = st.subject[0].digest.sha256;
      st.subject[0].digest.sha256 = (d.charAt(0) === "b" ? "c" : "b") + d.slice(1);
      setStatement(V.canonicalize(st));
    } else if (kind === "pretty" && st) {
      setStatement(JSON.stringify(st, null, 2));
    } else if (kind === "sig") {
      var s = env.signatures[0].sig, i = 24;
      env.signatures[0].sig = s.slice(0, i) + (s.charAt(i) === "A" ? "B" : "A") + s.slice(i + 1);
    } else if (kind === "digest") {
      var e = $("att-expected").value.trim();
      $("att-expected").value = e.slice(0, -1) + (e.slice(-1) === "0" ? "1" : "0");
    } else if (kind === "key") {
      var pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
      var jwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
      $("att-pubkey").value = JSON.stringify({ kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y }, null, 2);
    }
    syncing = true;
    $("att-envelope").value = JSON.stringify(env, null, 2);
    syncing = false;
    envelopeChanged();
    run();
  }

  var ICONS = { pass: "✓", fail: "✗", skip: "–", info: "i" };

  async function run() {
    var verdict = $("att-verdict"), list = $("att-results");
    if (!window.crypto || !crypto.subtle) {
      verdict.className = "att-verdict att-verdict-fail";
      verdict.textContent = "Your browser's Web Crypto support is unavailable. Open this page over https in a current browser.";
      return;
    }
    var res = await V.verifyAttestation({
      envelope: $("att-envelope").value,
      expectedDigest: $("att-expected").value,
      publicKey: $("att-pubkey").value.trim() || null
    });
    replaceChildren(list, res.checks.filter(function (c) { return c.id !== "key"; }).map(function (c) {
      return el("li", { className: "att-result att-result-" + c.status }, [
        el("span", { className: "att-result-icon" }, [ICONS[c.status]]),
        el("div", {}, [
          el("p", { className: "att-result-label" }, [c.label, c.status === "fail" ? " " : null, c.status === "fail" ? el("code", {}, [c.code]) : null]),
          el("p", { className: "att-result-detail" }, [c.detail])
        ])
      ]);
    }));
    var sha = res.statementSha256 ? el("span", { className: "att-sha" }, ["statement_sha256 " + res.statementSha256]) : null;
    if (res.code) {
      verdict.className = "att-verdict att-verdict-fail";
      replaceChildren(verdict, [el("strong", {}, ["Not verified."]), " The API would return ", el("code", {}, [res.code]), sha]);
    } else if (!res.verified) {
      verdict.className = "att-verdict att-verdict-idle";
      replaceChildren(verdict, [el("strong", {}, ["Not enough to decide."]), " Add the missing input shown below.", sha]);
    } else {
      verdict.className = "att-verdict att-verdict-pass";
      replaceChildren(verdict, [el("strong", {}, ["Verified."]), " Every check passed.", sha]);
    }
  }

  /* ---------------- wire up ---------------- */
  function init() {
    if (!$("attestation-guide") || !V) return;
    EXAMPLE = readJSON("att-example-data");
    FIELDS = readJSON("att-fields-data");

    replaceChildren($("att-tabs"), TAB_ORDER.map(function (k) {
      return el("button", { type: "button", role: "tab", className: "att-tab", "data-tab": k }, [FIELDS.tabs[k].label]);
    }));
    document.querySelectorAll(".att-tab").forEach(function (b) {
      b.addEventListener("click", function () { setTab(b.getAttribute("data-tab")); });
    });
    document.querySelectorAll(".att-flow-step").forEach(function (b) {
      b.addEventListener("click", function () {
        setTab(b.getAttribute("data-tab"));
        $("att-explorer").scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    $("att-decode").addEventListener("change", function (e) { decoded = e.target.checked; setTab(activeTab); });
    $("att-code").addEventListener("click", function (e) {
      var k = e.target.closest(".att-key");
      if (k) highlight(k.getAttribute("data-note"), true);
    });
    $("att-notes").addEventListener("click", function (e) {
      var n = e.target.closest(".att-note");
      if (n) highlight(n.getAttribute("data-note"), false);
    });
    $("att-envelope").addEventListener("input", envelopeChanged);
    $("att-payload").addEventListener("input", payloadChanged);
    $("att-expected").addEventListener("input", markStale);
    $("att-pubkey").addEventListener("input", markStale);
    $("att-run").addEventListener("click", run);
    $("att-reset").addEventListener("click", loadExample);
    document.querySelectorAll("[data-tamper]").forEach(function (b) {
      b.addEventListener("click", function () { tamper(b.getAttribute("data-tamper")); });
    });
    setTab(TAB_ORDER[0]);
    loadExample();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
