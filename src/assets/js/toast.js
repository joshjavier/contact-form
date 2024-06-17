class Toast {
  constructor(selector) {
    /** @type {HTMLFormElement} */
    this.toast = document.querySelector(selector)
    /** @type {HTMLDialogElement} */
    this.dialog = this.toast.closest('dialog')

    this.init()
  }

  startFadeOut(delay = 5000) {
    this.timeout = setTimeout(() => {
      this.toast.classList.add('fade-out')
    }, delay);
  }

  cancelFadeOut() {
    clearTimeout(this.timeout)
    this.toast.classList.remove('fade-out')
  }

  show() {
    this.dialog.show()
    this.toast.classList.add('fade-in-top')
    this.startFadeOut()
  }

  init() {
    this.toast.addEventListener('animationend', event => {
      if (event.animationName === 'fade-in-top') {
        this.toast.classList.remove('fade-in-top')
      }

      if (event.animationName === 'fade-out') {
        this.toast.classList.remove('fade-out')
        this.dialog.close()
      }
    })

    this.toast.addEventListener('mouseenter', event => {
      this.cancelFadeOut()
    })

    this.toast.addEventListener('mouseleave', event => {
      this.startFadeOut(1000)
    })
  }
}

export default Toast
