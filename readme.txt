=== Threepress ===
Contributors: kerryoco
Tags: threejs, 3d model, gltf, woocommerce, ecommerce
Donate link: http://threepress.shop/donate
Requires at least: 4.0
Tested up to: 5.9
Requires PHP: 5.6
Stable tag: 1.2.1
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

The plugin will create one database table to store your galleries:
`threepress_shortcodes`,

This remains in place upon deactivation, so if you want to remove it you must do so manually.

## Notes

All models must be in ".glb" format - most 3d programs can export to this.  

They are stored in the Media Library like everything else, but can be found easily through the Threepress library, which simply filters for ".glb" extensions.

#### For javascript devs:
All the galleries on a given page will be available in the global variable `THREEPRESS`, in the `galleries` property.  See the `Gallery` class (`static/js/ThreepressGallery.js`) for insight on interacting with these.

== Screenshots ==
1. A GUI for quickly creating scenes, with many features planned to be added
2. Added in v1.0 - heightmaps, fog and sunlight

== Changelog ==
= 1.2.1 = 
* activation error fixed
= 1.2.0 =
* basic HDR images available
= 1.1.2 =
* animation display bugfix
* multiple threejs versions
= 1.1.1 =
* animation GUI bugfixes
= 1.1.0 =
* ambient lights
* animations
= 1.0.3 =
* added snow
* saving coordinates bugfix
= 1.0.2 = 
* cleaner cam / light / ground positioning code, and bugfixes
* UI tweaks
= 1.0.1 = 
* allow 10x more model 'float' granularity for ground contact
= 1.0.0 =
* core features added to editor - fog, heightmaps, shadows.  Also editor UI update.
