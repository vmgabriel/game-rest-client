var MainMenu = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function MainMenu ()
    {
        Phaser.Scene.call(this, { key: 'mainmenu' });
        window.MENU = this;
    },

    create: function ()
    {
        console.log('%c MainMenu ', 'background: green; color: white; display: block;');

        var bg = this.add.image(0, 0, 'buttonBG');
        var logo = this.add.image(0, -100, 'logoPokemon').setScale(2);
        var textConfig = {fontSize:'40px', color:'#000', fontFamily: 'Revalia'};
        var text = this.add.text(-350, 100, "Dinero Restante de "+jugador.alias+": " +jugador.dinero, textConfig);

        text.align = 'center';
        text.stroke = '#000000';
        text.strokeThickness = 2;
        text.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);

        var container = this.add.container(400, 300, [ bg, logo, text ]);

        bg.setInteractive();

        bg.once('pointerup', function () {
            this.scene.start('game');
        }, this);
    }

});
