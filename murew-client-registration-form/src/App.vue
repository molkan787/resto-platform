<script setup lang="ts">
import { ref } from 'vue';
import InputField from './components/base/InputField.vue';
import { Config } from './config'
import { getQueryVariable } from './helpers'

const step = ref(-1)
const loadingText = ref('Loading...')
const previousStep = () => step.value--;
const nextStep = () => {
  if(!validateInput()){
    showErrors.value = true
    return
  }
  showErrors.value = false
  if(step.value === 2){
    submitApplication()
    return
  }else if(step.value === 3){
    submitIdentityVerification()
    return
  }else if(step.value === 4){
    checkDomainConfiguration()
    return
  }
  step.value++;
}

function validateInput(){
  // return true
  const s = step.value
  if(s === 0){
    if(data.value.feature_website === false && data.value.feature_mobileapp === false){
      alert('Atleast one of the following features must be selected:\n- Website\n- Mobile App')
      return false
    }
  }else if(s === 1){
    return validateProps(['business_name', 'domain_name'])
  }else if(s === 2){
    const matches = data.value.account_password === data.value.account_repeat_password
    passwordsError.value = !matches
    return (
      validateProps(['account_first_name', 'account_last_name', 'account_email', 'account_password', 'account_repeat_password'])
      && matches
    )
  }
  return true
}
function validateProps(props: (keyof typeof data.value)[]){
  for(let p of props){
    if((data.value[p] ?? '').toString().trim().length === 0){
      return false
    }
  }
  return true
}

const showErrors = ref(false)
const passwordsError = ref(false)

const currentApplicationId = ref('')
const data = ref({
  feature_desktop_pos: true,
  feature_website: true,
  feature_mobileapp: true,
  business_name: '',
  domain_name: '',
  payment_model: 'monthly_fee',
  account_first_name: '',
  account_last_name: '',
  account_email: '',
  account_phone: '',
  account_password: '',
  account_repeat_password: ''
})
const web_data = ref({
  domain_name: 'restaurant.com',
  serverIP: '1.1.1.1'
})

async function submitApplication() {
  try {
    loadingText.value = 'Please wait...'
    const data4Send = <any>Object.assign({}, data.value)
    delete data4Send.account_repeat_password
    const response = await fetch(
    `${Config.API_URL}/vendor-signup-applications/create-application`,
      {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(data4Send)
      }
    )
    if(response.status !== 200) throw new Error(response.statusText)
    const { error, id } = await response.json()
    if(error){
      if(typeof error === 'string'){
        alert(error)
      }else{
        alert(error.details[0].message)
      }
    }else{
      setApplicationId(id)
    }
  } catch (error) {
    console.error(error)
    alert('An error occured, Please try again.')
  }
  loadingText.value = ''
}

function setApplicationId(id: string){
  window.top?.postMessage({ applicationId: id })
  // const search = (window.location.search.length > 0 ? '&' : '?') + `aid=${id}`
  // window.location.replace(window.location.href + search)
}

async function submitIdentityVerification(){
  try {
    loadingText.value = 'Please wait...'
    const response = await fetch(`${Config.API_URL}/vendor-signup-applications/verify-identity/${currentApplicationId.value}`, { method: 'POST' })
    const responseData = await response.json() 
    setStepFromStatus(responseData.status)
  } catch (error) {
    console.error(error)
    alert('An error occured, Please try again.')
  }
  loadingText.value = ''
}

async function checkDomainConfiguration(){
  try {
    loadingText.value = 'Checking your domain configuration...'
    const response = await fetch(`${Config.API_URL}/vendor-signup-applications/verify-dns/${currentApplicationId.value}`, { method: 'POST' })
    if(response.status !== 200) throw new Error(response.statusText)
    const { status: applicationStatus } = await response.json()
    if(applicationStatus === 'awaiting_dns'){
      alert('Your domain is not pointing to the specified ip address, If you already made changes to the dns wait a few minutes and click "Verify" button again.')
    }else{
      setStepFromStatus(applicationStatus)
    }
  } catch (error) {
    console.error(error)
    alert('An error occured, Please try again.')
  }
  loadingText.value = ''
}

async function loadApplication(applicationId: string){
  try {
    const response = await fetch(`${Config.API_URL}/vendor-signup-applications/application-data/${applicationId}`)
    const responseData = await response.json()
    const { status, data: applicationData, cluster } = responseData
    Object.assign(data.value,applicationData)
    web_data.value.domain_name = applicationData.domain_name
    web_data.value.serverIP = cluster.public_ip
    currentApplicationId.value = applicationId
    setStepFromStatus(status)
  } catch (error) {
    alert('An error occured, Please contact support.')
  }
  loadingText.value = ''
}

const status2step: Record<string, number | undefined> = Object.freeze({
  'identity_verification': 3,
  'awaiting_dns': 4,
  'creating_vendor': 4,
  'completed': 5,
})

function setStepFromStatus(status: string){
  const _step = status2step[status]
  if(typeof _step === 'number'){
    step.value = _step
    if(status === 'creating_vendor'){
      setTimeout(() => loadingText.value = 'Please wait while we are preparing your platform...', 1)
      seekCompletedStatus()
    }
  }else{
    alert('An error occured, Please contact support.')
  }
}

async function seekCompletedStatus(){
  while(true){
    const response = await fetch(`${Config.API_URL}/vendor-signup-applications/application-data/${currentApplicationId.value}`)
    const { status } = await response.json()
    if(status === 'completed'){
      setStepFromStatus(status)
      loadingText.value = ''
      break
    }
    await new Promise(r => setTimeout(r, 5000))
  }
}

const queryApplicationId = getQueryVariable('aid')
if(typeof queryApplicationId === 'string' && queryApplicationId.length > 1){
  loadApplication(queryApplicationId)
}else{
  loadingText.value = ''
  step.value = 0
}

const appLink = ref<string | null>(null)
if(queryApplicationId){
  appLink.value = getQueryVariable('appLink') || window.location.href
}

</script>

<template>
  <main>
    <div class="form-wrapper">
      <form class="ui form">

        <div v-if="step == -1" class="initial">
          
        </div>

        <div v-if="step == 0" class="features">
          <h2>Select features</h2>
          <p>
            Please select features you want to use:
          </p>

          <div class="feature-box">
            <div class="ui checked read-only checkbox">
              <input id="ftr_posapp" type="checkbox" checked="false" disabled>
              <label for="ftr_posapp">POS Application</label>
            </div>
          </div>
          <div class="feature-box">
            <div class="ui checked checkbox">
              <input id="ftr_website" type="checkbox" v-model="data.feature_website">
              <label for="ftr_website">Website (Online ordering)</label>
            </div>
          </div>
          <div class="feature-box">
            <div class="ui checked checkbox">
              <input id="ftr_mobileapp" type="checkbox" v-model="data.feature_mobileapp">
              <label for="ftr_mobileapp">Mobile App</label>
            </div>
          </div>

        </div>

        <div v-if="step == 1" class="business-info">
          <h2>Business Information</h2>
          <InputField
            v-model.trim="data.business_name"
            name="business_name"
            label="Business Name"
            placeholder="My Restaurant"
            :emptyError="showErrors"
          />
          <InputField
            v-model.trim="data.domain_name"
            name="domain_name"
            label="Domain Name"
            placeholder="my-restaurant.com"
            description="Enter the domain name you wish to host the website on"
            :emptyError="showErrors"
          />
        </div>

        <div v-if="step == 2" class="admin-account-info">
          <h2>Setup Admin Account</h2>
          <p>
            Used to login into platform's administration panel
          </p>
          <div class="two fields">
            <InputField :emptyError="showErrors" v-model.trim="data.account_first_name" name="first_name" label="First Name" />
            <InputField :emptyError="showErrors" v-model.trim="data.account_last_name" name="last_name" label="Last Name" />
          </div>
          <InputField :emptyError="showErrors" v-model.trim="data.account_phone" name="phone_number" label="Phone Number" />
          <InputField :emptyError="showErrors" v-model.trim="data.account_email" name="email" label="Email Address" />
          <InputField :emptyError="showErrors" v-model="data.account_password" type="password" name="password" label="Password" :errorMessage="passwordsError ? 'Passwords does not match' : ''" />
          <InputField :emptyError="showErrors" v-model="data.account_repeat_password" type="password" name="repeat_password" label="Repeat Password" :errorMessage="passwordsError ? 'Passwords does not match' : ''" />
        </div>

        <div v-if="step == 3" class="payment-model">
          <h2>Payment Model</h2>
          <p>
            Choose how you want to pay fees: <br>
            <div style="height: 4px;"></div>
            <div class="feature-box">
              <div class="ui checkbox">
                <input id="pm_monthly" type="radio" v-model="data.payment_model" value="monthly_fee">
                <label for="pm_monthly">Fixed monthly rate ($36/month subscription)</label>
              </div>
            </div>
            <div class="feature-box">
              <div class="ui checkbox">
                <input id="pm_percent" type="radio" v-model="data.payment_model" value="percentage">
                <label for="pm_percent">Commision Based (5% of orders value)</label>
              </div>
            </div>
            <!-- <div class="feature-box">
              <div class="ui checked checkbox">
                <input type="checkbox" v-model="data.feature_mobileapp">
                <label>Free (No fees)</label>
              </div>
            </div> -->
          </p>
        </div>

        <div v-if="step == 4" class="dns-config">
          <h2>Website Configuration</h2>
          <p>
            You need to update DNS Settings of your domain
            <br>
          </p>
          <p>
            <h4>Navigate to the DNS settings and perform the following actions:</h4>
            <ul style="padding-left: 25px;">
              <li>
                Add <b>A</b> record <b>{{ web_data.domain_name }}</b> pointing to <b>{{ web_data.serverIP }}</b>
              </li>
              <li>
                Add <b>A</b> record <b>backend.{{ web_data.domain_name }}</b> pointing to <b>{{ web_data.serverIP }}</b>
              </li>
            </ul>
          </p>
          <br>
          <p>
            After completing the configuration press the "Verify" button. <br>
            * Please keep in mind that dns settings may take up to 24 hours to take effect, You can come back later and continue the registration.
          </p>
        </div>

        <div v-if="step == 5" class="completed-card">
          <h2>
            Completed
            <i class="green check circle icon"></i>
          </h2>
          <p>
            Your platform is ready, You can access it via: <br>
            <a :href="`http://backend.${web_data.domain_name}`" target="_blank">
              http://backend.{{ web_data.domain_name }}
            </a>
            <br>
            Use email address and password you've entered in previous steps to login.
          </p>
        </div>

        <br>

        <button v-if="step > 0 && step < 3" @click="previousStep" class="s-button" style="margin-right: 1rem" type="button">Back</button>
        <button v-if="step >= 0 && step < 5" @click="nextStep" class="p-button" type="button">
          {{  step === 4 ? 'Verify' : 'Next' }}
        </button>

        <div v-if="appLink && step != 5" class="appLinkSection">
          You can resume your registration anytime using the link below: <br>
          <a :href="appLink" target="_parent">{{ appLink }}</a>
        </div>

      </form>
      <div class="ui inverted dimmer" :class="{ active: !!loadingText }">
        <div class="ui indeterminate text loader">{{ loadingText }}</div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.form-wrapper{
  width: 100%;
  max-width: 500px;
  margin: auto;
  padding: 2rem;
  border: 2px solid #ebeef1;
  background: #fff;
}
.feature-box label{
  cursor: pointer;
  user-select: none;
}
.appLinkSection{
  padding-top: 2rem;
  font-size: 12px;
}
</style>

