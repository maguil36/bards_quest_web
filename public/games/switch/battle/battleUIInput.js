export class BattleUIInput {
  constructor(battleUI) {
    this.battleUI = battleUI;
    this.keyboardEventListener = null;
  }

  setupKeyboardNavigation() {
    if (this.keyboardEventListener) {
      document.removeEventListener('keydown', this.keyboardEventListener);
    }

    this.keyboardEventListener = (e) => {
      if (!this.battleUI.keyboardNavigationEnabled) return;

      const buttons = this.getNavigableButtons();
      if (buttons.length === 0) return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        this.battleUI.focusedButtonIndex = (this.battleUI.focusedButtonIndex - 1 + buttons.length) % buttons.length;
        this.updateButtonFocus(buttons);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        this.battleUI.focusedButtonIndex = (this.battleUI.focusedButtonIndex + 1) % buttons.length;
        this.updateButtonFocus(buttons);
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (buttons[this.battleUI.focusedButtonIndex]) {
          buttons[this.battleUI.focusedButtonIndex].click();
        }
      }
    };

    document.addEventListener('keydown', this.keyboardEventListener);

    const buttons = this.getNavigableButtons();
    if (buttons.length > 0) {
      this.updateButtonFocus(buttons);
    }
  }

  getNavigableButtons() {
    const actionButtons = Array.from(this.battleUI.container.querySelectorAll('.action-button'));
    const moveButtons = Array.from(this.battleUI.container.querySelectorAll('.move-button'));
    const backButtons = Array.from(this.battleUI.container.querySelectorAll('.back-button'));
    const fraymotifButtons = Array.from(this.battleUI.container.querySelectorAll('.fraymotif-ability-button'));
    const fraymotifBackButtons = Array.from(this.battleUI.container.querySelectorAll('.fraymotif-back-button'));

    return [...actionButtons, ...moveButtons, ...backButtons, ...fraymotifButtons, ...fraymotifBackButtons].filter(btn =>
      btn.offsetParent !== null
    );
  }

  updateButtonFocus(buttons) {
    buttons.forEach((btn, index) => {
      if (index === this.battleUI.focusedButtonIndex) {
        btn.style.transform = 'scale(1.05)';
        btn.style.boxShadow = '0 0 20px currentColor';
      } else {
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = 'none';
      }
    });
  }

  cleanup() {
    if (this.keyboardEventListener) {
      document.removeEventListener('keydown', this.keyboardEventListener);
      this.keyboardEventListener = null;
    }
  }
}
