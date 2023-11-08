<script setup lang="ts">
import { ref } from 'vue';
import InputField from './components/base/InputField.vue';
import { Config } from './config'

const step = ref(0)
const loadingText = ref('')
const previousStep = () => step.value--;
const nextStep = () => {
  if(!validateInput()){
    showErrors.value = true
    return
  }
  showErrors.value = false
  if(step.value === 3){
    submitData()
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
    if(data.feature_website === false && data.feature_mobileapp === false){
      alert('Atleast one of the following features must be selected:\n- Website\n- Mobile App')
      return false
    }
  }else if(s === 1){
    return validateProps(['business_name', 'domain_name'])
  }else if(s === 2){
    const matches = data.account_password === data.account_repeat_password
    passwordsError.value = !matches
    return (
      validateProps(['account_first_name', 'account_last_name', 'account_email', 'account_password', 'account_repeat_password'])
      && matches
    )
  }
  return true
}
function validateProps(props: (keyof typeof data)[]){
  for(let p of props){
    if((data[p] ?? '').toString().trim().length === 0){
      return false
    }
  }
  return true
}

const showErrors = ref(false)
const passwordsError = ref(false)

const data = {
  feature_desktop_pos: true,
  feature_website: true,
  feature_mobileapp: true,
  business_name: '',
  domain_name: '',
  account_first_name: '',
  account_last_name: '',
  account_email: '',
  account_phone: '',
  account_password: '',
  account_repeat_password: ''
}
const web_data = ref({
  domain_name: 'indial-curry.co.uk',
  serverIP: '154.22.78.163'
})

async function submitData() {
  try {
    loadingText.value = 'Please wait while we are preparing your platform...'
    const response = await fetch(
    `${Config.API_URL}/register-client`,
      {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    )
    if(response.status !== 200) throw new Error(response.statusText)
    const responseData = await response.json()
    web_data.value = responseData
    step.value++
  } catch (error) {
    console.error(error)
    alert('An error occured, Please try again.')
  }
  loadingText.value = ''
}

async function checkDomainConfiguration(){
  try {
    loadingText.value = 'Checking your domain configuration...'
    const response1 = await fetch(`${Config.API_URL}/helpers/resolve-host-ips?host=${web_data.value.domain_name}`)
    if(response1.status !== 200) throw new Error(response1.statusText)
    const responseData1 = await response1.json()
    console.log(responseData1)
    const response2 = await fetch(`${Config.API_URL}/helpers/resolve-host-ips?host=backend.${web_data.value.domain_name}`)
    if(response2.status !== 200) throw new Error(response2.statusText)
    const responseData2 = await response2.json()
    console.log(responseData2)
    if(
      !responseData1.result.includes(web_data.value.serverIP) ||
      !responseData2.result.includes(web_data.value.serverIP)
    ){
      alert('Your domain is not pointing to the specified ip address, If you already made changes to the dns wait a few minutes and click "Verify" button again.')
    }else{
      step.value++
    }
  } catch (error) {
    console.error(error)
    alert('An error occured, Please try again.')
  }
  loadingText.value = ''
}
</script>

<template>
  <main>
    <div class="form-wrapper">
      <form class="ui form">

        <div v-if="step == 0" class="features">
          <h2>Select features</h2>
          <p>
            Please select features you want to use:
          </p>

          <div class="feature-box">
            <div class="ui checked read-only checkbox">
              <input type="checkbox" checked="false" disabled>
              <label>POS Application</label>
            </div>
          </div>
          <div class="feature-box">
            <div class="ui checked checkbox">
              <input type="checkbox" v-model="data.feature_website">
              <label>Website (Online ordering)</label>
            </div>
          </div>
          <div class="feature-box">
            <div class="ui checked checkbox">
              <input type="checkbox" v-model="data.feature_mobileapp">
              <label>Mobile App</label>
            </div>
          </div>

        </div>

        <div v-if="step == 1" class="business-info">
          <h2>Business Information</h2>
          <InputField
            v-model="data.business_name"
            name="business_name"
            label="Business Name"
            placeholder="My Restaurant"
            :emptyError="showErrors"
          />
          <InputField
            v-model="data.domain_name"
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
            <InputField :emptyError="showErrors" v-model="data.account_first_name" name="first_name" label="First Name" />
            <InputField :emptyError="showErrors" v-model="data.account_last_name" name="last_name" label="Last Name" />
          </div>
          <InputField :emptyError="showErrors" v-model="data.account_phone" name="phone_number" label="Phone Number" />
          <InputField :emptyError="showErrors" v-model="data.account_email" name="email" label="Email Address" />
          <InputField :emptyError="showErrors" v-model="data.account_password" type="password" name="password" label="Password" :errorMessage="passwordsError ? 'Passwords does not match' : ''" />
          <InputField :emptyError="showErrors" v-model="data.account_repeat_password" type="password" name="repeat_password" label="Repeat Password" :errorMessage="passwordsError ? 'Passwords does not match' : ''" />
        </div>

        <div v-if="step == 3" class="card-verification">
          <h2>Credit/Debit Card Verification</h2>
          <p>
            We need your card information to verify your identity.
          </p>
          <br>
          <br>
          <br>
          <br>
        </div>

        <div v-if="step == 4" class="dns-config">
          <h2>Website Configuration</h2>
          <p>
            You need to update DNS Settings of your domain <b>{{ web_data.domain_name }}</b>
            <br>
          </p>
          <p>
            <h4>Navigate to the DNS settings and perform the following:</h4>
            <ul style="padding-left: 25px;">
              <li>
                Add <b>A</b> record <b>{{ web_data.domain_name }}</b> pointing to <b>{{ web_data.serverIP }}</b>
              </li>
              <li>
                Add <b>A</b> record <b>backend.{{ web_data.domain_name }}</b> pointing to <b>{{ web_data.serverIP }}</b>
              </li>
            </ul>
          </p>
          <p>
            After completing the configuration press the "Verify" button.
            * Please keep in mind that dns settings may take up to 1 hour to take effect.
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
            Use the email and password you've entered in the previous steps to login.
          </p>
        </div>

        <br>

        <button v-if="step > 0 && step < 4" @click="previousStep" class="s-button" style="margin-right: 1rem" type="button">Back</button>
        <button v-if="step < 5" @click="nextStep" class="p-button" type="button">
          {{  step === 4 ? 'Verify' : 'Next' }}
        </button>

      </form>
      <div class="ui inverted dimmer" :class="{ active: !!loadingText }">
        <div class="ui indeterminate text loader">{{ loadingText }}</div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.form-wrapper{
  width: 500px;
  padding: 2rem;
  border: 2px solid #ebeef1;
  background: #fff;
}
</style>

