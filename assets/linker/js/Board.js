Mast.define('Board', function () {
	return {

		'%nextTurn': function () {

			$('.tile').removeClass('owned');
			if (Mast.data.game.get('currentPlayer') > -1 && Mast.data.game.get('players')[Mast.data.game.get('currentPlayer')].id == Mast.data.user.id) {
				$('.tile[data-player='+Mast.data.game.get('currentPlayer')+']').addClass('owned');
			}

		},

		afterRender: function () {

			this.$el.css({
				width: (Mast.data.boardWidth * Mast.data.tileSize) + 'px',
				height: (Mast.data.boardWidth * Mast.data.tileSize) + 'px',
				marginLeft: 0 - (Math.round((Mast.data.boardWidth * Mast.data.tileSize) / 2)) + 'px',
				marginTop: 0 - (Math.round((Mast.data.boardHeight * Mast.data.tileSize) / 2)) + 'px'
			});
			this.collection = new Mast.data.TileCollection();

			Mast.data.board = this;

			var tileNum = 0;
			for (var y = 0; y < Mast.data.boardHeight; y++) {
				for (var x = 0; x < Mast.data.boardWidth; x++) {
					var tile = new Mast.data.TileModel({
						x:x,
						y:y,
						tileNum: tileNum++,
						onTopEdge: y === 0,
						onLeftEdge: x === 0,
						onRightEdge: x == (Mast.data.boardWidth - 1),
						onBottomEdge: y == (Mast.data.boardHeight -1)
					});
					this.tiles.append('Tile',{model:tile});
					tile.on('change:selected', this.changeSelectedTile);
					this.collection.add(tile);
				}
			}

		},

		changeSelectedTile: function(tile, value) {

			// Turn off all tile indicators
			this.collection.each(function(tile) {tile.set('highlighted', false);});

			if (value === true) {

				// Turn off the currently selected tile
				var selectedTiles = _.without(this.collection.where({selected:true}), tile);
				if (selectedTiles.length) {
					selectedTiles[0].set({selected:false});
				}

			}

		}

	};
});
