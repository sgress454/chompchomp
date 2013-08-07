Mast.define('App', function () {
	return {

		'%nextTurn': function(){this.updateStats();},

		afterRender: function () {

			Mast.data.app = this;

		},

		updateStats: function() {

			var currentPlayer = Mast.data.game.get('currentPlayer');
			if (currentPlayer == -1) {
				if (Mast.data.game.get('players').length < 2) {
					this.$el.find('.stats .current-player').html('Waiting for opponent to join...');
				} else {
					this.$el.find('.stats .current-player').html('Game over -- '+Mast.data.game.get('players')[Mast.data.game.get('winner')].name+' wins!');
				}
			} else {
				if (Mast.data.game.get('players')[currentPlayer].id == Mast.data.user.id) {
					this.$el.find('.stats .current-player').html("Your turn.");
				} else {
					this.$el.find('.stats .current-player').html(Mast.data.game.get('players')[currentPlayer].name+"&rsquo;s turn.");
				}
			}

		}

	};
});