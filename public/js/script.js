// Script Tambahan - efek & animasi visual (tanpa logika chat)

// Animasi background partikel halus
document.addEventListener("DOMContentLoaded", () => {
  const particlesContainer = document.getElementById("particles-container");
  if (!particlesContainer) return;

  const count = 20;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    const size = Math.random() * 5 + 1;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.bottom = "0";
    particle.style.animationDuration = `${Math.random() * 15 + 10}s`;
    particle.style.animationDelay = `${Math.random() * 10}s`;
    particlesContainer.appendChild(particle);
  }
});

// Tambahan animasi untuk tombol kirim ✨
const sendButton = document.querySelector("button[type='submit']");
if (sendButton) {
  sendButton.addEventListener("mouseenter", () => {
    sendButton.style.transform = "scale(1.1)";
    sendButton.style.transition = "transform 0.2s ease";
  });
  sendButton.addEventListener("mouseleave", () => {
    sendButton.style.transform = "scale(1)";
  });
}
