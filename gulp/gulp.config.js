
module.exports = function () {
    var config = {
        scss: {
            src: [
                './scss/**/*.scss',
                '!scss/**/*_scsslint_tmp*.scss'
            ],
            cssFolder: 'content/styles/'
        },
        svg: {
            sourceFolder: 'scss/sprites/svg/',
            spriteFolder: 'content/styles/images/',
            scssMapFolder: 'scss/core/',
            pngFallback: false
        }
    };

    return config;
};



