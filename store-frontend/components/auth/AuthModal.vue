<template>
  <vs-dialog v-model="isOpen" ref="dialog" width='400px' :auto-width="false">
    <template #header>
      <h4 class="not-margin">
        {{ registerMode ? "Create New Account" : "Login to your account" }}
      </h4>
    </template>
    <vs-alert v-if="message" :color="message.color">
        <template v-if="message.title" #title>{{ message.title }}</template>
        {{ message.text }}
    </vs-alert>
    <div class="con-form">
      <template v-if="registerMode">
        <vs-input v-model="registerForm.fullname" placeholder="Full Name" :disabled="loading">
          <template #icon> <i class="bx bxs-user"></i> </template>
        </vs-input>
        <vs-input v-model="registerForm.email" placeholder="Email" :disabled="loading">
          <template #icon> @ </template>
        </vs-input>
        <vs-input v-model="registerForm.phone" placeholder="Phone number" :disabled="loading">
          <template #icon> <i class="bx bxs-phone"></i> </template>
        </vs-input>
        <vs-input
          type="password"
          v-model="registerForm.password"
          placeholder="Password"
          :disabled="loading"
        >
          <template #icon>
            <i class="bx bxs-lock"></i>
          </template>
        </vs-input>
        <vs-input
          type="password"
          v-model="registerForm.passwordConfirmation"
          placeholder="Confirm Password"
          :disabled="loading"
        >
          <template #icon>
            <i class="bx bxs-lock"></i>
          </template>
        </vs-input>
      </template>
      <template v-else>

        <vs-input v-model="loginForm.identifier" placeholder="Email" :disabled="loading">
          <template #icon> @ </template>
        </vs-input>

        <vs-input
          type="password"
          v-model="loginForm.password"
          placeholder="Password"
          :disabled="loading"
        >
          <template #icon>
            <i class="bx bxs-lock"></i>
          </template>
        </vs-input>

        <div class="flex">
          <!-- <vs-checkbox v-model="remember">Remember me</vs-checkbox> -->
          <div></div>
          <a href="#">Forgot Password?</a>
        </div>
      </template>
    </div>

    <template #footer>
      <div class="footer-dialog">
        <vs-button @click="submitClick" :loading="loading" block>
          {{ registerMode ? "Sign Up" : "Sign In" }}
        </vs-button>

        <div class="new">
          <template v-if="registerMode">
            Already have an account?
            <a class="nhra" @click="mode = 'login'">Sign In</a>
          </template>
          <template v-else>
            New Here?
            <a class="nhra" @click="mode = 'register'">Create New Account</a>
          </template>
        </div>
      </div>
    </template>
  </vs-dialog>
</template>

<script>
export default {
  data: () => ({
    isOpen: false,
    mode: "register", // login or register
    loading: false,
    loginForm: {},
    registerForm: {},
    remember: false,
    message: null,
    // message: {
    //     color: 'warning',
    //     title: 'Login failed',
    //     text: 'Please check your email address and password!',
    // },
  }),
  computed: {
    registerMode() {
      return this.mode == "register";
    },
  },
  methods: {
    open(mode) {
      this.mode = mode;
      this.clearForms();
      this.message = null;
      this.loading = false;
      this.isOpen = true;
      this.$nextTick(() => {
          const diel = this.$refs.dialog.$el;
          diel && diel.classList.add('auth-modal');
      });
    },
    clearForms() {
      this.loginForm = {
        identifier: "",
        password: "",
      };
      this.registerForm = {
        email: "",
        password: "",
        passwordConfirmation: "",
        fullname: "",
        username: "",
        phone: "",
      };
    },
    showMessage(color, text, title){
        this.message = {
            color,
            title,
            text
        }
    },
    async submitClick(){
        this.message = null;
        this.loading = true;
        try {
            if(this.registerMode){
                await this.register();
            }else{
                await this.login();
            }
            this.isOpen = false;
        } catch (error) {
            this.showMessage('danger', error.message);
        }
        this.loading = false;
    },
    register(){
        const { password, passwordConfirmation, email, phone } = this.registerForm;
        if(password !== passwordConfirmation){
            throw new Error('Passwords doesn\'t match');
        }
        if(phone.length < 10){
          throw new Error('Please provide a valid phone number');
        }
        this.registerForm.username = email;
        return this.$authService.registerUser(this.registerForm);
    },
    login(){
        return this.$authService.loginUser(this.loginForm);
    }
  },
  mounted() {
    window.openAuthModal = (mode) => this.open(mode);
  },
};
</script>

<style lang="scss">
.auth-modal {
  .nhra {
    cursor: pointer;
    text-decoration: underline;
  }
  .not-margin {
    margin: 0px;
    font-weight: normal;
    padding: 10px;
  }
  .con-form {
    width: 100%;
  }
  .flex {
    display: flex;
    align-items: center;
    justify-content: space-between;
    a {
      font-size: 0.8rem;
      opacity: 0.7;
      &:hover {
        opacity: 1;
      }
    }
  }
  .vs-checkbox-label {
    font-size: 0.8rem;
  }
  .vs-input-content {
    margin: 10px 0px;
    width: calc(100%);
    .vs-input {
      width: 100%;
    }
  }
  .footer-dialog {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: calc(100%);
  }
  .new {
    margin: 0px;
    margin-top: 20px;
    padding: 0px;
    font-size: 0.7rem;
  }
  .new a {
    color: rgba(var(--vs-primary), 1) !important;
    margin-left: 6px;
  }
  .new a:hover {
    text-decoration: underline;
  }
  .vs-button {
    margin: 0px;
  }
}
</style>