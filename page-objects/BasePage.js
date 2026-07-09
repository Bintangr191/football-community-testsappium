const DriverHelper = require('../helpers/driver.helper')
const logger = require('../helpers/logger')
class BasePage {
  constructor() {
    this.logger = logger
  }
  get helper() {
    return new DriverHelper(browser)
  }
  async waitForPageLoad() {
    throw new Error('waitForPageLoad() harus diimplementasikan di subclass')
  }
  /**
   * Cek apakah halaman ini sedang aktif
   * @returns {Promise<boolean>}
   */
  async isCurrentPage() {
    throw new Error('isCurrentPage() harus diimplementasikan di subclass')
  }
  /**
   * Ambil screenshot dengan nama page sebagai prefix
   * @param {string} stepName 
   */
  async screenshot(stepName) {
    const pageName = this.constructor.name.replace('Page', '').toLowerCase()
    await this.helper.takeScreenshot(`${pageName}_${stepName}`)
  }
  /**
   * Tunggu dan tap elemen
   * @param {string} selector
   */
  async tap(selector) {
    await this.helper.tap(selector)
  }
  /**
   * Tunggu dan ketik teks
   * @param {string} selector
   * @param {string} text
   */
  async type(selector, text) {
    await this.helper.typeText(selector, text)
  }
  /**
   * Dapatkan teks dari elemen 
   * @param {string} selector
   * @returns {Promise<string>}
   */
  async getText(selector) {
    return await this.helper.getText(selector)
  }
  /**
   * @param {string} selector
   * @returns {Promise<boolean>}
   */
  async isVisible(selector) {
    return await this.helper.isElementVisible(selector)
  }
  /**
   * @param {string} selector
   * @returns {Promise<boolean>}
   */
  async isVisibleNow(selector) {
    return await this.helper.elementExistsNow(selector)
  }
  /**
   * @param {string} selector
   * @returns {Promise<string>}
   */
  async getTextNow(selector) {
    return await this.helper.getTextIfExists(selector)
  }
  /**
   * Pause dengan log
   * @param {number} ms
   */
  async pause(ms) {
    await this.helper.pause(ms)
  }
}
module.exports = BasePage