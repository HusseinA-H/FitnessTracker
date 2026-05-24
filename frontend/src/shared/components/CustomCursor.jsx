import { useEffect } from "react";

export default function CustomCursor() {

  useEffect(() => {
    const cursor = document.createElement("div");
    cursor.className = "custom-cursor";
    document.body.appendChild(cursor);

    const move = (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    };

    const addHoverEvents = () => {
      const buttons = document.querySelectorAll("button");
      const links = document.querySelectorAll("a");
      const inputs = document.querySelectorAll("input, textarea");

      buttons.forEach(btn => {
        btn.addEventListener("mouseenter", () => {
          cursor.classList.add("cursor-button", "active");
        });
        btn.addEventListener("mouseleave", () => {
          cursor.className = "custom-cursor";
        });
      });

      links.forEach(link => {
        link.addEventListener("mouseenter", () => {
          cursor.classList.add("cursor-link", "active");
        });
        link.addEventListener("mouseleave", () => {
          cursor.className = "custom-cursor";
        });
      });

      inputs.forEach(input => {
        input.addEventListener("mouseenter", () => {
          cursor.classList.add("cursor-input");
        });
        input.addEventListener("mouseleave", () => {
          cursor.className = "custom-cursor";
        });
      });
    };

    window.addEventListener("mousemove", move);
    addHoverEvents();

    return () => {
      window.removeEventListener("mousemove", move);
      cursor.remove();
    };

  }, []);

  return null;
}
