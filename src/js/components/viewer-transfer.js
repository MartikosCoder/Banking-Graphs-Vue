const viewer_transfer = {
    props: {
        search_params: Array,
        action_table: Boolean,
        mode: String
    },
    data() {
        return {
            dataset: null,
            interval: null,
            live: 'live',
            type: this.mode,
            search_template: this.search_params,
            action_template: this.action_table
        }
    },
    methods: {
        uniqueTable(array) {
            const obj = {};

            array.forEach(elem => obj[elem] = true);

            return Object.keys(obj);
        },

        axiosTable(data) {
            const _this = this;
            axios({
                method: 'POST',
                url: 'https://api-v1-temp-9527.nakitcoins.com/nw/tonymontana/show-balance-stats',
                data: data,
                withCredentials: true
            })
                .then((response) => {
                    if (response){
                        if (response.data.success) {
                            csrf = response.data.csrftoken;
                            const data = response.data.result.data[0];

                            data.forEach(data_obj => {
                                const id = data_obj.txIdCode;
                                const from_user = data_obj.fromUserCode;
                                const date = data_obj.dateCreate;
                                const value = data_obj.amount + data_obj.currency;
                                const status = data_obj.txStatus;
                                _this.dataset.push([id, from_user, date, value, status]);
                            });

                            _this.$set(_this, 'dataset', _this.dataset);
                        } else {
                            error_handler(_this, response.data.error.data[0]);
                        }
                    }
                })
                .catch((error) => {
                    console.log(error);
                })
        },

        sendAjax(body) {
            this.axiosTable({
                "type": "wallet",
                "body": body,
                "csrftoken": csrf
            })
        },

        switchLive() {
            if (this.live === 'live') {
                this.live = 'static';

                this.sendAjax({
                    "currency": this.type,
                    "rpp": 10,
                    "txStatuses": this.search_template
                });
                this.interval = setInterval(() => {
                    this.sendAjax({
                        "currency": this.type,
                        "rpp": 10,
                        "txStatuses": this.search_template
                    });
                }, 3000);
            } else {
                this.live = 'live';
                clearInterval(this.interval);
            }
        },

        approveReq(e) {
            const index = e.target.dataset['data-obj'];

            this.sendManual(index);
        },

        sendManual(index) {
            const obj = document.querySelectorAll('[scope*="row"]')[index].nextElementSibling;

            axios({
                method: 'POST',
                url: 'https://api-v1-temp-9527.nakitcoins.com/nw/tonymontana/tonymontana/reject-operation',
                data: {
                    body: {
                        txIdCode: obj.innerHTML
                    }
                },
                withCredentials: true
            }).then(response => {
                if (response) {
                    if (response.data.success) {
                        csrf = response.data.csrftoken;
                        alert(response.data.success === 'success' ? 'Action completed' : 'Action failed');
                    }
                }
            })
        },

        declineReq(e) {
            const index = e.target.dataset['data-obj'];

            this.sendManual(index);
        }
    },
    mounted() {
        this.sendAjax({
            "currency": this.type,
            "rpp": 10,
            "txStatuses": this.search_template
        });
    },
    template: `<div class="container">
                <div class="btn-group">
                <button class="switcher btn btn-outline-dark" @click="switchLive" :disabled="!dataset">
                    {{ live }}
                </button>
                </div>
                <div class="table-view">
                    <div class="table-view-wrapper">
                        <table class="table table-bordered">
                            <thead class="thead-dark">
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">ID</th>
                                    <th scope="col">From</th>
                                    <th scope="col">Date</th>
                                    <th scope="col">Amount</th>
                                    <th scope="col">Status</th>
                                    <th scope="col" v-if="action_template">Action</th>
                                </tr>
                            </thead>
                            <tbody v-if="dataset">
                                <tr v-for="(data_obj, index) in dataset">
                                    <th scope="row">{{ index }}</th>
                                    <th v-for="components in data_obj">
                                        {{ components }}
                                    </th>
                                    <th scope="col" v-if="action_template">
                                        <button @click="approveReq" :data-obj="index" class="btn btn-outline-success">Approve</button>
                                        <button @click="declineReq" :data-obj="index" class="btn btn-outline-danger">Reject</button>
                                    </th>
                                </tr>
                            </tbody>
                            <tbody v-else>
                                <th :colspan='action_template ? 7 : 6'>Data is unavailable.</th>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>`
};