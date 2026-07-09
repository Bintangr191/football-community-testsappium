const BasePage = require('./BasePage')
const PhotoHelper = require('../helpers/photo.helper')

class ReportPage extends BasePage {

  // ─── Locators — Report List Screen ──────────────────────────────────────────

  get newReportBtn() { return '~report-new-btn-header' }
  get fabCreate() { return '~report-fab-create' }
  get tabFeed() { return '~report-tab-feed' }
  get tabMine() { return '~report-tab-mine' }
  get searchInput() { return '~report-search-input' }
  get sortHot() { return '~report-sort-hot' }
  get sortNew() { return '~report-sort-new' }

  reportItem(id) { return `~report-item-${id}` }

  // ─── Locators — Create Report Screen ────────────────────────────────────────

  get createScreen() { return '~create-report-title' }          // dipakai sebagai anchor
  get createPhotoBtn() { return '~create-report-photo' }
  get photoPickerCamera() { return '~photo-picker-camera' }
  get photoPickerGallery() { return '~photo-picker-gallery' }
  get createLocGps() { return '~create-report-loc-gps' }
  get createGetGpsBtn() { return '~create-report-get-gps' }
  get createTitle() { return '~create-report-title' }
  get createTitleError() { return '~create-report-title-error' }
  get createDesc() { return '~create-report-desc' }
  get createDescError() { return '~create-report-desc-error' }
  get createSubmit() { return '~create-report-submit' }
  get resultModalOk() { return '~result-modal-ok' }
  get noticeModalOk() { return '~notice-modal-ok' }

  // ─── Locators — Report Detail Screen ────────────────────────────────────────

  get detailScreen() { return '~report-detail-screen' }
  get detailBackBtn() { return '~report-detail-back-btn' }
  get detailHeader() { return '~report-detail-header' }
  get detailTitle() { return '~report-detail-title' }
  get resolveNoProofBtn() { return '~resolve-no-proof-btn' }
  get confirmModalOk() { return '~confirm-modal-ok' }
  get resolutionBadge() { return '~resolution-badge' }

  // Komentar
  get commentInputFooter() { return '~comment-input-footer' }
  get commentTextInput() { return '~comment-text-input' }
  get commentAttachCamera() { return '~comment-attach-camera' }
  get commentAttachGallery() { return '~comment-attach-gallery' }
  get commentPhotoPreview() { return '~comment-photo-preview' }
  get commentSendBtn() { return '~comment-send-btn' }
  get commentsList() { return '~comments-list' }
  get commentsEmptyState() { return '~comments-empty-state' }

  commentItem(id) { return `~comment-item-${id}` }
  markSolutionBtn(id) { return `~mark-solution-${id}` }

  // ─── Actions — List Screen ───────────────────────────────────────────────────

  async waitForPageLoad() {
    this.logger.info('📄 Menunggu Report Screen...')
    await this.helper.waitForElement(this.fabCreate, 30000)
    this.logger.info('✅ Report Screen siap')
  }

  async isCurrentPage() {
    return await this.isVisible(this.fabCreate)
  }

  async tapCreateReport() {
    this.logger.info('✏️ Tap FAB Buat Laporan...')
    await this.tap(this.fabCreate)
    await this.helper.waitForElement(this.createTitle, 15000)
    this.logger.info('✅ Create Report Screen terbuka')
  }

  async tapTabMine() {
    this.logger.info('👆 Tap tab Laporanku')
    await this.tap(this.tabMine)
    await this.pause(1500)
  }

  async tapTabFeed() {
    this.logger.info('👆 Tap tab Semua Laporan')
    await this.tap(this.tabFeed)
    await this.pause(1500)
  }

  async tapSortNew() {
    this.logger.info('👆 Tap sort New')
    await this.tap(this.sortNew)
    await this.pause(1000)
  }

  async searchReport(keyword) {
    this.logger.info(`🔍 Search report: "${keyword}"`)
    const el = await $(this.searchInput)
    await el.clearValue()
    if (keyword) {
      await el.setValue(keyword)
    }
    await this.pause(1000)
    try {
      if (await driver.isKeyboardShown()) await driver.hideKeyboard()
    } catch (_) { }
  }

  // ─── Actions — Create Screen ─────────────────────────────────────────────────

  /**
   * Lengkap: ambil foto (via galeri + mock ADB), ambil GPS, isi form, submit.
   * @param {string} title
   * @param {string} desc
   */
  async fillAndSubmitReport(title, desc) {
    this.logger.info(`📋 Mengisi form laporan: "${title}"`)

    // 1. Foto via galeri (dummy photo sudah di-push sebelum suite)
    await this.tap(this.createPhotoBtn)
    await this.pause(1000)
    await this.tap(this.photoPickerGallery)
    const photoOk = await PhotoHelper.selectFirstPhotoFromGallery()
    if (!photoOk) {
      this.logger.warn('⚠ Foto tidak terpilih dari galeri, lanjutkan tanpa foto')
    }
    await this.pause(1000)

    // 2. Ambil lokasi GPS
    await this.tap(this.createGetGpsBtn)
    await browser.pause(8000) // tunggu GPS resolve (emulator biasanya < 5s)

    // 3. Isi judul
    await this.type(this.createTitle, title)

    // 4. Isi deskripsi
    await this.type(this.createDesc, desc)

    // Tutup keyboard
    try {
      if (await driver.isKeyboardShown()) await driver.hideKeyboard()
    } catch (_) { }

    // 5. Scroll ke submit dan klik
    await this.helper.scrollDown()
    await this.pause(500)
    await this.tap(this.createSubmit)
    this.logger.info('📤 Form disubmit, menunggu response...')
  }

  /**
   * Submit form kosong (untuk test validasi)
   */
  async submitEmptyReport() {
    this.logger.info('📝 Submit empty report form...')
    await this.tapCreateReport()
    await this.helper.waitForElement(this.createTitle, 15000)
    try {
      if (await driver.isKeyboardShown()) await driver.hideKeyboard()
    } catch (_) { }
    await this.tap(this.createSubmit)
    await this.pause(1500)
  }

  async getTitleError() { return await this.getText(this.createTitleError) }
  async getDescError() { return await this.getText(this.createDescError) }

  async exitCreateScreen() {
    this.logger.info('⬅️ Keluar dari Create Report Screen')
    await driver.back()
    await this.pause(1000)
    await this.waitForPageLoad()
  }

}  // ─── Actions — Detail Screen ──────────────────────────────────────────────────

module.exports = new ReportPage()