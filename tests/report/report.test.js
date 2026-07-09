const { expect } = require('chai')
const LoginPage = require('../../page-objects/LoginPage')
const HomePage = require('../../page-objects/HomePage')
const ReportPage = require('../../page-objects/ReportPage')
const ApiHelper = require('../../helpers/api.helper')
const PhotoHelper = require('../../helpers/photo.helper')
const { validUser, helperUser } = require('../../fixtures/test-data')
const logger = require('../../helpers/logger')

// ── Data laporan yang akan dibuat ──────────────────────────────────────────────
const REPORT_TITLE = `Test Laporan E2E ${Date.now()}`
const REPORT_DESC = 'Kerusakan pada jaring gawang area barat — perlu perbaikan segera. Kondisi sangat berbahaya.'

// Variabel yang di-share antar TC
let createdReportId = null
let proofCommentId = null

describe('⚠️ Report Screen', () => {

  before(async () => {
    logger.info('═══════════════════════════════════')
    logger.info('=== Suite: Report Screen (E2E) ===')
    logger.info('═══════════════════════════════════')

    // 1. Pastikan kedua user tersedia di backend
    await ApiHelper.ensureTestUserExists(validUser)
    await ApiHelper.ensureTestUserExists(helperUser)

    // 2. Push foto dummy ke emulator (dipakai TC-REPORT-06)
    PhotoHelper.pushPhotoToDevice()

    // 3. Set mock GPS di emulator → Jakarta (-6.2088, 106.8456)
    PhotoHelper.setMockLocation(-6.2088, 106.8456)

    // 4. Login sebagai validUser
    await LoginPage.waitForPageLoad()
    await LoginPage.login(validUser.email, validUser.password)
    await HomePage.waitForPageLoad()

    // 5. Navigasi ke Report tab
    await HomePage.goToReport()
    await ReportPage.waitForPageLoad()
    logger.info('✅ Setup selesai — siap menjalankan test')
  })

  // ─── TC-REPORT-01 ─────────────────────────────────────────────────────────
  it('TC-REPORT-01: Report Screen harus tampil setelah navigasi dari Home', async () => {
    logger.info('▶ TC-REPORT-01')

    const isOnReport = await ReportPage.isCurrentPage()
    expect(isOnReport, 'FAB Buat Laporan harus terlihat').to.be.true

    await ReportPage.screenshot('tc01_report_loaded')
    logger.info('✅ TC-REPORT-01: PASS')
  })

  // ─── TC-REPORT-02 ─────────────────────────────────────────────────────────
  it('TC-REPORT-02: Dapat berpindah tab Semua Laporan ↔ Laporanku', async () => {
    logger.info('▶ TC-REPORT-02')

    await ReportPage.tapTabMine()
    const onMine = await ReportPage.isCurrentPage()
    expect(onMine, 'Harus tetap di Report Screen saat tap tab Mine').to.be.true
    await ReportPage.screenshot('tc02_tab_mine')

    await ReportPage.tapTabFeed()
    const onFeed = await ReportPage.isCurrentPage()
    expect(onFeed, 'Harus tetap di Report Screen saat tap tab Feed').to.be.true
    await ReportPage.screenshot('tc02_tab_feed')

    logger.info('✅ TC-REPORT-02: PASS')
  })

  // ─── TC-REPORT-03 ─────────────────────────────────────────────────────────
  it('TC-REPORT-03: Dapat melakukan pencarian laporan', async () => {
    logger.info('▶ TC-REPORT-03')

    await ReportPage.searchReport('gawang')
    const afterSearch = await ReportPage.isCurrentPage()
    expect(afterSearch, 'Harus tetap di Report Screen setelah search').to.be.true
    await ReportPage.screenshot('tc03_search_results')

    // Reset search
    await ReportPage.searchReport('')
    logger.info('✅ TC-REPORT-03: PASS')
  })

  // ─── TC-REPORT-04 ─────────────────────────────────────────────────────────
  it('TC-REPORT-04: Dapat mengubah urutan (Sort) laporan', async () => {
    logger.info('▶ TC-REPORT-04')

    await ReportPage.tapSortNew()
    const afterSort = await ReportPage.isCurrentPage()
    expect(afterSort, 'Harus tetap di Report Screen setelah sort').to.be.true
    await ReportPage.screenshot('tc04_sort_new')

    logger.info('✅ TC-REPORT-04: PASS')
  })

  // ─── TC-REPORT-05 ─────────────────────────────────────────────────────────
  it('TC-REPORT-05: Validasi form — judul & deskripsi wajib diisi', async () => {
    logger.info('▶ TC-REPORT-05')

    await ReportPage.submitEmptyReport()

    // Cek error judul
    const titleError = await ReportPage.getTitleError()
    expect(titleError, 'Error judul harus muncul').to.not.be.null
    expect(titleError.toLowerCase()).to.include('karakter')

    // Cek error deskripsi
    const descError = await ReportPage.getDescError()
    expect(descError, 'Error deskripsi harus muncul').to.not.be.null
    expect(descError.toLowerCase()).to.include('karakter')

    await ReportPage.screenshot('tc05_validation_error')
    await ReportPage.exitCreateScreen()
    logger.info('✅ TC-REPORT-05: PASS')
  })

  // ─── TC-REPORT-06 ─────────────────────────────────────────────────────────
  it('TC-REPORT-06: E2E — Buat laporan → User lain kirim bukti foto', async () => {
    logger.info('▶ TC-REPORT-06 (E2E - dipotong sampai kirim komentar)')

    // ── STEP 1: Buat laporan baru ───────────────────────────────────────────
    logger.info('Step 1: Buka form Buat Laporan')
    await ReportPage.tapCreateReport()

    logger.info('Step 2: Isi form + foto + GPS lalu submit')
    await ReportPage.fillAndSubmitReport(REPORT_TITLE, REPORT_DESC)

    // Tunggu modal sukses atau kembali ke list
    const modalOkVisible = await ReportPage.isVisible(ReportPage.resultModalOk)
    if (modalOkVisible) {
      await ReportPage.tap(ReportPage.resultModalOk)
    }
    await ReportPage.waitForPageLoad()
    await ReportPage.screenshot('tc06_step1_report_created')

    // ── STEP 2: Ambil ID laporan via API ────────────────────────────────────
    logger.info('Step 3: Ambil ID laporan dari API')
    const userToken = await ApiHelper.getAccessToken(validUser.email, validUser.password)
    const reports = await ApiHelper.getReports(userToken, { sort: 'new', limit: 10 })
    const createdReport = reports.find(r => r.title === REPORT_TITLE)
    expect(createdReport, `Laporan "${REPORT_TITLE}" harus ditemukan di API`).to.not.be.undefined
    createdReportId = createdReport.id
    logger.info(`✅ Laporan ditemukan: id=${createdReportId}`)

    // ── STEP 3: User lain kirim komentar + bukti foto via API ──────────────
    logger.info('Step 4: helperUser kirim komentar + foto bukti')
    const helperToken = await ApiHelper.getAccessToken(helperUser.email, helperUser.password)
    // JPEG 100×100 hijau dummy yang valid
    const dummyJpegB64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAARCAAyADIDASIAAhEBAxEB/8QAGgABAAIDAQAAAAAAAAAAAAAAAAMEAQIFBv/EAB0QAAMBAAMBAQAAAAAAAAAAAAECAwAEERIhMf/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A9rLEoE7IiyGE7wAOJmJkpPdBMRiSTUhKUJVCNh4FGUiZq5RqWGRbhIkyFl0UDqCEjVbNFCkhFJWOhLRlFVKdAhSJLlFFb//Z'
    const commentRes = await ApiHelper.commentOnReport(
      helperToken,
      createdReportId,
      'Sudah diperbaiki! Ini foto buktinya, cek kondisi terbaru.',
      dummyJpegB64
    )
    proofCommentId = commentRes?.data?.id
    expect(proofCommentId, 'ID komentar bukti harus ada').to.not.be.null
    logger.info(`✅ Komentar bukti terkirim: id=${proofCommentId}`)

    logger.info('✅ TC-REPORT-06: PASS (dipotong — belum verifikasi UI accept resolve)')
  })
})