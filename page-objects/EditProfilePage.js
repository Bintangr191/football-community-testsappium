const BasePage = require('./BasePage')

class EditProfilePage extends BasePage {
  // Locators
  get editProfileScreen() { return '~edit-profile-screen' }
  get fullNameInput()     { return '~edit-profile-fullname-input' }
  get bioInput()          { return '~edit-profile-bio-input' }
  get teamInput()         { return '~edit-profile-team-input' }
  get countryBtn()        { return '~edit-profile-country-btn' }
  get saveBtn()           { return '~edit-profile-save-btn' }
  get cancelBtn()         { return '~edit-profile-cancel-btn' }

  async waitForPageLoad() {
    this.logger.info('📄 Menunggu Edit Profile Screen...')
    await this.helper.waitForElement(this.editProfileScreen, 15000)
    this.logger.info('✅ Edit Profile Screen siap')
  }

  async isCurrentPage() {
    return await this.isVisible(this.editProfileScreen)
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
    
    // Clear and type team
    await $(this.teamInput).clearValue()
    await this.type(this.teamInput, team)
    
    // Save
    await this.tap(this.saveBtn)
    await this.pause(2000) 
  }
}

module.exports = new EditProfilePage()
