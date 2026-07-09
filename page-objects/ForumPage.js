const BasePage = require('./BasePage')
const ApiHelper = require('../helpers/api.helper')
const { validUser } = require('../fixtures/test-data')

class ForumPage extends BasePage {
  // ─── Locators — Forum Screen ───────────────────────────────────────────────

  get forumScreen() { return '~forum-screen' }
  get postList() { return '~forum-post-list' }
  get fabCreate() { return '~forum-fab-create' }
  get searchInput() { return '~forum-search-input' }

  get tabFeed() { return '~forum-tab-feed' }
  get tabMine() { return '~forum-tab-mine' }

  get sortHot() { return '~forum-sort-hot' }
  get sortTop() { return '~forum-sort-top' }
  get sortNew() { return '~forum-sort-new' }

  /**
   * @param {string|number} postId
   */
  postItem(postId) { return `~forum-post-item-${postId}` }

  // ─── Locators — Create Post Screen ─────────────────────────────────────────

  get createScreen() { return '~create-post-screen' }
  get createBackBtn() { return '~create-post-back-btn' }
  get createTitle() { return '~create-post-title-input' }
  get createContent() { return '~create-post-content-input' }
  get createSubmit() { return '~create-post-submit-btn' }
  get createTitleError() { return '~create-post-title-error' }

  // ─── Locators — Forum Detail Screen ────────────────────────────────────────

  get detailScreen() { return '~forum-detail-screen' }
  get detailBackBtn() { return '~forum-detail-back-btn' }
  get commentInput() { return '~forum-comment-input' }
  get commentSendBtn() { return '~forum-comment-send-btn' }

  // ─── Actions — Forum Screen ─────────────────────────────────────────────────

  async waitForPageLoad() {
    this.logger.info('📄 Menunggu Forum Screen...')
    await this.helper.waitForElement(this.forumScreen, 30000)
    this.logger.info('✅ Forum Screen siap')
  }

  /**
   * @returns {Promise<boolean>}
   */
  async isCurrentPage() {
    return await this.isVisible(this.forumScreen)
  }

  async tapCreatePost() {
    this.logger.info('✏️ Tap Buat Post...')
    await this.tap(this.fabCreate)
    await this.helper.waitForElement(this.createScreen, 15000)
    this.logger.info('✅ Create Post Screen terbuka')
  }

  /**
   * @param {string} title 
   * @param {string} content 
   */
  async createPost(title, content) {
    this.logger.info(`📝 Membuat post: "${title}"`)
    await this.tapCreatePost()
    await this.helper.waitForElement(this.createTitle, 15000)
    await this.type(this.createTitle, title)
    await this.type(this.createContent, content)
    await this.tap(this.createSubmit)
    await this.pause(3000)
    await this.waitForPageLoad()
    this.logger.info('✅ Post berhasil dibuat')
  }

  async submitEmptyPost() {
    this.logger.info('📝 Submit empty post form...')
    await this.tapCreatePost()
    await this.helper.waitForElement(this.createTitle, 15000)
    await this.tap(this.createSubmit)
    await this.pause(1000)
  }

  /**
   * @returns {Promise<string|null>}
   */
  async getTitleError() {
    return await this.getText(this.createTitleError)
  }

  async exitCreateScreen() {
    this.logger.info('⬅️ Keluar dari Create Post Screen...')
    try {
      if (await driver.isKeyboardShown()) {
        await driver.hideKeyboard()
        await this.pause(300)
      }
    } catch (e) { }

    await this.tap(this.createBackBtn)
    await this.pause(1000)
    await this.waitForPageLoad()
    this.logger.info('✅ Kembali ke Forum Screen')
  }

  async ensureFeedHotSort() {
    this.logger.info('🔄 Memastikan tab Feed & sort Hot aktif...')
    try {
      await this.tap(this.tabFeed)
      await this.pause(500)
    } catch (e) { }
    try {
      await this.tap(this.sortHot)
      await this.pause(1000)
    } catch (e) { }
  }

  /**
   * @returns {Promise<string|number>} id post yang berhasil di-tap
   */
  async tapFirstPostItem() {
    await this.ensureFeedHotSort()

    const posts = await ApiHelper.getForumPostsAsUser(validUser, { sort: 'hot' })
    if (!posts || posts.length === 0) {
      throw new Error('Tidak ada post untuk ditest — pastikan minimal 1 post tersedia di backend')
    }
    const firstPostId = posts[0].id
    this.logger.info(`👆 Tap post item pertama, id=${firstPostId}`)
    await this.tap(this.postItem(firstPostId))
    return firstPostId
  }

  /**
   * @param {string|number} postId
   */
  async tapPostItemById(postId) {
    this.logger.info(`👆 Tap post item id=${postId}`)
    await this.tap(this.postItem(postId))
  }

  /**
   * Search post di forum
   * @param {string} keyword
   */
  async searchPost(keyword) {
    this.logger.info(`🔍 Search forum: "${keyword}"`)
    await this.type(this.searchInput, keyword)
    await this.pause(1000)

    try {
      if (await driver.isKeyboardShown()) {
        await driver.hideKeyboard()
      }
    } catch (e) { }
  }

  async tapTabMine() {
    this.logger.info('👆 Tap tab Postinganku')
    await this.tap(this.tabMine)
    await this.pause(1000)
  }

  async tapTabFeed() {
    this.logger.info('👆 Tap tab Feed')
    await this.tap(this.tabFeed)
    await this.pause(1000)
  }

  async tapSortTop() {
    this.logger.info('👆 Tap sort Top')
    await this.tap(this.sortTop)
    await this.pause(1000)
  }

  /**
   * @returns {Promise<boolean>}
   */
  async hasPostItems() {
    await this.ensureFeedHotSort()
    const posts = await ApiHelper.getForumPostsAsUser(validUser, { sort: 'hot' })
    if (!posts || posts.length === 0) return false
    return await this.isVisible(this.postItem(posts[0].id))
  }

  async scrollDown() {
    await this.helper.scrollDown()
  }

  // ─── Actions — Forum Detail Screen ──────────────────────────────────────────

  /**
   * Tambahkan komentar pada post (harus sedang berada di detail screen)
   * @param {string} commentText
   */
  async commentOnPost(commentText) {
    this.logger.info(`💬 Mengirim komentar: "${commentText}"`)
    await this.helper.waitForElement(this.commentInput, 5000)
    await this.type(this.commentInput, commentText)
    await this.tap(this.commentSendBtn)
    await this.pause(2000) 
  }

  async exitDetailScreen() {
    this.logger.info('⬅️ Keluar dari Forum Detail Screen...')
    try {
      if (await driver.isKeyboardShown()) {
        await driver.hideKeyboard()
        await this.pause(300)
      }
    } catch (e) { }

    await this.tap(this.detailBackBtn)
    await this.pause(1000)
    await this.waitForPageLoad()
    this.logger.info('✅ Kembali ke Forum Screen')
  }
}

module.exports = new ForumPage()