let csrf = null;

function recaptchaCallback() {
    auth.$set(auth, 'captcha_solved', true);
    auth.$set(auth, 'grecapthca', window.grecaptcha.getResponse());
};

const error_handler = (parent, request_error) => {
    axios.get('https://cdn.nakitcoins.com/conf/translation_en.json')
        .then((table) => {
            const answers = table.data;
            parent.error = answers[request_error];
        })
        .catch((error) => {
            console.log(error);
        })
}