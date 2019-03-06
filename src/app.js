const auth = new Vue({
    el: '#app',
    data() {
        return {
            mail             : '',
            pass             : '',
            grecapthca       : '',
            error            : '',
            logged           : false,
            captcha_solved   : false,
            min_email_entered: false,
            pass_entered     : false
        }
    },
    computed: {
        valid() {
            return !this.captcha_solved || !this.min_email_entered || !this.pass_entered;
        }
    },
    mounted() {
        this.$nextTick(function() {
            document.title = this.logged ? 'Data analysis graphs' : 'Autharization';
        })
    },
    updated() {
        this.min_email_entered = this.mail.length > 1 && this.mail.indexOf('@') !== -1;
        this.pass_entered      = this.pass.length > 3;
    },
    methods: {
        axiosLogin(url, data) {
            const _this = this;
            axios({
                method: 'post',
                url: url,
                data: Qs.stringify(data),
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                }
            })
            .then((response) => {
                if (response.data.success) {
                    // Process to table page
                    _this.logged = true;
                    csrf         = response.data.csrftoken;
                    table.$set(table, 'logged', true);
                } else {
                    // Get table of errors
                    error_handler(_this, response.data.error.data[0]);
                }
            })
            .catch((response) => {
                console.log(response);
            });
        },

        postLogin() {
            const url = 'https://api-v1-temp-9527.nakitcoins.com/nw/auth/login';
            const data = { 
                'email': this.mail,
                'password': this.pass,
                'g-recaptcha-response': this.grecapthca
            }

            this.axiosLogin(url, data);
        }
    }
});
