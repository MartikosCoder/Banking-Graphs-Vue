const viewer_stats = {
    props: {
        itemid       : Number,
        itemmode     : String,
        view_mode    : Boolean,
        search_params: Object
    },
    data() {
        return {
            data         : null,
            dataset      : null,
            dates        : null,
            option       : null,
            chart        : null,
            interval     : null,
            id           : this.itemid,
            mode         : this.itemmode,
            graph_view   : this.view_mode,
            graph_view_id: 'graph-view-' + this.itemid,
            titles       : ['System Fiat', 'System Crypto', 'Trade Fiat', 'Trade Crypto'],
            live         : 'live',
            lastId       : 0
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
                method: 'post',
                url: 'https://api-v1-temp-9527.nakitcoins.com/nw/tonymontana/show-balance-stats',
                data: data,
                withCredentials: true
            })
                .then((response) => {
                    if (response.data.success) {
                        csrf = response.data.csrftoken;

                        const givenData = data.idFrom ? response.data.result.data[0] : response.data.result.data;
                        _this.$set(_this, 'data', givenData);

                        const array = _this.data[0];
                        const givenDates = _this.uniqueTable(array.map(elem => elem.dateFrom)).reverse();
                        _this.$set(_this, 'dates', givenDates);

                        _this.$set(_this, 'dataset', []);

                        _this.dates.forEach(date => {
                            const objs      = array.filter(obj => obj.dateFrom === date);
                            const finder    = (objs, prop) => objs.find(obj => obj.typeTxt === prop);
                            const available = finder(objs, 'available') ? finder(objs, 'available').value : '-';
                            const confirmed = finder(objs, 'confirmed') ? finder(objs, 'confirmed').value : '-';

                            _this.dataset.push([date, available, confirmed]);
                        });

                        _this.$set(_this, 'dataset', _this.dataset);

                        _this.option = {
                            title: {
                                text: _this.titles[_this.id]
                            },
                            tooltip: {
                                trigger: 'axis'
                            },
                            dataset: {
                                source: [
                                    ['time', 'Available', 'Confirmed'],
                                    ..._this.dataset
                                ]
                            },
                            legend: {
                                data: ['Available', 'Confirmed']
                            },
                            xAxis: {
                                type: 'category',
                            },
                            yAxis: {},
                            series: [
                                {
                                    type: 'line'
                                },
                                {
                                    type: 'line'
                                },
                            ]
                        };
                        const array_last = array[array.length - 1].id;
                        _this.$set(_this, 'lastId', array_last);
                        if (document.querySelector('#graph-view-' + this.id)) {
                            if(_this.chart){
                                _this.initGraph();
                            } else {
                                _this.chart.hideLoading();
                                _this.chart.setOption(_this.option);
                            }
                        } else {

                        }
                    } else {
                        error_handler(_this, response.data.error.data[0]);
                    }
                })
        },

        switchScene() {
            if (this.graph_view) {
                this.destroyGraph();
                this.mode = 'graph';
                this.graph_view = false;
            } else {
                this.mode = 'table';
                this.graph_view = true;
                setTimeout(() => this.initGraph(), 100);
            }
        },

        destroyGraph() {
            this.chart = echarts.dispose(document.querySelector('#graph-view-' + this.id));
        },

        initGraph() {
            this.chart = echarts.init(document.querySelector('#graph-view-' + this.id));
            this.chart.hideLoading();
            this.chart.setOption(this.option);
        },

        sendAjax(body) {
            this.axiosTable({
                "type": "system",
                "body": body,
                "csrftoken": csrf
            })
        },

        switchLive() {
            if(this.live === 'live'){
                this.live = 'static';

                this.sendAjax({
                    "orderBy": "id",
                    "desc": true,
                    "rpp": 3000,
                    "currencies": this.search_params.currencies,
                    "srcs": this.search_params.srcs,
                    "page": 1,
                    "idFrom": this.lastId
                });
                this.interval = setInterval(() => {
                    this.sendAjax({
                        "orderBy": "id",
                        "desc": true,
                        "rpp": 3000,
                        "currencies": this.search_params.currencies,
                        "srcs": this.search_params.srcs,
                        "page": 1,
                        "idFrom": this.lastId
                    });
                }, 3000);
            } else {
                this.live = 'live';
                clearInterval(this.interval);
            }
        }
    },
    mounted() {
        this.chart = echarts.init(document.querySelector('#graph-view-' + this.id));
        this.chart.showLoading();
        this.sendAjax({
            "orderBy": "id",
            "desc": true,
            "rpp": 3000,
            "currencies": this.search_params.currencies,
            "srcs": this.search_params.srcs,
            "page": 1
        });
    },
    template: `<div class="container" :id="id">
                <div class="btn-group">
                <button class="switcher btn btn-outline-dark" @click="switchScene">
                    {{ mode }}
                </button>
                <button class="switcher btn btn-outline-dark" @click="switchLive">
                    {{ live }}
                </button>
                </div>
                <div v-if="graph_view" :id="graph_view_id" class="graph-view"></div>
                <div v-else class="table-view">
                    <div class="table-view-wrapper">
                        <table class="table table-bordered">
                            <thead class="thead-dark">
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Date</th>
                                    <th scope="col">Available</th>
                                    <th scope="col">Confirmed</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(obj, index) in dataset">
                                    <th scope="row">{{ index }}</th>
                                    <td v-for="components in obj">
                                        {{ components }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>`
};