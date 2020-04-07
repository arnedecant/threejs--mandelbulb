// --------------------------------------------------------------
// :: GULP CONFIGURATION
// --------------------------------------------------------------
// Build configuration

const config = require('./build-config.json')

// Gulp dependencies

const gulp = require('gulp')
const plugins = require('gulp-load-plugins')()

// Other dependencies

const livereload = require('browser-sync').create()
const webpack = require('webpack-stream')
const merge = require('merge-stream')
const del = require('del')


// --------------------------------------------------------------
// :: SASS
// --------------------------------------------------------------
// - https://www.npmjs.org/package/gulp-plumber
// - https://www.npmjs.com/package/gulp-sass
// - https://www.npmjs.org/package/gulp-autoprefixer
// - https://www.npmjs.com/package/merge-stream

gulp.task('sass', () => {

	let tasks = config.targets.map((target) => {

		return gulp.src('src/sass/'+target['src-sass'])
			.pipe(plugins.plumber())
			.pipe(plugins.sass({

				outputStyle: config.production ? 'compressed' : 'expanded',
				sourceComments: !config.production

			}).on('error', plugins.sass.logError))
			.pipe(plugins.autoprefixer('last 2 versions'))
			.pipe(plugins.rename(target['id']+'.css'))
			.pipe(gulp.dest('public/css'))
			.pipe(livereload.stream())

	})

	return merge(tasks)

})


// --------------------------------------------------------------
// :: SCRIPTS
// --------------------------------------------------------------
// - https://github.com/shama/webpack-stream

gulp.task('scripts', () => {

	return gulp.src('src/js/*.js')
		.pipe(plugins.plumber())
		.pipe(webpack(require('./webpack.js')))
		.pipe(gulp.dest('public/js'))

})


// --------------------------------------------------------------
// :: HTML
// --------------------------------------------------------------
// - https://www.npmjs.org/package/gulp-plumber
// - https://www.npmjs.com/package/gulp-file-include
// - https://www.npmjs.org/package/gulp-htmlmin
// - https://www.npmjs.org/package/gulp-rename
// - https://www.npmjs.com/package/merge-stream

gulp.task('html', () => {

	let tasks = config.targets.map((target) => {

		return gulp.src('src/html/'+target['src-html'])
			.pipe(plugins.plumber())
			.pipe(plugins.fileInclude({

				prefix: '@@',
				basepath: 'src/html',
				context: {

					// Inject build-target specific
					// content into our templates

					'buildTarget': target['id'],
					'seoTitle': target['seo-title'],
					'seoDescription': target['seo-description'],
					'url': target['url']

				}

			}))
			.pipe(plugins.htmlmin({

	        	collapseWhitespace: config.production,
	        	removeComments: config.production

	        }))
			.pipe(plugins.rename(target['id']+'.html'))
			.pipe(gulp.dest('public'))

	})

	return merge(tasks)

})


// --------------------------------------------------------------
// :: IMAGES
// --------------------------------------------------------------
// - https://www.npmjs.org/package/gulp-plumber
// - https://www.npmjs.org/package/gulp-imagemin
// - https://www.npmjs.com/package/merge-stream

gulp.task('images', () => {

	let options = {
		optimizationLevel: 7,
		progressive: true,
		interlaced: true,
		verbose: true
	};

	let images = gulp.src('src/img/**')
		.pipe(plugins.plumber())
		.pipe(plugins.imagemin(options))
		.pipe(gulp.dest('public/img'))

	let seo = gulp.src('src/seo/*.+(ico|jpg|png)')
		.pipe(plugins.plumber())
		.pipe(plugins.imagemin(options))
		.pipe(gulp.dest('public'))

	return merge([images, seo])

})


// --------------------------------------------------------------
// :: COPY
// --------------------------------------------------------------
// - https://www.npmjs.org/package/gulp-plumber
// - https://www.npmjs.org/package/gulp-rename
// - https://www.npmjs.com/package/merge-stream

gulp.task('copy', () => {

	let fonts = gulp.src('src/fonts/**')
		.pipe(plugins.plumber())
		.pipe(gulp.dest('public/fonts'))

    let vendor = gulp.src('src/js/vendor/**')
		.pipe(plugins.plumber())
		.pipe(gulp.dest('public/js/vendor'))

	let assets = gulp.src('src/assets/**')
		.pipe(plugins.plumber())
		.pipe(gulp.dest('public/assets'))

	let shaders = gulp.src('src/shaders/**')
		.pipe(plugins.plumber())
		.pipe(gulp.dest('public/shaders'))

	return merge([fonts, vendor, assets, shaders])

})


// --------------------------------------------------------------
// :: CLEAN
// --------------------------------------------------------------
// - https://www.npmjs.org/package/del

gulp.task('clean', () => {

	return del(['public'])

})


// --------------------------------------------------------------
// :: BUILD
// --------------------------------------------------------------

gulp.task('build', gulp.series('clean', gulp.parallel('sass', 'scripts', 'html', 'copy', 'images')))


// --------------------------------------------------------------
// :: LIVE-RELOAD
// --------------------------------------------------------------
// - https://browsersync.io/docs/gulp
// - https://browsersync.io/docs/options

gulp.task('watch', gulp.series('build', () => {

	livereload.init({
		server: {
			baseDir: 'public'
			//https: true // serve https on localhost!
		},
		reloadOnRestart: true,
		reloadDebounce: 500,
		notify: false
	})

	// Run tasks on file-change
	// NOTE: To speed up development we disable some watchers
	// NOTE: Updates not coming through? Run 'gulp build'

	gulp.watch('src/sass/**', gulp.parallel('sass'))
	gulp.watch('src/js/**', gulp.parallel('scripts'))
	gulp.watch('src/html/**', gulp.parallel('html'))
	gulp.watch('src/shaders/**', gulp.parallel('html'))
	gulp.watch('src/assets/data.json', gulp.parallel('copy'))
	//gulp.watch('src/js/vendor/**', gulp.parallel('copy'))
	//gulp.watch('src/img/**', gulp.parallel('images'))
	//gulp.watch('src/seo/**', gulp.series('images','copy'))
	//gulp.watch('src/fonts/**', gulp.parallel('copy'))

	// Watch changes in the /public folder
	// NOTE: Changes in .css files are triggered from the sass task

	return gulp.watch([
		'public/**/*.html',
		'public/js/**/*',
		'public/assets/data.json'
	]).on('change', livereload.reload)

}))
