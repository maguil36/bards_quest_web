export class BattleUIInput {
  constructor(battleUI) {
    this.battleUI = battleUI;
    this.keydownListener = null;
  }

  setupKeyboardNavigation() {
    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener);
    }

    this.keydownListener = (e) => {
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
      } else if (e.key === ' ') {
        e.preventDefault();

        if (e.repeat) {
          return;
        }

        if (this.battleUI.buttonCooldownActive) {
          console.log('[INPUT] Spacebar pressed during cooldown - action blocked');
          return;
        }

        if (buttons[this.battleUI.focusedButtonIndex]) {
          console.log('[INPUT] Spacebar pressed - clicking focused button:', buttons[this.battleUI.focusedButtonIndex].dataset.action);
          buttons[this.battleUI.focusedButtonIndex].click();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (!this.battleUI.buttonCooldownActive && buttons[this.battleUI.focusedButtonIndex]) {
          console.log('[INPUT] Enter pressed - clicking focused button:', buttons[this.battleUI.focusedButtonIndex].dataset.action);
          buttons[this.battleUI.focusedButtonIndex].click();
        } else if (this.battleUI.buttonCooldownActive) {
          console.log('[INPUT] Enter pressed during cooldown - action blocked');
        }
      }
    };

    document.addEventListener('keydown', this.keydownListener);

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
    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener);
      this.keydownListener = null;
    }
  }
}
