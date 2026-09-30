const scenes = [
  {
    ask: "Did the security patch reach production?",
    facts: [
      ["environment", "production"],
      ["release", "2.4.1"],
      ["change", "checkout CVE fixed"],
      ["evidence", "attestation signed"]
    ]
  },
  {
    ask: "Deploy the build that fixed checkout.",
    facts: [
      ["resolved", "build 1842"],
      ["source", "PR #441"],
      ["summary", "checkout race resolved"],
      ["gate", "policy passed"]
    ]
  },
  {
    ask: "May this agent promote the build?",
    facts: [
      ["identity", "spiffe://supply-chain/agent/release"],
      ["credential", "SVID · short-lived"],
      ["gateway", "authenticated"],
      ["decision", "promote staging · audited"]
    ]
  },
  {
    ask: "Which environment is still on the old cache?",
    facts: [
      ["behind", "staging-eu"],
      ["generation", "cache 7"],
      ["current", "cache 9 in prod"],
      ["action", "promote, then verify"]
    ]
  }
];

const question = document.getElementById("trace-q");
const facts = document.getElementById("trace-facts");
const toggle = document.getElementById("trace-toggle");

let index = 0;
let timer = 0;
let paused = false;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function render(scene) {
  question.textContent = scene.ask;
  facts.replaceChildren();
  scene.facts.forEach(([key, value], i) => {
    const row = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = key;
    dd.textContent = value;
    if (i === scene.facts.length - 1) dd.className = "ok";
    row.append(dt, dd);
    facts.append(row);
  });
}

function advance() {
  index = (index + 1) % scenes.length;
  render(scenes[index]);
}

function play() {
  window.clearInterval(timer);
  if (paused || reduceMotion) return;
  timer = window.setInterval(advance, 5200);
}

toggle.addEventListener("click", () => {
  paused = !paused;
  toggle.textContent = paused ? "Play" : "Pause";
  toggle.setAttribute("aria-pressed", String(paused));
  play();
});

render(scenes[0]);
play();

const links = [...document.querySelectorAll(".nav a")];
const sections = links
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach((link) => {
        const on = link.getAttribute("href") === `#${id}`;
        if (on) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    });
  },
  { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 }
);

sections.forEach((section) => spy.observe(section));
