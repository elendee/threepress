# threepress
base Threepress plugin package

## installation
standard WP plugin installation - move the plugin folder to `[yoursite.com]/wp-content/plugins/`, and activate from Dashboard.

## What you can do:

### create threejs galleries anywhere

A gallery renders one three.js Scene.

Create them using the shortcode generator, and then paste the shortcode wherever you want.

All the galleries on a given page will be available in the global variable `THREEPRESS`, in the `canvases` property.  See the `Canvas` class (`static/js/Canvas.js`) for insight on interacting with these.

Galleries are kept deliberately simple, for easier extensibility.

## Notes

Models must be in ".glb" format - most 3d programs can export to this.  They are stored in the Media Library like everything else, but can be found easily through the Threepress library, which simply filters for ".glb" extensions.
