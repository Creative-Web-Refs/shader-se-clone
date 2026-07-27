import "./style.css";

const root = document.documentElement;
const header = document.querySelector(".site-header");
const sections = [...document.querySelectorAll("[data-theme]")];
const noise = document.querySelector("#noise");
const context = noise.getContext("2d", { alpha: true });
const dots = [...document.querySelectorAll(".dots i")];
const rail = document.querySelector(".film__rail");
let carouselIndex = 0;
let lastScroll = window.scrollY;
let velocity = 0;
let noiseFrame = 0;

function resizeNoise() {
  const scale = Math.min(window.devicePixelRatio || 1, 1.5);
  noise.width = Math.round(window.innerWidth * scale * 0.22);
  noise.height = Math.round(window.innerHeight * scale * 0.22);
}

function drawNoise() {
  noiseFrame += 1;
  if (noiseFrame % 2 === 0) {
    const image = context.createImageData(noise.width, noise.height);
    const pixels = image.data;
    for (let index = 0; index < pixels.length; index += 4) {
      const value = Math.random() * 255;
      pixels[index] = value;
      pixels[index + 1] = value;
      pixels[index + 2] = value;
      pixels[index + 3] = 20;
    }
    context.putImageData(image, 0, 0);
  }
  requestAnimationFrame(drawNoise);
}

function updateScroll() {
  const current = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  velocity += ((current - lastScroll) - velocity) * 0.12;
  root.style.setProperty("--scroll", max > 0 ? current / max : 0);
  root.style.setProperty("--velocity", Math.min(Math.abs(velocity) / 120, 1));
  lastScroll = current;

  const center = window.innerHeight * 0.38;
  let active = sections[0];
  for (const section of sections) {
    const rect = section.getBoundingClientRect();
    if (rect.top <= center && rect.bottom >= center) active = section;
  }
  header.dataset.theme = active?.dataset.theme || "dark";
}

function setCarousel(next) {
  carouselIndex = (next + dots.length) % dots.length;
  rail.style.setProperty("--carousel-index", carouselIndex);
  dots.forEach((dot, index) => dot.classList.toggle("is-active", index === carouselIndex));
}

document.querySelector(".carousel-button--next").addEventListener("click", () => {
  setCarousel(carouselIndex + 1);
});

document.querySelector(".carousel-button--prev").addEventListener("click", () => {
  setCarousel(carouselIndex - 1);
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
    window.history.replaceState(null, "", link.getAttribute("href"));
  });
});

window.addEventListener("resize", resizeNoise, { passive: true });
window.addEventListener("scroll", updateScroll, { passive: true });

Promise.all(
  [...document.images].map((image) =>
    image.complete
      ? Promise.resolve()
      : new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
        }),
  ),
).finally(() => {
  window.setTimeout(() => document.querySelector(".boot").classList.add("is-ready"), 450);
});

resizeNoise();
updateScroll();
drawNoise();
