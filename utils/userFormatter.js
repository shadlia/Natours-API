function formatUser(user) {
  const formattedUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    // Add other fields you want to include
  };
  return formattedUser;
}
module.exports = { formatUser };
