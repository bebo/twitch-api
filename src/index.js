import request from 'request-promise';

const baseUrl = 'https://api.twitch.tv/kraken';
const authorizePath = '/oauth2/authorize';
const accessTokenPath = '/oauth2/token';

class Twitch{
  constructor({clientId, clientSecret, redirectUri, scopes = []}){
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.scopes = scopes;
  }

  static createRequest({method = 'GET', path = '', accessToken, body = {}}, params){
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

  static executeRequest(options, params){
    const req = this.createRequest(options, params);
    return request(req)
  }

  static getAuthorizationUrl = function(){
    let scopesParam = '';
    for (let i = 0; i < this.scopes.length;  i++){
      scopesParam += this.scopes[i];
      if (i !== (this.scopes.length - 1)){
        scopesParam += '+';
      }
    }
    return `${baseUrl}${authorizePath}?response_type=code&client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=${scopesParam}`;
  };

  static getAccessToken = function(code){
    const parameters = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri,
      code
    };

    return this.executeRequest(
      {
        method: 'POST',
        path: accessTokenPath,
      },
      parameters
    );
  };


  /**********************************************************************/
  /************************* USER SPECIFIC METHODS *************************/
  /**********************************************************************/

  getUsersLogin(usernames = []){
    if(!usernames || !usernames.length){return;}
    return this.executeRequest({path: 'users'}, {login: usernames.join()});
  }

}

export default Twitch;