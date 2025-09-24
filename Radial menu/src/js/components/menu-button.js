const mainBtn = document.querySelector('.main-btn');
const menuBtns = document.querySelectorAll('.menu-btn');
let open = false;

mainBtn.addEventListener('click', () => {
  open = !open;
  const radius = 120;

  menuBtns.forEach(btn => {
    const angle = parseInt(btn.dataset.angle);
    const rad = angle * Math.PI / 180;
    const x = Math.cos(rad) * radius;
    const y = -Math.sin(rad) * radius;

    if (open) {
      btn.style.transform = `translate(${x}px, ${y}px) scale(1)`;
    } else {
      btn.style.transform = `translate(0,0) scale(0)`;
    }
  });
});