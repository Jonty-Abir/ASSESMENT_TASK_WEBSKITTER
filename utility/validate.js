function validateEnum(productSize) {
  const productSizeEnum = ["SM", "MD", "XL", "XXL"];
 return productSizeEnum.includes(productSize);
}

module.exports = { validateEnum };
