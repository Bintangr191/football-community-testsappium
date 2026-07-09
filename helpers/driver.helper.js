const logger = require('./logger')

class DriverHelper {
  /**
   * @param {WebdriverIO.Browser} driver - Instance browser dari WebdriverIO
   */
  constructor(driver) {
    this.driver = driver
  }

  // ─── Locator Helpers ──────────────────────────────────────────────────────

  byTestID(testID) {
    return `~${testID}`
  }

  byText(text) {
    return `android=new UiSelector().text("${text}")`
  }

  byTextContains(text) {
    return `android=new UiSelector().textContains("${text}")`
  }

  byClass(className, index = 0) {
    return `android=new UiSelector().className("${className}").instance(${index})`
  }

  // ─── Wait Helpers ─────────────────────────────────────────────────────────

  async waitForElement(selector, timeout = 30000) {
    logger.debug(`⏳ Menunggu elemen: ${selector}`)
    const element = await this.driver.$(selector)
    await element.waitForDisplayed({ timeout, timeoutMsg: `Elemen tidak ditemukan dalam ${timeout}ms: ${selector}` })
    return element
  }

  async waitForElementToDisappear(selector, timeout = 15000) {
    logger.debug(`⏳ Menunggu elemen hilang: ${selector}`)
    const element = await this.driver.$(selector)
    await element.waitForDisplayed({ timeout, reverse: true, timeoutMsg: `Elemen masih ada setelah ${timeout}ms: ${selector}` })
  }

  /**
   * @param {string} selector 
   * @param {number} [timeout=5000] 
   * @returns {Promise<boolean>}
   */
  async isElementVisible(selector, timeout = 5000) {
    try {
      const element = await this.driver.$(selector)
      return await element.waitForDisplayed({ timeout })
    } catch {
      return false
    }
  }

  /**
   * @param {string} selector 
   * @returns {Promise<boolean>}
   */
  async elementExistsNow(selector) {
    try {
      const element = await this.driver.$(selector)
      const exists = await element.isExisting()
      if (!exists) return false
      return await element.isDisplayed()
    } catch {
      return false
    }
  }

  /**
   *
   * @param {string} selector 
   * @returns {Promise<string>}
   */
  async getTextIfExists(selector) {
    const exists = await this.elementExistsNow(selector)
    if (!exists) return ''
    const element = await this.driver.$(selector)
    return await element.getText()
  }

  // ─── Action Helpers ───────────────────────────────────────────────────────

  async tap(selector, timeout = 30000) {
    logger.debug(`👆 Tap: ${selector}`)
    const element = await this.waitForElement(selector, timeout)
    await element.click()
  }

  async typeText(selector, text, timeout = 30000) {
    logger.debug(`⌨️  Ketik ke ${selector}: "${text}"`)
    const element = await this.waitForElement(selector, timeout)
    await element.clearValue()
    await element.setValue(text)

    try {
      await this.driver.hideKeyboard()
    } catch {
    }
  }

  async getText(selector) {
    const element = await this.waitForElement(selector)
    return await element.getText()
  }

  async getAttribute(selector, attribute) {
    const element = await this.waitForElement(selector)
    return await element.getAttribute(attribute)
  }

  // ─── Scroll Helpers ───────────────────────────────────────────────────────

  async scrollDown(times = 1) {
    for (let i = 0; i < times; i++) {
      await this._swipe('up')
      await this.driver.pause(500)
    }
  }

  async scrollUp(times = 1) {
    for (let i = 0; i < times; i++) {
      await this._swipe('down')
      await this.driver.pause(500)
    }
  }

  async pullToRefresh() {
    logger.debug('🔄 Pull to refresh...')
    const { width, height } = await this.driver.getWindowSize()
    const x = Math.floor(width / 2)
    const startY = height * 0.25
    const endY = height * 0.75

    await this.driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x, y: Math.floor(startY) },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerMove', duration: 800, origin: 'pointer', x: 0, y: Math.floor(endY - startY) },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])
    await this.driver.releaseActions()
    await this.driver.pause(2000)
  }

  async _swipe(direction) {
    const { width, height } = await this.driver.getWindowSize()
    const startY = direction === 'up' ? height * 0.75 : height * 0.25
    const endY = direction === 'up' ? height * 0.25 : height * 0.75
    const x = Math.floor(width / 2)

    await this.driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x, y: Math.floor(startY) },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerMove', duration: 300, origin: 'pointer', x: 0, y: Math.floor(endY - startY) },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])
    await this.driver.releaseActions()
  }

  async scrollToElement(text) {
    logger.debug(`📜 Scroll ke elemen dengan teks: "${text}"`)
    await this.driver.$(
      `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().text("${text}"))`
    )
  }

  // ─── App Control ─────────────────────────────────────────────────────────

  async openExpoDeeplink(deeplink) {
    const url = deeplink || process.env.EXPO_DEEPLINK
    logger.info(`🔗 Membuka deeplink: ${url}`)
    await this.driver.execute('mobile: deepLink', {
      url,
      package: 'host.exp.exponent',
    })
    await this.driver.pause(3000)
  }

  async pressBack() {
    logger.debug('🔙 Tekan Back')
    await this.driver.back()
  }

  async pressHome() {
    await this.driver.execute('mobile: pressKey', { keycode: 3 })
  }

  async resetApp(appId = 'host.exp.exponent') {
    logger.info('🔄 Reset app...')
    await this.driver.terminateApp(appId)
    await this.driver.activateApp(appId)
    await this.driver.pause(3000)
  }

  async pause(ms) {
    await this.driver.pause(ms)
  }

  // ─── Screenshot & Recording ───────────────────────────────────────────────

  async takeScreenshot(name) {
    const path = require('path')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `${name}_${timestamp}.png`
    const filepath = path.join('screenshots', filename)
    await this.driver.saveScreenshot(filepath)
    logger.info(`📸 Screenshot: ${filepath}`)
    return filepath
  }

  async startRecording() {
    try {
      await this.driver.startRecordingScreen({
        timeLimit: 300,
        videoQuality: 'medium',
        videoType: 'mp4',
        forceRestart: true,
      })
      logger.debug('🎥 Recording dimulai')
    } catch (e) {
      logger.warn(`⚠ Recording gagal dimulai: ${e.message}`)
    }
  }

  async stopRecording(name) {
    const path = require('path')
    const fs = require('fs-extra')
    try {
      const videoBase64 = await this.driver.stopRecordingScreen()
      if (videoBase64) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const filename = `${name}_${timestamp}.mp4`
        const filepath = path.join('recordings', filename)
        fs.writeFileSync(filepath, Buffer.from(videoBase64, 'base64'))
        logger.info(`🎥 Recording disimpan: ${filepath}`)
        return filepath
      }
    } catch (e) {
      logger.warn(`⚠ Recording gagal disimpan: ${e.message}`)
    }
    return null
  }

  // ─── Keyboard ─────────────────────────────────────────────────────────────

  async hideKeyboard() {
    try {
      await this.driver.hideKeyboard()
    } catch {
    }
  }

  async pressEnter() {
    await this.driver.execute('mobile: pressKey', { keycode: 66 })
  }
}

module.exports = DriverHelper