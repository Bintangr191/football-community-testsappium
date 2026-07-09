const BasePage = require('./BasePage')

class HomePage extends BasePage {
  // ─── Locators ─────────────────────────────────────────────────────────────

  get homeScreen() { return '~home-screen' }
  get homeHeader() { return '~home-header' }
  get matchList() { return '~home-match-list' }

  // Bottom Tab Bar
  get tabHome() { return '~tab-home' }
  get tabForum() { return '~tab-forum' }
  get tabSearch() { return '~tab-search' }
  get tabReport() { return '~tab-report' }
  get tabProfile() { return '~tab-profile' }

  // Match card item (gunakan index atau teks)
  matchItem(index) { return `~home-match-item-${index}` }

  // ─── Actions ──────────────────────────────────────────────────────────────

  async waitForPageLoad() {
    this.logger.info('📄 Menunggu Home Screen...')
    await this.helper.waitForElement(this.homeScreen, 45000)
    this.logger.info('✅ Home Screen siap')
  }

  /**
   * @returns {Promise<boolean>}
   */
  async isCurrentPage() {
    return await this.isVisible(this.homeScreen)
  }

  async goToForum() {
    this.logger.info('🏟️ Navigasi ke Forum tab')
    await this.tap(this.tabForum)
    await this.pause(1000)
  }

  async goToSearch() {
    this.logger.info('🔍 Navigasi ke Search tab')
    await this.tap(this.tabSearch)
    await this.pause(1000)
  }

  async goToReport() {
    this.logger.info('⚠️ Navigasi ke Report tab')
    await this.tap(this.tabReport)
    await this.pause(1000)
  }

  async goToProfile() {
    this.logger.info('👤 Navigasi ke Profile tab')
    await this.tap(this.tabProfile)
    await this.pause(1000)
  }

  /**
   * Tap item pertandingan berdasarkan index
   * @param {number} index - 0-based
   */
  async tapMatchItem(index = 0) {
    await this.tap(this.matchItem(index))
  }

  /**
   * Cek apakah ada pertandingan di home screen
   * @returns {Promise<boolean>}
   */
  async hasMatchItems() {
    return await this.isVisible(this.matchItem(0))
  }

  async scrollDown() {
    await this.helper.scrollDown()
  }
}

module.exports = new HomePage()
