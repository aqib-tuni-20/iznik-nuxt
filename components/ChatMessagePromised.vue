<template>
  <div>
    <b-row class="pb-1">
      <b-col>
        <div v-if="chatmessage.userid != myid" class="media">
          <b-card border-variant="success">
            <b-card-title>
              <b-img
                v-if="refmsg && refmsg.attachments && refmsg.attachments.length > 0"
                class="float-right ml-1"
                rounded
                thumbnail
                generator-unable-to-provide-required-alt=""
                lazy
                :src="refmsg.attachments[0].paththumb"
                width="70px"
                @error="brokenImage"
              />
              <ProfileImage :image="otheruser.profile.turl" class="mr-1 mb-1 mt-1 inline" is-thumbnail size="sm" />
              <span class="small black">Good news! You've been promised this:</span>
              <br>
              <h4>
                {{ refmsg.subject }}
              </h4>
              <AddToCalendar v-if="tryst" :ics="tryst.ics" class="mr-2" />
            </b-card-title>
            <b-card-text>
              <div :class="emessage ? 'media-body chatMessage' : 'media-body'">
                <span>
                  <span v-if="(chatmessage.secondsago < 60) || (chatmessage.id > chat.lastmsgseen)" class="prewrap font-weight-bold">{{ emessage }}</span>
                  <span v-else class="preline forcebreak">{{ emessage }}</span>
                  <b-img v-if="chatmessage.image" fluid :src="chatmessage.image.path" lazy rounded />
                </span>
              </div>
            </b-card-text>
          </b-card>
        </div>
        <div v-else class="media float-right">
          <b-card border-variant="success">
            <b-card-title>
              <b-img
                v-if="refmsg && refmsg.attachments && refmsg.attachments.length > 0"
                class="float-right"
                rounded
                thumbnail
                generator-unable-to-provide-required-alt=""
                lazy
                :src="refmsg.attachments[0].paththumb"
                width="70px"
                @error="brokenImage"
              />
              <ProfileImage :image="me.profile.turl" class="mr-1 mb-1 mt-1 inline" is-thumbnail size="sm" />
              <span class="small black">You promised <strong>{{ otheruser.displayname }}</strong>:</span>
              <br>
              <h4>
                {{ refmsg.subject }}
              </h4>
              <p v-if="trystdate" class="small text-info">
                Handover arranged for <strong>{{ trystdate }}</strong>
              </p>
              <div class="d-flex mt-1 mb-1">
                <AddToCalendar v-if="tryst" :ics="tryst.ics" class="mr-2" />
                <b-btn v-if="refmsg.promisecount && !hasOutcome" variant="warning" class="align-middle" @click="unpromise">
                  <v-icon>
                    <v-icon name="handshake" />
                    <v-icon
                      name="slash"
                      class="unpromise__slash"
                    />
                  </v-icon>
                  Unpromise
                </b-btn>
              </div>
            </b-card-title>
            <b-card-text>
              <div :class="emessage ? 'media-body chatMessage' : 'media-body'">
                <span>
                  <span v-if="(chatmessage.secondsago < 60) || (chatmessage.id > chat.lastmsgseen)" class="prewrap font-weight-bold">{{ emessage }}</span>
                  <span v-else class="preline forcebreak">{{ emessage }}</span>
                  <b-img v-if="chatmessage.image" fluid :src="chatmessage.image.path" lazy rounded />
                </span>
              </div>
            </b-card-text>
          </b-card>
        </div>
      </b-col>
    </b-row>
    <RenegeModal ref="renege" :messages="[ refmsg ]" :selected-message="refmsg.id" :users="[otheruser ]" :selected-user="otheruser.id" />
  </div>
</template>

<script>
import AddToCalendar from '@/components/AddToCalendar'
import ChatBase from '~/components/ChatBase'
import ProfileImage from '~/components/ProfileImage'
const RenegeModal = () => import('./RenegeModal')

export default {
  components: {
    AddToCalendar,
    ProfileImage,
    RenegeModal
  },
  extends: ChatBase,
  computed: {
    hasOutcome() {
      return this.refmsg && this.refmsg.outcomes && this.refmsg.outcomes.length
    },
    tryst() {
      return this.otheruser
        ? this.$store.getters['tryst/getByUser'](this.otheruser.id)
        : null
    },
    trystdate() {
      return this.tryst
        ? this.$dayjs(this.tryst.arrangedfor).format('dddd Do HH:mm a')
        : null
    }
  },
  methods: {
    unpromise() {
      this.$refs.renege.show()
    }
  }
}
</script>

<style scoped lang="scss">
@import 'color-vars';

.unpromise__slash {
  transform: rotate(180deg);
  color: $color-red;
}
</style>
