const BasePage = require('./BasePage')

class EditProfilePage extends BasePage {
  // Locators
  get editProfileScreen() { return '~edit-profile-screen' }
  get fullNameInput() { return '~edit-profile-fullname-input' }
  get bioInput() { return '~edit-profile-bio-input' }
  get countryBtn() { return '~edit-profile-country-btn' }
  get saveBtn() { return '~edit-profile-save-btn' }
  get cancelBtn() { return '~edit-profile-cancel-btn' }

  get teamSearchInput() { return '~edit-profile-team-search-input' }

  async waitForPageLoad() {
    this.logger.info('📄 Menunggu Edit Profile Screen...')
    await this.helper.waitForElement(this.editProfileScreen, 15000)
    this.logger.info('✅ Edit Profile Screen siap')
  }

  async isCurrentPage() {
    return await this.isVisible(this.editProfileScreen)
  }

  async clearSelectedTeamIfExists() {
    try {
      const searchVisible = await this.isVisibleNow(this.teamSearchInput)
      if (searchVisible) {
        this.logger.info('🔍 Search input sudah terlihat, tidak perlu clear')
        return
      }

      this.logger.info('🧹 Ada tim terpilih, mencoba clear...')
      await this.helper.scrollDown(1)
      await this.pause(500)

      const closeBtn = 'android=new UiSelector().description("close-circle")'
      try {
        const el = await $(closeBtn)
        if (await el.isExisting()) {
          await el.click()
          await this.pause(500)
          this.logger.info('✅ Tim terpilih berhasil di-clear')
          return
        }
      } catch {
      }

      this.logger.info('⚠ Tidak bisa menemukan tombol clear, lanjut saja')
    } catch {
      this.logger.info('⚠ Skip clear selected team')
    }
  }

  /**
   * @param {string} teamName - Nama tim yang dicari (cth: "Manchester United")
   */
  async selectTeam(teamName) {
    this.logger.info(`⚽ Memilih tim: "${teamName}"`)

    // Clear tim yang sudah terpilih (jika ada) agar search input muncul
    await this.clearSelectedTeamIfExists()

    // Scroll ke bawah untuk memastikan field tim terlihat
    await this.helper.scrollDown(1)
    await this.pause(500)

    // Tunggu search input muncul
    await this.helper.waitForElement(this.teamSearchInput, 15000)

    const searchEl = await $(this.teamSearchInput)
    await searchEl.clearValue()
    await searchEl.setValue(teamName)
    await this.pause(2000)

    const teamItem = `android=new UiSelector().textContains("${teamName}")`
    try {
      const item = await $(teamItem)
      const exists = await item.waitForDisplayed({ timeout: 10000 })
      if (exists) {
        await item.click()
        this.logger.info(`✅ Tim "${teamName}" berhasil dipilih dari dropdown`)
        await this.pause(500)
        return
      }
    } catch {
      this.logger.warn(`⚠ Tidak menemukan "${teamName}" di dropdown, coba item pertama...`)
    }

    try {
      const firstItem = 'android=new UiSelector().className("android.view.ViewGroup").clickable(true).instance(0)'
      const fallbackEl = await $(firstItem)
      if (await fallbackEl.isExisting()) {
        await fallbackEl.click()
        this.logger.info('✅ Tim pertama dari dropdown dipilih (fallback)')
      }
    } catch {
      this.logger.warn('⚠ Gagal memilih tim dari dropdown')
    }

    // Hide keyboard jika masih terbuka
    try { await browser.hideKeyboard() } catch { }
    await this.pause(500)
  }

  async editProfile(fullName, bio, team) {
    this.logger.info(`📝 Edit profil: Nama="${fullName}", Bio="${bio}", Tim="${team}"`)

    // Clear and type fullName
    await this.helper.waitForElement(this.fullNameInput, 15000)
    await $(this.fullNameInput).clearValue()
    await this.type(this.fullNameInput, fullName)

    // Clear and type bio
    await $(this.bioInput).clearValue()
    await this.type(this.bioInput, bio)

    // Pilih tim menggunakan TeamPicker (search + dropdown)
    if (team) {
      await this.selectTeam(team)
    }

    // Scroll ke bawah untuk memastikan tombol Save terlihat
    await this.helper.scrollDown(1)
    await this.pause(500)

    // Save
    await this.tap(this.saveBtn)
    await this.pause(2000)
  }
}

module.exports = new EditProfilePage()
