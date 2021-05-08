# Threepress
Easily embed [three.js](https://threejs.org) in [Wordpress](https://github.com/Wordpress/Wordpress)

## Installation
standard WP plugin installation - move the plugin folder to `[yoursite.com]/wp-content/plugins/`, and activate from Dashboard.

The plugin will create one database table to store your galleries:
`threepress_shortcodes`,

It will also create one folder in the file system for uploads: 
`[yoursite.com]/wp-content/uploads/threepress_models/`

## What you can do:

### Create three.js galleries anywhere

A gallery renders one three.js Scene.

Create them using the shortcode generator in the Threepress admin, and then paste the shortcode wherever you want - the javascript that renders the shortcodes is loaded on all public pages.

To customize the layout or dimensions of your gallery, use CSS.  An id tag of form `#threepress-gallery-[gallery name]` will be appended, or use class `.threepress-viewer` / `.threepress-viewer canvas`.

The three.js renderer should adjust to match your given dimensions automatically to prevent skewing or blurring.

Customize them yourself with code (see below), or stay tuned for future extensions to this plugin.

## Notes

All models must be in ".glb" format - most 3d programs can export to this.  

They are stored in the Media Library like everything else, but can be found easily through the Threepress library, which simply filters for ".glb" extensions.

#### For javascript devs:
All the galleries on a given page will be available in the global variable `THREEPRESS`, in the `canvases` property.  See the `Canvas` class (`static/js/Canvas.js`) for insight on interacting with these.  