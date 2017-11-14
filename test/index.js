const assert = require('assert')
const process = require('process')
const TwitchApi = require('../src/index.js')

describe('TwitchApi', () => {
  const scopes = ['user_read', 'channel_read', 'chat_login', 'channel_feed_edit', 'channel_subscriptions', 'channel_editor'];
  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET
  const redirectUri = 'https://example.com'
  const accessToken = process.env.ACCESS_TOKEN;

  const twitch = new TwitchApi({
    clientId,
    clientSecret,
    redirectUri,
    scopes
  });
  const oldTwitch = new TwitchApi({
    clientId,
    clientSecret,
    redirectUri,
    scopes,
    version: 3
  })


  describe('getGames()', () => {
    it('get games', () => {
      oldTwitch.getGames()
        .then(games => {
          assert.equal(typeof games._total, 'number');
          assert.equal(Array.isArray(games.top), true);
        });
    })
  });

  describe('getAuthorizationUrl()', () => {
    it('match url', () => {
      const url = twitch.getAuthorizationUrl()
      const expected = `https://api.twitch.tv/kraken/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('+')}`
      return assert.strictEqual(url, expected)
    })
  })

  describe('getUser()', () => {
    it('fetch single user: 139658194 (jake_loo)', () => {
      const expected = {
        display_name: "jake_loo",
        _id: "139658194",
        name: "jake_loo",
        type: "user"
      }

      return twitch.getUser("139658194")
      .then((b) => {
        const user = b;
        const expectUser = expected;

        // we only care about couple field is correct
        assert.strictEqual(user.display_name, expectUser.display_name)
        assert.strictEqual(user._id, expectUser._id)
        assert.strictEqual(user.name, expectUser.name)
        assert.strictEqual(user.type, expectUser.type)
        return true
      })
    })

    it('fetch two user: jake_loo, jake_loo_dev, jake_loo_prod', () => {
      return twitch.getUsersLogin(['jake_loo', 'jake_loo_dev', 'jake_loo_prod'])
      .then((b) => {
        // we only care about couple field is correct
        assert.strictEqual(b._total, 3)
        assert.strictEqual(b.users.length, 3)
        return true
      })
    })

    it('fetch an invalid user', () => {
      // Twitch doesn't allow query with invalid character nor 1 character login name, so test it with UUID
      return twitch.getUsersLogin(['e331a9f237fc480d968c87af6c6ed552'])
        .then((b) => assert.strictEqual(b._total, 0))
    })

    it('fetch an invalid and a valid user', () => {
      // Twitch doesn't allow query with invalid character nor 1 character login name, so test it with UUID
      return twitch.getUsersLogin(['e331a9f237fc480d968c87af6c6ed552', 'jake_loo'])
      .then((b) => {
        assert.strictEqual(b._total, 1)
        assert.strictEqual(b.users.length, 1)
      })
    })
  })

  describe('getChannel()', () => {
    it('fetch channel: theonlyjohnny_jd_', () => {
      let social_id = '';
      return twitch.getUsersLogin(['theonlyjohnny_jd_'])
      .then(({users})=> {
        const user = users[0];
        social_id = user._id;
        return twitch.getChannel(social_id);
      })
      .then(chan => {
        assert.equal(chan.display_name, 'theonlyjohnny_jd_');
        assert.equal(typeof chan.status, 'string');
        assert.equal(typeof chan.game, 'string');
        assert.equal(chan._id, social_id);
      })
    })
  });

  describe('updateChannel()', () => {
    let channel = {};
    it('fetch channel: theonlyjohnny_jd_', () => {
      let social_id = '';
      return twitch.getUsersLogin(['theonlyjohnny_jd_'])
      .then(({users})=> {
        const user = users[0];
        social_id = user._id;
        return twitch.getChannel(social_id);
      })
      .then(chan => {
        assert.equal(chan.display_name, 'theonlyjohnny_jd_');
        assert.equal(typeof chan.status, 'string');
        assert.equal(typeof chan.game, 'string');
        assert.equal(chan._id, social_id);
        channel = chan;
      })
    })

    it('update channel: theonlyjohnny_jd_', () => {
      const update = { status: `twitch-api test @${Date.now()}` }
      return twitch.updateChannel(channel._id, update, accessToken)
        .then(res => {
          assert.equal(update.status, res.status);
        });
    })
  })

  it('fetch subscriptions list: theonlyjohnny_jd_', () => {
    return oldTwitch.getChannelSubscriptions('theonlyjohnny_jd_', accessToken, { limit: 50 });
     /* idk what asserts to do here tbh lol  */
  })

  describe('getUsersLogin()', () => {
    it('fetch single user: jake_loo', () => {
      const expected = {
        _total: 1,
        users:[
          {
            display_name: "jake_loo",
            _id: "139658194",
            name: "jake_loo",
            type: "user"
          }
        ]
      }

      return twitch.getUsersLogin(['jake_loo'])
      .then((b) => {
        // we only care about couple field is correct
        assert.strictEqual(b._total, expected._total)
        assert.strictEqual(b.users.length, expected.users.length)

        const user = b.users[0];
        const expectUser = expected.users[0];

        assert.strictEqual(user.display_name, expectUser.display_name)
        assert.strictEqual(user._id, expectUser._id)
        assert.strictEqual(user.name, expectUser.name)
        assert.strictEqual(user.type, expectUser.type)
        return true
      })
    })

    it('fetch two user: jake_loo, jake_loo_dev, jake_loo_prod', () => {
      return twitch.getUsersLogin(['jake_loo', 'jake_loo_dev', 'jake_loo_prod'])
      .then((b) => {
        // we only care about couple field is correct
        assert.strictEqual(b._total, 3)
        assert.strictEqual(b.users.length, 3)
        return true
      })
    })

    it('fetch an invalid user', () => {
      // Twitch doesn't allow query with invalid character nor 1 character login name, so test it with UUID
      return twitch.getUsersLogin(['e331a9f237fc480d968c87af6c6ed552'])
        .then((b) => assert.strictEqual(b._total, 0))
    })

    it('fetch an invalid and a valid user', () => {
      // Twitch doesn't allow query with invalid character nor 1 character login name, so test it with UUID
      return twitch.getUsersLogin(['e331a9f237fc480d968c87af6c6ed552', 'jake_loo'])
      .then((b) => {
        assert.strictEqual(b._total, 1)
        assert.strictEqual(b.users.length, 1)
      })
    })
  })

})

