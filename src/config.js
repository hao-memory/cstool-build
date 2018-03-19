export default {
  file: {
    dest: '../build',
    cdnDest: '../dist',
    scss: './src/**/*.scss',
    js: './src/*/*.js',
    src: './src',
    html: './src/index.html'
  },
  dummy_domain: '@dummy_domain@/',
  environment: {
    dev: {
      domain: 'dev.rs.com',
      aureuma_domain: 'aureuma.test.rs.com'
    },
    uat1: {
      domain: 'uat1.rs.com',
      aureuma_domain: 'aureuma.test.rs.com'
    },
    stg: {
      domain: 'mklmall.com',
      aureuma_domain: 'aureuma.test.rs.com'
    },
    prd: {
      domain: 'mmall.com',
      aureuma_domain: 'aureuma.mmall.com'
    }
  },
  cdnMapping: {
    js: {
      cdn: 'static1',
      name: 'js'
    },
    css: {
      cdn: 'static2',
      name: 'css'
    },
    image: {
      cdn: 'static3',
      name: 'image'
    },
    png: {
      cdn: 'static3',
      name: 'png'
    },
    jpg: {
      cdn: 'static3',
      name: 'jpg'
    },
    gif: {
      cdn: 'static3',
      name: 'gif'
    },
    bmp: {
      cdn: 'static3',
      name: 'bmp'
    },
    others: {
      cdn: 'static4',
      name: 'others'
    }
  }
};
