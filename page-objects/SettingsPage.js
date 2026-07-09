const BasePage = require('./BasePage')

class SettingsPage extends BasePage {
  get settingsScreen()         { return '~settings-screen' }
  get backBtn()                { return '~settings-back-btn' }
  get biometricSwitch()        { return '~settings-biometric-switch' }
  get changePasswordItem()     { return '~settings-item-password' }
  get notificationItem()       { return '~settings-item-notification' }
  get themeItem()              { return '~settings-item-theme' }
  get languageItem()           { return '~settings-item-language' }
  get editProfileBtn()         { return '~header-edit-profile-btn' } 

  async waitForPageLoad() {
    this.logger.info('📄 Menunggu Settings Screen...')
    await this.helper.waitForElement(this.settingsScreen, 15000)
    this.logger.info('✅ Settings Screen siap')
  }

  async isCurrentPage() {
    return await this.isVisible(this.settingsScreen)
  }

  async toggleBiometric() {
    this.logger.info('👆 Tap toggle biometrik')
    await this.tap(this.biometricSwitch)
  }
}

module.exports = new SettingsPage()
