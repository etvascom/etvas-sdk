module.exports = recipient => {
  if (recipient.name && recipient.email) {
    return `${recipient.name} <${recipient.email}>`
  }
  return recipient.email || recipient
}
