"use strict";

(() => {
  const $ = (id) => document.getElementById(id);
  const state = { config: null, samples: [], selectedSample: null, mode: "sample", busy: false, corpus: null };
  const statusLabels = {
    accepted: "Accepted at the covered facility",
    not_accepted: "Not accepted at the covered facility",
    cannot_determine: "Cannot determine",
    refused: "Outside this helper’s scope",
  };
  const sampleLabels = {
    "sample-accepted": "Clean cardboard",
    "sample-not-accepted": "Coated wrapper",
    "sample-uncertain": "Missing details",
    "sample-refusal": "Lab waste",
  };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function icon(name) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("icon");
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `#icon-${name}`);
    svg.append(use);
    return svg;
  }

  function safeUrl(value) {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
    } catch {
      return null;
    }
  }

  function formatDate(value) {
    if (!value) return "Not yet verified";
    const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
    return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
  }

  async function request(path, options = {}) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 65000);
    try {
      const response = await fetch(path, { ...options, signal: controller.signal, cache: "no-store" });
      let data;
      try { data = await response.json(); } catch { throw new Error("The local server returned an unreadable response. Please check that the project backend is running."); }
      if (!response.ok) throw new Error(data?.error?.message || `The request could not be completed (${response.status}). Please try again.`);
      return data;
    } catch (error) {
      if (error.name === "AbortError") throw new Error("The request took too long. No recycling decision was made. Please try again shortly.");
      if (error instanceof TypeError) throw new Error("Could not reach the local server. Start the project launcher, then reload this page.");
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function walkthrough(step) {
    for (let n = 1; n <= 3; n += 1) {
      const node = $(`walk-step-${n}`);
      node.classList.toggle("current", step === n);
      node.classList.toggle("complete", n < step);
      if (step === n) node.setAttribute("aria-current", "step");
      else node.removeAttribute("aria-current");
    }
  }

  function clearResult() {
    $("result-content").hidden = true;
    $("result-loading").hidden = true;
    $("result-empty").hidden = false;
    $("result-label").textContent = "READY WHEN YOU ARE";
    $("result-card").setAttribute("aria-labelledby", "result-heading");
    $("result-announcement").textContent = "";
    $("check-error").hidden = true;
  }

  function updateSubmit() {
    const ready = state.mode === "sample" ? !!state.selectedSample : !!state.config?.live_available && !!$("description").value.trim();
    $("check-button").disabled = state.busy || !ready;
  }

  function chooseSample(sample) {
    if (state.busy) return;
    state.selectedSample = sample;
    $("description").value = sample.description;
    for (const button of $("sample-chips").querySelectorAll("button")) {
      const selected = button.dataset.sampleId === sample.id;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    }
    clearResult();
    walkthrough(2);
    updateSubmit();
  }

  function sampleIcon(sample) {
    const description = `${sample.label} ${sample.description}`.toLowerCase();
    if (/lab|hazard|battery|unsafe/.test(description)) return "shield";
    if (/uncertain|missing|container|ambiguous/.test(description)) return "question";
    if (/paper|cardboard|carton|wrapper/.test(description)) return "paper";
    if (/metal|can|tin/.test(description)) return "can";
    return "bottle";
  }

  function renderSamples() {
    const container = $("sample-chips");
    container.replaceChildren();
    if (!state.samples.length) {
      container.append(el("p", "secondary-text", "No sample examples are available. Check the local sample data and reload."));
      return;
    }
    for (const sample of state.samples) {
      const button = el("button", "sample-chip");
      button.type = "button";
      button.dataset.sampleId = sample.id;
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", sample.label);
      button.append(icon(sampleIcon(sample)), el("span", null, sampleLabels[sample.id] || sample.label));
      button.addEventListener("click", () => chooseSample(sample));
      container.append(button);
    }
  }

  function switchMode(mode) {
    if (state.busy || (mode === "live" && !state.config?.live_available)) return;
    state.mode = mode;
    const sampleMode = mode === "sample";
    for (const name of ["sample", "live"]) {
      $(`mode-${name}`).classList.toggle("selected", name === mode);
      $(`mode-${name}`).setAttribute("aria-pressed", String(name === mode));
    }
    $("sample-picker").hidden = !sampleMode;
    $("description").readOnly = sampleMode;
    $("description").value = sampleMode && state.selectedSample ? state.selectedSample.description : "";
    $("description").placeholder = sampleMode ? "Choose a sample above to get started." : "For example: 一个干净的披萨盒 / one cleen pizza box / un carton de pizza propre.";
    $("input-kind").textContent = sampleMode ? "SAMPLE DESCRIPTION" : "ANY-LANGUAGE INPUT · ONE ITEM";
    $("input-help").textContent = sampleMode ? "Sample descriptions are fixed. Use Live AI for your own item." : "Typos and other languages are accepted. Answers use canonical English evidence with source links.";
    $("mode-description").textContent = sampleMode ? "Explore a pre-authored example. No AI call is made." : "Check your item against the cited live rule collection.";
    $("privacy-mode").textContent = sampleMode ? "Sample mode makes no AI call." : "Live sends your description and permitted records to Alibaba Cloud Bailian. The app does not save query logs.";
    $("character-count").hidden = sampleMode;
    $("character-count").textContent = "0 / 1000";
    $("form-footnote-text").textContent = sampleMode ? "Sample examples use an imaginary facility, not HKU." : "Checks apply to the re Kiosk on Main Campus only.";
    clearResult();
    updateSubmit();
    if (!sampleMode) $("description").focus();
  }

  function applyConfig() {
    const config = state.config;
    $("mode-live").disabled = !config.live_available;
    $("live-availability").classList.toggle("ready", !!config.live_available);
    $("live-availability").textContent = config.live_available
      ? `Live ready · ${config.provider || "Alibaba Cloud Bailian"} · ${config.model || "configured model"}`
      : `Live AI unavailable: ${config.live_unavailable_reason || "complete provider setup and approve the source collection first."}`;
    const count = Number(config.live_rule_count ?? config.approved_rule_count ?? 0);
    $("corpus-status").textContent = count > 0
      ? `${count} live rules · Checked ${formatDate(config.corpus_verified_on)}`
      : "0 live rules · Rule collection not configured";
    updateSubmit();
  }

  function setBusy(busy) {
    state.busy = busy;
    $("result-card").setAttribute("aria-busy", String(busy));
    $("check-button-label").textContent = busy ? "Checking…" : "Check item";
    $("check-button").querySelector(".spinner").hidden = !busy;
    $("check-button").querySelector(".button-arrow").hidden = busy;
    $("mode-sample").disabled = busy;
    $("mode-live").disabled = busy || !state.config?.live_available;
    $("description").readOnly = busy || state.mode === "sample";
    for (const button of $("sample-chips").querySelectorAll("button")) button.disabled = busy;
    updateSubmit();
  }

  function renderEvidence(evidence, sampleMode) {
    const container = $("evidence-list");
    container.replaceChildren();
    $("evidence-count").textContent = evidence.length ? `${evidence.length} ${sampleMode ? "EXAMPLE" : "SOURCE"}${evidence.length === 1 ? "" : "S"}` : "";
    $("no-evidence").hidden = !!evidence.length;
    $("no-evidence").textContent = sampleMode ? "This demonstration makes no evidence-backed facility recommendation." : "No cited live rule supports a facility decision for this item.";
    for (const source of evidence) {
      const url = safeUrl(source.url);
      const card = el(url ? "a" : "div", "evidence-link");
      if (url) {
        card.href = url;
        card.target = "_blank";
        card.rel = "noopener noreferrer";
        card.setAttribute("aria-label", `${source.title || "Official source"} (opens in a new tab)`);
        card.addEventListener("click", () => walkthrough(4));
      }
      const body = el("div");
      body.append(el("strong", null, source.title || "Supporting source"));
      if (source.locator) body.append(el("small", null, source.locator));
      if (source.verified_on) body.append(el("small", null, `${sampleMode ? "Example created" : "Source verified"} ${formatDate(source.verified_on)}`));
      card.append(icon("book"), body);
      if (url) card.append(icon("external"));
      container.append(card);
    }
    if (sampleMode || !evidence.length) {
      const referenceButton = el("button", "text-button reference-button", "Browse official reference links ↗");
      referenceButton.type = "button";
      referenceButton.addEventListener("click", () => { walkthrough(4); openSources(); });
      container.append(referenceButton);
      container.append(el("p", "reference-disclaimer", "Reference links are background reading, not supporting evidence for this example."));
    }
  }

  function renderMetadata(result, sampleMode) {
    const metadata = $("result-metadata");
    metadata.replaceChildren();
    const entries = [
      ["Answer type", sampleMode ? "Pre-authored sample (not a live AI result)" : result.mode === "screening" ? "Local scope / evidence screening (no model call)" : "Live AI response"],
      ["Provider", sampleMode ? "None — no API call" : result.provider || "Local screening"],
      ["Model", sampleMode ? "None — authored example" : result.model || "No model call"],
      ["Corpus", result.corpus_version || state.config?.corpus_version || "Not available"],
      ["Corpus verified", formatDate(result.corpus_verified_on || state.config?.corpus_verified_on)],
      ["Prompt version", result.prompt_version || state.config?.prompt_version || "Not available"],
      ["Request", result.request_id || "Not available"],
    ];
    for (const [label, value] of entries) metadata.append(el("dt", null, label), el("dd", null, value));
  }

  function renderResult(result) {
    if (!result || !Object.hasOwn(statusLabels, result.status)) throw new Error("The server returned an incomplete decision. No recommendation can be shown. Please try again.");
    const sampleMode = result.mode === "sample";
    $("result-empty").hidden = true;
    $("result-loading").hidden = true;
    $("result-content").hidden = false;
    $("result-card").setAttribute("aria-labelledby", "decision-heading");
    $("result-label").textContent = sampleMode ? "SAMPLE · AUTHORED EXAMPLE" : result.mode === "screening" ? "LOCAL SCREENING · NO AI CALL" : "LIVE · SOURCE-BACKED CHECK";
    $("result-status").dataset.status = result.status;
    const statusIcon = result.status === "accepted" ? "check" : result.status === "not_accepted" ? "close" : result.status === "refused" ? "shield" : "question";
    $("status-icon-use").setAttribute("href", `#icon-${statusIcon}`);
    $("result-eyebrow").textContent = sampleMode ? "ILLUSTRATIVE RESULT" : "DECISION";
    $("decision-heading").textContent = statusLabels[result.status];
    $("sample-result-notice").hidden = !sampleMode;
    $("result-reason").textContent = result.reason || "No explanation was provided.";
    $("clarification-box").hidden = !result.clarification;
    $("clarification-text").textContent = result.clarification || "";
    $("result-facility").textContent = result.facility || "No facility recommendation";
    const preparation = Array.isArray(result.preparation) ? result.preparation : [];
    $("preparation-section").hidden = !preparation.length;
    $("preparation-section").querySelector("h3").textContent = sampleMode ? "Preparation in this example" : "Before you drop it off";
    const list = $("preparation-list");
    list.replaceChildren();
    for (const item of preparation) {
      const li = el("li");
      li.append(icon("check"), el("span", null, item));
      list.append(li);
    }
    renderEvidence(Array.isArray(result.evidence) ? result.evidence : [], sampleMode);
    renderMetadata(result, sampleMode);
    $("result-announcement").textContent = `${sampleMode ? "Sample demonstration. " : ""}${statusLabels[result.status]}. ${result.reason || ""}`;
    walkthrough(3);
    $("decision-heading").focus({ preventScroll: true });
    if (window.matchMedia("(max-width: 640px)").matches) $("result-card").scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }

  async function checkItem(event) {
    event.preventDefault();
    if (state.busy) return;
    if (state.mode === "sample" && !state.selectedSample) return;
    if (state.mode === "live" && (!state.config?.live_available || !$("description").value.trim())) return;
    const payload = { mode: state.mode, description: state.mode === "sample" ? state.selectedSample.description : $("description").value.trim() };
    if (state.mode === "sample") payload.sample_id = state.selectedSample.id;
    $("check-error").hidden = true;
    $("result-content").hidden = true;
    $("result-empty").hidden = true;
    $("result-loading").hidden = false;
    $("loading-message").textContent = state.mode === "sample" ? "Reading the selected example. No AI call is made." : "Retrieving permitted evidence and validating the answer.";
    $("result-label").textContent = "CHECKING YOUR ITEM";
    $("result-announcement").textContent = "Checking your item.";
    setBusy(true);
    try {
      const result = await request("./api/check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      renderResult(result);
    } catch (error) {
      clearResult();
      $("check-error").textContent = error.message;
      $("check-error").hidden = false;
      $("result-announcement").textContent = "The check could not be completed. No recycling decision was made.";
    } finally {
      setBusy(false);
    }
  }

  function renderSources(data) {
    const references = Array.isArray(data) ? data : Array.isArray(data.references) ? data.references : [];
    const approvedSources = !Array.isArray(data) && Array.isArray(data.sources) ? data.sources : [];
    const approvedIds = new Set(approvedSources.map((source) => source.id));
    const sources = [...new Map([...approvedSources, ...references].map((source) => [source.id || source.url, source])).values()];
    const count = state.config?.live_rule_count ?? state.config?.approved_rule_count ?? 0;
    $("library-summary").textContent = `${count} live rules · ${sources.length} reference${sources.length === 1 ? "" : "s"} · Corpus ${state.config?.corpus_version || data.version || "pending"}`;
    const container = $("source-library");
    container.replaceChildren();
    if (!sources.length) {
      container.append(el("p", "secondary-text", "The reference register is not available yet. See the project README for the source review and approval workflow."));
      return;
    }
    for (const source of sources) {
      const card = el("article", "library-source");
      const url = safeUrl(source.url);
      const title = el(url ? "a" : "h3", null, source.title || source.id || "Reference");
      if (url) { title.href = url; title.target = "_blank"; title.rel = "noopener noreferrer"; title.append(icon("external")); title.setAttribute("aria-label", `${source.title || "Reference"} (opens in a new tab)`); }
      card.append(title);
      if (source.locator) card.append(el("p", null, source.locator));
      if (source.verified_on) card.append(el("p", null, `Reference checked ${formatDate(source.verified_on)}. This date does not establish permission or facility availability.`));
      const permission = source.permission || {};
      const approved = approvedIds.has(source.id) || (["approved", "team_override"].includes(permission.status) && permission.allow_api_processing === true && permission.allow_distribution === true);
      card.append(el("span", "source-state", approved ? "Included in live corpus · cited official reference" : "Reference only · not used for live answers"));
      if (permission.basis || source.permission_basis) card.append(el("p", null, permission.basis || source.permission_basis));
      container.append(card);
    }
  }

  async function openSources() {
    openDialog("sources-dialog");
    if (state.corpus) { renderSources(state.corpus); return; }
    $("library-summary").textContent = "Loading the source register…";
    $("source-library").replaceChildren();
    try { state.corpus = await request("./api/corpus"); renderSources(state.corpus); }
    catch (error) { $("library-summary").textContent = "The source register could not be loaded."; $("source-library").append(el("p", "notice notice-error", error.message)); }
  }

  function openDialog(id) {
    const dialog = $(id);
    if (!dialog.open) dialog.showModal();
  }

  async function loadApp() {
    $("global-error").hidden = true;
    const results = await Promise.allSettled([request("./api/config"), request("./api/samples")]);
    const errors = [];
    if (results[0].status === "fulfilled") { state.config = results[0].value; applyConfig(); }
    else { errors.push(results[0].reason.message); $("live-availability").textContent = "Live availability could not be checked."; $("corpus-status").textContent = "Corpus status unavailable"; }
    if (results[1].status === "fulfilled") {
      const data = results[1].value;
      state.samples = Array.isArray(data) ? data : data.samples || [];
      renderSamples();
    } else { errors.push(results[1].reason.message); $("sample-chips").replaceChildren(el("span", "loading-label", "Samples could not be loaded.")); }
    if (errors.length) {
      const banner = $("global-error");
      banner.replaceChildren(el("span", null, [...new Set(errors)].join(" ")));
      const retry = el("button", null, "Retry connection");
      retry.type = "button";
      retry.addEventListener("click", () => { retry.disabled = true; loadApp(); });
      banner.append(retry);
      banner.hidden = false;
    }
  }

  $("check-form").addEventListener("submit", checkItem);
  $("mode-sample").addEventListener("click", () => switchMode("sample"));
  $("mode-live").addEventListener("click", () => switchMode("live"));
  $("description").addEventListener("input", () => {
    $("character-count").textContent = `${$("description").value.length} / 1000`;
    clearResult();
    updateSubmit();
  });
  $("open-sources").addEventListener("click", openSources);
  for (const button of document.querySelectorAll("[data-open-dialog]")) button.addEventListener("click", () => openDialog(button.dataset.openDialog));
  for (const button of document.querySelectorAll("[data-close-dialog]")) button.addEventListener("click", () => button.closest("dialog").close());
  for (const dialog of document.querySelectorAll("dialog")) dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  $("dismiss-walkthrough").addEventListener("click", () => {
    $("walkthrough").hidden = true;
    try { localStorage.setItem("re-helper-walkthrough-dismissed", "yes"); } catch { /* Storage is optional. */ }
  });
  try { $("walkthrough").hidden = localStorage.getItem("re-helper-walkthrough-dismissed") === "yes"; } catch { /* The helper works with storage disabled. */ }
  walkthrough(1);
  loadApp();
})();
