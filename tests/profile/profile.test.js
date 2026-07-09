const { expect } = require('chai')
const LoginPage = require('../../page-objects/LoginPage')
const HomePage = require('../../page-objects/HomePage')
const ProfilePage = require('../../page-objects/ProfilePage')
const SettingsPage = require('../../page-objects/SettingsPage')
const EditProfilePage = require('../../page-objects/EditProfilePage')
const ApiHelper = require('../../helpers/api.helper')
const { validUser } = require('../../fixtures/test-data')
const logger = require('../../helpers/logger')

describe('👤 Profile & Settings Screen', () => {

  before(async () => {
    logger.info('=== Suite: Profile Screen ===')
    await ApiHelper.ensureTestUserExists(validUser)

    // Login
    await LoginPage.waitForPageLoad()
    await LoginPage.login(validUser.email, validUser.password)
    await HomePage.waitForPageLoad()
  })

  // ─── TC-PROF-01 ─────────────────────────────────────────────────────────
  it('TC-PROF-01: Harus dapat masuk ke halaman Profil dari Home', async () => {
    logger.info('▶ TC-PROF-01')

    await HomePage.goToProfile()
    await ProfilePage.waitForPageLoad()
    
    const isOnProfile = await ProfilePage.isCurrentPage()
    expect(isOnProfile).to.be.true

    await ProfilePage.screenshot('profile_loaded')
    logger.info('✅ TC-PROF-01: PASS')
  })

  // ─── TC-PROF-02 ─────────────────────────────────────────────────────────
  it('TC-PROF-02: Dapat membuka menu Pengaturan', async () => {
    logger.info('▶ TC-PROF-02')

    await ProfilePage.tapSettings()
    await SettingsPage.waitForPageLoad()

    const isOnSettings = await SettingsPage.isCurrentPage()
    expect(isOnSettings).to.be.true
    
    await SettingsPage.screenshot('settings_loaded')
    logger.info('✅ TC-PROF-02: PASS')
  })

  // ─── TC-PROF-03 ─────────────────────────────────────────────────────────
  it('TC-PROF-03: Dapat melakukan toggle Biometric (UI check)', async () => {
    logger.info('▶ TC-PROF-03')

    // Lakukan toggle biometric
    await SettingsPage.toggleBiometric()
    await browser.pause(1000)

    // Kembali ke Profile
    await browser.back()
    await ProfilePage.waitForPageLoad()
    
    logger.info('✅ TC-PROF-03: PASS')
  })

  // ─── TC-PROF-04 ─────────────────────────────────────────────────────────
  it('TC-PROF-04: Dapat mengubah profil (Edit Profile)', async () => {
    logger.info('▶ TC-PROF-04')

    await ProfilePage.tapEditProfile()
    await EditProfilePage.waitForPageLoad()

    const newName = `Appium User ${Date.now()}`
    const newBio = 'Ini adalah bio hasil otomasi Appium'
    const newTeam = 'Manchester United'

    await EditProfilePage.editProfile(newName, newBio, newTeam)

    // Setelah save, pastikan kembali ke halaman profile
    await ProfilePage.waitForPageLoad()
    const isOnProfile = await ProfilePage.isCurrentPage()
    expect(isOnProfile).to.be.true

    await ProfilePage.screenshot('profile_edited')
    logger.info('✅ TC-PROF-04: PASS')
  })

})
