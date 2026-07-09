const BasePage = require('./BasePage')

class ProfilePage extends BasePage {
    get logoutBtn() { return '~profile-logout-btn' }
    get logoutConfirmBtn() { return '~profile-logout-confirm-btn' }
    get editProfileBtn() { return '~profile-edit-btn' }
    get settingsBtn() { return '~profile-settings-btn' }

    async waitForPageLoad() {
        this.logger.info('📄 Menunggu Profile Screen...')
        await this.helper.waitForElement(this.logoutBtn, 15000)
        this.logger.info('✅ Profile Screen siap')
    }

    async isCurrentPage() {
        return await this.isVisible(this.logoutBtn)
    }

    async logout() {
        this.logger.info('🚪 Logout dari Profile Screen...')
        await this.tap(this.logoutBtn)
        await this.helper.waitForElement(this.logoutConfirmBtn, 5000)
        await this.tap(this.logoutConfirmBtn)
    }

    async tapEditProfile() {
        this.logger.info('👆 Tap Edit Profil')
        await this.tap(this.editProfileBtn)
    }

    async tapSettings() {
        this.logger.info('👆 Tap Pengaturan')
        await this.tap(this.settingsBtn)
    }
}

module.exports = new ProfilePage()