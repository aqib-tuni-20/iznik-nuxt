<template>
  <div>
    <b-modal
      id="donationaskemodal"
      v-model="showModal"
      :title="'Please help keep ' + groupname + ' running'"
      size="lg"
      no-stacking
    >
      <template slot="default">
        <NoticeMessage variant="info">
          Like many charities (and many freeglers) Freegle is affected by the lockdown. Please help us be there
          for people when it's over.
        </NoticeMessage>
        <div class="d-flex justify-content-between">
          <div v-if="variant === 'whatyoucanrunning'" style="width:250px" class="mr-4 pt-4 d-none d-sm-block">
            <b-img-lazy fluid src="/running.gif" alt="Keep freegle running" />
          </div>
          <div>
            <p>
              <strong>{{ groupname }}</strong> is a charity that's free to use, but not free to run.
            </p>
            <p>
              This month we're trying to raise <strong>&pound;{{ target }}</strong><span v-if="groupid && !targetMet"> for this community</span>.
              If you can, <strong>
                <span v-if="variant === 'link1' || variant === 'buttons1'">
                  please donate &pound;1
                </span>
                <span v-else-if="variant === 'link3' || variant === 'buttons3'">
                  please donate &pound;3
                </span>
                <span v-else-if="variant === 'buttons1monthly'">
                  please set up a monthly &pound;1 donation
                </span>
                <span v-else-if="variant === 'buttons1510' || variant === 'buttons51025'">
                  please donate
                </span>
                <span v-else>
                  <!--                  "variant === 'whatyoucan'"-->
                  please donate what you can
                </span>
              </strong>
              to keep us running.
            </p>
            <donation-button v-if="variant === 'whatyoucanrunning'" link="paypal1510" @clicked="score(5)" />
            <donation-button v-else-if="variant === 'link1'" link="paypal1" @clicked="score(1)" />
            <donation-button v-else-if="variant === 'link3'" link="paypal3" @clicked="score(3)" />
            <donation-button v-else-if="variant === 'buttons1'" link="paypal1" show="£1" @clicked="score(1)" />
            <donation-button v-else-if="variant === 'buttons3'" link="paypal3" show="£3" @clicked="score(3)" />
            <donation-button v-else-if="variant === 'buttons1monthly'" link="paypal1" show="£1/month" monthly @clicked="score(4)" />
            <div v-else-if="variant === 'buttons1510'" class="d-flex justify-content-between flex-wrap">
              <donation-button link="paypal1" show="£1" class="mb-1" @clicked="score(1)" />
              <donation-button link="paypal5" show="£5" class="mb-1" @clicked="score(5)" />
              <donation-button link="paypal10" show="£10" class="mb-1" @clicked="score(10)" />
            </div>
            <div v-else-if="variant === 'buttons51025'" class="d-flex justify-content-between flex-wrap">
              <donation-button link="paypal5" show="£5" class="mb-1" @clicked="score(5)" />
              <donation-button link="paypal10" show="£10" class="mb-1" @clicked="score(10)" />
              <donation-button link="paypal25" show="£25" class="mb-1" @clicked="score(25)" />
            </div>
            <!--            if="variant === 'whatyoucan'"-->
            <donation-button v-else link="paypal1510" @clicked="score(5)" />
            <p class="mt-2">
              <!-- eslint-disable-next-line -->
              Anything you can give is very welcome. You can find other ways to donate (e.g. bank transfer or cheque) <nuxt-link to="/donate">here</nuxt-link>.
            </p>
            <p v-if="groupid && !targetMet" class="text-muted small mt-1">
              This will contribute to the general fund for the ongoing support of Freegle.  If we raise more than the
              target, we'll use it to support other communities.
            </p>
            <div v-if="variant === 'whatyoucanrunning'" class="w-100 d-flex justify-content-center">
              <img src="/running.gif" alt="Keep freegle running" class="d-block d-sm-none img-fluid " width="200">
            </div>
          </div>
          <DonationThermometer ref="thermo" :groupid="groupid" />
        </div>
      </template>
      <template slot="modal-footer" slot-scope="{ cancel }">
        <b-button variant="primary" @click="cancel">
          Close
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import NoticeMessage from '@/components/NoticeMessage'
import DonationThermometer from './DonationThermometer'
import DonationButton from './DonationButton'

export default {
  components: {
    NoticeMessage,
    DonationThermometer,
    DonationButton
  },
  props: {
    groupid: {
      type: Number,
      required: false,
      default: null
    }
  },
  data: function() {
    return {
      showModal: false,
      variant: null
    }
  },
  computed: {
    groupname() {
      if (this.groupid && !this.targetMet) {
        const group = this.$store.getters['group/get'](this.groupid)

        if (group) {
          return group.namedisplay
        }
      }

      return 'Freegle'
    },
    target() {
      return this.$store.getters['donations/target']
    },
    raised() {
      return this.$store.getters['donations/raised']
    },
    targetMet() {
      // Have we met our per group target?  If so then we'll do a global donation appeal.
      return this.groupid && this.raised > this.target
    }
  },
  async mounted() {
    if (this.groupid) {
      await this.$store.dispatch('group/fetch', {
        id: this.groupid
      })
    }
  },
  methods: {
    async show(type) {
      // We need to decide which variant of donation ask to show.
      this.variant = 'buttons1'

      try {
        const variant = await this.$api.bandit.choose({
          uid: 'donation'
        })

        if (variant) {
          this.variant = variant.variant
        }
      } catch (e) {
        console.error('Get variant failed')
      }

      this.showModal = true

      // Record the show
      this.$api.bandit.shown({
        uid: 'donation',
        variant: this.variant
      })
    },

    hide() {
      this.showModal = false
    },

    score(value) {
      this.$api.bandit.chosen({
        uid: 'donation',
        variant: this.variant,
        score: value
      })
    }
  }
}
</script>
