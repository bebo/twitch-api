const request = require('request-promise');

const baseUrl = 'https://api.twitch.tv/kraken';
const authorizePath = '/oauth2/authorize';
const accessTokenPath = '/oauth2/token';

class Twitch {
  constructor({clientId, clientSecret, redirectUri, scopes = []}) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.scopes = scopes;
  }

  createRequest({method = 'GET', path = '', accessToken, body = {}}, params) {
    return {
      method,
      body,
      url: baseUrl + path,
      qs: params,
      headers: {
        'Authorization': accessToken ? `OAuth ${accessToken}` : undefined,
        'Accept': 'Accept: application/vnd.twitchtv.v5+json',
        'Client-ID': this.clientId
      },
      json: true
    };
  }

  executeRequest(options, params) {
    const req = this.createRequest(options, params);
    return request(req)
  }

  getAuthorizationUrl() {
    return `${baseUrl}${authorizePath}?response_type=code&client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=${this.scopes.join('+')}`;
  }

  getAccessToken(code) {
    const parameters = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri,
      code
    };

    return this.executeRequest({
        method: 'POST',
        path: accessTokenPath,
      },
      parameters
    );
  }


  /**********************************************************************/
  /************************ USER SPECIFIC METHODS ***********************/
  /**********************************************************************/

  getUsersLogin(usernames = []) {
    if (!usernames || !usernames.length) { return; }
    return this.executeRequest({
      method: 'GET',
      path: '/users'
    }, {
      login: usernames.join()
    });
  }

  /**********************************************************************/
  /******************** CHANNELS SPECIFIC METHODS ***********************/
  /**********************************************************************/

  getAuthenticatedUserChannel(accessToken) {
    return this.executeRequest({
      method: 'GET',
      path: '/channel',
      accessToken: accessToken
    });
  }

  getStreams(parameters) {
    return this.executeRequest({
        method: 'GET',
        path: '/streams'
      },
      parameters
    );
  }
}

module.exports = Twitch;
