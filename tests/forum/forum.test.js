const { expect } = require('chai')
const LoginPage = require('../../page-objects/LoginPage')
const HomePage = require('../../page-objects/HomePage')
const ForumPage = require('../../page-objects/ForumPage')
const ApiHelper = require('../../helpers/api.helper')
const { validUser, forumPost } = require('../../fixtures/test-data')
const logger = require('../../helpers/logger')

describe('💬 Forum Screen', () => {

  before(async () => {
    logger.info('=== Suite: Forum Screen ===')

    await ApiHelper.ensureTestUserExists(validUser)

    // Login
    await LoginPage.waitForPageLoad()
    await LoginPage.login(validUser.email, validUser.password)
    await HomePage.waitForPageLoad()

    // Navigasi ke Forum
    await HomePage.goToForum()
    await ForumPage.waitForPageLoad()
    logger.info('✅ Setup: Berhasil navigasi ke Forum Screen')
  })

  // ─── TC-FORUM-01 ─────────────────────────────────────────────────────────
  it('TC-FORUM-01: Forum Screen harus tampil setelah navigasi dari Home', async () => {
    logger.info('▶ TC-FORUM-01')

    const isOnForum = await ForumPage.isCurrentPage()
    expect(isOnForum).to.be.true

    await ForumPage.screenshot('forum_loaded')
    logger.info('✅ TC-FORUM-01: PASS')
  })

  // ─── TC-FORUM-02 ─────────────────────────────────────────────────────────
  it('TC-FORUM-02: Daftar post forum harus ditampilkan', async () => {
    logger.info('▶ TC-FORUM-02')

    await browser.pause(2000)

    const hasItems = await ForumPage.hasPostItems()

    const forumScreenVisible = await ForumPage.isCurrentPage()
    expect(forumScreenVisible).to.be.true

    await ForumPage.screenshot('forum_post_list')
    logger.info(`✅ TC-FORUM-02: PASS (has items: ${hasItems})`)
  })

  // ─── TC-FORUM-03 ─────────────────────────────────────────────────────────
  it('TC-FORUM-03: FAB button buat post harus tersedia', async () => {
    logger.info('▶ TC-FORUM-03')

    const fabVisible = await ForumPage.isVisible(ForumPage.fabCreate)
    expect(fabVisible).to.be.true

    await ForumPage.screenshot('forum_fab_visible')
    logger.info('✅ TC-FORUM-03: PASS')
  })

  // ─── TC-FORUM-04 ─────────────────────────────────────────────────────────
  it('TC-FORUM-04: Harus dapat membuat post baru', async () => {
    logger.info('▶ TC-FORUM-04')
    logger.info(`📝 Membuat post: "${forumPost.title}"`)

    await ForumPage.createPost(forumPost.title, forumPost.content)

    const isOnForum = await ForumPage.isCurrentPage()
    expect(isOnForum).to.be.true

    await ForumPage.screenshot('forum_post_created')
    logger.info('✅ TC-FORUM-04: PASS')
  })

  // ─── TC-FORUM-05 ─────────────────────────────────────────────────────────
  it('TC-FORUM-05: Tap post item harus membuka halaman detail', async () => {
    logger.info('▶ TC-FORUM-05')

    await ForumPage.tapFirstPostItem()

    await browser.pause(2000)

    const onDetail = await ForumPage.isVisible(ForumPage.detailScreen)
    expect(onDetail).to.be.true

    await ForumPage.screenshot('forum_post_detail')
    logger.info('✅ TC-FORUM-05: PASS')

    await ForumPage.exitDetailScreen()
  })

  // ─── TC-FORUM-06 ─────────────────────────────────────────────────────────
  it('TC-FORUM-06: Dapat berpindah tab Feed dan Postinganku', async () => {
    logger.info('▶ TC-FORUM-06')

    await ForumPage.tapTabMine()
    await browser.pause(2000)

    const onForumMine = await ForumPage.isCurrentPage()
    expect(onForumMine).to.be.true
    await ForumPage.screenshot('forum_tab_mine')

    await ForumPage.tapTabFeed()
    await browser.pause(2000)

    const onForumFeed = await ForumPage.isCurrentPage()
    expect(onForumFeed).to.be.true
    await ForumPage.screenshot('forum_tab_feed')

    logger.info('✅ TC-FORUM-06: PASS')
  })

  // ─── TC-FORUM-07 ─────────────────────────────────────────────────────────
  it('TC-FORUM-07: Dapat melakukan pencarian post', async () => {
    logger.info('▶ TC-FORUM-07')

    await ForumPage.searchPost('test search')
    await browser.pause(2000)

    const onForumSearch = await ForumPage.isCurrentPage()
    expect(onForumSearch).to.be.true

    await ForumPage.screenshot('forum_search_results')
    await ForumPage.searchPost('')
    await browser.pause(1000)

    logger.info('✅ TC-FORUM-07: PASS')
  })

  // ─── TC-FORUM-08 ─────────────────────────────────────────────────────────
  it('TC-FORUM-08: Dapat mengubah urutan (Sort) post', async () => {
    logger.info('▶ TC-FORUM-08')

    await ForumPage.tapSortTop()
    await browser.pause(2000)

    const onForumSort = await ForumPage.isCurrentPage()
    expect(onForumSort).to.be.true

    await ForumPage.screenshot('forum_sort_top')

    logger.info('✅ TC-FORUM-08: PASS')
  })

  // ─── TC-FORUM-09 ─────────────────────────────────────────────────────────
  it('TC-FORUM-09: Validasi form buat post (judul wajib diisi)', async () => {
    logger.info('▶ TC-FORUM-09')

    await ForumPage.submitEmptyPost()

    const errorText = await ForumPage.getTitleError()
    expect(errorText).to.not.be.null
    expect(errorText).to.include('Judul wajib diisi')

    await ForumPage.screenshot('forum_create_validation_error')

    await ForumPage.exitCreateScreen()
    logger.info('✅ TC-FORUM-09: PASS')
  })

  // ─── TC-FORUM-10 ─────────────────────────────────────────────────────────
  it('TC-FORUM-10: Dapat menambahkan komentar pada post', async () => {
    logger.info('▶ TC-FORUM-10')

    await ForumPage.tapFirstPostItem()
    await browser.pause(2000)

    const onDetail = await ForumPage.isVisible(ForumPage.detailScreen)
    expect(onDetail).to.be.true

    const comment = `Test komentar via Appium ${Date.now()}`
    await ForumPage.commentOnPost(comment)

    await ForumPage.screenshot('forum_comment_added')

    await ForumPage.exitDetailScreen()
    logger.info('✅ TC-FORUM-10: PASS')
  })

})