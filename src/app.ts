import fs from 'fs';
import path from 'path';
import axios from 'axios';
import toml from 'toml';
import { createSign, getMd5 } from './lib/sign_manage';
import qs from 'qs';
import { v4 as uuid } from 'uuid';

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
  privatekey,
  timeout,
  customer,
  invoiceType,
  department,
  clerk,
  unit
} = envConfig.tpulus;
const baseURL = `http://${host}:${port}/${prefix}`;

const getAuthorization = (
  appkey: string,
  appsecret: string,
  keyPath: string,
  token?: string | null
) => {
  const header: { [key: string]: string } = { appkey, orgid: '', appsecret };
  const headerStr = JSON.stringify(header);
  const signValue = createSign(
    headerStr,
    fs.readFileSync(keyPath, 'utf-8'),
    token ? { access_token: token } : {}
  );
  const authStr = JSON.stringify({
    appKey: appkey,
    authInfo: signValue,
    orgId: ''
  });
  const encodeBase64 = Buffer.from(authStr, 'utf8').toString('base64');
  return encodeBase64;
};

let token = '';
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
  const encodeBase64 = Buffer.from(authStr, 'utf8').toString('base64');
  const instance = axios.create({
    baseURL,
    timeout: 1000,
    headers: {
      Authorization: encodeBase64,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
    // proxy: {
    //   host: '127.0.0.1',
    //   port: 8888
    // }
  });

  const { data } = await instance.post(
    '/collaborationapp/GetRealNameTPlusToken?IsFree=1',
    qs.stringify({
      _args: JSON.stringify({
        userName: username,
        password: getMd5(userpwd),
        accNum: accnum
      })
    })
  );
  token = data.access_token;
};

const placeSaleOrder = async (order: any) => {
  try {
    const baseURL = `http://${host}:${port}/${prefix}`;
    const instance = axios.create({
      baseURL,
      timeout: timeout * 1000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    const postData = {
      dto: {
        ...order,
        customer: { Code: customer },
        invoiceType: { Code: invoiceType },
        department: { Code: department },
        dynamicPropertyKeys: ['pubuserdefnvc3'],
        dynamicPropertyValues: [invoiceType],
        clerk: { Code: clerk },
        saleDeliveryDetails: order.saleDeliveryDetails.map(value => {
          return { ...value, inventory: { Code: value.inventory }, unit: { Name: unit } };
        })
      }
    };
    const { data } = await instance.post(
      'saleDelivery/Create',
      qs.stringify({
        _args: JSON.stringify(postData)
      }),
      {
        headers: {
          Authorization: getAuthorization(appkey, appsecret, privatekey, token)
        }
      }
    );
    console.log(data);
  } catch (error) {
    throw error;
  }
};

(async () => {
  await getToken();
  const order = {
    externalCode: uuid(),
    address: '测试地址',
    linkMan: '测试联系人',
    contactPhone: '测试手机号',
    memo: '测试备注',
    origTaxAmount: 100,
    saleDeliveryDetails: [
      {
        inventory: '4000000789',
        quantity: 1,
        origTaxPrice: 100
      }
    ]
  };
  await placeSaleOrder(order);
  console.log(token);
})();
