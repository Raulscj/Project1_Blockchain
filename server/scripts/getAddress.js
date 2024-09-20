function getAddress(publicKey) {
  const address = publicKey.slice(-20);
  return address;
}

module.exports = getAddress;
