/* istanbul ignore file */
module.exports = {
  has: () => false,
  read: (_, defaultValue) => defaultValue,
  write: () => {},
  clear: () => {}
}
