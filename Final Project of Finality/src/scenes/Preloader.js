import ASSETS from '../assets.js';

export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        // Load space background
        this.load.image(ASSETS.image.space.key, ASSETS.image.space.path);

        // Load ship spritesheet (for player only)
        this.load.spritesheet(
            ASSETS.spritesheet.ships.key,
            ASSETS.spritesheet.ships.args[0],
            ASSETS.spritesheet.ships.args[1]
        );

        // Load tilesheet (for bullets)
        this.load.spritesheet(
            ASSETS.spritesheet.tiles.key,
            ASSETS.spritesheet.tiles.args[0],
            ASSETS.spritesheet.tiles.args[1]
        );
    }

    create() {
        this.scene.start('Game'); // or 'Start' if you use a title scene
    }
}
