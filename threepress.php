<?php
/**
 * Plugin Name: Threepress 
 * Plugin URI: https://oko.nyc/product/threepress
 * Plugin Description: Quickly add 3d to parts of your website with the click of a button
 * Text Domain: threepress
 */

/*
Threepress is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
any later version.
 
Threepress is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
 
You should have received a copy of the GNU General Public License
along with Threepress. If not, see https://www.gnu.org/licenses/.
*/


if ( !defined('ABSPATH') ) { 
    die;
}

if ( !defined('DS') ) { define( 'DS', DIRECTORY_SEPARATOR ); }

require_once( ABSPATH . 'wp-includes/pluggable.php' );

$threepress_local_models = WP_CONTENT_DIR . '/uploads/threepress_models';
$threepress_public_models = site_url() . '/wp-content/uploads/threepress_models';

function _LOG( $msg ){

	$type = gettype( $msg );
	if( $type  === 'object' || $type === 'array' ){
		$msg = '(' . $type . ')
' . json_encode($msg, JSON_PRETTY_PRINT);
	}
    $logfile = __DIR__ . '/.oko-log.txt';
    file_put_contents($logfile, date('M:D:H:i') . ' _LOG:
' . $msg . PHP_EOL, FILE_APPEND | LOCK_EX);

}


function threepress_datetime(){
	return gmdate( 'Y-m-d H:i:s', time() );
}


if ( !class_exists( 'Threepress' ) ) {

	abstract class Threepress{

	    // public static function init() {
	    //     register_setting( 'wporg_settings', 'threepress_settings' );
	    // }

	    // public static function get_settings() {
	    //     return get_option( 'threepress_settings' );
	    // }

 	    public static function global_scripts() {
    		wp_enqueue_style( 
				'threepress-global-css', 
				plugins_url('/static/css/global.css', __FILE__ ), 
				array()
			);	    	
    		wp_enqueue_script( 
				'threepress-global-js', 
				plugins_url( '/static/js/global.js', __FILE__ ),
				array('jquery')
			);

			wp_localize_script( 'threepress-global-js', 'THREEPRESS', array(
					'plugin_url' => plugins_url() . '/threepress/',
					'home_url' => home_url(),
					'ajaxurl' => admin_url( 'global-ajax.php' )
					// 'is_user_logged_in' => is_user_logged_in()
				)
			);

	    }

	    public static function base_module() {
    		wp_enqueue_script( 
				'threepress-base-js', 
				plugins_url( '/static/js/init_base.js', __FILE__ ),
				array() // 'jquery'
			);
	    }

	    public static function admin_scripts() {
    		wp_enqueue_style( 
				'threepress-admin-css', 
				plugins_url('/static/css/admin.css', __FILE__ ), 
				array()
			);

    		wp_enqueue_script( 
				'threepress-admin-js', 
				plugins_url( '/static/js/init_admin.js', __FILE__ ),
				array('jquery')
			);

	    }

	    public static function filter_modules( $tag, $handle, $src ) {
	    	$modules = ['threepress-admin-js', 'threepress-posts-js', 'threepress-lib-js', 'threepress-base-js'];
		    if ( !in_array($handle, $modules ) ){
		        return $tag;		    	
		    }
		    $tag = '<script type="module" src="' . esc_url( $src ) . '" defer="defer"></script>';
		    return $tag;
		}

	    public static function options_page() {
			$threepress_page_title = 'Threepress';
			$threepress_menu_title = 'Threepress';
			$threepress_capability = 'administrator';
			$threepress_menu_slug = 'inc/admin.php';

			add_menu_page(
			    $threepress_page_title,
			    $threepress_menu_title,
			    $threepress_capability,
			    plugin_dir_path(__FILE__) . $threepress_menu_slug,
			    null,
			    false,
			    20
			);	
	    }

	    public static function init_upload_folder(){
	    	global $threepress_local_models;
			if( !is_dir( $threepress_local_models ) ){
				mkdir ( $threepress_local_models , 0755 , true  );
			}
	    }







	    // ajax

	    public static function fill_library(){
			global $wpdb;
			$sql = $wpdb->prepare('SELECT * FROM wp_posts LEFT JOIN wp_postmeta ON id=post_id WHERE guid LIKE "%.glb%"');
			$rows = $wpdb->get_results( $sql );
			wp_die( json_encode( $rows ) ); 
	    }

	    public static function fill_gallery(){
			global $wpdb;
			// $sql = $wpdb->prepare('SELECT * FROM wp_posts LEFT JOIN wp_postmeta ON id=post_id WHERE guid LIKE "%.glb"');
			// $rows = $wpdb->get_results( $sql );
			// echo 'gallery not yet available';
			wp_die( json_encode([]) );
		}

	    public static function save_shortcode(){
	    	global $wpdb;
	    	$sql = $wpdb->prepare('
	    		CREATE TABLE IF NOT EXISTS threepress_shortcodes (
	    		id int(11) NOT NULL auto_increment PRIMARY KEY,
	    		author_key int(11),
	    		created datetime,
	    		edited datetime,
	    		content text )');
	    	$results = $wpdb->get_results( $sql );

	    	$datetime = threepress_datetime();
	    	$id = get_current_user_id();

	    	$sql2 = $wpdb->prepare('
	    		INSERT INTO threepress_shortcodes VALUES (author_key=?, created=?, edited=?, content=?');
	    	$results = $wpdb->get_results( $sql2, $id, $datetime, $datetime, $_POST['content']);
	    	_LOG( $results );
		}

	}

	// Threepress::init();
	// Threepress::get_settings();

	$has_module = false;

	// --------------------------------------------- admin init

	if( current_user_can('manage_options') ){

		define( 'ALLOW_UNFILTERED_UPLOADS', true );
		
		Threepress::init_upload_folder();

		$threepress = strpos( $_SERVER['REQUEST_URI'], 'page=threepress' );
		$admin_ajax = strpos( $_SERVER['REQUEST_URI'], 'wp-admin/admin-ajax' );		
		$post_edit = strpos( $_SERVER['REQUEST_URI'], 'wp-admin/post.php');

		if( $threepress ){ // _____ admin page

			add_action( 'admin_enqueue_scripts', 'Threepress::admin_scripts', 100 );
			$has_module = true;

		}else if( $admin_ajax ){ // _____ ajax requests

			add_action( 'wp_ajax_fill_library', 'Threepress::fill_library' );
			add_action( 'wp_ajax_fill_gallery', 'Threepress::fill_gallery' );
			add_action( 'wp_ajax_save_shortcode', 'Threepress::save_shortcode' );

		}

	}else{ // _____ public pages

		define( 'ALLOW_UNFILTERED_UPLOADS', $allow_unfiltered );

	}

	add_action('admin_menu', 'Threepress::options_page');



	// -------------------------------------------- client init





	// -------------------------------------------- global inits

	if( !$has_module ){
		add_action('init', 'Threepress::base_module', 100);
	}

	add_action('init', 'Threepress::global_scripts', 100);
	add_filter('script_loader_tag', 'Threepress::filter_modules' , 10, 3);

}







