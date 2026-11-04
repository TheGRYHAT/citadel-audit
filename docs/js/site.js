(function () {
  document.documentElement.classList.add("js");

  var toggle = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  var tabs = Array.prototype.slice.call(document.querySelectorAll("[data-frame-tab]"));
  var frames = Array.prototype.slice.call(document.querySelectorAll("[data-frame]"));
  if (!tabs.length || !frames.length) return;

  function show(id) {
    tabs.forEach(function (tab) {
      var selected = tab.getAttribute("data-frame-tab") === id;
      tab.setAttribute("aria-selected", selected ? "true" : "false");
      tab.tabIndex = selected ? 0 : -1;
    });
    frames.forEach(function (frame) {
      var on = frame.id === id;
      frame.classList.toggle("is-active", on);
      frame.hidden = !on;
    });
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () {
      show(tab.getAttribute("data-frame-tab"));
    });
    tab.addEventListener("keydown", function (event) {
      var next = index;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault();
      tabs[next].focus();
      show(tabs[next].getAttribute("data-frame-tab"));
    });
  });

  show(tabs[0].getAttribute("data-frame-tab"));
})();
