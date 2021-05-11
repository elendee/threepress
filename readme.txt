=== Test Plugin ===
Contributors: kerryoco
Tags: threejs, 3d, model viewer
Donate link: http://threepress.shop/
Requires at least: 4.0
Tested up to: 5.7.1
Requires PHP: 5.6
Stable tag: 0.1
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

3d model gallery uploader and viewer powered by three.js

== Description ==

Easily embed [three.js](https://threejs.org) in [Wordpress](https://github.com/Wordpress/Wordpress)

## What you can do:

### Create three.js galleries anywhere

Create galleries using the shortcode generator in the Threepress admin, and then paste the shortcode wherever you want - the javascript that renders the shortcodes is loaded on all public pages.

A gallery renders one three.js Scene.

To customize the layout or dimensions of your gallery, use CSS.  An id tag of form `#threepress-gallery-[gallery name]` is put on the *wrapper* of the `<canvas>` element, or use class `.threepress-gallery` / `.threepress-gallery canvas` to target all galleries.

The gallery renderer (three.js object) should adjust to match your given dimensions automatically to prevent skewing or blurring.

If you want to custom code your own gallery, scroll down to 'javascript devs'.

## Installation
standard WP plugin installation - move the plugin folder to `[yoursite.com]/wp-content/plugins/`, and activate from Dashboard.

The plugin will create one database table to store your galleries:
`threepress_shortcodes`,

It will also create one folder in the file system for uploads: 
`[yoursite.com]/wp-content/uploads/threepress_models/`

## Notes

All models must be in ".glb" format - most 3d programs can export to this.  

They are stored in the Media Library like everything else, but can be found easily through the Threepress library, which simply filters for ".glb" extensions.

#### For javascript devs:
All the galleries on a given page will be available in the global variable `THREEPRESS`, in the `galleries` property.  See the `Gallery` class (`static/js/Gallery.js`) for insight on interacting with these.

== Changelog ==
= 0.1 =
* Initial release.