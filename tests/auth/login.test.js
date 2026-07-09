const { expect } = require('chai')
const LoginPage = require('../../page-objects/LoginPage')
const HomePage = require('../../page-objects/HomePage')
const RegisterPage = require('../../page-objects/RegisterPage')
const ProfilePage = require('../../page-objects/ProfilePage')
const ApiHelper = require('../../helpers/api.helper')
const { validUser, invalidCredentials } = require('../../fixtures/test-data')
const logger = require('../../helpers/logger')

describe('🔐 Authentication — Login', () => {

  before(async () => {
    logger.info('=== Suite: Login ===')

    // Pastikan backend bisa diakses
    const healthy = await ApiHelper.isBackendHealthy()
    if (!healthy) {
      logger.warn('⚠ Backend mungkin tidak running. Test mungkin gagal.')
    }

    // Pastikan test user sudah ada di sistem
    await ApiHelper.ensureTestUserExists(validUser)

    // Tunggu Login Screen siap
    await LoginPage.waitForPageLoad()
  })

  afterEach(async () => {
    const onLogin = await LoginPage.isCurrentPage()

    if (!onLogin) {
      logger.info('🔄 Kembali ke Login Screen...')

      let onHome = false
      try {
        onHome = await browser.$(HomePage.homeScreen).isExisting()
      } catch (e) {
        onHome = false
      }

      if (onHome) {
        await HomePage.goToProfile()
        await ProfilePage.logout()
      } else {
        logger.info('↩️ Tidak di Home, gunakan browser.back() (mis. dari Register Screen)')
        await browser.back()
        await browser.pause(1000)
      }

      await LoginPage.waitForPageLoad()
    }

    try {
      await LoginPage.fillEmail('')
      await LoginPage.fillPassword('')
    } catch (e) {
      logger.warn(`⚠ Gagal membersihkan field: ${e.message}`)
    }
  })

  // ─── TC-LOGIN-01 ─────────────────────────────────────────────────────────
  it('TC-LOGIN-01: Harus berhasil login dengan kredensial valid', async () => {
    logger.info('▶ TC-LOGIN-01')

    await LoginPage.login(validUser.email, validUser.password)

    // Tunggu navigasi ke Home Screen
    await HomePage.waitForPageLoad()

    // Assertion: Home Screen harus tampil
    const isHome = await HomePage.isCurrentPage()
    expect(isHome).to.be.true

    await LoginPage.screenshot('login_success')
    logger.info('✅ TC-LOGIN-01: PASS')

    // Kembali ke login untuk test berikutnya
    await HomePage.goToProfile()
    await ProfilePage.logout()
    await LoginPage.waitForPageLoad()
  })

  // ─── TC-LOGIN-02 ─────────────────────────────────────────────────────────
  it('TC-LOGIN-02: Harus menampilkan error ketika email tidak terdaftar', async () => {
    logger.info('▶ TC-LOGIN-02')

    await LoginPage.fillEmail(invalidCredentials.wrongEmail)
    await LoginPage.fillPassword(validUser.password)
    await LoginPage.tapLoginButton()

    // Tunggu pesan error muncul
    await browser.pause(3000)

    // Cek masih di Login Screen (tidak navigasi ke Home)
    const stillOnLogin = await LoginPage.isCurrentPage()
    expect(stillOnLogin).to.be.true

    // Cek pesan error
    const emailError = await LoginPage.getEmailError()
    expect(emailError).to.include('salah') // "Email atau password salah"

    await LoginPage.screenshot('login_wrong_email')
    logger.info('✅ TC-LOGIN-02: PASS')
  })

  // ─── TC-LOGIN-03 ─────────────────────────────────────────────────────────
  it('TC-LOGIN-03: Harus menampilkan error ketika password salah', async () => {
    logger.info('▶ TC-LOGIN-03')

    await LoginPage.fillEmail(validUser.email)
    await LoginPage.fillPassword(invalidCredentials.wrongPassword)
    await LoginPage.tapLoginButton()

    await browser.pause(3000)

    const stillOnLogin = await LoginPage.isCurrentPage()
    expect(stillOnLogin).to.be.true

    const emailError = await LoginPage.getEmailError()
    expect(emailError).to.not.be.empty

    await LoginPage.screenshot('login_wrong_password')
    logger.info('✅ TC-LOGIN-03: PASS')
  })

  // ─── TC-LOGIN-04 ─────────────────────────────────────────────────────────
  it('TC-LOGIN-04: Harus menampilkan error ketika email kosong', async () => {
    logger.info('▶ TC-LOGIN-04')

    await LoginPage.fillEmail('')
    await LoginPage.fillPassword(validUser.password)
    await LoginPage.tapLoginButton()

    await browser.pause(1500)

    const stillOnLogin = await LoginPage.isCurrentPage()
    expect(stillOnLogin).to.be.true

    const emailError = await LoginPage.getEmailError()
    expect(emailError).to.include('wajib') // "Email wajib diisi"

    await LoginPage.screenshot('login_empty_email')
    logger.info('✅ TC-LOGIN-04: PASS')
  })

  // ─── TC-LOGIN-05 ─────────────────────────────────────────────────────────
  it('TC-LOGIN-05: Harus menampilkan error ketika password kosong', async () => {
    logger.info('▶ TC-LOGIN-05')

    await LoginPage.fillEmail(validUser.email)
    await LoginPage.fillPassword('')
    await LoginPage.tapLoginButton()

    await browser.pause(1500)

    const stillOnLogin = await LoginPage.isCurrentPage()
    expect(stillOnLogin).to.be.true

    const passwordError = await LoginPage.getPasswordError()
    expect(passwordError).to.include('wajib') 

    await LoginPage.screenshot('login_empty_password')
    logger.info('✅ TC-LOGIN-05: PASS')
  })

  // ─── TC-LOGIN-06 ─────────────────────────────────────────────────────────
  it('TC-LOGIN-06: Harus menampilkan error ketika format email tidak valid', async () => {
    logger.info('▶ TC-LOGIN-06')

    await LoginPage.fillEmail(invalidCredentials.invalidEmail)
    await LoginPage.fillPassword(validUser.password)
    await LoginPage.tapLoginButton()

    await browser.pause(1500)

    const stillOnLogin = await LoginPage.isCurrentPage()
    expect(stillOnLogin).to.be.true

    const emailError = await LoginPage.getEmailError()
    expect(emailError).to.include('tidak valid') 

    await LoginPage.screenshot('login_invalid_email_format')
    logger.info('✅ TC-LOGIN-06: PASS')
  })

  // ─── TC-LOGIN-07 ─────────────────────────────────────────────────────────
  it('TC-LOGIN-07: Harus dapat navigasi ke Register Screen', async () => {
    logger.info('▶ TC-LOGIN-07')

    await LoginPage.tapRegisterLink()

    // Tunggu Register Screen
    await RegisterPage.waitForPageLoad()

    const onRegister = await RegisterPage.isCurrentPage()
    expect(onRegister).to.be.true

    await LoginPage.screenshot('login_nav_to_register')
    logger.info('✅ TC-LOGIN-07: PASS')
  })

})