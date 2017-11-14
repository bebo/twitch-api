const request = require('request-promise');

const baseUrl = 'https://api.twitch.tv/kraken';
const authorizePath = '/oauth2/authorize';
const accessTokenPath = '/oauth2/token';
const timeout = 30 * 1000; //30 second timeout

class Twitch {
  constructor({clientId, clientSecret, redirectUri, scopes = [], version = 5}) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.version = version;
    this.scopes = scopes;
    if (this.version <= 5) {
      const expires = new Date(1546243200000);
      /* Mon Dec 31 2018 00:00:00 */
      const diff = new Date() - expires;
      console.warn(`Twitch API v${this.version} is deprecated and will be removed in ${expires - Date.now()}`);
    }
  }

  createRequest({method = 'GET', path = '', accessToken, body = {}}, params) {
    return {
      method,
      body,
      url: baseUrl + path,
      qs: params,
      timeout,
      headers: {
        'Authorization': accessToken ? `OAuth ${accessToken}` : undefined,
        'Accept': `application/vnd.twitchtv.v${this.version}+json`,
        'Client-ID': this.clientId
      },
      json: true
    };
  }

  executeRequest(options, params) {
    const req = this.createRequest(options, params);
    return request(req);
  }

  getAuthorizationUrl(scopes) {
    if (!scopes) scopes = this.scopes;
    return `${baseUrl}${authorizePath}?response_type=code&client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=${scopes.join('+')}`;
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
  getUser(user_id) {
    if (!user_id) { return Promise.reject('user_id is required'); }

    return this.executeRequest({
      method: 'GET',
      path: `/users/${user_id}`
    });
  }

  getUsersLogin(usernames = []) {
    if (!usernames || !usernames.length) { return Promise.reject('array of usernames required'); }

    return this.executeRequest({
      method: 'GET',
      path: '/users'
    }, {
      login: usernames.join()
    });
  }

  getAuthenticatedUser(accessToken) {
    return this.executeRequest({
      method: 'GET',
      path: '/user',
      accessToken: accessToken
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

  getChannelFollowers(channelId, parameters) {
    return this.executeRequest({
        method: 'GET',
        path: `/channels/${channelId}/follows`
      },
      parameters
    );
  }

  getChannelSubscriptions(channelId, accessToken, params) {
    if (this.version > 3) return Promise.reject("TwitchAPI:getChannelSubscriptions is only support on twitch api v3 and below");
    return this.executeRequest({
        method: 'GET',
        path: `/channels/${channelId}/subscriptions`,
        accessToken
      },
      params
    ).then(data => {
      if (data && data.subscriptions) {
        return data.subscriptions;
      }
      return [];
    })
    .catch(err => {
      if (err && err.statusCode === 422) return Promise.resolve([]);
      throw err;
    });
  }

  getChannel(channelId) {
    return this.executeRequest({
      method: 'GET',
      path: `/channels/${channelId}`,
    },
    {});
  }

  updateChannel(channelId, attempt, accessToken) {
    const { status, game, delay } = attempt;
    const update = {};
    if (status) {
      update.status = status;
    }
    if (game) {
      update.game = game;
    }
    if ('delay' in attempt) {
      update.delay = delay;
    }
    return this.executeRequest({
      method: 'PUT',
      body: { channel:  update },
      path: `/channels/${channelId}`,
      accessToken
    }, {});
  }
  /**********************************************************************/
  /**************************GAMES***************************************/
  /**********************************************************************/

  getGames(count = 20, offset = 0) {
    if (this.version > 3) return Promise.reject("TwitchAPI:getChannelSubscriptions is only support on twitch api v3 and below");
    return this.executeRequest({
      method: 'GET',
      path: `/games/top?limit=${count}&offset=${offset}`
    });
  }

}

module.exports = Twitch;
