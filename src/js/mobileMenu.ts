document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');

  if (mobileMenuButton && mobileMenu && menuIcon && closeIcon) {
    const closeMobileMenu = () => {
      mobileMenu.classList.add('hidden');
      menuIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
      mobileMenuButton.setAttribute('aria-expanded', 'false');
    };

    mobileMenuButton.addEventListener('click', () => {
      const isExpanded =
        mobileMenuButton.getAttribute('aria-expanded') === 'true';

      mobileMenu.classList.toggle('hidden');
      menuIcon.classList.toggle('hidden');
      closeIcon.classList.toggle('hidden');
      mobileMenuButton.setAttribute('aria-expanded', (!isExpanded).toString());
    });

    // Event delegation so dynamically added tool links also close the menu
    mobileMenu.addEventListener('click', (event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('a')) {
        closeMobileMenu();
      }
    });

    document.addEventListener('click', (event) => {
      const target = event.target as Node;
      const isClickInsideMenu = mobileMenu.contains(target);
      const isClickOnButton = mobileMenuButton.contains(target);

      if (
        !isClickInsideMenu &&
        !isClickOnButton &&
        !mobileMenu.classList.contains('hidden')
      ) {
        closeMobileMenu();
      }
    });
  }
});
