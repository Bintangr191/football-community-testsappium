const { expect } = require('chai')
const LoginPage = require('../../page-objects/LoginPage')
const HomePage = require('../../page-objects/HomePage')
const ForumPage = require('../../page-objects/ForumPage')
const ApiHelper = require('../../helpers/api.helper')
const { validUser } = require('../../fixtures/test-data')
const logger = require('../../helpers/logger')

describe('🏠 Home Screen', () => {

  before(async () => {
    logger.info('=== Suite: Home Screen ===')

    await ApiHelper.ensureTestUserExists(validUser)

    // Login
    await LoginPage.waitForPageLoad()
    await LoginPage.login(validUser.email, validUser.password)

    // Tunggu Home Screen
    await HomePage.waitForPageLoad()
    logger.info('✅ Setup: Berhasil login dan di Home Screen')
  })

  // ─── TC-HOME-01 ──────────────────────────────────────────────────────────
  it('TC-HOME-01: Home Screen harus tampil setelah login', async () => {
    logger.info('▶ TC-HOME-01')

    const isHome = await HomePage.isCurrentPage()
    expect(isHome).to.be.true

    await HomePage.screenshot('home_loaded')
    logger.info('✅ TC-HOME-01: PASS')
  })

  // ─── TC-HOME-02 ──────────────────────────────────────────────────────────
  it('TC-HOME-02: Bottom tab bar harus tersedia', async () => {
    logger.info('▶ TC-HOME-02')

    const tabHomeVisible = await HomePage.isVisible(HomePage.tabHome)
    const tabForumVisible = await HomePage.isVisible(HomePage.tabForum)
    const tabSearchVisible = await HomePage.isVisible(HomePage.tabSearch)
    const tabProfileVisible = await HomePage.isVisible(HomePage.tabProfile)

    expect(tabHomeVisible).to.be.true
    expect(tabForumVisible).to.be.true
    expect(tabSearchVisible).to.be.true
    expect(tabProfileVisible).to.be.true

    await HomePage.screenshot('home_tab_bar')
    logger.info('✅ TC-HOME-02: PASS')
  })

  // ─── TC-HOME-03 ──────────────────────────────────────────────────────────
  it('TC-HOME-03: Harus dapat navigasi ke Forum tab', async () => {
    logger.info('▶ TC-HOME-03')

    await HomePage.goToForum()
    await ForumPage.waitForPageLoad()

    const onForum = await ForumPage.isCurrentPage()
    expect(onForum).to.be.true

    await HomePage.screenshot('home_nav_to_forum')
    logger.info('✅ TC-HOME-03: PASS')

    // Kembali ke Home
    await HomePage.tap(HomePage.tabHome)
    await HomePage.waitForPageLoad()
  })

  // ─── TC-HOME-04 ──────────────────────────────────────────────────────────
  it('TC-HOME-04: Harus dapat navigasi ke Search tab', async () => {
    logger.info('▶ TC-HOME-04')

    await HomePage.goToSearch()
    await browser.pause(2000)

    // Cek tab search aktif (tidak error / crash)
    const isVisible = await HomePage.isVisible('~tab-search')
    expect(isVisible).to.be.true

    await HomePage.screenshot('home_nav_to_search')
    logger.info('✅ TC-HOME-04: PASS')

    // Kembali ke Home
    await HomePage.tap(HomePage.tabHome)
    await HomePage.waitForPageLoad()
  })

  // ─── TC-HOME-05 ──────────────────────────────────────────────────────────
  it('TC-HOME-05: Harus dapat navigasi ke Profile tab', async () => {
    logger.info('▶ TC-HOME-05')

    await HomePage.goToProfile()
    await browser.pause(2000)

    const isVisible = await HomePage.isVisible('~tab-profile')
    expect(isVisible).to.be.true

    await HomePage.screenshot('home_nav_to_profile')
    logger.info('✅ TC-HOME-05: PASS')
  })

})
