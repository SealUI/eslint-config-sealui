module.exports = {
  rules: {
    /**
     * 禁止使用 console
     * @category Possible Errors
     * @reason console 的使用很常见
     */
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
};
