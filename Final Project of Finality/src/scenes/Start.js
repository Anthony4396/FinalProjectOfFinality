export class Start extends Phaser.Scene {
    constructor() {
        super('Start');
    }

    create() {
        this.scene.start('Preloader');
    }
}
