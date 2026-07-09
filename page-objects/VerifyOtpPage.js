const BasePage = require('./BasePage')

const DEFAULT_TIMEOUT = 20000

class VerifyOtpPage extends BasePage {
  // ─── Locators ─────────────────────────────────────────────────────────────
  get otpInput() { return '~verify-otp-input' }
  get screen() { return '~verify-otp-screen' }
  get title() { return '~verify-otp-title' }
  get emailText() { return '~verify-otp-email' }

  // ─── Actions ──────────────────────────────────────────────────────────────
  async waitForPageLoad() {
    this.logger.info('📄 Menunggu OTP Screen...')
    try {
      await this.helper.waitForElement(this.otpInput, DEFAULT_TIMEOUT)
      this.logger.info('✅ OTP Screen siap (terdeteksi via verify-otp-input)')
      return
    } catch (err) {
      this.logger.info('⚠️ verify-otp-input tidak ditemukan, mencoba fallback verify-otp-screen...')
    }

    // Fallback — kalau ini juga gagal, error asli akan tetap informatif
    await this.helper.waitForElement(this.screen, DEFAULT_TIMEOUT)
    this.logger.info('✅ OTP Screen siap (terdeteksi via verify-otp-screen)')
  }

  /**
   * Cek apakah sedang di OTP Screen.
   * @returns {Promise<boolean>}
   */
  async isCurrentPage() {
    const hasInput = await this.isVisibleNow(this.otpInput)
    if (hasInput) return true

    return await this.isVisibleNow(this.screen)
  }

  /**
   * Dapatkan email yang ditampilkan di OTP Screen.
   * @returns {Promise<string>}
   */
  async getDisplayedEmail() {
    return await this.getText(this.emailText)
  }
}

module.exports = new VerifyOtpPage()