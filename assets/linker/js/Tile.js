Mast.define('Tile', function () {
	return {

		'click': 'onClick',
		'keydown': 'onKeyDown',

		afterRender: function () {

			var x = (this.model.get('x') * Mast.data.tileSize);
			var y = (this.model.get('y') * Mast.data.tileSize);

			this.$el.attr('data-tilenum', this.model.get('tileNum'));
			this.$el.attr('tabindex', this.model.get('tileNum'));
			this.$el.css({left: x + 'px', top: y + 'px'});

			this.model.on('change:highlighted', this.toggleHighlight);
			this.model.on('change:selected', this.toggleSelection);
			this.model.on('change:player', this.changePlayer);
			this.model.on('change:availability', this.toggleAvailability);

			this.model.on('cloneTo', this.cloneTo);
			this.model.on('jumpTo', this.jumpTo);


		},

		cloneTo: function(destinationTile, immediate) {

			var self = this;
			var player = this.model.get('player');

			if (immediate) {

				destinationTile.set('player', player);
				self.model.trigger('finishedMoving', destinationTile);
				return;

			}

			// Get the offset of the destination tile
			var offsetX = (destinationTile.get('x') - this.model.get('x')) * Mast.data.tileSize;
			var offsetY = (destinationTile.get('y') - this.model.get('y')) * Mast.data.tileSize;
			
			// Create a new piece overlapping the one we have
			var piece = new Mast.data.PieceModel({player:player});
			var pieceComponent = this.piece.append('Piece', {model:piece});
			pieceComponent.$el.addClass('eclipse');

			// Force webkit to recompute styles, so that transitions will work on the new element
			// (From http://timtaubert.de/blog/2012/09/css-transitions-for-dynamically-created-dom-elements/)
			window.getComputedStyle(pieceComponent.$el[0]).opacity;

			// Move it to its new home, then remove it and set the destination tile's player
			move(pieceComponent.$el[0]).to(offsetX, offsetY).end(function() {
				destinationTile.set('player', player);
				pieceComponent.remove();
				self.model.trigger('finishedMoving', destinationTile);
			});

		},

		jumpTo: function(destinationTile, immediate) {

			var self = this;
			var pieceComponent = this.piece._children[0];
			var player = this.model.get('player');

			
			if (immediate) {

				pieceComponent.remove();
				self.model.set('player', null);
				destinationTile.set('player', player);
				self.model.trigger('finishedMoving', destinationTile);
				return;

			}

			// Get the offset of the destination tile
			var offsetX = (destinationTile.get('x') - this.model.get('x')) * Mast.data.tileSize;
			var offsetY = (destinationTile.get('y') - this.model.get('y')) * Mast.data.tileSize;


			
			
			// Move it to its new home, then remove it and set the destination tile's player
			move(pieceComponent.$el[0]).to(offsetX, offsetY).end(function(){
				pieceComponent.remove();
				self.model.set('player', null);
				destinationTile.set('player', player);
				self.model.trigger('finishedMoving', destinationTile);
			});

		},



		toggleAvailability: function(model, value) {

			if (model.get('availability') != Mast.data.TileModel.NOT_AVAILABLE) {

				this.$el.addClass('available');

			} else {

				this.$el.removeClass('available');

			}

		},

		toggleHighlight: function(model, value) {
			if (value === true) {
				this.$el.addClass('highlighted');
			} else {
				this.$el.removeClass('highlighted');
			}
		},

		toggleSelection: function(model, value) {
			if (value === true) {
				this.$el.addClass('selected');
			} else {
				this.$el.removeClass('selected');
			}
		},

		onClick: function() {
			this.model.trigger('clicked', this.model);
			// this.model.set('selected', !this.model.get('selected'));
		},

		onKeyDown: function(e) {
		},

		changePlayer: function(model, value) {
			var piece = new Mast.data.PieceModel({player:value});
			this.piece.attach('Piece', {model:piece});
			this.$el.attr('data-player', value);
		}

	};
});
