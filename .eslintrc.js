module.exports = {
  extends: [require.resolve('@umijs/lint/binbi-frontend-master/config/eslint')],
  globals: {
    page: true,
    REACT_APP_ENV: true,
  },
};
