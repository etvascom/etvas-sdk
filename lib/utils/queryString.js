const getQueryString = (params = {}) => {
  if (!params || typeof params !== 'object' || !Object.keys(params).length) {
    return ''
  }

  const qs = Object.keys(params)
    .map(field => `${encodeURI(field)}=${encodeURI(params[field])}`)
    .join('&')
  /* istanbul ignore next */
  return qs ? `?${qs}` : ''
}

module.exports = {
  getQueryString
}
