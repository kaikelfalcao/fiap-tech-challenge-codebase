export default () => ({
  auth: {
    secret: process.env.JWT_SECRET,
    expires: process.env.JWT_EXPIRES_IN,
  },
});
