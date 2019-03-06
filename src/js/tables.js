const table = new Vue({
    el: '#tables-app',
    data() {
        return {
            error     : '',
            logged    : false,
            graph_view: true,
            mode      : 'table'
        }
    },
    components: {
        'viewer': viewer_stats,
        'transfer': viewer_transfer
    },
    updated() {
        document.title = 'Data analysis';
    }
});