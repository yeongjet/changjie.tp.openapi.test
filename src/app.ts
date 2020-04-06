import fs from 'fs';
import path from 'path';
import axios from 'axios';
import toml from 'toml';
import { createSign, getMd5 } from './lib/sign_manage';
import qs from 'qs';

const env = process.env.NODE_ENV || 'dev';
const parse = (path: string) => toml.parse(fs.readFileSync(path, 'utf-8'));
const envConfig = parse(path.resolve(__dirname, `../config/${env}.toml`));

const {
  host,
  port,
  prefix,
  appkey,
  appsecret,
  username,
  userpwd,
  accnum,
  privatekey
} = envConfig.tpulus;
const baseURL = `http://${host}:${port}/${prefix}`;

const getToken = async () => {
  const header = JSON.stringify([{ appkey }, { orgid: '' }, { appsecret }]);
  const signValue = createSign(header, fs.readFileSync(privatekey, 'utf-8'));
  console.log(header);
  console.log(fs.readFileSync(privatekey, 'utf-8'));
  console.log(signValue);
  const authStr = JSON.stringify({
    appKey: appkey,
    authInfo: signValue,
    orgId: ''
  });
  // console.log(authStr);
  const encodeBase64 = Buffer.from(authStr, 'utf8').toString('base64');
  const instance = axios.create({
    baseURL,
    timeout: 1000,
    headers: {
      Authorization: encodeBase64,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    proxy: {
      host: '127.0.0.1',
      port: 8888
    }
  });
  //   instance.interceptors.request.use(
  //     config => {
  //       // Do something before request is sent
  //       console.log(config);
  //       return config;
  //     },
  //     error => {
  //       // Do something with request error
  //       console.log(error);
  //       return Promise.reject(error);
  //     }
  //   );

  const result: string = await instance.post(
    '/collaborationapp/GetRealNameTPlusToken?IsFree=1',
    qs.stringify({
      _args: JSON.stringify({
        userName: username,
        password: getMd5(userpwd),
        accNum: accnum
      })
    })
  );
  return result;
};

(async () => {
  const token = await getToken();
  console.log(token);
})();
