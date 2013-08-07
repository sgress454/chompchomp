Mast.data.TileModel = Mast.Model.extend({

	defaults: function() {
		return {
			player: null,
			x: null,
			y: null,
			tileNum: null,
			availability: 0,
			selected: false,
			highlighted: false,
			onTopEdge: false,
			onLeftEdge: false,
			onRightEdge: false,
			onBottomEdge: false
		};
	}

});

Mast.data.TileModel.NOT_AVAILABLE = 0;
Mast.data.TileModel.AVAILABLE_FOR_CLONING = 1;
Mast.data.TileModel.AVAILABLE_FOR_JUMPING = 2;


Mast.data.TileCollection = Mast.Collection.extend({
	model: Mast.data.TileModel,
	getAdjacentTile: function(tileModel, direction) {

		var tileNum = tileModel.get('tileNum');

		if (direction == 'n') {
			if (!tileModel.get('onTopEdge')) {
				return this.models[tileNum - Mast.data.boardWidth];
			} else {
				return null;
			}
		}

		else if (direction == 'nw') {
			if (!tileModel.get('onTopEdge') && !tileModel.get('onLeftEdge')) {
				return this.models[tileNum - (Mast.data.boardWidth + 1)];
			} else {
				return null;
			}
		}

		else if (direction == 'ne') {
			if (!tileModel.get('onTopEdge') && !tileModel.get('onRightEdge')) {
				return this.models[tileNum - (Mast.data.boardWidth - 1)];
			} else {
				return null;
			}
		}

		else if (direction == 'w') {
			if (!tileModel.get('onLeftEdge')) {
				return this.models[tileNum - 1];
			} else {
				return null;
			}
		}

		else if (direction == 'e') {
			if (!tileModel.get('onRightEdge')) {
				return this.models[tileNum + 1];
			} else {
				return null;
			}
		}

		else if (direction == 'sw') {
			if (!tileModel.get('onLeftEdge') && !tileModel.get('onBottomEdge')) {
				return this.models[tileNum + Mast.data.boardWidth - 1];
			} else {
				return null;
			}
		}

		else if (direction == 's') {
			if (!tileModel.get('onBottomEdge')) {
				return this.models[tileNum + Mast.data.boardWidth];
			} else {
				return null;
			}
		}

		else if (direction == 'se') {
			if (!tileModel.get('onRightEdge') && !tileModel.get('onBottomEdge')) {
				return this.models[tileNum + Mast.data.boardWidth +1];
			} else {
				return null;
			}
		}

		return null;
	},

	getAdjacentTiles: function(tileModel, blankOnly) {

		var tileNum = tileModel.get('tileNum');
		var adjacentTiles = {};

		_.each(['nw','n','ne','w','e','sw','s','se'], function(direction) {
			var tile = this.getAdjacentTile(tileModel, direction);
			if (tile && (!blankOnly || tile.get('player') === null)) {
				adjacentTiles[direction] = tile;
			}
		}, this);

		return adjacentTiles;


		// if (!tileModel.get('onTopEdge')) {
		// 	adjacentTiles['n'] = this.models[tileNum - Mast.data.boardWidth];
		// 	if (!tileModel.get('onLeftEdge')) {
		// 		adjacentTiles['nw'] = this.models[tileNum - (Mast.data.boardWidth + 1)]; // NW
		// 	}
		// 	if (!tileModel.get('onRightEdge')) {
		// 		adjacentTiles['ne'] = this.models[tileNum - (Mast.data.boardWidth - 1)]; // NE
		// 	}
		// }

		// if (!tileModel.get('onLeftEdge')) {
		// 	adjacentTiles['w'] = this.models[tileNum - 1]; // W
		// 	if (!tileModel.get('onBottomEdge')) {
		// 		adjacentTiles['sw'] = this.models[tileNum + Mast.data.boardWidth - 1]; // SW
		// 	}
		// }

		// if (!tileModel.get('onRightEdge')) {
		// 	adjacentTiles['e'] = this.models[tileNum + 1]; // E
		// 	if (!tileModel.get('onBottomEdge')) {
		// 		adjacentTiles['se'] = this.models[tileNum + Mast.data.boardWidth + 1]; // SE
		// 	}
		// }

		// if (!tileModel.get('onBottomEdge')) {
		// 	adjacentTiles['s'] = this.models[tileNum + Mast.data.boardWidth]; // S
		// }

		// return adjacentTiles;
	}
});