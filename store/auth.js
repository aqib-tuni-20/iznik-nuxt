export const state = () => ({
  forceLogin: false,
  user: null,
  userFetched: null
})

const NONMIN = ['me', 'groups', 'aboutme', 'phone', 'notifications']

export const mutations = {
  forceLogin(state, value) {
    state.forceLogin = value
  },

  setUser(state, user) {
    if (user) {
      // We can query the server for different components.  Merge everything we have back in.
      if (!state.user) {
        state.user = {}
      }

      for (const key in user) {
        state.user[key] = user[key]
      }

      state.userFetched = new Date().getTime()
    } else if (state.user) {
      state.user = null
      state.userFetched = null
    }
  }
}

export const getters = {
  forceLogin: state => () => {
    return state.forceLogin
  },

  user: state => () => {
    return state.user
  }
}

export const actions = {
  forceLogin({ commit }, value) {
    commit('forceLogin', value)
  },

  setUser({ commit }, value) {
    console.log('Set user', value)
    commit('setUser', value)

    // Set or clear our auth token to be used on all API requests.
    this.$axios.defaults.headers.common.Authorization = value
      ? 'Iznik ' + value.persistent
      : null
  },

  async login({ commit, dispatch }, params) {
    const res = await this.$axios.post(process.env.API + '/session', params)

    if (res.status === 200 && res.data.ret === 0) {
      // Login no longer required (if it was)
      commit('forceLogin', false)

      // Save the persistent session token.
      res.data.user.persistent = res.data.persistent

      // Login succeeded.  Set the user, which will trigger various rerendering if we were required to be logged in.
      commit('setUser', res.data.user)

      // We need to fetch the user again to get the groups, which aren't returned by the login API.
      dispatch('fetchUser')
    } else {
      // Login failed.
      console.error('Login failed', res)
      throw new Error('Login failed')
    }
  },

  async fetchUser({ commit, store, state }, params) {
    const lastfetch = state.userFetched

    params = params || {
      components: ['me', 'groups']
    }

    if (
      !params.force &&
      lastfetch &&
      new Date().getTime() - lastfetch < 30000
    ) {
      // We have fetched the user pretty recently.
    } else {
      // We're so vain, we probably think this call is about us.
      const res = await this.$axios.get(process.env.API + '/session', {
        params: params
      })

      if (res.status === 200 && res.data.ret === 0) {
        // Save the persistent session token.
        res.data.me.persistent = res.data.persistent

        if (res.data.groups) {
          res.data.me.groups = res.data.groups
        }

        // Login succeeded.  Set the user, which will trigger various re-rendering if we were required to be logged in.
        if (res.data.me) {
          commit('setUser', res.data.me)
          commit('forceLogin', false)
        }
      } else {
        // Login failed.
        console.error('Fetch user failed')
        throw new Error('Fetch user failed')
      }
    }
  },

  async saveAboutMe({ commit, dispatch }, value) {
    await dispatch('saveAndGet', {
      aboutme: value
    })
  },

  async saveEmail({ commit, dispatch, state }, params) {
    const res = await this.$axios.post(process.env.API + '/session', params, {
      headers: {
        'X-HTTP-Method-Override': 'PATCH'
      }
    })

    if (res.status === 200 && res.data.ret === 0) {
      await dispatch('fetchUser', {
        components: ['me', 'groups', 'aboutme']
      })
    } else {
      // TODO
      console.error('saveUser failed')
    }

    return res
  },

  async saveAndGet({ commit, dispatch, state }, params) {
    const res = await this.$axios.post(process.env.API + '/session', params, {
      headers: {
        'X-HTTP-Method-Override': 'PATCH'
      }
    })

    if (res.status === 200 && res.data.ret === 0) {
      await dispatch('fetchUser', {
        components: NONMIN,
        force: true
      })
    } else {
      // TODO
      console.error('saveUser failed')
    }

    return state.user
  },

  async setGroup({ commit, dispatch, state }, params) {
    await this.$axios.post(process.env.API + '/memberships', params, {
      headers: {
        'X-HTTP-Method-Override': 'PATCH'
      }
    })
  },

  async leaveGroup({ commit, dispatch, state }, params) {
    const res = await this.$axios.post(
      process.env.API + '/memberships',
      params,
      {
        headers: {
          'X-HTTP-Method-Override': 'DELETE'
        }
      }
    )

    if (res.status === 200 && res.data.ret === 0) {
      await dispatch('fetchUser', {
        components: NONMIN,
        force: true
      })
    } else {
      // TODO
      console.error('saveUser failed')
    }

    return state.user
  }
}
