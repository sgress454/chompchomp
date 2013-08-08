Mast.data.GameModel = Mast.Model.extend({

	url: Mast.data.catamaranServer+'/game',

	defaults: function() {
		return {
			players: [],
			moves: [],
			currentPlayer: -1,
			winner: null
		};
	}

});
