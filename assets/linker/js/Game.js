Mast.define('Game', function () {
	return {

		beforeRender: function(cb) {

			Mast.data.boardWidth = 9;
			Mast.data.boardHeight = 9;
			Mast.data.tileSize = 50;
			cb();

		},

		afterRender: function () {

			// Create the board
			this.board = this.boardRegion.append('Board');

			// Bind click handlers for all the tiles
			this.board.collection.each(function(tile) {
				tile.on('clicked', this.onClickedTile);
			}, this);

			// Set the initial pieces
			this.setupBoard();
			// If the game has moves already, play them out
			_.each(this.model.get('moves'), function(move) {
				this.performMove(move);
			}, this);

			socket.on('message', this.onSocketMessage);

			if (this.model.get('players').length == 2) {
				if (this.model.get('currentPlayer') == -1) {
					this.nextTurn(true);
				}
				Mast.trigger('%nextTurn');
			}
		},

		onSocketMessage: function(message) {
			if (message.model == "game") {
				// Has a player joined?
				if (this.model.get('players').length < 2 && message.data.players.length == 2) {
					this.model.set('players', message.data.players);
					this.nextTurn();
				}
				// Has a move been made?
				else if (message.data.moves.length > this.model.get('moves').length) {
					// If so, pop off the last one and replay it
					var move = message.data.moves[message.data.moves.length - 1];
					this.onClickedTile(this.board.collection.models[move.selectedTileNum], true);
					this.onClickedTile(this.board.collection.models[move.destinationTileNum], true);
					this.model.set('moves', message.data.moves);
				}
			}
		},

		setupBoard: function() {

			this.board.collection.models[20].set({player:0});
			this.board.collection.models[24].set({player:1});
			this.board.collection.models[56].set({player:0});
			this.board.collection.models[60].set({player:1});

		},

		performMove: function(move, animate) {

			var playerMoving = move.player;
			var moveType = move.moveType;
			var selectedTileNum = move.selectedTileNum;
			var destinationTileNum = move.destinationTileNum;

			var selectedTile = this.board.collection.models[selectedTileNum];
			var destinationTile = this.board.collection.models[destinationTileNum];

			if (moveType == "clone") {
				selectedTile.trigger('cloneTo', destinationTile, true);
			} else {
				selectedTile.trigger('jumpTo', destinationTile, true);
			}

			_.each(this.board.collection.getAdjacentTiles(destinationTile), function(adjacentTile) {

				// Get the adjacent tile's current player
				var player = adjacentTile.get('player');

				// If it's not empty, and it's not the same player as the one who's moving.
				// then assimilate the tile
				if (player !== null && player != playerMoving) {

					// Trigger the cloning
					destinationTile.trigger('cloneTo', adjacentTile, true);
				}
			});

		},

		onClickedTile: function(tile, force) {

			var self = this;
			// Determine whether the current player owns this square
			if (tile.get('player') !== null && ((this.model.get('players')[tile.get('player')].id == this.model.get('players')[this.model.get('currentPlayer')].id && this.model.get('players')[this.model.get('currentPlayer')].id == Mast.data.user.id) || force === true)) {

				// Clear the availability status

				// If so, toggle selection
				tile.set('selected', !tile.get('selected'));

				// If it's now selected, set availability for nearby tiles
				if (tile.get('selected')) {
					this.setAvailabilityStatus(tile);
				}

			}

			// If it's an empty tile, see if we can move to it
			if (tile.get('player') === null) {

				// Is there a selected tile?
				var selectedTile = this.board.collection.findWhere({selected:true});

				// If so, see if the tile we clicked on can be cloned or jumped to
				if (selectedTile && tile.get('availability') != Mast.data.TileModel.NOT_AVAILABLE) {

					// De-select the tile
					selectedTile.set('selected', false);

					// Set up callback to assimilate all adjacent tiles to the one that was clicked
					selectedTile.once('finishedMoving', function() {

						// Create an array of deferred objects to track cloning moves
						var queue = [];

						// Loop through each adjacent tile and clone to it if necessary
						_.each(this.board.collection.getAdjacentTiles(tile), function(adjacentTile) {

							// Get the adjacent tile's current player
							var player = adjacentTile.get('player');

							// If it's not empty, and it's not the same player as the one who's moving.
							// then assimilate the tile
							if (player !== null && player != this.model.get('currentPlayer')) {

								// Create a new deferred object to track the cloning animation,
								// and push it into the queue
								var deferred = $.Deferred();
								queue.push(deferred);

								// Set up a listener that will resolve the defered object's promise
								// once the tile has finished cloning
								adjacentTile.listenTo(tile, 'finishedMoving', function(destination){

									// We only want to track cloning to this specific tile, otherwise
									// all of the promises would resolve after the first cloning
									if(destination==adjacentTile){

										// Remove this listener and resolve the promise
										adjacentTile.stopListening(tile);
										deferred.resolve();
									}
								});

								// Trigger the cloning
								tile.trigger('cloneTo', adjacentTile);
							}
						}, this);

						// Once all of the clonings are done, move to the next player's turn
						$.when.apply(null, queue).then(function(){
							// Add the move to the game's moves list, save, and sync to the server
							self.model.get('moves').push(newMove);
							self.nextTurn(force);
						});

					}, this);

					// Clone or jump to the new tile
					var newMove = {
						player: this.model.get('currentPlayer'),
						selectedTileNum: selectedTile.get('tileNum'),
						destinationTileNum: tile.get('tileNum')
					};
					if (tile.get('availability') == Mast.data.TileModel.AVAILABLE_FOR_CLONING) {
						selectedTile.trigger('cloneTo', tile);
						newMove.moveType = "clone";
					} else {
						selectedTile.trigger('jumpTo', tile);
						newMove.moveType = "jump";
					}

					


				}
			}

		},

		nextTurn: function(silent) {
			var self = this;
			this.model.set('currentPlayer', (this.model.get('currentPlayer')+1) % this.model.get('players').length);
			if (!silent) {
				this.model.save({}, {success: function(){
					self.clearAvailabilityStatus();
					self.checkForAvailableMoves();
					Mast.trigger('%nextTurn');
				}});
			}
		},

		checkForAvailableMoves: function() {
			var playerTiles = this.board.collection.where({player:this.model.get('currentPlayer')});
			var foundMoves = false;
			_.every(playerTiles, function(playerTile) {
				var availableTiles = this.board.collection.getAdjacentTiles(playerTile, true);
				if (_.keys(availableTiles).length) {
					foundMoves = true;
					return false;
				} else {
					return true;
				}
			}, this);

			// No more moves?  Count up the pieces and determine the winner
			if (foundMoves === false) {
				var currentWinner = -1;
				var curMaxPieces = 0;
				for (var i = 0; i < this.model.get('players').length; i++) {
					var numPlayerPieces = this.board.collection.where({player:i}).length;
					if (numPlayerPieces > curMaxPieces) {
						currentWinner = i;
						curMaxPieces = numPlayerPieces;
					}
				}
				this.model.set('winner', currentWinner);
				this.model.set('currentPlayer', -1);
			}
		},

		clearAvailabilityStatus: function() {

			this.board.collection.each(function(tile){
				tile.set('availability', Mast.data.TileModel.NOT_AVAILABLE);
			});


		},

		setAvailabilityStatus: function(selectedTile) {

			// Clear all availability
			this.clearAvailabilityStatus();

			// Get all adjacent tiles
			var adjacentTiles = this.board.collection.getAdjacentTiles(selectedTile);

			// Mark any empty ones as available to clone to, and check whether
			// ones adjacent to THEM might be available for jumping to
			_.each(adjacentTiles, function(tile, direction) {

				// If an adjacent tile is empty, it can be cloned to
				if (tile.get('player') === null) {
					tile.set('availability', Mast.data.TileModel.AVAILABLE_FOR_CLONING);

					// If an adjacent tile in the same direction is empty, it can be jumped to.
					// For instance, the northeast tile of the northeast tile.
					var doubleTile = this.board.collection.getAdjacentTile(tile, direction);
					if (doubleTile && doubleTile.get('player') === null) {
						doubleTile.set('availability', Mast.data.TileModel.AVAILABLE_FOR_JUMPING);
					}

				}



			}, this);


		}

	};
});
