const crypto = require('crypto');
const jwt = require('jsonwebtoken');

export const createSign = (data, privateKey, customParas = {}) => {
  const ts = new Date().getTime();
  const exp = ts + 30000;
  const header = { alg: 'PS256', typ: 'JWT' };
  const payload = {
    sub: 'tester',
    exp: exp,
    datas: getMd5(data)
  };
  if (customParas) {
    for (const prop in customParas) {
      payload[prop] = customParas[prop];
    }
  }
  const token = jwt.sign(JSON.stringify(payload), privateKey, {
    algorithm: 'PS256',
    header
  });
  return token;
};

export const getMd5 = data => {
  return crypto
    .createHash('md5')
    .update(data)
    .digest('hex');
};
