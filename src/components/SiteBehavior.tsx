"use client";

/**
 * Re-implements the small parts of Bricks' frontend JavaScript the site relies on:
 * active menu items, dropdown + mobile menu, sliders (Splide), accordions,
 * and blocking form submissions (forms are visual-only for now).
 */
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Splide from "@splidejs/splide";

const ACTIVE_ITEM = ["current-menu-item", "current_page_item"];
const ACTIVE_PARENT = ["current-menu-ancestor", "current-menu-parent", "current_page_parent", "current_page_ancestor"];
const MOBILE_BREAKPOINT_SELECTOR = ".bricks-mobile-menu-toggle";

const normalize = (p: string) => (p.endsWith("/") ? p : p + "/");

function markActiveMenuItems(pathname: string) {
  const current = normalize(pathname);
  document.querySelectorAll<HTMLLIElement>(".bricks-nav-menu li.menu-item, .bricks-mobile-menu li.menu-item").forEach((li) => {
    li.classList.remove(...ACTIVE_ITEM, ...ACTIVE_PARENT);
    li.querySelector(":scope > a, :scope > .brx-submenu-toggle > a")?.removeAttribute("aria-current");
  });
  document.querySelectorAll<HTMLAnchorElement>(".bricks-nav-menu a, .bricks-mobile-menu a").forEach((a) => {
    const href = a.getAttribute("href");
    if (!href || !href.startsWith("/")) return;
    const exact = normalize(href) === current;
    // Section pages (e.g. a case study) also highlight their section's menu item
    const inSection = href !== "/" && current.startsWith(normalize(href));
    if (!exact && !inSection) return;
    if (exact) a.setAttribute("aria-current", "page");
    const li = a.closest("li.menu-item");
    li?.classList.add(...ACTIVE_ITEM);
    let parent = li?.parentElement?.closest("li.menu-item");
    while (parent) {
      parent.classList.add(...ACTIVE_PARENT);
      parent = parent.parentElement?.closest("li.menu-item");
    }
  });
}

function closeMobileMenus() {
  document.querySelectorAll(".brxe-nav-menu.show-mobile-menu").forEach((nav) => {
    nav.classList.remove("show-mobile-menu");
    nav.querySelector(MOBILE_BREAKPOINT_SELECTOR)?.setAttribute("aria-expanded", "false");
  });
  document.body.classList.remove("no-scroll");
}

function setSubmenu(li: Element, open: boolean) {
  li.classList.toggle("open", open);
  if (!open) li.classList.remove("active");
  li.querySelector(":scope > .brx-submenu-toggle > button")?.setAttribute("aria-expanded", String(open));
}

function slideToggle(content: HTMLElement, open: boolean, duration = 200) {
  const item = content.parentElement!;
  item.classList.toggle("brx-open", open);
  item.querySelector(".accordion-title-wrapper")?.setAttribute("aria-expanded", String(open));
  content.style.display = "block";
  const full = content.scrollHeight;
  content.style.overflow = "hidden";
  content.style.transition = `height ${duration}ms`;
  content.style.height = open ? "0px" : `${full}px`;
  void content.offsetHeight;
  content.style.height = open ? `${full}px` : "0px";
  window.setTimeout(() => {
    content.style.removeProperty("height");
    content.style.removeProperty("overflow");
    content.style.removeProperty("transition");
    if (!open) content.style.display = "none";
  }, duration);
}

/** Global, delegated listeners: attached once for the whole app. */
function attachGlobalListeners() {
  const onClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    const mobileToggle = target.closest(MOBILE_BREAKPOINT_SELECTOR);
    if (mobileToggle) {
      const nav = mobileToggle.closest(".brxe-nav-menu")!;
      const open = nav.classList.toggle("show-mobile-menu");
      mobileToggle.setAttribute("aria-expanded", String(open));
      mobileToggle.setAttribute("aria-label", open ? "Close mobile menu" : "Open mobile menu");
      document.body.classList.toggle("no-scroll", open);
      return;
    }
    if (target.classList.contains("bricks-mobile-menu-overlay")) {
      closeMobileMenus();
      return;
    }

    const submenuButton = target.closest(".brx-submenu-toggle > button");
    if (submenuButton) {
      const li = submenuButton.parentElement!.parentElement!;
      setSubmenu(li, !li.classList.contains("open"));
      return;
    }

    const accordionTitle = target.closest<HTMLElement>(".brxe-accordion-nested .accordion-title-wrapper");
    if (accordionTitle) {
      const item = accordionTitle.parentElement!;
      const accordion = item.parentElement!;
      const content = item.querySelector<HTMLElement>(":scope > .accordion-content-wrapper");
      if (!content) return;
      const open = !item.classList.contains("brx-open");
      accordion.querySelectorAll<HTMLElement>(":scope > .brx-open > .accordion-content-wrapper").forEach((c) => {
        if (c !== content) slideToggle(c, false);
      });
      slideToggle(content, open);
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const title = (e.target as HTMLElement).closest?.(".accordion-title-wrapper");
    if (title && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      (title as HTMLElement).click();
    }
    if (e.key === "Escape") {
      closeMobileMenus();
      document.querySelectorAll(".bricks-nav-menu li.open").forEach((li) => setSubmenu(li, false));
    }
  };

  // Desktop dropdowns open on hover (not inside the open mobile menu)
  const onHover = (e: MouseEvent) => {
    const li = (e.target as HTMLElement).closest?.(".bricks-nav-menu .menu-item-has-children");
    if (!li || li.closest(".show-mobile-menu")) return;
    const related = e.relatedTarget as Node | null;
    if (related && li.contains(related)) return;
    setSubmenu(li, e.type === "mouseover");
  };

  // Forms are visual-only in this phase
  const onSubmit = (e: SubmitEvent) => {
    if ((e.target as HTMLElement).closest(".brxe-form")) e.preventDefault();
  };

  // Real viewport height for the mobile menu (mobile browser bars make 100vh too tall)
  const setVh = () => document.documentElement.style.setProperty("--bricks-vh", `${window.innerHeight * 0.01}px`);
  setVh();
  window.addEventListener("resize", setVh);

  document.addEventListener("click", onClick);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("mouseover", onHover);
  document.addEventListener("mouseout", onHover);
  document.addEventListener("submit", onSubmit);
  return () => {
    window.removeEventListener("resize", setVh);
    document.removeEventListener("click", onClick);
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("mouseover", onHover);
    document.removeEventListener("mouseout", onHover);
    document.removeEventListener("submit", onSubmit);
  };
}

function mountSliders() {
  const instances: Splide[] = [];
  document.querySelectorAll<HTMLElement>(".brxe-slider-nested.splide").forEach((el) => {
    el.querySelectorAll<HTMLElement>(":scope > .splide__track > .splide__list > :is(.brxe-container, .brxe-block, .brxe-div)").forEach((slide) => {
      slide.classList.add("splide__slide");
      // Bricks styles slides (e.g. background images) via [data-id="brxe-..."]
      slide.dataset.id = slide.id;
    });
    // Auto-playing sliders get a pause/play button and pause on hover/focus (WCAG 2.2.2)
    const options = JSON.parse(el.dataset.splide || "{}");
    if (options.autoplay && !el.querySelector(".splide__toggle")) {
      el.dataset.splide = JSON.stringify({ ...options, pauseOnHover: true, pauseOnFocus: true });
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "splide__toggle ux-slider-toggle";
      toggle.innerHTML = '<span class="splide__toggle__play">Play</span><span class="splide__toggle__pause">Pause</span>';
      el.appendChild(toggle);
    }
    // Splide reads its options from the element's data-splide attribute
    instances.push(new Splide(el).mount());
    // Splide renames the slides' ids; Bricks puts the original ones back (CSS targets them)
    el.querySelectorAll<HTMLElement>(".splide__slide:not(.splide__slide--clone)[data-id]").forEach((slide) => {
      slide.id = slide.dataset.id!;
    });
  });
  return () => instances.forEach((s) => s.destroy());
}

export default function SiteBehavior() {
  const pathname = usePathname();

  useEffect(attachGlobalListeners, []);

  useEffect(() => {
    markActiveMenuItems(pathname);
    closeMobileMenus();
    document.querySelectorAll(".bricks-nav-menu li.open").forEach((li) => setSubmenu(li, false));
    return mountSliders();
  }, [pathname]);

  return null;
}
