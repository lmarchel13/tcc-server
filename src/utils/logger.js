module.exports = (name) => {
  return {
    info: (...msg) => {
      console.log(`[${name}]`, '-', 'LOG', '-', ...msg);
    },
    debug: (...msg) => {
      console.log(`[${name}]`, '-', 'DEBUG', '-', ...msg);
    },
    error: (...msg) => {
      console.log(`[${name}]`, '-', 'ERROR', '-', ...msg);
    },
    warn: (...msg) => {
      console.log(`[${name}]`, '-', 'WARN', '-', ...msg);
    },
  };
};
