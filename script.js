function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  menu.classList.toggle("open");
  icon.classList.toggle("open");
}

const roles = ["UI/UX", "Brand", "Graphic"];
let index = 0;
let charIndex = 0;
let currentRole = roles[index];
let typing = true;

const typewriterElement = document.getElementById("typewriter");

function typeWriterEffect() {
  if (typing) {
    if (charIndex < currentRole.length) {
      typewriterElement.textContent += currentRole.charAt(charIndex);
      charIndex++;
      setTimeout(typeWriterEffect, 200);
    } else {
      typing = false;
      setTimeout(typeWriterEffect, 2000); // Wait before deleting
    }
  } else {
    if (charIndex > 0) {
      typewriterElement.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      setTimeout(typeWriterEffect, 100);
    } else {
      typing = true;
      index = (index + 1) % roles.length;
      currentRole = roles[index];
      setTimeout(typeWriterEffect, 150); // Wait before typing next role
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  typewriterElement.textContent = ""; // Clear initial static text
  typeWriterEffect();
});
