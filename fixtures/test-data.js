require('dotenv').config()

const validUser = {
  username: process.env.TEST_USERNAME || 'testuser',
  email: process.env.TEST_USER_EMAIL || 'testuser@kickoff.test',
  password: process.env.TEST_USER_PASSWORD || 'password123',
}

const helperUser = {
  username: 'helper_report',
  email: 'helper_report@kickoff.test',
  password: 'password123',
}

const timestamp = Date.now()
const newUser = {
  username: `autotest_${timestamp}`,
  email: process.env.TEST_REGISTER_EMAIL || `autotest_${timestamp}@kickoff.test`,
  password: process.env.TEST_REGISTER_PASSWORD || 'AutoTest@123',
  confirmPassword: process.env.TEST_REGISTER_PASSWORD || 'AutoTest@123',
  fullName: 'Auto Test User',
}

const invalidCredentials = {
  wrongEmail: 'salah@email.com',
  wrongPassword: 'wrongpassword',
  invalidEmail: 'bukan-email-valid',
  shortPassword: '123',     
  emptyString: '',
}

// data forum
const forumPost = {
  title: `Test Post - ${new Date().toLocaleString('id-ID')}`,
  content: 'Ini adalah post test yang dibuat secara otomatis oleh Appium. Lorem ipsum dolor sit amet.',
  tag: 'test',
}

// timeout constant
const timeouts = {
  short: 5000,
  medium: 15000,
  long: 30000,
  appLoad: 45000,    
}

module.exports = {
  validUser,
  helperUser,
  newUser,
  invalidCredentials,
  forumPost,
  timeouts,
}
