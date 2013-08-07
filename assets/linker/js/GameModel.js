Mast.data.GameModel = Mast.Model.extend({

	url: '/game',

	defaults: function() {
		return {
			players: [],
			moves: [],
			currentPlayer: -1,
			winner: null
		};
	}

});
