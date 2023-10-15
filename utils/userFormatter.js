function formatUser(user) {
  const formattedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    // Add other fields you want to include
  };
  return formattedUser;
}
module.exports = { formatUser };
