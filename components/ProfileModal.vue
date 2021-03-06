<template>
  <b-modal
    v-if="id && user && user.info"
    id="profilemodal"
    v-model="showModal"
    size="lg"
    no-stacking
  >
    <template slot="modal-header">
      <div class="coverphoto">
        <profile-header :id="id" class="flex-grow-1 px-3 py-2" />
      </div>
    </template>
    <template slot="default">
      <notice-message v-if="user.info.expectedreply" variant="warning">
        <v-icon name="exclamation-triangle" />&nbsp;{{ user.info.expectedreply | pluralize(['freegler is', 'freeglers are'], { includeNumber: true }) }} still waiting for them to reply.
      </notice-message>
      <notice-message v-else-if="user.hasReneged" variant="warning">
        <v-icon name="exclamation-triangle" />&nbsp;Things haven't always worked out for this freegler.  That might not be their fault, but please make very clear arrangements.
      </notice-message>
      <div v-if="aboutme" class="mb-1">
        <blockquote class="font-weight-bold">
          &quot;{{ aboutme }}&quot;
        </blockquote>
      </div>
      <b-card border-variant="success" header-bg-variant="success" header-text-variant="white" class="mt-2">
        <template v-slot:header>
          <v-icon name="info-circle" /> About this freegler
        </template>
        <b-card-body class="p-0 pt-1">
          <p v-if="user.info.milesaway">
            <v-icon name="map-marker-alt" class="fa-fw" />
            <span v-if="user.info.publiclocation">
              <span v-if="user.info.publiclocation.location">
                {{ user.info.publiclocation.location }}, {{ user.info.milesaway | pluralize([ 'mile', 'miles' ], { includeNumber: true }) }} away.
              </span>
              <span v-else-if="user.info.publiclocation.groupname">
                {{ user.info.publiclocation.groupname }}
              </span>
              <span v-else>
                Unknown
              </span>
            </span>
          </p>
          <ReplyTime :user="user" />
        </b-card-body>
      </b-card>
      <b-card border-variant="info" header-bg-variant="info" header-text-variant="white" class="mt-2">
        <template v-slot:header>
          <v-icon name="chart-bar" />
          <span v-if="user.info.offers + user.info.wanteds + user.info.replies > 0">Activity in the last 90 days</span>
          <span v-else>No recent activity.</span>
        </template>
        <b-card-body class="p-0 pt-1">
          <div v-if="user.info.offers + user.info.wanteds + user.info.replies > 0" class="d-flex justify-content-between flex-wrap">
            <div>
              <v-icon name="gift" /> {{ user.info.offers | pluralize([ 'recent OFFER', 'recent OFFERs' ], { includeNumber: true }) }}
              <span v-if="user.info.openoffers" class="text-success font-weight-bold">
                ({{ user.info.openoffers }} still active)
              </span>
            </div>
            <div>
              <v-icon name="shopping-cart" /> {{ user.info.wanteds | pluralize([ 'recent WANTED', 'recent WANTEDs' ], { includeNumber: true }) }}
              <span v-if="user.info.openwanteds" class="text-success font-weight-bold">
                ({{ user.info.wanteds }} still active)
              </span>
            </div>
            <div>
              <v-icon name="envelope" /> {{ user.info.replies | pluralize([ 'reply', 'replies' ], { includeNumber: true }) }} sent
            </div>
          </div>
          <div class="mt-2">
            <span v-if="user.info.collected">
              <v-icon name="check" /> Picked up about {{ user.info.collected | pluralize('item', { includeNumber: true }) }}
            </span>
            <span v-else>
              <v-icon name="check" class="text-faded" />&nbsp;Not received any items recently, so far as we know.
            </span>
          </div>
        </b-card-body>
      </b-card>
    </template>
    <template slot="modal-footer" slot-scope="{ ok, cancel }">
      <b-button variant="white" @click="cancel">
        Close
      </b-button>
      <b-btn variant="primary" :to="'/profile/' + id">
        View full profile
      </b-btn>
    </template>
  </b-modal>
</template>

<script>
import twem from '~/assets/js/twem'
import ProfileHeader from '~/components/ProfileHeader'

const ReplyTime = () => import('~/components/ReplyTime')
const NoticeMessage = () => import('~/components/NoticeMessage')

export default {
  components: {
    ReplyTime,
    NoticeMessage,
    ProfileHeader
  },
  props: {
    id: {
      type: Number,
      required: false,
      default: 0
    }
  },
  data: function() {
    return {
      showModal: false
    }
  },
  computed: {
    user() {
      // Look for the user in both the user store (FD) and the members store (MT).  This saves some fetches which can
      // result in weird render errors.
      let ret = null

      if (this.id) {
        let user = this.$store.getters['user/get'](this.id)

        if (user && user.info) {
          ret = user
        } else {
          user = this.$store.getters['members/getByUserId'](this.id)

          if (user && user.info) {
            ret = user
          }
        }
      }

      return ret
    },
    aboutme() {
      return this.user && this.user.info && this.user.info.aboutme
        ? twem.twem(this.$twemoji, this.user.info.aboutme.text)
        : null
    }
  },
  async mounted() {
    if (this.id && !this.user) {
      // Components can't use asyncData, so we fetch here.  Can't do this for SSR, but that's fine as we don't
      // need to render this pane on the server.
      await this.$store.dispatch('user/fetch', {
        id: this.id,
        info: true
      })
    }
  },
  methods: {
    show() {
      this.showModal = true
    },

    hide() {
      this.showModal = false
    }
  }
}
</script>

<style scoped lang="scss">
@import 'color-vars';

::v-deep .media .align-self-start {
  margin-right: 0.25rem !important;
}

::v-deep .modal-header {
  padding: 0px;
}

.coverphoto {
  min-height: 100px !important;
  width: 100% !important;
  background-image: url('~static/wallpaper.png');
}

.covername {
  left: 108px;
  position: absolute;
  width: calc(100% - 105px);
  padding-top: 10px;
  padding-left: 10px;
  padding-right: 10px;
}
</style>
