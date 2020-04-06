const assert = require('assert');
const v2client = require('./TplusOpenApiV2Client');
const v1client = require('./TplusOpenApiV1Client');

const domainUrl = 'T+域名';
const appkey = 'T+颁发的Appkey';
const appsecret = 'T+颁发的Appsecret';
const privateKey = 'T+颁发的私钥';
describe('v2接口单元测试', function() {
  it('v2GetTokenByOrgIdTest', function(done) {
    let orgId = '帐套对应的云企业Id'; //90013027742集测
    var client = new v2client(domainUrl, appkey, appsecret, privateKey);
    client.generateAccessTokenByOrgId(orgId, function(err, data) {
      if (err) {
        done(err);
      } else {
        console.log(data);
        done();
      }
    });
  });

  it('v2GetTokenByPwdTest', function(done) {
    let identity = '用户名';
    let pwd = '密码明文';
    let accNum = 帐套号;
    var client = new v2client(domainUrl, appkey, appsecret, privateKey);
    client.generateAccessTokenByPassword(identity, pwd, accNum, function(err, data) {
      if (err) {
        done(err);
      } else {
        console.log(data);
        done();
      }
    });
  });

  it('v2CallWithOrgIdTokenTest', function(done) {
    let orgId = '帐套对应的云企业Id'; //90013027742集测
    var client = new v2client(domainUrl, appkey, appsecret, privateKey);
    //先获取token
    client.generateAccessTokenByOrgId(orgId, function(err, data) {
      if (err) {
        done(err);
      } else {
        var accessToken = data.access_token;
        var sid = data.sid;
        client.Call(orgId, 'freeItemType/Query', { param: {} }, accessToken, sid, false, function(
          err,
          data
        ) {
          if (err) {
            done(err);
          } else {
            console.log(data);
            done();
          }
        });
      }
    });
  });

  it('v2CallWithPasswordTokenTest', function(done) {
    let identity = '用户名';
    let pwd = '密码明文';
    let accNum = 帐套号;
    var client = new v2client(domainUrl, appkey, appsecret, privateKey);
    //先获取token
    client.generateAccessTokenByPassword(identity, pwd, accNum, function(err, data) {
      if (err) {
        done(err);
      } else {
        var accessToken = data.access_token;
        var sid = data.sid;
        client.Call('', 'freeItemType/Query', { param: {} }, accessToken, sid, false, function(
          err,
          data
        ) {
          if (err) {
            done(err);
          } else {
            console.log(data);
            done();
          }
        });
      }
    });
  });

  it('v2LoginoutTest', function(done) {
    let orgId = '帐套对应的云企业Id'; //90013027742集测
    var client = new v2client(domainUrl, appkey, appsecret, privateKey);
    //先获取token
    client.generateAccessTokenByOrgId(orgId, function(err, data) {
      if (err) {
        done(err);
      } else {
        var accessToken = data.access_token;
        var sid = data.sid;
        client.Loginout(orgId, accessToken, function(err, data) {
          if (err) {
            done(err);
          } else {
            console.log(data);
            done();
          }
        });
      }
    });
  });
});

describe('v1接口单元测试', function() {
  it('v1GetTokenByPwdTest', function(done) {
    let identity = '用户名';
    let pwd = '密码明文';
    let accNum = 帐套号;
    var loginDate = new Date();
    var client = new v1client(domainUrl, appkey, appsecret);
    client.generateAccessTokenByPassword(identity, pwd, accNum, loginDate, function(err, data) {
      if (err) {
        done(err);
      } else {
        console.log(data);
        done();
      }
    });
  });

  it('v1ReloginTest', function(done) {
    let identity = '用户名';
    let pwd = '密码明文';
    let accNum = 帐套号;
    var loginDate = new Date();
    var client = new v1client(domainUrl, appkey, appsecret);
    client.generateAccessTokenByPassword(identity, pwd, accNum, loginDate, function(err, data) {
      if (err) {
        done(err);
      } else {
        client.reLogin(data.access_token, function(err, data) {
          if (err) {
            done(err);
          } else {
            console.log(data);
            done();
          }
        });
      }
    });
  });

  it('v1LoginoutTest', function(done) {
    let identity = '用户名';
    let pwd = '密码明文';
    let accNum = 帐套号;
    var loginDate = new Date();
    var client = new v1client(domainUrl, appkey, appsecret);
    client.generateAccessTokenByPassword(identity, pwd, accNum, loginDate, function(err, data) {
      if (err) {
        done(err);
      } else {
        client.Loginout(data.access_token, function(err, data) {
          if (err) {
            done(err);
          } else {
            console.log(data);
            done();
          }
        });
      }
    });
  });

  it('v1CallTest', function(done) {
    let identity = '用户名';
    let pwd = '密码明文';
    let accNum = 帐套号;
    var loginDate = new Date();
    var client = new v1client(domainUrl, appkey, appsecret);
    client.generateAccessTokenByPassword(identity, pwd, accNum, loginDate, function(err, data) {
      if (err) {
        done(err);
      } else {
        client.Call('freeItemType/Query', { param: {} }, data.access_token, data.sid, function(
          err,
          data
        ) {
          if (err) {
            done(err);
          } else {
            console.log(data);
            done();
          }
        });
      }
    });
  });
});
