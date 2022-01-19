const generateUsername = (name, phone) => {
  const firstName = name.split(" ")[0];
  const num = phone.substring(6);
  return firstName + num;
};

module.exports = {
  generateUsername,
};
