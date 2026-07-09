const BasePage = require('./BasePage')

class LoginPage extends BasePage {
  // ─── Locators ─────────────────────────────────────────────────────────────

  get emailInput()    { return '~login-email-input' }
  get passwordInput() { return '~login-password-input' }
  get loginButton()   { return '~login-submit-btn' }
  get registerLink()  { return '~login-register-link' }
  get appLogo()       { return '~login-logo' }
  get appName()       { return '~login-app-name' }
  get biometricBtn()  { return '~login-biometric-btn' }

  get emailError()    { return '~login-email-error' }
  get passwordError() { return '~login-password-error' }

  // ─── Actions ──────────────────────────────────────────────────────────────

  async waitForPageLoad() {
    this.logger.info('📄 Menunggu Login Screen...')
    await this.helper.waitForElement(this.loginButton, 30000)
    this.logger.info('✅ Login Screen siap')
  }

  /**
   * Cek apakah sedang di Login Screen
   * @returns {Promise<boolean>}
   */
  async isCurrentPage() {
    return await this.isVisible(this.loginButton)
  }

  /**
   * Isi form dan login
   *
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    this.logger.info(`🔐 Login sebagai: ${email}`)
    await this.fillEmail(email)
    await this.fillPassword(password)
    await this.tapLoginButton()
  }

  /**
   * Isi field email
   * @param {string} email
   */
  async fillEmail(email) {
    await this.type(this.emailInput, email)
  }

  /**
   * Isi field password
   * @param {string} password
   */
  async fillPassword(password) {
    await this.type(this.passwordInput, password)
  }

  async tapLoginButton() {
    await this.tap(this.loginButton)
  }

  async tapRegisterLink() {
    this.logger.info('📝 Navigasi ke Register Screen...')
    await this.tap(this.registerLink)
  }

  /**
   * Dapatkan teks error pada field email (jika ada)
   * @returns {Promise<string>}
   */
  async getEmailError() {
    try {
      return await this.getText(this.emailError)
    } catch {
      return ''
    }
  }

  /**
   * Dapatkan teks error pada field password (jika ada)
   * @returns {Promise<string>}
   */
  async getPasswordError() {
    try {
      return await this.getText(this.passwordError)
    } catch {
      return ''
    }
  }

  /**
   * Cek apakah tombol login dalam keadaan disabled (loading)
   * @returns {Promise<boolean>}
   */
  async isLoginButtonDisabled() {
    const el = await browser.$(this.loginButton)
    const enabled = await el.getAttribute('enabled')
    return enabled === 'false'
  }
}

module.exports = new LoginPage()
