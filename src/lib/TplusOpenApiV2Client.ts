const request = require('request');
const SignManage = require('./sign_manage');

export class TplusOpenApiV2Client {
  private _tplusDomain;
  private _appKey: string;
  private _appSecret;
  private _privateKey;
  private _accessToken = '';
  private _sid = '';
  constructor(tplusDomain, appKey, appSecret, privateKey) {
    this._tplusDomain = tplusDomain;
    this._appKey = appKey;
    this._appSecret = appSecret;
    this._privateKey = privateKey;
    this._accessToken = '';
    this._sid = '';
  }
  getTplusDomain() {
    return this._tplusDomain;
  }
  setTplusDomain(tplusDomain) {
    this._tplusDomain = tplusDomain;
  }

  getAppKey() {
    return this._appKey;
  }
  setAppKey(appKey) {
    this._appKey = appKey;
  }

  getAppSecret() {
    return this._appSecret;
  }
  setAppSecret(appSecret) {
    this._appSecret = appSecret;
  }
  getPrivateKey() {
    return this._privateKey;
  }
  setPrivateKey(privateKey) {
    this._privateKey = privateKey;
  }

  getAccessToken() {
    return this._accessToken;
  }

  getSid() {
    return this._sid;
  }

  Loginout(orgId, accessToken, callback) {
    this.validBasicInfo();
    if (!accessToken) {
      throw new Error('accessToken不能为空');
    }
    this.call(orgId, 'collaborationapp/Loginout', null, accessToken, '', false, callback);
  }

  call(orgId, relativePath, postData, accessToken, sid, isAsync, callback) {
    this.validBasicInfo();
    if (!relativePath) throw new Error('relativePath不能为空');
    if (!accessToken) throw new Error('accessToken不能为空');
    if (isAsync == null || isAsync == undefined) isAsync = false;
    if (!postData) postData = {};
    if (!orgId) orgId = '';
    const customParas = { access_token: accessToken };
    const bizheader = {
      appkey: this._appKey,
      orgid: orgId,
      appsecret: this._appSecret
    };
    const bizdatas = JSON.stringify(bizheader);
    const bizAuth = SignManage.createSign(bizdatas, this._privateKey, customParas);
    const authDic = {
      appKey: this._appKey,
      authInfo: bizAuth,
      orgId: orgId
    };
    const authStr = JSON.stringify(authDic);
    const encodeBase64 = Buffer.from(authStr, 'utf8').toString('base64');
    if (isAsync) postData['type'] = 'Asyn';
    const requestOptions = {
      url: this._tplusDomain + '/tplus/api/v2/' + relativePath,
      method: 'POST',
      headers: {
        Authorization: encodeBase64,
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: 'sid=' + sid + ';'
      },
      form: {
        _args: JSON.stringify(postData)
      }
    };
    request(requestOptions, function(err, res, body) {
      if (!err && res.statusCode == 200) {
        console.log('请求返回内容:' + body);
        callback(null, body);
      } else {
        if (err) {
          callback(err, null);
        } else {
          callback(new Error('响应状态码：' + res.statusCode + ',响应内容：' + body), null);
        }
      }
    });
  }

  generateAccessTokenByPassword(identity, pwd, accNum, callback) {
    this.validBasicInfo();
    if (!identity) throw new Error('未设置T+的请求identity');
    if (!accNum || accNum < 0) throw new Error('未设置T+的请求accNum');
    const pwdMd5 = SignManage.getMd5(pwd);
    const header = [{ appkey: this._appKey }, { orgid: '' }, { appsecret: this._appSecret }];
    const headerStr = JSON.stringify(header);
    console.log(headerStr);
    console.log(this._privateKey);
    const signValue = SignManage.createSign(headerStr, this._privateKey);
    const authDic = {
      appKey: this._appKey,
      authInfo: signValue,
      orgId: ''
    };
    console.log(signValue);
    const authStr = JSON.stringify(authDic);
    const encodeBase64 = Buffer.from(authStr, 'utf8').toString('base64');
    console.log('生成的header认证头:' + encodeBase64);
    const requestOptions = {
      url: this._tplusDomain + '/tplus/api/v2/collaborationapp/GetRealNameTPlusToken?IsFree=1',
      method: 'POST',
      headers: {
        Authorization: encodeBase64,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: {
        _args: JSON.stringify({
          userName: identity,
          password: pwdMd5,
          accNum: accNum
        })
      },
      proxy: 'http://127.0.0.1:8888'
    };
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    // request.defaults({ proxy: 'http://127.0.0.1:8888' });
    request(requestOptions, function(err, res, body) {
      if (!err && res.statusCode == 200) {
        console.log('请求返回内容:' + body);
        const json = JSON.parse(body);
        if (json.access_token) {
          self._accessToken = json.access_token;
          self._sid = json.sid;
          callback(null, json);
        } else callback(new Error('获取token出错，返回内容:' + body), null);
      } else {
        if (err) {
          callback(err, null);
        } else {
          callback(new Error('响应状态码：' + res.statusCode + ',响应内容：' + body), null);
        }
      }
    });
  }

  // this.generateAccessTokenByOrgId = function(orgId, callback) {
  //   validBasicInfo();
  //   if (!orgId) throw new Error('未设置T+的请求OrgId');
  //   //let accessTokenUrl = _tplusDomain+"/tplus/api/v2/collaborationapp/GetAnonymousTPlusToken?IsFree=1";
  //   const header = [{ appkey: _appKey }, { orgid: orgId }, { appsecret: _appSecret }];
  //   const headerStr = JSON.stringify(header);
  //   const signValue = SignManage.CreateSign(headerStr, _privateKey);
  //   const authDic = {
  //     appKey: _appKey,
  //     authInfo: signValue,
  //     orgId: orgId
  //   };
  //   const authStr = JSON.stringify(authDic);
  //   const encodeBase64 = Buffer.from(authStr, 'utf8').toString('base64');
  //   console.log('生成的header认证头:' + encodeBase64);
  //   const requestOptions = {
  //     url: _tplusDomain + '/tplus/api/v2/collaborationapp/GetAnonymousTPlusToken?IsFree=1',
  //     method: 'POST',
  //     headers: { Authorization: encodeBase64 }
  //   };
  //   request(requestOptions, function(err, res, body) {
  //     if (!err && res.statusCode == 200) {
  //       console.log('请求返回内容:' + body);
  //       const json = JSON.parse(body);
  //       if (json.access_token) {
  //         _accessToken = json.access_token;
  //         _sid = json.sid;
  //         callback(null, json);
  //       } else callback(new Error('获取token出错，返回内容:' + body), null);
  //     } else {
  //       if (err) {
  //         callback(err, null);
  //       } else {
  //         callback(new Error('响应状态码：' + res.statusCode + ',响应内容：' + body), null);
  //       }
  //     }
  //   });
  // };

  validBasicInfo() {
    if (!this._tplusDomain) throw new Error('未设置T+的请求TplusDomain');
    if (!this._appKey) throw new Error('未设置T+的请求AppKey');
    if (!this._appSecret) throw new Error('未设置T+的请求AppSecret');
  }
}
