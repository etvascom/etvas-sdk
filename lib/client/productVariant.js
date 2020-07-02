const config = require('../init/config')

module.exports = productId => {
  const productVariants = config.get('productVariants')
  if (!productVariants || !productVariants[productId]) {
    throw new Error('[ETVAS] Product variant: invalid configuration')
  }
  return productVariants[productId]
}
