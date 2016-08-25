(function() {
  window.addEventListener('DOMContentLoaded', function () {
    var ABOUT = Vue.extend({
      template: '#about'
    });
    
    var STATS = Vue.extend({
      template: '#stats',
      data: function() {
        return {
          numkeys: 0,
          memusage: 0
        };
      },
      ready: function() {
        this.fetchStats();
      },
      methods: {
        fetchStats: function() {
          var socket = io();
          var _this = this;
          socket.on('update', function(data) {
            _this.$set('numkeys', data.keys);
            _this.$set('memusage', data.memory);
          });
        }
      }
    });

    var INGREDIENTS = Vue.extend({
      template: '#ingredients'
    });

    var app = Vue.extend({});
    var router = new VueRouter();

    router.map({
      '/': {
          component: ABOUT
      },
      '/stats': {
          component: STATS
      },
      '/ingredients': {
          component: INGREDIENTS
      }
    });

    router.start(app, '#cacheservice');
  });
}());
