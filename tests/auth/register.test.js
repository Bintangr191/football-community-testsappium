const { expect } = require('chai')
const RegisterPage = require('../../page-objects/RegisterPage')
const LoginPage = require('../../page-objects/LoginPage')
const { newUser, invalidCredentials } = require('../../fixtures/test-data')
const logger = require('../../helpers/logger')

/**
 * @param {Object} baseUser 
 * @returns {Object} 
 */
function makeUniqueUser(baseUser) {
  const timestamp = Date.now()
  const [localPart, domain] = baseUser.email.split('@')

  return {
    ...baseUser,
    username: `${baseUser.username}_${timestamp}`,
    email: `${localPart}+${timestamp}@${domain}`,
  }
}

describe('📝 Authentication — Register', () => {

  before(async () => {
    logger.info('=== Suite: Register ===')

    await LoginPage.waitForPageLoad()
    await LoginPage.tapRegisterLink()
    await RegisterPage.waitForPageLoad()
  })

  afterEach(async () => {
    const onRegister = await RegisterPage.isCurrentPage()
    if (!onRegister) {
      await browser.back()
      await browser.pause(1000)

      const onLogin = await LoginPage.isCurrentPage()
      if (onLogin) {
        await LoginPage.tapRegisterLink()
        await RegisterPage.waitForPageLoad()
      }
    }
  })

  // ─── TC-REG-01 ───────────────────────────────────────────────────────────
  it('TC-REG-01: Harus menampilkan error ketika username kosong', async () => {
    logger.info('▶ TC-REG-01')

    await RegisterPage.fillRequiredFields({
      username: '',         // kosong
      email: newUser.email,
      password: newUser.password,
      confirmPassword: newUser.confirmPassword,
    })
    await RegisterPage.tapSubmit()

    await browser.pause(1000)

    const onRegister = await RegisterPage.isCurrentPage()
    expect(onRegister).to.be.true

    const error = await RegisterPage.getErrorMessage()
    expect(error.toLowerCase()).to.include('username')

    await RegisterPage.screenshot('reg_empty_username')
    logger.info('✅ TC-REG-01: PASS')
  })

  // ─── TC-REG-02 ───────────────────────────────────────────────────────────
  it('TC-REG-02: Harus menampilkan error ketika email kosong', async () => {
    logger.info('▶ TC-REG-02')

    await RegisterPage.fillRequiredFields({
      username: newUser.username,
      email: '',             // kosong
      password: newUser.password,
      confirmPassword: newUser.confirmPassword,
    })
    await RegisterPage.tapSubmit()

    await browser.pause(1000)

    const error = await RegisterPage.getErrorMessage()
    expect(error.toLowerCase()).to.include('email')

    await RegisterPage.screenshot('reg_empty_email')
    logger.info('✅ TC-REG-02: PASS')
  })

  // ─── TC-REG-03 ───────────────────────────────────────────────────────────
  it('TC-REG-03: Harus menampilkan error ketika format email tidak valid', async () => {
    logger.info('▶ TC-REG-03')

    await RegisterPage.fillRequiredFields({
      username: newUser.username,
      email: invalidCredentials.invalidEmail,   
      password: newUser.password,
      confirmPassword: newUser.confirmPassword,
    })
    await RegisterPage.tapSubmit()

    await browser.pause(1000)

    const error = await RegisterPage.getErrorMessage()
    expect(error.toLowerCase()).to.satisfy(
      (msg) => msg.includes('format') || msg.includes('valid') || msg.includes('email'),
      `Pesan error harus menyebut format email. Pesan aktual: "${error}"`
    )

    await RegisterPage.screenshot('reg_invalid_email')
    logger.info('✅ TC-REG-03: PASS')
  })

  // ─── TC-REG-04 ───────────────────────────────────────────────────────────
  it('TC-REG-04: Harus menampilkan error ketika password kurang dari 6 karakter', async () => {
    logger.info('▶ TC-REG-04')

    await RegisterPage.fillRequiredFields({
      username: newUser.username,
      email: newUser.email,
      password: invalidCredentials.shortPassword,  // '123'
      confirmPassword: invalidCredentials.shortPassword,
    })
    await RegisterPage.tapSubmit()

    await browser.pause(1000)

    const error = await RegisterPage.getErrorMessage()
    expect(error.toLowerCase()).to.satisfy(
      (msg) => msg.includes('password') || msg.includes('minimal') || msg.includes('karakter'),
      `Pesan error harus menyebut password minimal. Pesan aktual: "${error}"`
    )

    await RegisterPage.screenshot('reg_short_password')
    logger.info('✅ TC-REG-04: PASS')
  })

  // ─── TC-REG-05 ───────────────────────────────────────────────────────────
  it('TC-REG-05: Harus menampilkan error ketika password tidak cocok', async () => {
    logger.info('▶ TC-REG-05')

    await RegisterPage.fillRequiredFields({
      username: newUser.username,
      email: newUser.email,
      password: newUser.password,
      confirmPassword: 'passwordBerbeda123',  
    })
    await RegisterPage.tapSubmit()

    await browser.pause(1000)

    const error = await RegisterPage.getErrorMessage()
    expect(error.toLowerCase()).to.satisfy(
      (msg) => msg.includes('cocok') || msg.includes('sama') || msg.includes('password'),
      `Pesan error harus menyebut password tidak cocok. Pesan aktual: "${error}"`
    )

    await RegisterPage.screenshot('reg_password_mismatch')
    logger.info('✅ TC-REG-05: PASS')
  })

  // ─── TC-REG-06 ───────────────────────────────────────────────────────────
  it('TC-REG-06: Harus menerima registrasi dengan data valid (tanpa error validasi)', async () => {
    logger.info('▶ TC-REG-06')

    const uniqueUser = makeUniqueUser(newUser)
    logger.info(`📝 Mendaftar dengan email unik: ${uniqueUser.email}`)

    await RegisterPage.register(uniqueUser)

    await browser.pause(1500)

    const error = await RegisterPage.getErrorMessage()
    expect(error).to.equal(
      '',
      `Tidak boleh ada error untuk data registrasi yang valid. Pesan aktual: "${error}"`
    )

    const onRegister = await RegisterPage.isCurrentPage()
    expect(onRegister).to.be.false

    await RegisterPage.screenshot('reg_success_valid_data')
    logger.info('✅ TC-REG-06: PASS (Data valid diterima, tidak ada error validasi)')
  })

  // ─── TC-REG-07 ───────────────────────────────────────────────────────────
  it('TC-REG-07: Harus dapat kembali ke Login Screen', async () => {
    logger.info('▶ TC-REG-07')

    let onRegister = await RegisterPage.isCurrentPage()
    if (!onRegister) {
      await browser.back()
      await browser.pause(1000)
      onRegister = await RegisterPage.isCurrentPage()
    }

    if (!onRegister) {
      const onLogin = await LoginPage.isCurrentPage()
      if (onLogin) {
        await LoginPage.tapRegisterLink()
        await RegisterPage.waitForPageLoad()
      }
    }

    await RegisterPage.tapLoginLink()

    await LoginPage.waitForPageLoad()

    const onLogin = await LoginPage.isCurrentPage()
    expect(onLogin).to.be.true

    await RegisterPage.screenshot('reg_nav_to_login')
    logger.info('✅ TC-REG-07: PASS')
  })

})