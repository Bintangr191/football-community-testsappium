
const BasePage = require('./BasePage')

class RegisterPage extends BasePage {
  // ─── Locators ─────────────────────────────────────────────────────────────

  get usernameInput() { return '~register-username-input' }
  get emailInput() { return '~register-email-input' }
  get passwordInput() { return '~register-password-input' }
  get confirmInput() { return '~register-confirm-input' }
  get fullNameInput() { return '~register-fullname-input' }
  get bioInput() { return '~register-bio-input' }
  get favTeamInput() { return '~register-favteam-input' }
  get submitButton() { return '~register-submit-btn' }
  get loginLink() { return '~register-login-link' }
  get errorText() { return '~register-error-text' }

  // ─── Actions ──────────────────────────────────────────────────────────────

  async waitForPageLoad() {
    this.logger.info('📄 Menunggu Register Screen...')
    await this.helper.waitForElement(this.usernameInput, 30000)
    this.logger.info('✅ Register Screen siap')
  }

  /**
   * Cek apakah sedang di Register Screen.
   * @returns {Promise<boolean>}
   */
  async isCurrentPage() {
    const hasSubmit = await this.isVisibleNow(this.submitButton)
    if (hasSubmit) return true

    const hasError = await this.isVisibleNow(this.errorText)
    if (hasError) return true

    try {
      await this.helper.scrollUp(3)
    } catch {
    }

    return await this.isVisibleNow(this.usernameInput)
  }

  /**
   * Isi form registrasi minimal (field wajib saja)
   *
   * @param {Object} data
   * @param {string} data.username
   * @param {string} data.email
   * @param {string} data.password
   * @param {string} data.confirmPassword
   */
  async fillRequiredFields({ username, email, password, confirmPassword }) {
    this.logger.info(`📝 Mengisi form registrasi: ${email}`)
    await this.helper.scrollUp(3)
    await this.type(this.usernameInput, username)
    await this.type(this.emailInput, email)
    await this.type(this.passwordInput, password)
    await this.type(this.confirmInput, confirmPassword)
  }

  /**
   * Isi form registrasi lengkap (semua field)
   *
   * @param {Object} data
   */
  async fillAllFields({ username, email, password, confirmPassword, fullName, bio, favoriteTeam }) {
    await this.fillRequiredFields({ username, email, password, confirmPassword })

    if (fullName) {
      await this.helper.scrollDown()
      await this.type(this.fullNameInput, fullName)
    }
    if (bio) {
      await this.type(this.bioInput, bio)
    }
    if (favoriteTeam) {
      await this.type(this.favTeamInput, favoriteTeam)
    }
  }

  /**
   * Tap tombol "Daftar"
   */
  async tapSubmit() {
    await this.helper.scrollToElement('Buat Akun')
    await this.tap(this.submitButton)
  }

  /**
   * Registrasi one-call: isi form + submit
   *
   * @param {Object} data
   */
  async register(data) {
    await this.fillRequiredFields(data)
    await this.tapSubmit()
  }

  /**
   * Kembali ke Login Screen
   */
  async tapLoginLink() {
    await this.helper.scrollToElement('Sudah punya akun?')
    await this.tap(this.loginLink)
  }

  /**
   * Dapatkan pesan error (global).
   * @returns {Promise<string>}
   */
  async getErrorMessage() {
    try {
      const visible = await this.isVisibleNow(this.errorText)
      if (!visible) {
        try {
          await this.helper.scrollToElement('Buat Akun')
        } catch {
        }
      }
      return await this.getTextNow(this.errorText)
    } catch {
      return ''
    }
  }

  async waitForOtpScreen() {
    this.logger.info('⏳ Menunggu OTP screen...')
    await this.helper.waitForElement('~verify-otp-input', 20000)
  }
}

module.exports = new RegisterPage()